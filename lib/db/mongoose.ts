import mongoose from 'mongoose'

/**
 * Cached Mongoose connection for serverless environments.
 * Prevents connection storms by reusing a single connection across
 * hot-reloads (dev) and Lambda invocations (prod).
 */

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global._mongooseCache) {
  global._mongooseCache = cached
}

/**
 * Defensively normalise the connection string. Guards against two common
 * copy/paste mistakes when pasting the value into an env-var field:
 *  - the whole `MONGODB_URI=mongodb+srv://...` line pasted into the value,
 *    leaving a stray `MONGODB_URI=` prefix on the value itself;
 *  - the value wrapped in single or double quotes.
 * Without this, mongoose throws "Invalid scheme, expected connection string to
 * start with mongodb:// or mongodb+srv://".
 */
function sanitizeMongoUri(raw: string | undefined): string | undefined {
  if (!raw) return raw
  let uri = raw.trim()
  // Strip a stray leading `MONGODB_URI=` (or `MONGO_URI=`) prefix.
  uri = uri.replace(/^\s*MONGO(?:DB)?_URI\s*=\s*/i, '')
  // Strip a single pair of surrounding quotes.
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1)
  }
  return uri.trim()
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  const MONGODB_URI = sanitizeMongoUri(process.env.MONGODB_URI)
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. Add it to your project environment variables.',
    )
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      // Fail fast instead of hanging for the default 30s when the database is
      // unreachable (e.g. an Atlas cluster blocked by a firewall/whitelist, or
      // outbound port 27017 blocked on a corporate/campus network). This keeps
      // page loads responsive and surfaces the real error quickly.
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}

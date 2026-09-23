export interface LegalSection {
  heading: string
  body: string[]
}

export interface LegalDoc {
  slug: string
  title: string
  intro: string
  metaDescription: string
  sections: LegalSection[]
}

const company = "ViaRidez"

export const legalDocs: Record<string, LegalDoc> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    metaDescription:
      "How ViaRidez collects, uses, and protects personal data across our corporate transportation services in the UAE and beyond.",
    intro: `This Privacy Policy explains how ${company} ("we", "us") collects, uses, discloses, and safeguards your information when you use our website and corporate mobility services. We are committed to protecting your privacy in line with the UAE Personal Data Protection Law and applicable international standards.`,
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "Contact details you provide through enquiry, quote, and application forms — such as your name, company, email address, and phone number.",
          "Service information required to plan transportation, including pickup and drop-off locations, passenger volumes, and scheduling preferences.",
          "Technical data collected automatically, such as IP address, browser type, and pages visited, used to improve site performance and security.",
        ],
      },
      {
        heading: "How We Use Your Information",
        body: [
          "To respond to enquiries, prepare quotations, and deliver the transportation services you request.",
          "To manage recruitment applications and communicate about career opportunities.",
          "To improve our services, ensure security, comply with legal obligations, and — where you have consented — send relevant updates.",
        ],
      },
      {
        heading: "Data Sharing and Retention",
        body: [
          "We do not sell your personal data. We share it only with vetted service partners and systems required to deliver our services, under strict confidentiality obligations.",
          "We retain personal data only for as long as necessary to fulfil the purposes described here or to comply with legal and contractual requirements.",
        ],
      },
      {
        heading: "Your Rights",
        body: [
          "You may request access to, correction of, or deletion of your personal data, and you may withdraw consent to marketing communications at any time.",
          "To exercise any of these rights, contact us using the details on our Contact page.",
        ],
      },
    ],
  },
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    metaDescription:
      "The terms governing your use of the ViaRidez website and corporate transportation services.",
    intro: `These Terms of Service govern your access to and use of the ${company} website and services. By using our website or engaging our services, you agree to these terms.`,
    sections: [
      {
        heading: "Use of Our Website",
        body: [
          "You agree to use this website lawfully and not to attempt to disrupt its operation or security.",
          "Content on this website is provided for general information about our services and may be updated at any time without notice.",
        ],
      },
      {
        heading: "Service Engagements",
        body: [
          "Quotations are indicative until confirmed in a written agreement. The specific terms of any transportation engagement are set out in the service contract between you and ViaRidez.",
          "Bookings, cancellations, and service levels are governed by the applicable service agreement and schedule.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "To the fullest extent permitted by law, our liability is limited to the terms set out in the relevant service agreement.",
          "We are not liable for indirect or consequential losses arising from use of this website.",
        ],
      },
      {
        heading: "Governing Law",
        body: [
          "These terms are governed by the laws of the United Arab Emirates, and any disputes are subject to the exclusive jurisdiction of the courts of Dubai.",
        ],
      },
    ],
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    metaDescription:
      "How ViaRidez uses cookies and similar technologies on our website.",
    intro: `This Cookie Policy explains how ${company} uses cookies and similar technologies to recognise you when you visit our website and to improve your experience.`,
    sections: [
      {
        heading: "What Are Cookies",
        body: [
          "Cookies are small text files placed on your device that help websites function and provide analytical information.",
        ],
      },
      {
        heading: "How We Use Cookies",
        body: [
          "Essential cookies enable core functionality such as navigation and security.",
          "Analytics cookies help us understand how visitors use our site so we can improve it. These are used only where permitted.",
        ],
      },
      {
        heading: "Managing Cookies",
        body: [
          "You can control and delete cookies through your browser settings. Disabling some cookies may affect the functionality of the website.",
        ],
      },
    ],
  },
}

export const legalSlugs = Object.keys(legalDocs)

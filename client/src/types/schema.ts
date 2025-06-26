// Schema.org type definitions for structured data

export interface Person {
  "@type": "Person";
  name: string;
  jobTitle?: string;
  description?: string;
}

export interface Organization {
  "@type": "Organization";
  name: string;
  logo?: string;
  url?: string;
}

export interface BlogPosting {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: Person;
  publisher?: Organization;
  mainEntityOfPage?: {
    "@type": "WebPage";
    "@id": string;
  };
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
}

export interface HowTo {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: Person;
  supply?: Array<{
    "@type": "HowToSupply";
    name: string;
  }>;
  step: Array<{
    "@type": "HowToStep";
    name: string;
    text: string;
    image?: string;
  }>;
}

export interface FAQPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export type SchemaType = BlogPosting | HowTo | FAQPage;
export interface Certification {
  name: string;
  description: string;
  image: string;
  url: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    name: 'Scrum Certified',
    description:
      'Verified Scrum certification demonstrating Agile delivery and Scrum workflow foundations.',
    image:
      'https://storage.googleapis.com/verified-storage/cert/54856394670688.png',
    url: 'https://verified.sertifier.com/en/verify/54856394670688/',
  },
];

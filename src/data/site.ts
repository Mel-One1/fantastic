/**
 * Single source of truth for NAP data, contact details and facts.
 *
 * Rule from the briefing: nothing in here may be invented. Every value that
 * Melanie still has to confirm stays `null` and is rendered as a visible
 * TODO-MELANIE marker. `npm run todos` lists everything that is still open.
 */

export type OpeningHours = {
  /** Schema.org day names, e.g. ["Monday", "Tuesday"] */
  days: string[];
  opens: string;
  closes: string;
};

export const site = {
  name: 'SoftDentalCare',
  legalName: 'SoftDentalCare',
  url: 'https://softdentalcare.com',
  locale: 'en-US',
  dentist: 'Dr. Mario A. Garibay',

  /** Must match the Google Business Profile character for character. TODO-MELANIE */
  address: {
    street: null as string | null,
    locality: 'Los Algodones',
    region: 'Baja California',
    postalCode: null as string | null,
    country: 'MX',
  },

  /** From the Google Business Profile listing. TODO-MELANIE */
  geo: {
    latitude: null as number | null,
    longitude: null as number | null,
  },

  /** E.164 format, e.g. "+52..." TODO-MELANIE */
  telephone: null as string | null,
  /** Digits only, used to build the wa.me link. TODO-MELANIE */
  whatsapp: null as string | null,
  email: 'contacto@softdentalcare.com',

  /** TODO-MELANIE: identical to the Google Business Profile */
  openingHours: [] as OpeningHours[],

  /** Profiles that belong to SDC. No link to comparison portals. TODO-MELANIE */
  sameAs: [] as string[],

  /**
   * Only ever filled from the real Google rating, never estimated.
   * Left null means: no aggregateRating in the structured data.
   */
  aggregateRating: null as { ratingValue: number; reviewCount: number } | null,

  /** Google Business Profile place id, needed for the live reviews embed. TODO-MELANIE */
  googlePlaceId: null as string | null,
} as const;

export const nav = [
  { href: '/dental-implants/', label: 'Dental Implants' },
  { href: '/cosmetic-dentistry/', label: 'Cosmetic Dentistry' },
  { href: '/general-dentistry/', label: 'General Dentistry' },
  { href: '/prices/', label: 'Prices' },
  { href: '/your-first-visit/', label: 'Your First Visit' },
  { href: '/planning-your-trip/', label: 'Planning Your Trip' },
  { href: '/second-opinion/', label: 'Second Opinion' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];

export const footerNav = [
  {
    heading: 'Treatments',
    links: [
      { href: '/dental-implants/', label: 'Dental Implants' },
      { href: '/dental-implants/single-tooth-implant/', label: 'Single Tooth Implant' },
      { href: '/dental-implants/all-on-4/', label: 'All on 4' },
      { href: '/dental-implants/bone-grafting/', label: 'Bone Grafting' },
      { href: '/cosmetic-dentistry/', label: 'Cosmetic Dentistry' },
      { href: '/general-dentistry/', label: 'General Dentistry' },
    ],
  },
  {
    heading: 'Planning your treatment',
    links: [
      { href: '/prices/', label: 'Prices' },
      { href: '/your-first-visit/', label: 'Your First Visit' },
      { href: '/planning-your-trip/', label: 'Planning Your Trip' },
      { href: '/second-opinion/', label: 'Second Opinion' },
      { href: '/aftercare-and-warranty/', label: 'Aftercare and Warranty' },
    ],
  },
  {
    heading: 'About the practice',
    links: [
      { href: '/about/', label: 'About' },
      { href: '/reviews/', label: 'Reviews' },
      { href: '/faq/', label: 'FAQ' },
      { href: '/contact/', label: 'Contact' },
      { href: '/privacy-policy/', label: 'Privacy Policy' },
    ],
  },
];

export const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp}` : null;
export const telLink = site.telephone ? `tel:${site.telephone}` : null;

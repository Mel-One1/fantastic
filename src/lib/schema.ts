import { site } from '../data/site';

/** Removes null, undefined and empty arrays so no placeholder ends up in the JSON-LD. */
function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const cleaned = value.map(prune).filter((v) => v !== undefined);
    return (cleaned.length ? cleaned : undefined) as T;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, prune(v)] as const)
      .filter(([, v]) => v !== undefined && v !== null);
    return (entries.length ? Object.fromEntries(entries) : undefined) as T;
  }
  return (value === null ? undefined : value) as T;
}

export function dentistSchema() {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${site.url}/#practice`,
    name: site.name,
    url: `${site.url}/`,
    telephone: site.telephone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo:
      site.geo.latitude !== null && site.geo.longitude !== null
        ? { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude }
        : null,
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [...site.sameAs],
    // Only rendered when a real Google rating has been entered in site.ts.
    aggregateRating: site.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: site.aggregateRating.ratingValue,
          reviewCount: site.aggregateRating.reviewCount,
        }
      : null,
  });
}

export function breadcrumbSchema(trail: { name: string; href: string }[]) {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.href}`,
    })),
  });
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return undefined;
  return prune({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  });
}

export function medicalProcedureSchema(procedure: {
  name: string;
  description?: string | null;
  bodyLocation?: string | null;
}) {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: procedure.name,
    description: procedure.description ?? null,
    bodyLocation: procedure.bodyLocation ?? 'Jaw',
    procedureType: { '@type': 'MedicalProcedureType', name: 'Surgical procedure' },
    provider: { '@id': `${site.url}/#practice` },
  });
}

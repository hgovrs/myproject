import { extractFacts } from './lib.mjs';

const observedAt = '2026-11-09T00:00:00Z';
const candidate = (data) => ({
  ...data, id: data.url, mode: 'sample', observedAt, photos: [], conflicts: [],
  facts: extractFacts(data.excerpt), extraction: 'Saved search-index research; not a live page read',
  priority: 'Review first', rank: 3, foundIn: [data.platform],
});

export const EXAMPLES = {
  portugal: {
    mode: 'sample', observedAt, partial: false, error: null,
    reference: {
      title: 'Villa Alegria · Salema, Portugal',
      sourceUrl: 'https://www.blackbookvillas.com/luxury-rental-sun-portugal-algarve-salema-villa-alegria.html',
      country: 'Portugal', query: 'Villa Alegria Salema', terms: ['alegria', 'salema'], registrations: [],
    },
    coverage: [
      { id: 'blackbook', name: 'Black Book Villas', state: 'sample', count: 1 },
      { id: 'villanovo', name: 'Villanovo', state: 'sample', count: 1 },
      { id: 'web', name: 'Wider internet', state: 'sample', count: 1 },
    ],
    candidates: [
      candidate({
        title: 'Villa Alegria', platform: 'web', siteType: 'Commercial operator', location: 'Salema, Algarve, Portugal',
        url: 'https://vilavitacollection.com/en/villas/villa-alegria',
        excerpt: 'The indexed operator page describes a villa in Salema with 4 bedrooms, 8 guests, a rooftop pool and sea views. A commercial booking route was found; legal ownership was not established.',
        evidence: ['Same name and locality: Alegria, Salema', 'Reported capacity and bedrooms agree with the source listing', 'Distinctive rooftop pool and sea views'],
      }),
      candidate({
        title: 'Villa Salema Alegria', platform: 'villanovo', siteType: 'Listing platform', location: 'Salema, Algarve, Portugal',
        url: 'https://www.villanovo.com/villa-rentals/europe/portugal/algarve/salema/villa-salema-alegria',
        excerpt: 'The indexed listing describes 4 bedrooms, 8 guests and a private rooftop pool overlooking the ocean. Registration and property ownership were not verified.',
        evidence: ['Name variant includes both Alegria and Salema', 'Four bedrooms and eight guests agree', 'Rooftop pool is described on both listings'],
      }),
    ],
  },
  spain: {
    mode: 'sample', observedAt, partial: false, error: null,
    reference: {
      title: 'Villa Doblo / Son Doblons · Mallorca, Spain',
      sourceUrl: 'https://www.villanovo.com/villa-rentals/europe/spain/mallorca/north-mallorca/villa-doblo',
      country: 'Spain', query: 'Son Doblons Santa Margalida', terms: ['doblons', 'santa', 'margalida'], registrations: [],
    },
    coverage: [
      { id: 'villanovo', name: 'Villanovo', state: 'sample', count: 1 },
      { id: 'web', name: 'Wider internet', state: 'sample', count: 1 },
    ],
    candidates: [
      candidate({
        title: 'Son Doblons', platform: 'web', siteType: 'Property-branded website', location: 'Santa Margalida, Mallorca, Spain',
        url: 'https://sondoblons.com/our-villa/',
        excerpt: 'The property-branded website describes eight suites (8 bedrooms). The Villanovo listing uses “Villa Doblo” as its title but mentions Son Doblons inside the description. Location and bedroom count agree.',
        evidence: ['The source description explicitly names Son Doblons', 'Same locality: Santa Margalida, Mallorca', 'Eight bedrooms/suites reported by both sources'],
      }),
    ],
  },
};

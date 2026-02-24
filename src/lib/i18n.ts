// src/lib/i18n.ts
export type SupportedLocale = 'sq' | 'en';

const translations: Record<SupportedLocale, Record<string, string>> = {
    sq: {
        noProperties: 'Nuk ka pasuri për të shfaqur në hartë.',
        viewDetails: 'Shiko Detajet →',
        bedrooms: 'dhoma',
        bathrooms: 'banjo',
        squareMeters: 'm²',
        streetView: 'Pamja e Rrugës',
        directions: 'Udhëzime',
        clusterMore: 'më shumë',
        properties: 'pasuri',
        showOnMap: 'Shfaq në hartë'
    },
    en: {
        noProperties: 'No properties to display on the map.',
        viewDetails: 'View Details →',
        bedrooms: 'bedrooms',
        bathrooms: 'bathrooms',
        squareMeters: 'm²',
        streetView: 'Street View',
        directions: 'Directions',
        clusterMore: 'more',
        properties: 'properties',
        showOnMap: 'Show on map'
    }
};

export function getTranslation(key: string, locale: SupportedLocale = 'sq'): string {
    return translations[locale]?.[key] ?? key;
}

// Simple internationalization helper for the real estate website.
//
// This module defines a limited set of translations used throughout the
// application. It avoids introducing an additional runtime dependency by
// providing a minimal lookup table keyed by locale codes. If a key is
// missing for a given locale the function returns the key itself.

export type SupportedLocale = 'sq' | 'en';

const translations: Record<SupportedLocale, Record<string, string>> = {
    // Albanian translations (default locale)
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
        showOnMap: 'Shfaq në hartë',
        // Map controls
        switchMap: 'Ndrysho hartën',
        home: 'Qendra',
    },
    // English translations
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
        showOnMap: 'Show on map',
        // Map controls
        switchMap: 'Switch map view',
        home: 'Home',
    },
};

/**
 * Returns a translation for a given key and locale.  If the translation is
 * missing, the key itself is returned.  This helper avoids external
 * dependencies and supports simple string lookups only.
 *
 * @param key     The translation key (e.g. 'noProperties').
 * @param locale  The locale code (sq or en) used for lookup.  Defaults to 'sq'.
 */
export function getTranslation(
    key: string,
    locale: SupportedLocale = 'sq'
): string {
    return translations[locale]?.[key] ?? key;
}

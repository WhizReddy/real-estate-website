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
        // Draw controls (not currently used in UI, reserved for future i18n)
        drawArea: 'Vizato Zonën',
        clearArea: 'Fshi Zonën',
        // Home page hero and contact section
        exclusiveAgency: 'Agjencia Ekskluzive e Tiranës',
        findYourPerfectHome: 'Gjeni Shtëpinë Tuaj të Përsosur',
        heroDescription: 'Zbulimi i pasurive premium në lokacionet më të kërkuara të Tiranës. Shërbim elitar për klientë që kërkojnë përsosmërinë.',
        viewListings: 'Shiko Shpalljet',
        interactiveMap: 'Harta Interaktive',
        activeProperties: 'Pasuri Aktive',
        reliability: 'Besueshmëri',
        support: 'Mbështetje',
        locations: 'Lokacionet',
        openFullMap: 'Hap Hartën e Plotë',
        contact: 'Kontaktoni',
        readyToMove: 'Gati për të Lëvizur?',
        teamHelpDescription: 'Ekipi ynë i ekspertëve është gati t’ju ndihmojë në çdo hap të procesit të pasurive të patundshme.',
        callUs: 'Na telefononi',
        contactUs: 'Na Kontaktoni',
        contactDescription: 'Na tregoni se çfarë po kërkoni dhe ne do t’ju kontaktojmë me ofertat më të mira.',
        namePlaceholder: 'Emri juaj',
        emailPlaceholder: 'Email-i juaj',
        messagePlaceholder: 'Mesazhi juaj...',
        sendMessage: 'Dërgo Mesazh',
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
        // Draw controls (not currently used in UI, reserved for future i18n)
        drawArea: 'Draw Area',
        clearArea: 'Clear Area',
        // Home page hero and contact section
        exclusiveAgency: 'Exclusive Agency of Tirana',
        findYourPerfectHome: 'Find Your Perfect Home',
        heroDescription: 'Discover premium properties in Tirana’s most sought-after locations. Elite service for clients who demand excellence.',
        viewListings: 'View Listings',
        interactiveMap: 'Interactive Map',
        activeProperties: 'Active Properties',
        reliability: 'Reliability',
        support: 'Support',
        locations: 'Locations',
        openFullMap: 'Open Full Map',
        contact: 'Contact',
        readyToMove: 'Ready to Move?',
        teamHelpDescription: 'Our team of experts is ready to assist you at every step of the real estate process.',
        callUs: 'Call Us',
        contactUs: 'Contact Us',
        contactDescription: 'Tell us what you’re looking for and we’ll reach out with the best offers.',
        namePlaceholder: 'Your name',
        emailPlaceholder: 'Your email',
        messagePlaceholder: 'Your message...',
        sendMessage: 'Send Message',
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

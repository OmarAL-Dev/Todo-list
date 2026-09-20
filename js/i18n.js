const SUPPORTED_LANGUAGES = ["en", "ar"];
const DEFAULT_LANGUAGE = "en";
const RTL_LANGUAGES = ["ar"];
const LOCALES_PATH = "assets/Lang";

// Supported translatable attributes.
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title"];

const locales = {};              // Loaded locale data.
let currentLanguage = DEFAULT_LANGUAGE;
let latestRequest = 0;           // Ignore stale requests when switching quickly.

async function loadLocale(language) {
    if (locales[language]) return locales[language];

    try {
        const response = await fetch(`${LOCALES_PATH}/${language}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        locales[language] = await response.json();
        return locales[language];
    } catch (error) {
        console.error(`Failed to load locale "${language}":`, error);
        return {}; // Do not cache failures so a later retry remains possible.
    }
}

// Resolve the current language, then fall back to English.
function lookup(key) {
    return locales[currentLanguage]?.[key] ?? locales[DEFAULT_LANGUAGE]?.[key];
}

function lookupPlural(key, count) {
    const find = (locale, language) => {
        if (!locale) return undefined;
        const category = new Intl.PluralRules(language).select(count);
        return locale[`${key}.${category}`] ?? locale[`${key}.other`];
    };

    return find(locales[currentLanguage], currentLanguage)
        ?? find(locales[DEFAULT_LANGUAGE], DEFAULT_LANGUAGE);
}

// Resolve a pluralized translation or return undefined when it is missing.
export function tPlural(key, count) {
    return lookupPlural(key, count);
}

// Translate all matching elements inside the provided root.
export function translate(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
        const text = lookup(element.dataset.i18n);
        if (text !== undefined) element.textContent = text;
    });

    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        root.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
            const text = lookup(element.getAttribute(`data-i18n-${attribute}`));
            if (text !== undefined) element.setAttribute(attribute, text);
        });
    });
}

export async function setLanguage(language) {
    const target = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    const request = ++latestRequest;

    // Load English as a fallback together with the requested language.
    await Promise.all([...new Set([DEFAULT_LANGUAGE, target])].map(loadLocale));

    if (request !== latestRequest) return; // A newer request has superseded this one.

    currentLanguage = target;

    const root = document.documentElement;
    root.setAttribute("lang", target);
    root.setAttribute("dir", RTL_LANGUAGES.includes(target) ? "rtl" : "ltr");

    translate();
}
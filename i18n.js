/**
 * i18n.js — Internationalization module
 *
 * Manages EN/ES language switching across all pages.
 * Usage: include this script, then call i18n.init() on DOMContentLoaded.
 *
 * Each translatable element must carry a data-i18n="key" attribute.
 * The key maps to strings in the TRANSLATIONS object below.
 *
 * Persists the user's language choice in localStorage under "lang".
 */

const i18n = (() => {
    /* -----------------------------------------------------------------------
       TRANSLATIONS
       Each key maps to { en: "...", es: "..." }
    ----------------------------------------------------------------------- */
    const TRANSLATIONS = {
        /* Shared / navigation */
        "nav.back": {
            en: "← Back",
            es: "← Volver al inicio"
        },
        "lang.toggle.label": {
            en: "ES",     /* label shown when current language is EN */
            es: "EN"      /* label shown when current language is ES */
        },

        /* index.html */
        "home.role": {
            en: "Product Designer",
            es: "Diseñador de Producto"
        },
        "home.bio": {
            en: "Product designer focused on solving complex problems through simple, functional, and visually refined solutions. Specialized in strategic conceptualization, information architecture, and interaction design.",
            es: "Diseñador de producto enfocado en la resolución de problemas complejos a través de soluciones sencillas, funcionales y de alta calidad visual. Especializado en conceptualización estratégica, arquitectura de información y diseño de interacción."
        },
        "home.section.projects": {
            en: "Featured Projects",
            es: "Proyectos Destacados"
        },
        "home.section.articles": {
            en: "Articles",
            es: "Artículos"
        },
        "home.project1.title": {
            en: "Case Study 1",
            es: "Caso de Estudio 1"
        },
        "home.article1.title": {
            en: "Strategic Thinking in Product Design",
            es: "Pensamiento estratégico en el diseño de producto"
        },

        /* article-1.html */
        "article1.title": {
            en: "Strategic Thinking in Product Design",
            es: "Pensamiento estratégico en el diseño de producto"
        },
        "article1.subtitle": {
            en: "Article · 2026",
            es: "Artículo · 2026"
        },
        "article1.body.p1": {
            en: "Strategic thinking in product design means understanding not just what users need today, but what business goals, technical constraints, and market dynamics require over time. Great design is never purely aesthetic—it is the result of deliberate decisions grounded in context.",
            es: "El pensamiento estratégico en el diseño de producto implica entender no solo lo que los usuarios necesitan hoy, sino también qué requieren los objetivos de negocio, las restricciones técnicas y la dinámica del mercado a lo largo del tiempo. El buen diseño nunca es puramente estético: es el resultado de decisiones deliberadas fundamentadas en el contexto."
        },
        "article1.body.p2": {
            en: "You can add images, explanatory videos in MP4, or paragraphs of text to detail your strategic design process.",
            es: "Puedes añadir imágenes, vídeos explicativos en MP4, o texto en párrafos para detallar tu proceso de diseño estratégico."
        },

        /* a5f16aa6.html (protected case study) */
        "case1.title": {
            en: "Management App Design",
            es: "Diseño de una App de Gestión"
        },
        "case1.subtitle": {
            en: "Protected case study · Confidential content",
            es: "Caso de estudio protegido · Contenido Confidencial"
        },
        "case1.body.p1": {
            en: "If you can read this, you have successfully entered the cryptographic password in the static GitHub Pages system.",
            es: "Si estás viendo esto, es porque has introducido correctamente la contraseña criptográfica en el sistema estático de GitHub Pages."
        },
        "case1.body.p2": {
            en: "Here you can share your product metrics, complex UX flows, or strategic design decisions that you did not want to leave publicly accessible on the web.",
            es: "Aquí puedes explayarte enseñando tus métricas de producto, flujos de UX complejos o decisiones estratégicas de diseño que no querías dejar abiertas a todo el público en la red."
        },

        /* 404.html */
        "404.heading": {
            en: "404",
            es: "404"
        },
        "404.tagline": {
            en: "This page does not exist or access is restricted.",
            es: "Esta página no existe o el acceso está restringido."
        },
        "404.body": {
            en: "If you were trying to access a protected project, you have most likely entered an incorrect password. Confidential file names are cryptographically generated, so a wrong code will bring you here.",
            es: "Si estabas intentando acceder a un proyecto protegido, es muy probable que hayas introducido una contraseña incorrecta. Los nombres de nuestros archivos confidenciales se generan criptográficamente, por lo que un código erróneo te traerá directamente aquí."
        },

        /* Note widget */
        "note.label": {
            en: "NOTE",
            es: "NOTA"
        },
        "note.placeholder": {
            en: "Write a note… It will be saved in your cache.",
            es: "Escribe una nota… Se guardará en tu caché."
        },
        "note.clear.confirm": {
            en: "Do you want to delete the notes saved in this sticky note?",
            es: "¿Quieres borrar las notas guardadas en este post-it?"
        }
    };

    /* -----------------------------------------------------------------------
       CONSTANTS
    ----------------------------------------------------------------------- */
    const STORAGE_KEY  = "lang";
    const DEFAULT_LANG = "en";
    const SUPPORTED    = ["en", "es"];

    /* -----------------------------------------------------------------------
       STATE
    ----------------------------------------------------------------------- */
    let currentLang = DEFAULT_LANG;

    /* -----------------------------------------------------------------------
       PRIVATE HELPERS
    ----------------------------------------------------------------------- */

    /**
     * Reads a persisted language preference from localStorage.
     * Falls back to DEFAULT_LANG if nothing is stored or value is invalid.
     *
     * @returns {string} "en" or "es"
     */
    function loadSavedLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
    }

    /**
     * Translates a single key into the requested language.
     * Returns the key itself as a fallback so missing translations are visible.
     *
     * @param {string} key
     * @param {string} lang
     * @returns {string}
     */
    function translate(key, lang) {
        const entry = TRANSLATIONS[key];
        if (!entry) {
            console.warn(`i18n: missing key "${key}"`);
            return key;
        }
        return entry[lang] ?? entry[DEFAULT_LANG] ?? key;
    }

    /**
     * Applies translations to every element that carries a data-i18n attribute.
     *
     * @param {string} lang
     */
    function applyTranslations(lang) {
        const elements = document.querySelectorAll("[data-i18n]");

        elements.forEach((el) => {
            const key = el.dataset.i18n;
            el.textContent = translate(key, lang);
        });

        /* Also update placeholder attributes where present */
        const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
        placeholders.forEach((el) => {
            const key = el.dataset.i18nPlaceholder;
            el.setAttribute("placeholder", translate(key, lang));
        });

        /* Keep <html lang="..."> in sync for accessibility */
        document.documentElement.lang = lang;
    }

    /**
     * Updates the toggle button label to reflect the language the user
     * would switch TO (not the current one).
     *
     * @param {string} lang — current language
     */
    function updateToggleButton(lang) {
        const btn = document.getElementById("lang-toggle");
        if (btn) {
            btn.textContent = translate("lang.toggle.label", lang);
            btn.setAttribute("aria-label",
                lang === "en" ? "Switch to Spanish" : "Switch to English");
        }
    }

    /* -----------------------------------------------------------------------
       PUBLIC API
    ----------------------------------------------------------------------- */

    /**
     * Switches the UI to the given language and persists the choice.
     *
     * @param {string} lang — "en" or "es"
     */
    function setLang(lang) {
        if (!SUPPORTED.includes(lang)) { return; }

        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        applyTranslations(lang);
        updateToggleButton(lang);
    }

    /**
     * Toggles between EN and ES.
     */
    function toggleLang() {
        setLang(currentLang === "en" ? "es" : "en");
    }

    /**
     * Returns the translation for a key in the active language.
     * Useful for JS-generated strings (e.g. confirm dialogs).
     *
     * @param {string} key
     * @returns {string}
     */
    function t(key) {
        return translate(key, currentLang);
    }

    /**
     * Initialises i18n: loads saved preference, renders translations,
     * and wires up the toggle button.
     *
     * Call once on DOMContentLoaded.
     */
    function init() {
        currentLang = loadSavedLang();
        applyTranslations(currentLang);
        updateToggleButton(currentLang);

        const toggleBtn = document.getElementById("lang-toggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", toggleLang);
        }
    }

    return { init, setLang, toggleLang, t };
})();

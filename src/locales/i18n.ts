import { nextTick } from "vue";
import { createI18n, type I18n } from "vue-i18n";
import axios from "axios";
import { setMetaAttributes } from "@/router/metaTagsHandler";
import router from "@/router";
import $bus, { eventTypes } from "@/eventBus/events";

import en from "@/locales/en.json";

export const SUPPORT_LOCALES = ["en", "fr"];

export async function setupI18n() {
  let locale =
    localStorage.getItem("locale") ?? navigator.language.split("-")[0] ?? "en";
  // If the locale is not supported, fallback to English
  if (!["en", "fr"].includes(locale)) {
    locale = "en";
  }

  const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    fallbackLocale: "en", // set fallback locale
    messages: {
      en: en,
    } as Record<string, any>,
    // something vue-i18n options here ...
  });

  await setI18nLanguage(i18n, locale);

  return i18n;
}

// @todo: opportunity to refactor - parts of this code does not / should not run on first page load (e.g. when its called from setupI18n)
export async function setI18nLanguage(
  i18n: I18n<{}, {}, {}, string, false>,
  locale: string
) {
  i18n.global.locale.value = locale;
  // Set the document locale
  document.documentElement.lang = locale;
  // Set the document direction
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  // Set a local storage item
  localStorage.setItem("locale", locale);
  // Set the axios locale
  axios.defaults.headers.common["Accept-Language"] = locale;
  // Load the locale messages
  await loadLocaleMessages(i18n, locale);
  // Re run the meta tags handler when the language changes to update SEO meta tags
  //   When the router first loads, its matched routes are empty, so we know that we don't need to run the meta tags handler (because the page isn't ready yet, so the language meta will be handled after the page loads by the router)
  if (router.currentRoute.value.matched.length !== 0) {
    const to = router.currentRoute.value;
    const from = router.currentRoute.value;
    setMetaAttributes(to, from);
  }
  // Emit an event to let the app know that the language has changed
  $bus.$emit(eventTypes.changed_locale, locale);
}

export async function loadLocaleMessages(
  i18n: { global: { setLocaleMessage: (arg0: any, arg1: any) => void } },
  locale: string
) {
  // load locale messages with dynamic import
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `../locales/${locale}.json`
  );

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);
  return nextTick();
}

const i18n = await setupI18n();

export default i18n;

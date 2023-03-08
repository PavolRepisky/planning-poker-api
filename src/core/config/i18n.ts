import i18next from 'i18next';
import I18NexFsBackend from 'i18next-fs-backend';
import * as i18NextMiddleware from 'i18next-http-middleware';
import { default as en, default as sk } from './locales/en/translation.json';

export const defaultNS = 'default';

export const resources = {
  en: {
    [defaultNS]: en,
  },
  sk: {
    [defaultNS]: sk,
  },
};

i18next
  .use(I18NexFsBackend)
  .use(i18NextMiddleware.LanguageDetector)
  .init({
    defaultNS,
    ns: [defaultNS],
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18NextMiddleware.handle(i18next);

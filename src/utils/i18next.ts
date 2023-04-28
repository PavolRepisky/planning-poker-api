import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import en from '../../locales/en/translation.json';
import sk from '../../locales/sk/translation.json';

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    resources: {
      en: {
        translation: en,
      },
      sk: {
        translation: sk,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'sk'],
  });

export default i18nextMiddleware.handle(i18next);

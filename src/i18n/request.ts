import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { APP_TIME_ZONE } from '@/lib/runtime-config';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: APP_TIME_ZONE,
  };
});

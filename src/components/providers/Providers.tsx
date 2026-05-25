'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';

export function Providers({
  children,
  messages,
  locale,
  timeZone,
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
  timeZone: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={timeZone}
      >
        {children}
      </NextIntlClientProvider>
    </NextThemesProvider>
  );
}

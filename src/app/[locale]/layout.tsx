import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/providers/Providers';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Simple Skill',
  description: 'Enterprise-grade Next.js project',
};

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });
  const isProduction = process.env.NODE_ENV === 'production';
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <Providers locale={locale} messages={messages}>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
        {isProduction && gaId && <GoogleAnalytics gaId={gaId} />}
        {isProduction && gtmId && <GoogleTagManager gtmId={gtmId} />}
        {isProduction && clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}
      </body>
    </html>
  );
}

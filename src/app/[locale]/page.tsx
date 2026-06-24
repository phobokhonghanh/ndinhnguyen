import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ThemeToggle } from '@/components/features/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/features/i18n/LanguageSwitcher';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { InfoBox } from '@/components/ui/info-box';

/**
 * Enhanced IndexPage using standardized components.
 * Follows Atomic Design for scalability.
 */
export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background transition-colors duration-300">
      {/* Quick Settings - Fixed position */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Card className="w-[600px] shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg italic mt-1">
            {t('rule')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Reusable Info Section */}
          <InfoBox
            title={t('welcome')}
            description={t('description')}
            className="shadow-sm"
          />

          {/* New Grid for Experience & Homelab */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoBox
              title={t('experience')}
              description={t('experience_desc')}
              href="/experience"
              className="h-full"
            />
            <InfoBox
              title={t('homelab')}
              description={t('homelab_desc')}
              href="#"
              className="h-full"
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

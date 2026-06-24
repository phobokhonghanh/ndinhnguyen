import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NavBar } from '@/components/features/cashback/NavBar';
import { CashbackDashboard } from '@/components/features/cashback/CashbackDashboard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cashback' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function CashbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      {/* Sticky NavBar specific to cashback layout */}
      <NavBar />

      {/* Main Cashback Portal Content */}
      <CashbackDashboard />
    </main>
  );
}

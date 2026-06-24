import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { NavBar } from '@/components/features/experience/NavBar';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
import { HeroSection } from '@/components/features/experience/HeroSection';
import { TechStackSection } from '@/components/features/experience/TechStackSection';
import { ExperienceSection } from '@/components/features/experience/ExperienceSection';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'experience' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main
      className="experience-page min-h-screen overflow-x-hidden bg-[var(--experience-bg)]"
      id="top"
    >
      {/* Dot-grid background decoration */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage:
            'radial-gradient(var(--experience-accent-border) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Sticky Navbar */}
      <NavBar />

      {/* Hero Panel — L-Shape layout */}
      <section className="relative z-10 container mx-auto max-w-6xl px-6 py-10 lg:py-14 clearfix">
        {/* Left column: Avatar + Info (Floated left) */}
        <div className="w-full lg:w-[320px] xl:w-[340px] lg:float-left lg:mr-10 xl:mr-14 mb-10">
          <HeroSection />
        </div>

        {/* Right column: Skills Grid (Flows around the floated hero) */}
        <div className="block">
          <TechStackSection />
        </div>
      </section>

      {/* Experience Section — dark wrapper to preserve existing dark styles */}
      <div
        className="relative z-10 clear-both bg-[var(--experience-bg)]"
        id="contact"
      >
        <ExperienceSection />
      </div>

      {/* Footer is rendered by [locale]/layout.tsx automatically */}
    </main>
  );
}

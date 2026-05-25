'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/features/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/features/theme/ThemeToggle';

const NAV_LINK_KEYS = [
  { key: 'nav_home', href: '/' as const },
  { key: 'nav_experience', href: '/experience' as const },
  { key: 'nav_homelab', href: '#' },
] as const;

export function NavBar() {
  const t = useTranslations('experience');
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[var(--experience-nav-bg)] backdrop-blur-md border-b border-[var(--experience-nav-border)] shadow-sm">
      <nav className="container mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-6">
        {/* Left: Nav links */}
        <ul className="hidden sm:flex items-center gap-6">
          {NAV_LINK_KEYS.map(({ key, href }) => {
            const isDisabled = href === '#';
            const isActive = !isDisabled && pathname === href;

            if (isDisabled) {
              return (
                <li key={key}>
                  <span className="text-sm text-[var(--experience-subtle)] cursor-not-allowed font-medium">
                    {t(key)}
                  </span>
                </li>
              );
            }

            if (href.startsWith('#')) {
              return (
                <li key={key}>
                  <a
                    href={href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--experience-accent)] font-semibold'
                        : 'text-[var(--experience-muted)] hover:text-[var(--experience-accent)]'
                    }`}
                  >
                    {t(key)}
                  </a>
                </li>
              );
            }

            return (
              <li key={key}>
                <Link
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--experience-accent)] font-semibold'
                      : 'text-[var(--experience-muted)] hover:text-[var(--experience-accent)]'
                  }`}
                >
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: Lang + Theme toggles */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto sm:ml-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile: hamburger placeholder (nav links hidden on mobile) */}
        <div className="sm:hidden">
          <span className="text-xs text-[var(--experience-subtle)]">Menu</span>
        </div>
      </nav>
    </header>
  );
}

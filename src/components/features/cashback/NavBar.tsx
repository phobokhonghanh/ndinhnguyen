'use client';

import * as React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/features/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/features/theme/ThemeToggle';

/**
 * NavBar for Affiliate page.
 * Styled with warm orange borders, logo and integration with Lang/Theme toggles.
 */
export function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--aff-nav-bg)] backdrop-blur-md border-b border-[var(--aff-border)] transition-colors duration-300">
      <nav className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo and Back link */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--aff-border)] hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-[var(--aff-text)] hover:text-[var(--aff-orange)] active:scale-95 cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>

          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/10">
              <Share2 className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden xs:block">
              <span className="text-[var(--aff-text)]">Portal</span>
              <span className="text-[var(--aff-orange)] ml-1">Cashback</span>
            </span>
          </div>
        </div>

        {/* Right: Language Switcher and Theme Toggle */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

'use client';

import Image from 'next/image';
import { MapPin, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('experience');

  return (
    <div className="flex flex-col items-center lg:items-start gap-7 text-center lg:text-left">
      {/* Avatar */}
      <div className="relative">
        {/* Decorative dashed ring */}
        <div className="absolute -inset-3 rounded-full border-2 border-[var(--experience-accent-border)] border-dashed" />
        {/* Soft glow */}
        <div className="absolute inset-0 rounded-full bg-[var(--experience-accent-muted)] blur-xl scale-110" />

        <div
          className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px] rounded-full overflow-hidden border-4 border-[var(--experience-bg)]"
          style={{
            boxShadow:
              '0 0 0 6px var(--experience-accent-muted), 0 20px 60px var(--experience-accent-muted)',
          }}
        >
          <Image
            src="/images/avatar.png"
            alt="Nguyen Dinh Nguyen"
            fill
            sizes="(min-width: 768px) 260px, 220px"
            className="object-cover object-top"
            priority
          />
        </div>
      </div>

      {/* Name & Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--experience-heading)] leading-tight">
          NGUYỄN ĐÌNH NGUYÊN
        </h1>
        <p className="text-sm md:text-base font-bold tracking-widest text-[var(--experience-accent)] uppercase mt-1.5">
          SOFTWARE &amp; DATA ENGINEER
        </p>
      </div>

      {/* Bio */}
      <p className="text-xs md:text-sm font-semibold uppercase tracking-wide text-[var(--experience-muted)] leading-relaxed max-w-xs">
        {t('hero_bio')}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center lg:justify-start gap-3 w-full">
        <a
          href="/CV_Developer_Nguyen_Dinh_Nguyen_EN.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 bg-[var(--experience-accent)] text-[var(--experience-button-text)] text-sm font-bold rounded-lg
                     hover:bg-[var(--experience-accent-hover)] active:scale-95 transition-all duration-200 shadow-md"
        >
          {t('hero_view_cv')}
        </a>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2.5 w-full">
        <span className="flex items-center justify-center lg:justify-start gap-2.5 text-sm text-[var(--experience-muted)]">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--experience-icon-bg)] flex-shrink-0">
            <MapPin className="h-4 w-4 text-[var(--experience-accent)]" />
          </span>
          {t('hero_location')}
        </span>
        <span className="flex items-center justify-center lg:justify-start gap-2.5 text-sm text-[var(--experience-muted)]">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--experience-icon-bg)] flex-shrink-0">
            <GraduationCap className="h-4 w-4 text-[var(--experience-accent)]" />
          </span>
          {t('hero_education')}
        </span>
      </div>
    </div>
  );
}

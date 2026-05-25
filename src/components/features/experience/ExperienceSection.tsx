'use client';

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string;
  product?: string;
  tags: string[];
}

import { useTranslations } from 'next-intl';

export function ExperienceSection() {
  const t = useTranslations('experience');
  const experiences: ExperienceItem[] = [
    {
      company: t('exp1_company'),
      role: t('exp1_role'),
      period: t('exp1_period'),
      product: t('exp1_product'),
      description: t('exp1_desc'),
      tags: [t('exp1_tag1'), t('exp1_tag2'), t('exp1_tag3')],
    },
    {
      company: t('exp2_company'),
      role: t('exp2_role'),
      period: t('exp2_period'),
      description: t('exp2_desc'),
      tags: [t('exp2_tag1'), t('exp2_tag2'), t('exp2_tag3')],
    },
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[var(--experience-accent-muted)] rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--experience-heading)] mb-4">
            {t('section_experience')}
          </h2>
          <p className="text-[var(--experience-muted)]">
            {t('section_experience_subtitle')}
          </p>
        </div>

        <div className="relative pl-8 md:pl-0">
          {/* Vertical line - hidden on very small mobile if desired, but here we keep it with padding */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--experience-accent-border)] via-[var(--experience-accent-muted)] to-transparent md:-translate-x-1/2" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 top-0 w-4 h-4 rounded-full bg-[var(--experience-accent)] border-4 border-[var(--experience-bg)] shadow-[0_0_10px_var(--experience-accent-glow)] -translate-x-1/2 z-10 hidden md:block" />

                {/* Content Side */}
                <div className="md:w-1/2 space-y-4">
                  <div
                    className={`p-6 md:p-8 rounded-2xl bg-[var(--experience-surface)] border border-[var(--experience-border)] hover:border-[var(--experience-accent-border)] transition-all duration-500 group relative overflow-hidden backdrop-blur-sm`}
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--experience-accent-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--experience-accent)]">
                          {exp.period}
                        </span>
                        <h3 className="text-xl font-bold text-[var(--experience-heading)]">
                          {exp.role}
                        </h3>
                      </div>

                      <div className="mb-4">
                        <div className="text-lg font-semibold text-[var(--experience-text)]">
                          {exp.company}
                        </div>
                        {exp.product && (
                          <div className="text-sm text-[var(--experience-muted)] italic">
                            {exp.product}
                          </div>
                        )}
                      </div>

                      <p className="text-[var(--experience-muted)] text-sm leading-relaxed mb-6">
                        {exp.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-[var(--experience-accent-muted)] border border-[var(--experience-accent-border)] text-[10px] font-bold text-[var(--experience-accent)] uppercase tracking-tight"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacer Side for Desktop */}
                <div className="md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

import { useTranslations } from 'next-intl';

export function ContactSection() {
  const t = useTranslations('experience');
  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/phobokhonghanh',
      icon: <Github className="h-6 w-6" />,
      color: 'hover:text-[#2dba4e]',
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/ndinhnguyende/',
      icon: <Linkedin className="h-6 w-6" />,
      color: 'hover:text-[#0a66c2]',
    },
  ];

  return (
    <section className="py-24 px-6 bg-[var(--experience-surface)]">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--experience-heading)] mb-4">
            {t('section_contact')}
          </h2>
          <p className="text-[var(--experience-muted)]">
            {t('contact_subtitle')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-12">
          {/* Email Card */}
          <a
            href="mailto:ndinhnguyen.work@gmail.com"
            className="group relative inline-flex flex-col items-center p-8 md:p-12 rounded-3xl bg-[var(--experience-surface)] border border-[var(--experience-border)] hover:bg-[var(--experience-surface-hover)] hover:border-[var(--experience-accent-border)] transition-all duration-500 max-w-md w-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <ExternalLink className="h-5 w-5" />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[var(--experience-accent-muted)] flex items-center justify-center mb-6 text-[var(--experience-accent)] group-hover:scale-110 transition-transform">
              <Mail className="h-8 w-8" />
            </div>

            <span className="text-sm uppercase tracking-widest text-[var(--experience-subtle)] mb-2 font-bold">
              {t('contact_email_label')}
            </span>
            <span className="text-xl md:text-2xl font-bold text-[var(--experience-heading)] break-all">
              ndinhnguyen.work@gmail.com
            </span>
          </a>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-14 h-14 rounded-full bg-[var(--experience-surface)] border border-[var(--experience-border)] text-[var(--experience-muted)] ${link.color} hover:border-current transition-all duration-300 hover:scale-110`}
                title={link.name}
              >
                {link.icon}
                <span className="sr-only">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

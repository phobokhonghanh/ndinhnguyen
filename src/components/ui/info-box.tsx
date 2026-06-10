import * as React from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface InfoBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  href?: string;
  external?: boolean;
}

/**
 * InfoBox component - A flexible container for displaying information with optional linking.
 * Atomic Design: Molecule/Atom.
 *
 * @param title - The main heading in the box.
 * @param description - The supporting text (supports \n).
 * @param href - Optional link destination.
 * @param external - If true, opens link in a new tab.
 */
export function InfoBox({
  title,
  description,
  href,
  external,
  className,
  children,
  ...props
}: InfoBoxProps) {
  const content = (
    <div
      className={cn(
        'p-6 rounded-xl bg-muted/30 border border-border transition-all duration-300 hover:bg-muted/50',
        href && 'hover:border-primary/50 cursor-pointer',
        className,
      )}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-semibold mb-2 text-foreground tracking-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

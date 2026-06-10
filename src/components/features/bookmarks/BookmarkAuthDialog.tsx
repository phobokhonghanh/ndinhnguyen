'use client';

import * as React from 'react';
import { KeyRound, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookmarkDashboardLabels } from './types';

interface BookmarkAuthDialogProps {
  labels: BookmarkDashboardLabels;
  message: string | null;
  isLoading: boolean;
  onSubmit: (token: string) => void;
}

export function BookmarkAuthDialog({
  labels,
  message,
  isLoading,
  onSubmit,
}: BookmarkAuthDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4 backdrop-blur-md">
      <form
        suppressHydrationWarning
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-auth-title"
        aria-describedby="bookmark-auth-description"
        className="w-full max-w-md overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const token = formData.get('token');
          onSubmit(typeof token === 'string' ? token.trim() : '');
        }}
      >
        <div className="border-b bg-muted/30 p-5">
          <div className="mb-4 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 id="bookmark-auth-title" className="text-xl font-semibold">
            {labels.loginTitle}
          </h1>
          <p
            id="bookmark-auth-description"
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          >
            {labels.loginSubtitle}
          </p>
        </div>

        <div className="p-5">
          <label className="grid gap-1.5 text-sm font-medium">
            {labels.token}
            <span className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                suppressHydrationWarning
                ref={inputRef}
                name="token"
                type="password"
                autoComplete="current-password"
                placeholder={labels.tokenPlaceholder}
                className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </span>
          </label>

          {message && (
            <p className="mt-3 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {message}
            </p>
          )}

          <Button type="submit" className="mt-5 w-full" disabled={isLoading}>
            {labels.loginButton}
          </Button>
        </div>
      </form>
    </div>
  );
}

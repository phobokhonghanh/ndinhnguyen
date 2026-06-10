'use client';

import * as React from 'react';

export default function BookmarksRedirectPage() {
  React.useEffect(() => {
    window.location.replace('/en/bookmarks');
  }, []);

  return null;
}

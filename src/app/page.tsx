'use client';

import * as React from 'react';

export default function RootPage() {
  React.useEffect(() => {
    window.location.replace('/en');
  }, []);

  return null;
}

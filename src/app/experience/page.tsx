'use client';

import * as React from 'react';

export default function ExperienceRedirectPage() {
  React.useEffect(() => {
    window.location.replace('/en/experience');
  }, []);

  return null;
}

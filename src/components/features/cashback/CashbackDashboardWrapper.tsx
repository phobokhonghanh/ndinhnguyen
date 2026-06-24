'use client';

import dynamic from 'next/dynamic';

const CashbackDashboardWrapper = dynamic(
  () => import('./CashbackDashboard').then((mod) => mod.CashbackDashboard),
  { ssr: false }
);

export default CashbackDashboardWrapper;

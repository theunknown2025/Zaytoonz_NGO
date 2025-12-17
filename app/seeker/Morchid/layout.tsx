'use client';

import { ReactNode } from 'react';

export default function MorchidLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Morchid uses the parent seeker layout which includes the Zaytoonz sidebar
  // This layout just ensures proper sizing within the main content area
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
}

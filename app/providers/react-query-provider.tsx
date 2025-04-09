"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/react-query/client';
import dynamic from 'next/dynamic';

// Dynamically import React Query DevTools to avoid loading it in production
const ReactQueryDevtools = dynamic(
  () => process.env.NODE_ENV === 'development' 
    ? import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools)
    : Promise.resolve(() => null),
  { ssr: false }
);

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Use our enhanced QueryClient factory
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
} 
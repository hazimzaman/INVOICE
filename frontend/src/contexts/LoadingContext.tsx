'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import PageLoader from '@/components/common/PageLoader';

interface LoadingContextType {
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({} as LoadingContextType);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setLoading: setIsLoading }}>
      {isLoading && <PageLoader />}
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext); 
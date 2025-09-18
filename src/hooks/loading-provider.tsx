
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import LogoStatic from '@/components/logo-static';
import { Card } from '@/components/ui/card';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

const LoadingOverlay = () => {
  return (
    <div
      style={{
        backdropFilter: 'blur(1px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md p-8 space-y-4 shadow-2xl">
        <LogoStatic />
        <p className="text-center text-muted-foreground animate-pulse">Loading, please wait...</p>
      </Card>
    </div>
  );
};


export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  );
};

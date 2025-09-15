
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import LogoStatic from '@/components/logo-static';
import { Card, CardContent } from '@/components/ui/card';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50">
            <Card className="w-full max-w-sm p-8 space-y-4">
                <div className="flex justify-center">
                    <LogoStatic />
                </div>
                <p className="text-center text-muted-foreground">Loading, please wait...</p>
            </Card>
        </div>
    );
};


export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingOverlay />}
      {children}
    </LoadingContext.Provider>
  );
};

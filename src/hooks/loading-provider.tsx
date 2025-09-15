
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import LogoStatic from '@/components/logo-static';
import { cn } from '@/lib/utils';

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

const LoadingOverlay = ({ visible }: { visible: boolean }) => {
    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div className="w-full max-w-sm p-8 space-y-4 rounded-2xl bg-gray-700/10 bg-clip-padding backdrop-filter backdrop-blur-md border border-gray-100/20">
                <div className="flex justify-center">
                    <LogoStatic />
                </div>
                <p className="text-center text-muted-foreground">Loading, please wait...</p>
            </div>
        </div>
    );
};

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  // Start with loading true to prevent flashes of content on initial load
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <LoadingOverlay visible={isLoading} />
      {children}
    </LoadingContext.Provider>
  );
};

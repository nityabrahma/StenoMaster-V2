
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import LogoStatic from '@/components/logo-static';
import { cn } from '@/lib/utils';
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

const LoadingOverlay = ({ visible }: { visible: boolean }) => {
    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <Card className="w-full max-w-sm">
                <CardContent className="p-8 space-y-4">
                    <div className="flex justify-center">
                        <LogoStatic />
                    </div>
                    <p className="text-center text-muted-foreground">Loading, please wait...</p>
                </CardContent>
            </Card>
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

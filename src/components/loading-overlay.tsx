
'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import Logo from './logo';

const LoadingOverlay = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev >= 95) {
          return prev + 1;
        }
        if (prev >= 85) {
          return prev + Math.random() * 2;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm p-8 space-y-4 rounded-2xl bg-gray-700/10 bg-clip-padding backdrop-filter backdrop-blur-md border border-gray-100/20">
        <div className="flex justify-center">
            <Logo />
        </div>
        <p className="text-center text-muted-foreground">Loading, please wait...</p>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
};

export default LoadingOverlay;

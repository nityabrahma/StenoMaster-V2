
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useLoading } from '@/hooks/loading-provider';

type AppRouterContextType = {
  push: (href: string) => void;
  back: () => void;
};

const AppRouterContext = createContext<AppRouterContextType | undefined>(
  undefined
);

export const useAppRouter = () => {
  const context = useContext(AppRouterContext);
  if (!context) {
    throw new Error('useAppRouter must be used within an AppRouterProvider');
  }
  return context;
};

export const AppRouterProvider = ({ children }: { children: ReactNode }) => {
  const router = useNextRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, setIsLoading } = useLoading();

  // Effect to turn off loading when navigation completes
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  const push = useCallback(
    (href: string) => {
      const currentPath = pathname + '?' + searchParams.toString();
      // Don't show loading if it's the same page
      if (href !== currentPath) {
        setIsLoading(true);
      }
      router.push(href);
    },
    [router, setIsLoading, pathname, searchParams]
  );

  const back = useCallback(() => {
    setIsLoading(true);
    router.back();
  }, [router, setIsLoading]);

  const value = {
    push,
    back,
  };

  return (
    <AppRouterContext.Provider value={value}>
      {children}
    </AppRouterContext.Provider>
  );
};

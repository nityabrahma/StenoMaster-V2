
'use client';

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useLoading } from '@/components/loading-provider';

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
  const { setIsLoading } = useLoading();

  useEffect(() => {
    // This effect runs when the page navigation has completed.
    setIsLoading(false);
  }, [pathname, searchParams, setIsLoading]);

  const push = useCallback(
    (href: string) => {
      setIsLoading(true);
      router.push(href);
    },
    [router, setIsLoading]
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

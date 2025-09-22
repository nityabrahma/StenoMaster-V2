
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  Suspense,
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

// This internal component contains the logic that uses useSearchParams
function AppRouterLogic({ children }: { children: ReactNode }) {
  const { isLoading, setIsLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect to turn off loading when navigation completes
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return <>{children}</>;
}


export const AppRouterProvider = ({ children }: { children: ReactNode }) => {
  const router = useNextRouter();
  const { setIsLoading } = useLoading();
  const pathname = usePathname();
  
  const push = useCallback(
    (href: string) => {
      // We can't use searchParams here directly, so we check just the pathname
      if (href !== pathname) {
        setIsLoading(true);
      }
      router.push(href);
    },
    [router, setIsLoading, pathname]
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
       <Suspense>
        <AppRouterLogic>{children}</AppRouterLogic>
       </Suspense>
    </AppRouterContext.Provider>
  );
};


import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Suspense } from 'react';
import { LoadingProvider } from '@/hooks/loading-provider';
import BackgroundStars from '@/components/background-stars';
import { AppRouterProvider } from '@/hooks/use-app-router';

export const metadata: Metadata = {
  title: 'StenoMaster',
  description: 'The ultimate platform for stenography and typing excellence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=LXGW+Marker+Gothic&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <BackgroundStars />
        <LoadingProvider>
          <AppRouterProvider>
            <AuthProvider>
              <Suspense>{children}</Suspense>
              <Toaster />
            </AuthProvider>
          </AppRouterProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

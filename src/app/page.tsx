
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LoginForm from '@/components/login-form';
import Logo from '@/components/logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Target,
  Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


function LoginDialogContent({
  isLoginOpen,
  setIsLoginOpen,
}: {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const showLogin = searchParams.get('showLogin') === 'true';
    if (showLogin) {
      setIsLoginOpen(showLogin);
    }
  }, [searchParams, setIsLoginOpen]);

  return (
    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-button">Login</Button>
      </DialogTrigger>
      <DialogContent
        className="glass-card w-full max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            <Logo />
          </DialogTitle>
        </DialogHeader>
        <LoginForm onLoginSuccess={() => setIsLoginOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

const HomePageContent = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const router = useRouter();
  const { isAuthenticated, user, firstLoadDone } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Assignments',
      description:
        'Practice with real stenography assignments uploaded by your teachers',
      gradient: 'from-blue-400 to-sky-300',
    },
    {
      icon: Users,
      title: 'Class Management',
      description:
        'Teachers can create classes and manage students efficiently',
      gradient: 'from-purple-400 to-pink-400',
    },
    {
      icon: Target,
      title: 'Real-time Feedback',
      description:
        'Get instant accuracy and WPM feedback on your typing practice',
      gradient: 'from-emerald-400 to-teal-300',
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time with detailed analytics',
      gradient: 'from-amber-400 to-red-400',
    },
    {
      icon: Clock,
      title: 'Timed Practice',
      description:
        'Practice with time constraints to improve speed and accuracy',
      gradient: 'from-indigo-400 to-blue-300',
    },
    {
      icon: GraduationCap,
      title: 'Educational Focus',
      description:
        'Designed specifically for stenography education and learning',
      gradient: 'from-violet-400 to-purple-300',
    },
  ];

  useEffect(() => {
    if (firstLoadDone && isAuthenticated && user) {
        router.push('/dashboard');
    }
  }, [isAuthenticated, user, router, firstLoadDone]);

  if (!firstLoadDone) {
    return (
      <div className="flex justify-center items-center h-screen p-20 bg-background">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background"
    >
      <nav
        className="bg-background/60 backdrop-blur-lg border-b border-white/10 fixed w-full top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 justify-center">
              <Logo />
            </div>
            <div className="flex items-center space-x-4">
              <Suspense fallback={<Button disabled>Loading...</Button>}>
                <LoginDialogContent
                    isLoginOpen={isLoginOpen}
                    setIsLoginOpen={setIsLoginOpen}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="py-22 sm:py-32 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl"></div>
              <div className="relative">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 primary-gradient-text leading-tight font-headline">
                  Master Stenography
                  <br />
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl gradient-text">
                    with Interactive Learning
                  </span>
                </h1>
                <p
                  className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-300"
                >
                  A comprehensive platform for learning stenography with
                  real-time feedback, progress tracking, and interactive
                  assignments designed for both teachers and students.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="gradient-button w-full sm:w-auto"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-black/20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 primary-gradient-text font-headline">
                Why Choose StenoMaster?
              </h2>
              <p
                className="text-lg font-medium sm:text-xl text-gray-300"
              >
                Everything you need to excel in stenography education
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="glass-card p-6">
                    <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-lg`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3
                          className="text-lg sm:text-xl font-bold text-gray-100"
                        >
                          {feature.title}
                        </h3>
                    </div>
                    <p
                        className="leading-relaxed text-gray-300 mt-4"
                    >
                        {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="glass-card"
            >
              <div className="py-12 sm:py-16 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 primary-gradient-text">
                  Ready to Start Learning?
                </h3>
                <p
                  className="text-lg sm:text-xl mb-8 leading-relaxed text-gray-300"
                >
                  Join thousands of students and teachers already using
                  StenoMaster to master stenography
                </p>
                <Button
                  size="lg"
                  className="gradient-button"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Login to Your Account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="border-t border-white/10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-background/50"
      >
        <span
          className="justify-center items-center text-lg sm:text-xl font-bold w-full flex gap-1 flex-col sm:flex-row copyright-message text-gray-400"
        >
          <p>Copyright © {new Date().getFullYear()}</p>
          <p className="font-normal hidden sm:flex">|</p>
          <p>Powered By Shubham Mishra</p>
        </span>
      </footer>
    </div>
  );
};


function HomePageWithSuspense() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePageContent />
        </Suspense>
    )
}

export default function Home() {
    return <HomePageWithSuspense />
}

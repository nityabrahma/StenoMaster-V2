'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import LoginForm from '@/components/login-form';
import { useTheme } from '@/hooks/use-theme';
import Logo from '@/components/logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { Award, BookOpen, Clock, GraduationCap, Target, Users } from 'lucide-react';


function LoginDialogContent({
  isLoginOpen,
  setIsLoginOpen,
}: {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const { colorScheme } = useTheme();

  useEffect(() => {
    const showLogin = searchParams.get('showLogin') === 'true';
    if(showLogin) {
        setIsLoginOpen(showLogin);
    }
  }, [searchParams, setIsLoginOpen]);

  return (
    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
      <DialogTrigger asChild>
        <Button>Login</Button>
      </DialogTrigger>
      <DialogContent
        className={`flex flex-col rounded-xl ${
          colorScheme === 'dark'
            ? 'max-h-[90vh] max-w-sm sm:max-w-lg bg-gradient-to-br from-gray-900/95 via-blue-950/90 to-purple-950/95 backdrop-blur-xl border-0 shadow-2xl'
            : 'max-h-[90vh] max-w-sm sm:max-w-lg bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 backdrop-blur-xl border-0 shadow-2xl'
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold text-center">
            <Logo />
          </DialogTitle>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}

const LoginPageContent = () => {
  const { colorScheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { isAuthenticated, user, firstLoadDone } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Assignments',
      description:
        'Practice with real stenography assignments uploaded by your teachers',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      icon: Users,
      title: 'Class Management',
      description:
        'Teachers can create classes and manage students efficiently',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Target,
      title: 'Real-time Feedback',
      description:
        'Get instant accuracy and WPM feedback on your typing practice',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time with detailed analytics',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Clock,
      title: 'Timed Practice',
      description:
        'Practice with time constraints to improve speed and accuracy',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: GraduationCap,
      title: 'Educational Focus',
      description:
        'Designed specifically for stenography education and learning',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  useEffect(() => {
    if (firstLoadDone) {
      if (isAuthenticated) {
        if (user) {
          router.push(`/dashboard`);
        }
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router, firstLoadDone]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen p-20 bg-background">
        <Card className="animate-bounce">
          <CardContent className="flex flex-col gap-2 items-center justify-center p-20 h-full">
            <div className="flex items-center space-x-3 justify-center">
              <Logo />
            </div>
            <p
              className={`text-lg font-bold text-muted-foreground`}
            >
              Loading...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        colorScheme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <nav
        className={`border-b border-border/50 backdrop-blur-xl fixed w-full top-0 z-50 ${
            colorScheme === 'dark' ? 'bg-gray-950/80' : 'bg-gray-50/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 justify-center">
                <Logo />
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
                <LoginDialogContent
                  isLoginOpen={isLoginOpen}
                  setIsLoginOpen={setIsLoginOpen}
                />
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
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                    Master Stenography
                    <br />
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                    with Interactive Learning
                    </span>
                </h2>
                <p
                    className={`text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed`}
                >
                    A comprehensive platform for learning stenography with real-time
                    feedback, progress tracking, and interactive assignments
                    designed for both teachers and students.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto font-bold"
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
            className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 backdrop-blur-sm ${
                colorScheme === 'dark' ? "bg-black/20" : "bg-white/20"
            }`}
        >
            <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Why Choose StenoMaster?
                </h3>
                <p
                className={`text-lg font-medium sm:text-xl text-muted-foreground`}
                >
                Everything you need to excel in stenography education
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                    <Card
                    key={index}
                    className={`relative overflow-hidden bg-card backdrop-blur-xl border group`}
                    >
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                    ></div>
                    <CardHeader className="relative z-10">
                        <div className="flex items-center space-x-3">
                        <div
                            className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                        >
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle
                            className={`text-lg sm:text-xl text-card-foreground`}
                        >
                            {feature.title}
                        </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p
                        className={`leading-relaxed text-muted-foreground`}
                        >
                        {feature.description}
                        </p>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
            </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
            <Card
                className={`relative overflow-hidden bg-card backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
                <CardContent className="py-12 sm:py-16 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Ready to Start Learning?
                </h3>
                <p
                    className={`text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed`}
                >
                    Join thousands of students and teachers already using
                    StenoMaster to master stenography
                </p>
                <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsLoginOpen(true)}
                >
                    Login to Your Account
                </Button>
                </CardContent>
            </Card>
            </div>
        </section>
      </main>

      <footer
        className={`border-t border-border/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 p-1`}
      >
        <span
          className={`justify-center items-center text-lg sm:text-xl font-bold w-full flex gap-1 flex-col sm:flex-row text-muted-foreground`}
        >
          <p>Copyright © {new Date().getFullYear()}</p>
          <p className="font-normal hidden sm:flex">|</p>
          <p>Powered By Shubham Mishra</p>
        </span>
      </footer>
    </div>
  );
};

export default LoginPageContent;
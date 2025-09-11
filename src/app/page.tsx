import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, Feather, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Feather className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-headline">
              StenoMaster
            </span>
          </Link>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-accent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter">
                Master the Art of Typing
              </h1>
              <p className="text-lg text-muted-foreground">
                StenoMaster is the ultimate platform for students and teachers to
                improve typing speed and accuracy through targeted practice and
                detailed analytics.
              </p>
              <Button size="lg" asChild>
                <Link href="/login">Start Learning Now</Link>
              </Button>
            </div>
            <div className="relative h-64 md:h-full w-full rounded-xl shadow-2xl overflow-hidden">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={heroImage.imageHint}
                  className="transform hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              )}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Why Choose StenoMaster?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform is designed with both educators and learners in
                mind, providing a seamless experience for all.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <Users className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-headline pt-4">
                    For Teachers & Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Manage classes, create assignments, and track progress with
                    our role-based system.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <Zap className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-headline pt-4">
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get detailed insights on typing speed (WPM), accuracy, and
                    common mistakes.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-headline pt-4">
                    Customized Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Practice with pre-defined texts or custom assignments created
                    by teachers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StenoMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

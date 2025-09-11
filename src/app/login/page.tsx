'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { students, teachers } from '@/lib/data';
import { Feather, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (selectedUserId) {
      setIsLoading(true);
      try {
        await login(selectedUserId);
        // The redirect is handled by the AuthProvider now
      } catch (error) {
        console.error("Login failed:", error);
        // Optionally, show an error toast to the user
        setIsLoading(false);
      }
    }
  };

  const allUsers = [...teachers, ...students];

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Feather className="w-8 h-8 text-primary" />
          </Link>
          <CardTitle className="font-headline text-2xl">
            Welcome to StenoMaster
          </CardTitle>
          <CardDescription>
            Select your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-profile">User Profile</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={isLoading}>
              <SelectTrigger id="user-profile">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={!selectedUserId || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

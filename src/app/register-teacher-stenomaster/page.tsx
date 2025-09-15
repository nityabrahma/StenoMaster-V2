
'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { AuthProvider } from "@/hooks/auth-provider";

const TeacherRegistrationContent = () => {
  const [teacherSignup, setTeacherSignup] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const router = useAppRouter();

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !teacherSignup.name.trim() ||
      !teacherSignup.email.trim() ||
      !teacherSignup.password.trim() ||
      !teacherSignup.confirmPassword.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (teacherSignup.password !== teacherSignup.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (teacherSignup.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
        await signup({
            name: teacherSignup.name,
            email: teacherSignup.email,
            password: teacherSignup.password,
            role: "teacher",
        });
        toast({
            title: "Success!",
            description: "Teacher account created successfully. Redirecting to login."
        });
        router.push('/');
    } catch(error: any) {
        toast({
            title: 'Registration Failed',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive'
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4 font-headline">Create Teacher Account</h2>
        <form onSubmit={handleTeacherSignup} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={teacherSignup.name}
                onChange={(e) =>
                setTeacherSignup((prev) => ({
                    ...prev,
                    name: e.target.value,
                }))
                }
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={teacherSignup.email}
                onChange={(e) =>
                setTeacherSignup((prev) => ({
                    ...prev,
                    email: e.target.value,
                }))
                }
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
                id="signup-password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={teacherSignup.password}
                onChange={(e) =>
                setTeacherSignup((prev) => ({
                    ...prev,
                    password: e.target.value,
                }))
                }
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">Confirm Password</Label>
            <Input
                id="signup-confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={teacherSignup.confirmPassword}
                onChange={(e) =>
                setTeacherSignup((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                }))
                }
            />
            </div>
            <Button
            disabled={loading}
            type="submit"
            className="w-full"
            >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
            </Button>
        </form>
        </Card>
    </div>
  );
};

export default function TeacherRegistrationPage() {
    return (
        <AuthProvider>
            <TeacherRegistrationContent />
        </AuthProvider>
    )
}

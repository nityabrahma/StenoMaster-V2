'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth-provider";
import { UserPlus, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";

const TeacherRegistrationContent = () => {
  const [teacherSignup, setTeacherSignup] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const router = useAppRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setTeacherSignup((prev) => ({ ...prev, [id]: value }));
  };

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !teacherSignup.fullName.trim() ||
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
        name: teacherSignup.fullName,
        email: teacherSignup.email,
        password: teacherSignup.password,
        role: "teacher",
      });
      toast({
        title: "Success!",
        description: "Teacher account created successfully. You can now log in.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 font-headline">Create Teacher Account</h2>
        <form onSubmit={handleTeacherSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={teacherSignup.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={teacherSignup.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={teacherSignup.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={teacherSignup.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            <Button
              disabled={loading}
              type="submit"
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Create Account
            </Button>
        </form>
      </Card>
    </div>
  );
};

export default function TeacherRegistrationPage() {
    return (
        <TeacherRegistrationContent />
    )
}

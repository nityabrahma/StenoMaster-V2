'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth-provider";
import { UserPlus, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";

const TeacherRegistrationContent = () => {
  const [step, setStep] = useState(1);
  const [teacherSignup, setTeacherSignup] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const router = useAppRouter();

  const handleNextStep = () => {
    if (!teacherSignup.name.trim() || !teacherSignup.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !teacherSignup.password.trim() ||
      !teacherSignup.confirmPassword.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
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
        <h2 className="text-2xl font-bold text-center mb-4 font-headline">Create Teacher Account</h2>
        {step === 1 && (
          <div className="space-y-4">
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
            <Button onClick={handleNextStep} className="w-full">
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleTeacherSignup} className="space-y-4">
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handlePreviousStep} className="w-1/3">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button
                disabled={loading}
                type="submit"
                className="w-2/3"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Create Account
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default function TeacherRegistrationPage() {
    return (
        <TeacherRegistrationContent />
    )
}

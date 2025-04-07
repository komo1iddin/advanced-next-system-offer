"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { School } from "lucide-react";
import { FormBase } from "@/app/components/forms/FormBase";
import FormTextField from "@/app/components/forms/fields/FormTextField";
import { FormRow } from "@/app/components/forms/FormRow";
import { FormSection } from "@/app/components/forms/FormSection";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      // Your registration logic here
      toast({
        title: "Success",
        description: "Registration successful!",
      });
      router.push("/auth/signin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            <School className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormBase
            schema={formSchema}
            defaultValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            submitText={isLoading ? "Creating account..." : "Create account"}
          >
            {(form) => (
              <FormSection>
                <FormRow>
                  <FormTextField
                    name="name"
                    label="Name"
                    placeholder="John Doe"
                    required
                  />
                </FormRow>
                <FormRow>
                  <FormTextField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </FormRow>
                <FormRow>
                  <FormTextField
                    name="password"
                    label="Password"
                    type="password"
                    required
                  />
                </FormRow>
                <FormRow>
                  <FormTextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    required
                  />
                </FormRow>
              </FormSection>
            )}
          </FormBase>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/auth/signin")}
            >
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
} 
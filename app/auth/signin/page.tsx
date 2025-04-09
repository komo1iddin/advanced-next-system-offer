"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { School } from "lucide-react";
import { FormBase } from "@/app/components/forms/FormBase";
import FormTextField from "@/app/components/forms/fields/FormTextField";
import { FormRow } from "@/app/components/forms/FormRow";
import { FormSection } from "@/app/components/forms/FormSection";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });

      // Redirect to the callback URL or home page
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.push(callbackUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormBase
            schema={formSchema}
            defaultValues={{
              email: "",
              password: "",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            submitText={isLoading ? "Signing in..." : "Sign in"}
          >
            {(form) => (
              <FormSection>
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
              </FormSection>
            )}
          </FormBase>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/auth/register")}
            >
              Register
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
} 
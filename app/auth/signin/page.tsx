"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { School } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast({
          title: "Authentication Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        // Redirect on successful sign in
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sign in to StudyBridge</CardTitle>
          <CardDescription>
            Enter your credentials to access the platform
          </CardDescription>
          {error && (
            <div className="p-2 mt-2 text-sm text-red-600 bg-red-50 rounded-md">
              {error === "CredentialsSignin" 
                ? "Invalid email or password" 
                : "An error occurred. Please try again."}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        {...field} 
                        type="email"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your password" 
                        {...field} 
                        type="password"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/auth/register")}
            >
              Create one
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/")}
            >
              Back to home
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
} 
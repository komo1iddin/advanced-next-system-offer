"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    AccessDenied: "You do not have permission to access this resource.",
    Configuration: "There is a problem with the server configuration.",
    Verification: "The verification link may have expired or already been used.",
    Default: "An unexpected error occurred during authentication.",
    CredentialsSignin: "Invalid email or password. Please try again.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center bg-destructive/10 rounded-md">
            <p className="text-destructive font-medium">
              {errorMessage}
            </p>
            {error && (
              <p className="text-xs text-muted-foreground mt-2">
                Error code: {error}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center">
            <Button asChild>
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
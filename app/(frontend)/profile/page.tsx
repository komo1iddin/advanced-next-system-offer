"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormBase } from "@/app/components/forms/FormBase";
import FormTextField from "@/app/components/forms/fields/FormTextField";
import { FormRow } from "@/app/components/forms/FormRow";
import { FormSection } from "@/app/components/forms/FormSection";
import { User } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<FormValues>({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Fetch current user data
    if (status === "authenticated") {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setUserData({
              firstName: data.user.firstName || "",
              lastName: data.user.lastName || "",
              phone: data.user.phone || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      };

      fetchUserData();
    }
  }, [status, router]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormBase
            schema={formSchema}
            defaultValues={userData}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            submitText={isLoading ? "Saving..." : "Save Changes"}
          >
            {(form) => (
              <FormSection title="Personal Information">
                <FormRow>
                  <FormTextField
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                  />
                </FormRow>
                <FormRow>
                  <FormTextField
                    name="lastName"
                    label="Last Name"
                    placeholder="Doe"
                  />
                </FormRow>
                <FormRow>
                  <FormTextField
                    name="phone"
                    label="Phone Number"
                    placeholder="+1 (123) 456-7890"
                  />
                </FormRow>
                <FormRow>
                  <div className="text-sm text-muted-foreground">
                    Email: {session?.user?.email || "Not available"}
                  </div>
                </FormRow>
              </FormSection>
            )}
          </FormBase>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
} 
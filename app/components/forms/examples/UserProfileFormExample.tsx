"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import { 
  FormBase, 
  FormTextField,
  FormSelectField,
  FormSwitchField,
  FormSection,
  FormRow,
  FormSpacer,
  FormCard,
  FormDivider,
  FormHelperText,
  validation
} from "@/app/components/forms";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// User profile form validation schema
const userProfileSchema = z.object({
  // Basic information
  firstName: validation.requiredString("First name is required"),
  lastName: validation.requiredString("Last name is required"),
  email: validation.email("Please enter a valid email address"),
  
  // Contact information
  phone: validation.phoneNumber("Please enter a valid phone number").optional(),
  
  // Address
  streetAddress: validation.requiredString("Street address is required"),
  city: validation.requiredString("City is required"),
  state: z.string().min(1, { message: "State is required" }),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, { message: "Please enter a valid ZIP code" }),
  
  // Preferences
  receiveEmails: z.boolean(),
  receiveTexts: z.boolean(),
  
  // Account
  username: z.string().min(4, { message: "Username must be at least 4 characters" }),
  
  // Optional information
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  website: validation.url("Please enter a valid URL").optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

const defaultValues: Partial<UserProfileFormValues> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  receiveEmails: true,
  receiveTexts: false,
  username: "",
  company: "",
  jobTitle: "",
  website: ""
};

// Mock list of US states for the state dropdown
const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  // ... other states would be listed here
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

export default function UserProfileFormExample() {
  const router = useRouter();
  
  const handleSubmit = async (data: UserProfileFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Form submitted:", data);
    toast.success("Profile updated successfully!");
    
    // In a real app, you would save the data and navigate
    // router.push("/profile");
  };
  
  const handleCancel = () => {
    toast.info("Form cancelled");
    // In a real app, you would navigate away
    // router.push("/dashboard");
  };
  
  return (
    <FormBase
      schema={userProfileSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Save Profile"
      className="max-w-3xl mx-auto"
      showFooter={false} // We'll use the footer in FormCard instead
    >
      <FormCard
        title="User Profile"
        description="Please fill out your profile information"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button type="submit">Save Profile</Button>
          </div>
        }
      >
        <FormSection title="Basic Information">
          <FormRow columns={2}>
            <FormTextField 
              name="firstName" 
              label="First Name" 
              required 
            />
            <FormTextField 
              name="lastName" 
              label="Last Name" 
              required 
            />
          </FormRow>
          
          <FormTextField 
            name="email" 
            label="Email Address" 
            required 
          />
          <FormHelperText>
            We'll never share your email with anyone else.
          </FormHelperText>
          
          <FormTextField 
            name="phone" 
            label="Phone Number" 
            placeholder="+1 (555) 123-4567" 
          />
        </FormSection>
        
        <FormDivider label="Address Information" spacing="large" />
        
        <FormSection>
          <FormTextField 
            name="streetAddress" 
            label="Street Address" 
            required 
          />
          
          <FormRow columns={3}>
            <FormTextField 
              name="city" 
              label="City" 
              required 
            />
            <FormSelectField 
              name="state" 
              label="State" 
              options={US_STATES} 
              required 
            />
            <FormTextField 
              name="zipCode" 
              label="ZIP Code" 
              required 
            />
          </FormRow>
        </FormSection>
        
        <FormSpacer size="large" />
        
        <FormSection title="Account Information">
          <FormTextField 
            name="username" 
            label="Username" 
            required 
          />
          <FormHelperText variant="tip">
            This will be used for login purposes
          </FormHelperText>
          
          <FormRow columns={2}>
            <FormSwitchField 
              name="receiveEmails" 
              label="Receive Email Updates" 
            />
            <FormSwitchField 
              name="receiveTexts" 
              label="Receive Text Messages" 
            />
          </FormRow>
        </FormSection>
        
        <FormDivider label="Optional Information" />
        
        <FormSection description="The following information is optional but helps us personalize your experience">
          <FormRow columns={2}>
            <FormTextField 
              name="company" 
              label="Company" 
            />
            <FormTextField 
              name="jobTitle" 
              label="Job Title" 
            />
          </FormRow>
          
          <FormTextField 
            name="website" 
            label="Website" 
            placeholder="https://example.com" 
          />
          <FormHelperText variant="warning">
            Ensure website URL includes http:// or https://
          </FormHelperText>
        </FormSection>
      </FormCard>
    </FormBase>
  );
} 
"use client";

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { 
  FormTextField, 
  FormTextareaField,
  FormSwitchField,
  FormSection,
  validation
} from "@/app/components/forms";
import { Agent } from "../hooks/useAgentsQuery";

// Validation schema for agent form
const agentFormSchema = z.object({
  name: validation.requiredString("Agent name is required").max(100),
  description: z.string().optional(),
  whatsapp: z.string().optional(),
  whatsappGroup: z.string().optional(),
  wechat: z.string().optional(),
  wechatGroup: z.string().optional(),
  telegram: z.string().optional(),
  telegramGroup: z.string().optional(),
  telephone: z.string().optional(),
  facebookPage: z.string().optional(),
  facebookGroup: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  website: z.string().optional(),
  active: z.boolean().default(true),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AgentFormContentProps {
  form: UseFormReturn<any>;
  mode: "create" | "edit";
}

// Export static properties for use by parent components
const AgentForm = {
  schema: agentFormSchema,
  
  getDefaultValues: (agent?: Agent | null) => {
    return {
      name: agent?.name || "",
      description: agent?.description || "",
      whatsapp: agent?.whatsapp || "",
      whatsappGroup: agent?.whatsappGroup || "",
      wechat: agent?.wechat || "",
      wechatGroup: agent?.wechatGroup || "",
      telegram: agent?.telegram || "",
      telegramGroup: agent?.telegramGroup || "",
      telephone: agent?.telephone || "",
      facebookPage: agent?.facebookPage || "",
      facebookGroup: agent?.facebookGroup || "",
      email: agent?.email || "",
      website: agent?.website || "",
      active: agent?.active ?? true,
    };
  },
  
  Content: ({ form, mode }: AgentFormContentProps) => {
    return (
      <div>
        {/* Basic Information Section */}
        <FormSection>
          <FormTextField
            name="name"
            label="Agent Name"
            placeholder="Enter agent name"
            required
          />
          
          <FormTextareaField
            name="description"
            label="Description"
            placeholder="Enter a brief description of the agent"
            rows={3}
          />
          
          <FormSwitchField
            name="active"
            label="Active"
            description="Only active agents will be visible to users"
          />
        </FormSection>
        
        {/* Contact Information Section */}
        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormTextField
              name="telephone"
              label="Telephone"
              placeholder="Enter phone number"
            />
            
            <FormTextField
              name="email"
              label="Email"
              placeholder="Enter email address"
            />
            
            <FormTextField
              name="website"
              label="Website"
              placeholder="Enter website URL"
            />
          </div>
        </FormSection>
        
        {/* Social Media & Messaging Section */}
        <FormSection title="Social Media & Messaging">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <FormTextField
                  name="whatsapp"
                  label="WhatsApp"
                  placeholder="Enter WhatsApp ID"
                />
              </div>
              
              <div className="mb-4">
                <FormTextField
                  name="whatsappGroup"
                  label="WhatsApp Group"
                  placeholder="Enter group link"
                />
              </div>
              
              <div className="mb-4">
                <FormTextField
                  name="telegram"
                  label="Telegram"
                  placeholder="Enter username"
                />
              </div>
              
              <div className="mb-4">
                <FormTextField
                  name="telegramGroup"
                  label="Telegram Group"
                  placeholder="Enter group link"
                />
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <FormTextField
                  name="wechat"
                  label="WeChat"
                  placeholder="Enter WeChat ID"
                />
              </div>
              
              <div className="mb-4">
                <FormTextField
                  name="wechatGroup"
                  label="WeChat Group"
                  placeholder="Enter group ID"
                />
              </div>
              
              <div className="mb-4">
                <FormTextField
                  name="facebookPage"
                  label="Facebook Page"
                  placeholder="Enter page URL"
                />
              </div>
              
              <div className="mb-4">
                <FormTextField
                  name="facebookGroup"
                  label="Facebook Group"
                  placeholder="Enter group URL"
                />
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    );
  }
};

export default AgentForm; 
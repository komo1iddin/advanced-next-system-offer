import React from "react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "./FormSection";

interface ScholarshipSectionProps {
  scholarshipAvailable: boolean;
  setScholarshipAvailable: (value: boolean) => void;
  scholarshipDetails: string;
  setScholarshipDetails: (value: string) => void;
}

export function ScholarshipSection({
  scholarshipAvailable,
  setScholarshipAvailable,
  scholarshipDetails,
  setScholarshipDetails,
}: ScholarshipSectionProps) {
  return (
    <FormSection title="Scholarship Information">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Scholarship</h3>
        <div className="flex items-center space-x-2">
          <Switch
            id="scholarshipAvailable"
            checked={scholarshipAvailable}
            onCheckedChange={setScholarshipAvailable}
          />
          <label htmlFor="scholarshipAvailable" className="text-sm">
            Scholarship Available
          </label>
        </div>
      </div>
      
      {scholarshipAvailable && (
        <div className="space-y-2">
          <label htmlFor="scholarshipDetails" className="text-sm font-medium">
            Scholarship Details <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="scholarshipDetails"
            value={scholarshipDetails}
            onChange={(e) => setScholarshipDetails(e.target.value)}
            placeholder="Describe available scholarships, eligibility, and application process"
            className="min-h-[100px]"
            required={scholarshipAvailable}
          />
        </div>
      )}
    </FormSection>
  );
} 
import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { FormSection } from "./FormSection";

interface ApplicationDeadlineSectionProps {
  applicationDeadline: Date;
  setApplicationDeadline: (date: Date) => void;
}

export function ApplicationDeadlineSection({
  applicationDeadline,
  setApplicationDeadline,
}: ApplicationDeadlineSectionProps) {
  return (
    <FormSection title="Application Deadline">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Deadline Date <span className="text-destructive">*</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {applicationDeadline ? format(applicationDeadline, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={applicationDeadline}
              onSelect={(date) => date && setApplicationDeadline(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </FormSection>
  );
} 
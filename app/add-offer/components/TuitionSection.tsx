import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "./FormSection";

// Available currencies
const currencies = ["USD", "CNY", "EUR", "GBP"];

// Available periods
const periods = ["Year", "Semester", "Course", "Month"];

interface TuitionSectionProps {
  tuitionAmount: number;
  setTuitionAmount: (value: number) => void;
  tuitionCurrency: string;
  setTuitionCurrency: (value: string) => void;
  tuitionPeriod: string;
  setTuitionPeriod: (value: string) => void;
}

export function TuitionSection({
  tuitionAmount,
  setTuitionAmount,
  tuitionCurrency,
  setTuitionCurrency,
  tuitionPeriod,
  setTuitionPeriod,
}: TuitionSectionProps) {
  return (
    <FormSection title="Tuition Fees">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="tuitionAmount" className="text-sm font-medium">
            Amount <span className="text-destructive">*</span>
          </label>
          <Input
            id="tuitionAmount"
            type="number"
            min="0"
            value={tuitionAmount}
            onChange={(e) => setTuitionAmount(parseFloat(e.target.value))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="tuitionCurrency" className="text-sm font-medium">
            Currency <span className="text-destructive">*</span>
          </label>
          <Select value={tuitionCurrency} onValueChange={setTuitionCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="tuitionPeriod" className="text-sm font-medium">
            Period <span className="text-destructive">*</span>
          </label>
          <Select value={tuitionPeriod} onValueChange={setTuitionPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormSection>
  );
} 
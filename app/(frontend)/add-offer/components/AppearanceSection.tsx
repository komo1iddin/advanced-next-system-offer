import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSection } from "./FormSection";

// Color options for cards - solid colors instead of gradients
const cardColors = [
  { bg: "bg-rose-50", accent: "border-rose-200 text-rose-600" },
  { bg: "bg-blue-50", accent: "border-blue-200 text-blue-600" },
  { bg: "bg-amber-50", accent: "border-amber-200 text-amber-600" },
  { bg: "bg-emerald-50", accent: "border-emerald-200 text-emerald-600" },
  { bg: "bg-violet-50", accent: "border-violet-200 text-violet-600" },
  { bg: "bg-orange-50", accent: "border-orange-200 text-orange-600" },
];

interface AppearanceSectionProps {
  selectedColorIndex: number;
  setSelectedColorIndex: (index: number) => void;
  featured: boolean;
  setFeatured: (featured: boolean) => void;
}

export function AppearanceSection({
  selectedColorIndex,
  setSelectedColorIndex,
  featured,
  setFeatured,
}: AppearanceSectionProps) {
  return (
    <FormSection title="Appearance">
      <div className="space-y-2">
        <label className="text-sm font-medium">Color Scheme</label>
        <div className="flex flex-wrap gap-2">
          {cardColors.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedColorIndex(index)}
              className={`w-8 h-8 rounded ${color.bg} ${
                selectedColorIndex === index ? `ring-2 ring-offset-2 ${color.accent.split(" ")[0]}` : ""
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={featured}
          onCheckedChange={(checked) => setFeatured(!!checked)}
        />
        <label htmlFor="featured" className="text-sm font-medium">
          Featured Offer (will be highlighted in the listings)
        </label>
      </div>
    </FormSection>
  );
} 
import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "./FormSection";

// Languages
const languages = ["English", "Chinese", "Russian"];

interface LanguageRequirement {
  language: string;
  minimumScore?: string;
  testName?: string;
}

interface LanguageRequirementsSectionProps {
  languageRequirements: LanguageRequirement[];
  setLanguageRequirements: (requirements: LanguageRequirement[]) => void;
}

export function LanguageRequirementsSection({
  languageRequirements,
  setLanguageRequirements,
}: LanguageRequirementsSectionProps) {
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [currentMinimumScore, setCurrentMinimumScore] = useState("");
  const [currentTestName, setCurrentTestName] = useState("");

  const addLanguageRequirement = () => {
    if (currentLanguage) {
      setLanguageRequirements([
        ...languageRequirements,
        {
          language: currentLanguage,
          minimumScore: currentMinimumScore.trim() || undefined,
          testName: currentTestName.trim() || undefined,
        },
      ]);
      setCurrentLanguage("English");
      setCurrentMinimumScore("");
      setCurrentTestName("");
    }
  };

  const removeLanguageRequirement = (index: number) => {
    setLanguageRequirements(languageRequirements.filter((_, i) => i !== index));
  };

  return (
    <FormSection title="Language Requirements">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium">
            Language <span className="text-destructive">*</span>
          </label>
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="testName" className="text-sm font-medium">
            Test Name
          </label>
          <Input
            id="testName"
            value={currentTestName}
            onChange={(e) => setCurrentTestName(e.target.value)}
            placeholder="E.g., TOEFL, IELTS, HSK"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="minimumScore" className="text-sm font-medium">
            Minimum Score
          </label>
          <div className="flex gap-2">
            <Input
              id="minimumScore"
              value={currentMinimumScore}
              onChange={(e) => setCurrentMinimumScore(e.target.value)}
              placeholder="E.g., 90, 6.5, HSK 4"
              className="flex-1"
            />
            <Button type="button" onClick={addLanguageRequirement}>
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mt-2">
        {languageRequirements.map((req, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
            <div>
              <span className="font-medium">{req.language}</span>
              {req.testName && req.minimumScore && (
                <span> - {req.testName} ({req.minimumScore})</span>
              )}
              {req.testName && !req.minimumScore && <span> - {req.testName}</span>}
              {!req.testName && req.minimumScore && <span> - {req.minimumScore}</span>}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLanguageRequirement(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {languageRequirements.length === 0 && (
          <p className="text-sm text-muted-foreground">No language requirements added yet</p>
        )}
      </div>
    </FormSection>
  );
} 
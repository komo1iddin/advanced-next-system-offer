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
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Add a new language requirement:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="language" className="text-sm font-medium mb-2 block">
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
          
          <div>
            <label htmlFor="testName" className="text-sm font-medium mb-2 block">
              Test Name
            </label>
            <Input
              id="testName"
              value={currentTestName}
              onChange={(e) => setCurrentTestName(e.target.value)}
              placeholder="E.g., TOEFL, IELTS, HSK"
            />
          </div>
          
          <div>
            <label htmlFor="minimumScore" className="text-sm font-medium mb-2 block">
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
      </div>
      
      {languageRequirements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Added Requirements:</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="text-sm text-muted-foreground">Language</div>
            <div className="text-sm text-muted-foreground">Test Name</div>
            <div className="text-sm text-muted-foreground">Minimum Score</div>
          </div>
          
          {languageRequirements.map((req, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 py-3 border-b last:border-b-0">
              <div className="font-medium">{req.language}</div>
              <div>{req.testName || "—"}</div>
              <div className="flex justify-between items-center">
                <span>{req.minimumScore || "—"}</span>
                <button
                  type="button"
                  onClick={() => removeLanguageRequirement(index)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
} 
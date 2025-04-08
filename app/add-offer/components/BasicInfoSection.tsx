import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "./FormSection";
import LocationSelect from "@/app/components/features/location/LocationSelect";
import Link from "next/link";

// Available categories
const degreeLevels = [
  "Bachelor",
  "Master",
  "PhD",
  "Certificate",
  "Diploma",
  "Language Course",
];

// University categories
const categories = [
  "University",
  "College"
];

// Source options
const sourceOptions = [
  "agent",
  "university direct",
  "public university offer"
];

interface Agent {
  _id: string;
  name: string;
  active: boolean;
}

interface UniversityDirect {
  _id: string;
  universityName: string;
  contactPersonName?: string;
  active: boolean;
}

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  universityName: string;
  setUniversityName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  cityId?: string;
  setCityId?: (value: string) => void;
  provinceId?: string;
  setProvinceId?: (value: string) => void;
  degreeLevel: string;
  setDegreeLevel: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  durationInYears: number;
  setDurationInYears: (value: number) => void;
  source: string;
  setSource: (value: string) => void;
  agentId?: string;
  setAgentId?: (value: string) => void;
  universityDirectId?: string;
  setUniversityDirectId?: (value: string) => void;
}

export function BasicInfoSection({
  title,
  setTitle,
  universityName,
  setUniversityName,
  description,
  setDescription,
  location,
  setLocation,
  cityId,
  setCityId,
  provinceId,
  setProvinceId,
  degreeLevel,
  setDegreeLevel,
  category,
  setCategory,
  durationInYears,
  setDurationInYears,
  source,
  setSource,
  agentId,
  setAgentId,
  universityDirectId,
  setUniversityDirectId,
}: BasicInfoSectionProps) {
  // Check if university name is required (only not required when source is "agent")
  const isUniversityNameRequired = source !== "agent";
  
  // State for loading agents and university directs
  const [agents, setAgents] = useState<Agent[]>([]);
  const [universityDirects, setUniversityDirects] = useState<UniversityDirect[]>([]);
  const [loadingAgents, setLoadingAgents] = useState<boolean>(false);
  const [loadingUniversityDirects, setLoadingUniversityDirects] = useState<boolean>(false);
  const [useLegacyLocationInput, setUseLegacyLocationInput] = useState<boolean>(false);

  // Fetch agents when source is "agent"
  useEffect(() => {
    if (source === "agent" && setAgentId) {
      fetchAgents();
    }
  }, [source]);

  // Fetch university directs when source is "university direct"
  useEffect(() => {
    if (source === "university direct" && setUniversityDirectId) {
      fetchUniversityDirects();
    }
  }, [source]);

  // Check if the location is already in the format "City, Province, Country"
  useEffect(() => {
    // If there's a location value but it doesn't match our expected format,
    // enable the legacy input mode for backward compatibility
    if (location && !location.match(/^[^,]+, [^,]+, [^,]+$/)) {
      setUseLegacyLocationInput(true);
    }
  }, [location]);

  // Fetch active agents from API
  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await fetch('/api/agents?activeOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Fetch active university directs from API
  const fetchUniversityDirects = async () => {
    try {
      setLoadingUniversityDirects(true);
      const response = await fetch('/api/university-directs?activeOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch university directs');
      }
      const data = await response.json();
      setUniversityDirects(data.data);
    } catch (error) {
      console.error('Error fetching university directs:', error);
    } finally {
      setLoadingUniversityDirects(false);
    }
  };

  // When source changes, reset related fields
  useEffect(() => {
    if (setAgentId && source !== "agent") {
      setAgentId("");
    }
    if (setUniversityDirectId && source !== "university direct") {
      setUniversityDirectId("");
    }
  }, [source, setAgentId, setUniversityDirectId]);

  // Auto-fill university name when selecting a university direct
  useEffect(() => {
    if (source === "university direct" && universityDirectId) {
      const selected = universityDirects.find(ud => ud._id === universityDirectId);
      if (selected) {
        setUniversityName(selected.universityName);
      }
    }
  }, [universityDirectId, universityDirects, source]);

  // Toggle between legacy input and new location select
  const toggleLocationInput = () => {
    setUseLegacyLocationInput(!useLegacyLocationInput);
    
    // Reset location value when switching between input types
    if (!useLegacyLocationInput) {
      setLocation("");
    }
  };

  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Offer Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Computer Science Bachelor's at Fudan University"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="source" className="text-sm font-medium">
            Offer Source <span className="text-destructive">*</span>
          </label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select offer source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((sourceOption) => (
                <SelectItem key={sourceOption} value={sourceOption}>
                  {sourceOption.charAt(0).toUpperCase() + sourceOption.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Agent selection for agent source */}
      {source === "agent" && setAgentId && (
        <div className="space-y-2">
          <label htmlFor="agentId" className="text-sm font-medium">
            Select Agent <span className="text-destructive">*</span>
          </label>
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger>
              <SelectValue placeholder={loadingAgents ? "Loading agents..." : "Select an agent"} />
            </SelectTrigger>
            <SelectContent>
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-agent-available" disabled>
                  {loadingAgents ? "Loading..." : "No agents available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* University direct selection for university direct source */}
      {source === "university direct" && setUniversityDirectId && (
        <div className="space-y-2">
          <label htmlFor="universityDirectId" className="text-sm font-medium">
            Select University Contact <span className="text-destructive">*</span>
          </label>
          <Select value={universityDirectId} onValueChange={setUniversityDirectId}>
            <SelectTrigger>
              <SelectValue placeholder={loadingUniversityDirects ? "Loading contacts..." : "Select a university contact"} />
            </SelectTrigger>
            <SelectContent>
              {universityDirects.length > 0 ? (
                universityDirects.map((ud) => (
                  <SelectItem key={ud._id} value={ud._id}>
                    {ud.universityName}{ud.contactPersonName ? ` - ${ud.contactPersonName}` : ''}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-university-direct-available" disabled>
                  {loadingUniversityDirects ? "Loading..." : "No university contacts available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="universityName" className="text-sm font-medium">
          University Name {isUniversityNameRequired && <span className="text-destructive">*</span>}
        </label>
        <Input
          id="universityName"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          placeholder="E.g., Fudan University"
          required={isUniversityNameRequired}
          disabled={source === "agent" || (source === "university direct" && !!universityDirectId)}
        />
        {!isUniversityNameRequired && (
          <p className="text-xs text-muted-foreground mt-1">
            University name is not required for agent sources.
          </p>
        )}
        {source === "university direct" && universityDirectId && (
          <p className="text-xs text-muted-foreground mt-1">
            University name is auto-filled from the selected university contact.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about the program, university, and opportunities for students"
          className="min-h-[120px]"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="location" className="text-sm font-medium">
              Location <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <Link href="/admin/locations" className="text-xs text-primary hover:underline">
                Manage locations
              </Link>
              <button 
                type="button" 
                onClick={toggleLocationInput}
                className="text-xs text-primary hover:underline"
              >
                {useLegacyLocationInput ? "Use location selector" : "Use manual input"}
              </button>
            </div>
          </div>
          {useLegacyLocationInput ? (
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="E.g., Shanghai, China"
              required
            />
          ) : (
            <LocationSelect
              value={location}
              onChange={setLocation}
              placeholder="E.g., Shanghai, China"
              onLocationSelect={(cityId, provinceId, locationText) => {
                if (setCityId) setCityId(cityId);
                if (setProvinceId) setProvinceId(provinceId);
              }}
            />
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {useLegacyLocationInput 
              ? "Format: City, Province/State, Country"
              : "Select location from the available cities."}
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="degreeLevel" className="text-sm font-medium">
            Degree Level <span className="text-destructive">*</span>
          </label>
          <Select value={degreeLevel} onValueChange={setDegreeLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select degree level" />
            </SelectTrigger>
            <SelectContent>
              {degreeLevels.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            University Category <span className="text-destructive">*</span>
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select university category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="durationInYears" className="text-sm font-medium">
            Duration (Years) <span className="text-destructive">*</span>
          </label>
          <Input
            id="durationInYears"
            type="number"
            min="0.5"
            step="0.5"
            value={durationInYears}
            onChange={(e) => setDurationInYears(parseFloat(e.target.value))}
            required
          />
        </div>
      </div>
    </FormSection>
  );
} 
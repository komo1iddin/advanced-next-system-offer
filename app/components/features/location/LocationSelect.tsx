"use client";

import { useState, useEffect, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
    country: string;
  };
}

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (cityId: string, provinceId: string, locationString: string) => void;
  onProvinceSelect?: (provinceName: string, country: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function LocationSelect({
  value,
  onChange,
  onLocationSelect,
  onProvinceSelect,
  placeholder = "Select a location",
  disabled = false,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cities when popover opens
  useEffect(() => {
    if (open) {
      fetchCities();
    }
  }, [open]);

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cities?includeProvince=true&activeOnly=true");
      
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      
      const data = await response.json();
      setCities(data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format display text for location
  const formatLocationText = (city: City): string => {
    return `${city.name}, ${city.provinceId.name}, ${city.provinceId.country}`;
  };

  // Handle city selection
  const handleSelect = (city: City) => {
    const locationText = formatLocationText(city);
    onChange(locationText);
    
    // Notify parent component about city and province IDs if callback provided
    if (onLocationSelect) {
      onLocationSelect(
        city._id,
        city.provinceId._id,
        locationText
      );
    }
    
    // Notify parent component about province if callback provided
    if (onProvinceSelect) {
      onProvinceSelect(city.provinceId.name, city.provinceId.country);
    }
    
    setOpen(false);
  };

  // Filter cities based on search term
  const filteredCities = debouncedSearchTerm
    ? cities.filter(city => 
        city.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        city.provinceId.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : cities;

  // Group cities by province for better organization
  const groupedCities = filteredCities.reduce((acc, city) => {
    const province = city.provinceId.name;
    
    if (!acc[province]) {
      acc[province] = [];
    }
    
    acc[province].push(city);
    return acc;
  }, {} as Record<string, City[]>);

  // Get sorted provinces
  const provinces = Object.keys(groupedCities).sort();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-10",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search for a city..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            ref={inputRef}
          />
          <CommandList>
            {loading && <CommandEmpty>Loading locations...</CommandEmpty>}
            {!loading && filteredCities.length === 0 && (
              <CommandEmpty>
                {searchTerm
                  ? "No locations found."
                  : "No locations available. Please add locations in the admin panel first."}
              </CommandEmpty>
            )}
            {provinces.map(province => (
              <CommandGroup key={province} heading={province}>
                {groupedCities[province].map(city => (
                  <CommandItem
                    key={city._id}
                    onSelect={() => handleSelect(city)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        value === formatLocationText(city) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 truncate">{city.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 
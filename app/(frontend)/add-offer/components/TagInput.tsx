import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  badgeVariant?: "default" | "secondary" | "outline"; 
}

export function TagInput({ 
  items, 
  setItems, 
  placeholder,
  badgeVariant = "outline"
}: TagInputProps) {
  const [currentItem, setCurrentItem] = useState("");

  const addItem = () => {
    if (currentItem.trim() && !items.includes(currentItem.trim())) {
      setItems([...items, currentItem.trim()]);
      setCurrentItem("");
    }
  };

  const removeItem = (itemToRemove: string) => {
    setItems(items.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={currentItem}
          onChange={(e) => setCurrentItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={addItem}>
          Add
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={badgeVariant} className="flex items-center gap-1">
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="ml-1 rounded-full hover:bg-muted w-4 h-4 inline-flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No items added yet</p>
        )}
      </div>
    </div>
  );
} 
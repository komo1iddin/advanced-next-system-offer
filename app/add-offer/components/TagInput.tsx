import React, { useState } from "react";
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
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Add a new item:</h4>
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
      </div>
      
      {items.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Added Items:</h4>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant={badgeVariant} className="flex items-center gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
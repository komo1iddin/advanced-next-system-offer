import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RequirementInputProps {
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
}

export function RequirementInput({ items, setItems, placeholder }: RequirementInputProps) {
  const [currentItem, setCurrentItem] = useState("");

  const addItem = () => {
    if (currentItem.trim()) {
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
        <h4 className="text-sm font-medium mb-3">Add a new requirement:</h4>
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
          <h4 className="text-sm font-medium mb-3">Added Requirements:</h4>
          <div>
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="font-medium">{item}</div>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
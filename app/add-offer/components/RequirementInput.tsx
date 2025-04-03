import React, { useState } from "react";
import { X } from "lucide-react";
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
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
            <div>{item}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No items added yet</p>
        )}
      </div>
    </div>
  );
} 
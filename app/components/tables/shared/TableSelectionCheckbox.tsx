import { Checkbox } from "@/components/ui/checkbox";

export interface TableSelectionCheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

export function TableSelectionCheckbox({
  checked,
  onCheckedChange,
  label,
}: TableSelectionCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
    />
  );
} 
"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalBaseProps {
  // The content to trigger the modal
  children: React.ReactNode;
  
  // Modal title
  title?: React.ReactNode;
  
  // Modal description
  description?: React.ReactNode;
  
  // The content of the modal
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  
  // Footer content
  footer?: React.ReactNode;
  
  // Whether the modal is initially open
  defaultOpen?: boolean;
  
  // Control the modal open state externally
  open?: boolean;
  
  // Event handler for when the open state changes
  onOpenChange?: (open: boolean) => void;
  
  // Size of the modal
  size?: ModalSize;
  
  // Additional classes for the modal content
  className?: string;
}

const sizeClassMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[95vw] w-[95vw] h-[90vh]"
};

export function ModalBase({
  children,
  title,
  description,
  content,
  footer,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  size = "md",
  className,
}: ModalBaseProps) {
  // Use controlled or uncontrolled state based on props
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  // Determine if we're using controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled 
    ? controlledOnOpenChange 
    : setUncontrolledOpen;
  
  // Handler to close the modal
  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className={cn(
          "overflow-y-auto",
          sizeClassMap[size],
          size === "full" && "overflow-y-auto flex flex-col",
          className
        )}
      >
        {title && (
          <DialogHeader>
            {typeof title === 'string' ? <DialogTitle>{title}</DialogTitle> : title}
            {description && (typeof description === 'string' 
              ? <DialogDescription>{description}</DialogDescription> 
              : description
            )}
          </DialogHeader>
        )}
        
        <div className={cn(
          "py-4", 
          size === "full" && "flex-grow overflow-y-auto"
        )}>
          {typeof content === 'function' ? content(handleClose) : content}
        </div>
        
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 
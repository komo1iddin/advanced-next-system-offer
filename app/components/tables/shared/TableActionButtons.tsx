import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export interface TableActionProps {
  id: string;
  name?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  isActive?: boolean;
  isDeleting?: boolean;
}

export function TableActionButtons({
  id,
  name = "this item",
  onEdit,
  onDelete,
  onView,
  onToggleActive,
  isActive,
  isDeleting = false,
}: TableActionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleActive = () => {
    if (!onToggleActive || isActive === undefined) return;
    
    // Start animation
    setIsAnimating(true);
    
    // Call the toggle handler
    onToggleActive(id, !isActive);
    
    // End animation after a delay
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Activate/Deactivate button - FIRST in sequence */}
      {onToggleActive && isActive !== undefined && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleActive}
          title={isActive ? "Deactivate" : "Activate"}
          className={`relative ${
            isActive 
              ? "bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-700" 
              : "bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-700"
          } ${isAnimating ? "scale-110 transition-transform duration-300" : ""}`}
        >
          <div className={`${isAnimating ? "animate-pulse" : ""}`}>
            {isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </div>
          
          {/* Animation ring */}
          {isAnimating && (
            <span className="absolute inset-0 rounded-md border-2 animate-ping 
              border-amber-400 opacity-75" 
              style={{ 
                borderColor: isActive ? "#d97706" : "#059669",
                animationDuration: "750ms" 
              }}
            ></span>
          )}
        </Button>
      )}
      
      {/* Edit button */}
      {onEdit && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(id)}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {/* View button */}
      {onView && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onView(id)}
          title="View"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}
      
      {/* Delete button */}
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="text-red-500 hover:text-red-600"
              disabled={isDeleting}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onDelete(id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
} 
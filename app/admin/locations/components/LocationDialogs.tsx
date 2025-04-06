import { 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Province, City } from "../lib/location-service";
import { LocationFormModal } from "./LocationFormModal";

interface DialogControl<T> {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isSubmitting: boolean;
  selected?: T | null;
}

interface LocationDialogsProps {
  provinces: Province[];
  dialogs: {
    province: {
      add: DialogControl<Province>;
      edit: DialogControl<Province>;
    };
    city: {
      add: DialogControl<City>;
      edit: DialogControl<City>;
    };
  };
  onAddProvince: (data: { name: string; active: boolean }) => Promise<void>;
  onUpdateProvince: (data: { name: string; active: boolean }) => Promise<void>;
  onAddCity: (data: { name: string; provinceId: string; active: boolean }) => Promise<void>;
  onUpdateCity: (data: { name: string; provinceId: string; active: boolean }) => Promise<void>;
}

export default function LocationDialogs({
  provinces,
  dialogs,
  onAddProvince,
  onUpdateProvince,
  onAddCity,
  onUpdateCity
}: LocationDialogsProps) {
  return (
    <>
      {/* Add Province Modal - removed button trigger since it's handled in page.tsx */}
      <LocationFormModal
        entityType="province"
        mode="create"
        provinces={provinces}
        onSubmit={onAddProvince}
        isSubmitting={dialogs.province.add.isSubmitting}
        open={dialogs.province.add.isOpen}
        onOpenChange={dialogs.province.add.setOpen}
      />
      
      {/* Add City Modal - removed button trigger since it's handled in page.tsx */}
      <LocationFormModal
        entityType="city"
        mode="create"
        provinces={provinces}
        onSubmit={(data) => {
          // Ensure data has the correct type for city
          if ('provinceId' in data) {
            return onAddCity(data as { name: string; provinceId: string; active: boolean });
          }
          // This should never happen since we specified entityType="city"
          throw new Error("Invalid data format for city");
        }}
        isSubmitting={dialogs.city.add.isSubmitting}
        open={dialogs.city.add.isOpen}
        onOpenChange={dialogs.city.add.setOpen}
      />
      
      {/* Edit Province Modal */}
      {dialogs.province.edit.selected && (
        <LocationFormModal
          entityType="province"
          mode="edit"
          provinces={provinces}
          initialData={dialogs.province.edit.selected}
          onSubmit={onUpdateProvince}
          isSubmitting={dialogs.province.edit.isSubmitting}
          open={dialogs.province.edit.isOpen}
          onOpenChange={dialogs.province.edit.setOpen}
        />
      )}
      
      {/* Edit City Modal */}
      {dialogs.city.edit.selected && (
        <LocationFormModal
          entityType="city"
          mode="edit"
          provinces={provinces}
          initialData={dialogs.city.edit.selected}
          onSubmit={(data) => {
            // Ensure data has the correct type for city
            if ('provinceId' in data) {
              return onUpdateCity(data as { name: string; provinceId: string; active: boolean });
            }
            // This should never happen since we specified entityType="city"
            throw new Error("Invalid data format for city");
          }}
          isSubmitting={dialogs.city.edit.isSubmitting}
          open={dialogs.city.edit.isOpen}
          onOpenChange={dialogs.city.edit.setOpen}
        />
      )}
    </>
  );
} 
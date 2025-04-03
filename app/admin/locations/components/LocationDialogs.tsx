import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Province, City } from "../lib/location-service";
import ProvinceForm from "./ProvinceForm";
import CityForm from "./CityForm";

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
    <div className="flex gap-2">
      {/* Add Province Dialog */}
      <Dialog 
        open={dialogs.province.add.isOpen} 
        onOpenChange={dialogs.province.add.setOpen}
      >
        <DialogTrigger asChild>
          <Button 
            onClick={() => dialogs.province.add.setOpen(true)} 
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Province
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Province</DialogTitle>
            <DialogDescription>
              Add a new province/state to the system.
            </DialogDescription>
          </DialogHeader>
          
          <ProvinceForm
            onSubmit={onAddProvince}
            onCancel={() => dialogs.province.add.setOpen(false)}
            isSubmitting={dialogs.province.add.isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add City Dialog */}
      <Dialog 
        open={dialogs.city.add.isOpen} 
        onOpenChange={dialogs.city.add.setOpen}
      >
        <DialogTrigger asChild>
          <Button 
            onClick={() => dialogs.city.add.setOpen(true)} 
            className="flex items-center gap-2"
            disabled={provinces.length === 0}
          >
            <PlusCircle className="h-4 w-4" />
            Add City
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>
              Add a new city and link it to a province.
            </DialogDescription>
          </DialogHeader>
          
          <CityForm
            provinces={provinces}
            onSubmit={onAddCity}
            onCancel={() => dialogs.city.add.setOpen(false)}
            isSubmitting={dialogs.city.add.isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Province Dialog */}
      <Dialog 
        open={dialogs.province.edit.isOpen} 
        onOpenChange={dialogs.province.edit.setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Province</DialogTitle>
            <DialogDescription>
              Update province details.
            </DialogDescription>
          </DialogHeader>
          
          {dialogs.province.edit.selected && (
            <ProvinceForm
              initialData={dialogs.province.edit.selected}
              onSubmit={onUpdateProvince}
              onCancel={() => dialogs.province.edit.setOpen(false)}
              isSubmitting={dialogs.province.edit.isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit City Dialog */}
      <Dialog 
        open={dialogs.city.edit.isOpen} 
        onOpenChange={dialogs.city.edit.setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>
              Update city details.
            </DialogDescription>
          </DialogHeader>
          
          {dialogs.city.edit.selected && (
            <CityForm
              provinces={provinces}
              initialData={dialogs.city.edit.selected}
              onSubmit={onUpdateCity}
              onCancel={() => dialogs.city.edit.setOpen(false)}
              isSubmitting={dialogs.city.edit.isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
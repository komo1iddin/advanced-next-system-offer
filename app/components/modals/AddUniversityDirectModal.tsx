"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useCreateUniversityDirectMutation } from "@/app/admin/university-directs/hooks/useCreateUniversityDirectMutation";
import { AddUniversityDirectModalComponent } from "./types";

export const AddUniversityDirectModal: AddUniversityDirectModalComponent = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // University Direct state
  const [universityName, setUniversityName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [wechat, setWechat] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [active, setActive] = useState(true);

  // Use React Query mutation
  const { createUniversityDirect, isCreating } = useCreateUniversityDirectMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!universityName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a university name",
        variant: "destructive",
      });
      return;
    }

    const universityDirectData = {
      universityName: universityName.trim(),
      departmentName: departmentName.trim() || undefined,
      contactPersonName: contactPersonName.trim() || undefined,
      position: position.trim() || undefined,
      description: description.trim() || undefined,
      wechat: wechat.trim() || undefined,
      telephone: telephone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      active,
    };
    
    await createUniversityDirect(universityDirectData);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add University Direct</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New University Direct</DialogTitle>
            <DialogDescription>
              Create a new university direct contact
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Information Section */}
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="universityName">
                    University Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="universityName"
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                    placeholder="Enter university name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            {/* Contact Person Section */}
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Contact Person</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPersonName">Contact Person Name</Label>
                  <Input
                    id="contactPersonName"
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Enter position/title"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telephone">Telephone</Label>
                  <Input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Enter telephone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="wechat">WeChat</Label>
                  <Input
                    id="wechat"
                    value={wechat}
                    onChange={(e) => setWechat(e.target.value)}
                    placeholder="Enter WeChat ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create University Direct"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
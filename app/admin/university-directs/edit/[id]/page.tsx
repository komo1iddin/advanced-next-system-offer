"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useUniversityDirectQuery } from "../../hooks/useUniversityDirectQuery";

interface EditUniversityDirectPageProps {
  params: {
    id: string;
  };
}

export default function EditUniversityDirectPage({ params }: EditUniversityDirectPageProps) {
  const universityDirectId = params.id;
  const router = useRouter();

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
  
  // Use React Query hook
  const { 
    universityDirect,
    isLoading,
    isError,
    error,
    updateUniversityDirect,
    isUpdating
  } = useUniversityDirectQuery(universityDirectId);

  // Set form state when data is loaded
  useEffect(() => {
    if (universityDirect) {
      setUniversityName(universityDirect.universityName || "");
      setDepartmentName(universityDirect.departmentName || "");
      setContactPersonName(universityDirect.contactPersonName || "");
      setPosition(universityDirect.position || "");
      setDescription(universityDirect.description || "");
      setWechat(universityDirect.wechat || "");
      setTelephone(universityDirect.telephone || "");
      setEmail(universityDirect.email || "");
      setWebsite(universityDirect.website || "");
      setActive(universityDirect.active);
    }
  }, [universityDirect]);

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
    
    updateUniversityDirect(universityDirectData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading university direct details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : "Failed to load university direct details"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/admin/university-directs")}>
              Back to University Directs
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Edit University Direct</h1>
        <div className="flex items-center">
          <Link href="/admin/university-directs" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to University Directs
          </Link>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit University Direct</CardTitle>
            <CardDescription>
              Update university direct information and contact details
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description (optional)"
                  rows={4}
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
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Person</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Contact Person Name</Label>
                  <Input
                    id="contactPersonName"
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>
                
                <div className="space-y-2">
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
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Telephone</Label>
                  <Input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Enter telephone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wechat">WeChat</Label>
                  <Input
                    id="wechat"
                    value={wechat}
                    onChange={(e) => setWechat(e.target.value)}
                    placeholder="Enter WeChat ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
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
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/admin/university-directs")}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
              {!isUpdating && <Save className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Toaster />
    </div>
  );
} 
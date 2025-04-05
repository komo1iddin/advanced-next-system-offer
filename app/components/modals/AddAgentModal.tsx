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
import { toast } from "@/components/ui/use-toast";
import { useCreateAgentMutation } from "@/app/admin/agents/hooks/useCreateAgentMutation";
import { AddAgentModalComponent } from "./types";

export const AddAgentModal: AddAgentModalComponent = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Agent state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappGroup, setWhatsappGroup] = useState("");
  const [wechat, setWechat] = useState("");
  const [wechatGroup, setWechatGroup] = useState("");
  const [telegram, setTelegram] = useState("");
  const [telegramGroup, setTelegramGroup] = useState("");
  const [telephone, setTelephone] = useState("");
  const [facebookPage, setFacebookPage] = useState("");
  const [facebookGroup, setFacebookGroup] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [active, setActive] = useState(true);

  // Use React Query mutation
  const { createAgent, isCreating } = useCreateAgentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an agent name",
        variant: "destructive",
      });
      return;
    }

    const agentData = {
      name: name.trim(),
      description: description.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      whatsappGroup: whatsappGroup.trim() || undefined,
      wechat: wechat.trim() || undefined,
      wechatGroup: wechatGroup.trim() || undefined,
      telegram: telegram.trim() || undefined,
      telegramGroup: telegramGroup.trim() || undefined,
      telephone: telephone.trim() || undefined,
      facebookPage: facebookPage.trim() || undefined,
      facebookGroup: facebookGroup.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      active,
    };
    
    await createAgent(agentData);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Agent</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent and provide their contact information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Information Section */}
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">
                    Agent Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter agent name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a brief description of the agent"
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
            </div>
            
            {/* Contact Information Section */}
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            {/* Social Media & Messaging Section */}
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Social Media & Messaging</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Enter WhatsApp number or ID"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsappGroup">WhatsApp Group</Label>
                    <Input
                      id="whatsappGroup"
                      value={whatsappGroup}
                      onChange={(e) => setWhatsappGroup(e.target.value)}
                      placeholder="Enter WhatsApp group link"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="Enter Telegram username"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telegramGroup">Telegram Group</Label>
                    <Input
                      id="telegramGroup"
                      value={telegramGroup}
                      onChange={(e) => setTelegramGroup(e.target.value)}
                      placeholder="Enter Telegram group link"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
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
                    <Label htmlFor="wechatGroup">WeChat Group</Label>
                    <Input
                      id="wechatGroup"
                      value={wechatGroup}
                      onChange={(e) => setWechatGroup(e.target.value)}
                      placeholder="Enter WeChat group ID"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="facebookPage">Facebook Page</Label>
                    <Input
                      id="facebookPage"
                      value={facebookPage}
                      onChange={(e) => setFacebookPage(e.target.value)}
                      placeholder="Enter Facebook page URL"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="facebookGroup">Facebook Group</Label>
                    <Input
                      id="facebookGroup"
                      value={facebookGroup}
                      onChange={(e) => setFacebookGroup(e.target.value)}
                      placeholder="Enter Facebook group URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
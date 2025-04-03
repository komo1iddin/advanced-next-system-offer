"use client";

import { useState } from "react";
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
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { useCreateAgentMutation } from "../hooks/useCreateAgentMutation";

export default function AddAgentPage() {
  const router = useRouter();

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
    
    createAgent(agentData);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Add Agent</h1>
        <div className="flex items-center">
          <Link href="/admin/agents" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Agents
          </Link>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Add New Agent</CardTitle>
            <CardDescription>
              Create a new agent and provide their contact information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description of the agent"
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
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media & Messaging</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Enter WhatsApp number or ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappGroup">WhatsApp Group</Label>
                  <Input
                    id="whatsappGroup"
                    value={whatsappGroup}
                    onChange={(e) => setWhatsappGroup(e.target.value)}
                    placeholder="Enter WhatsApp group link"
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
                  <Label htmlFor="wechatGroup">WeChat Group</Label>
                  <Input
                    id="wechatGroup"
                    value={wechatGroup}
                    onChange={(e) => setWechatGroup(e.target.value)}
                    placeholder="Enter WeChat group ID or QR code link"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="Enter Telegram handle or link"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telegramGroup">Telegram Group</Label>
                  <Input
                    id="telegramGroup"
                    value={telegramGroup}
                    onChange={(e) => setTelegramGroup(e.target.value)}
                    placeholder="Enter Telegram group link"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookPage">Facebook Page</Label>
                  <Input
                    id="facebookPage"
                    value={facebookPage}
                    onChange={(e) => setFacebookPage(e.target.value)}
                    placeholder="Enter Facebook page link"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookGroup">Facebook Group</Label>
                  <Input
                    id="facebookGroup"
                    value={facebookGroup}
                    onChange={(e) => setFacebookGroup(e.target.value)}
                    placeholder="Enter Facebook group link"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              {isCreating ? "Creating..." : "Create Agent"}
              {!isCreating && <Save className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Toaster />
    </div>
  );
} 
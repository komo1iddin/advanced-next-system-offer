"use client";

import { UniversityDirect } from "@/app/admin/university-directs/hooks/useUniversityDirectsQuery";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Globe, MessageSquare } from "lucide-react";

interface ContactMethodsProps {
  universityDirect: UniversityDirect;
}

export function ContactMethods({ universityDirect }: ContactMethodsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {universityDirect.telephone && (
        <Badge variant="outline" className="px-2 py-0">
          <Phone className="h-3 w-3 mr-1" />
          Phone
        </Badge>
      )}
      {universityDirect.email && (
        <Badge variant="outline" className="px-2 py-0">
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Badge>
      )}
      {universityDirect.website && (
        <Badge variant="outline" className="px-2 py-0">
          <Globe className="h-3 w-3 mr-1" />
          Web
        </Badge>
      )}
      {universityDirect.wechat && (
        <Badge variant="outline" className="px-2 py-0">
          <MessageSquare className="h-3 w-3 mr-1" />
          WeChat
        </Badge>
      )}
    </div>
  );
} 
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: SidebarLink[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Tags",
      href: "/admin/tags",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Locations",
      href: "/admin/locations",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: "Agents",
      href: "/admin/agents",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "University Directs",
      href: "/admin/university-directs",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Main Site",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
  ];

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar for Desktop and Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
          expanded ? "w-64" : "w-[70px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-3 py-4">
          <h2
            className={cn(
              "text-lg font-semibold transition-opacity",
              expanded ? "opacity-100" : "opacity-0"
            )}
          >
            Admin Panel
          </h2>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={toggleSidebar}
            >
              {expanded ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobile}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex h-10 items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === link.href && "bg-accent text-accent-foreground",
                  !expanded && "justify-center"
                )}
              >
                {link.icon}
                <span
                  className={cn(
                    "ml-3 transition-opacity",
                    expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  )}
                >
                  {link.title}
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
} 
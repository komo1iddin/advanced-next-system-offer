"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Home, Users, Settings, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./page-layout";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: Omit<SidebarNavItem, "icon" | "children">[];
}

interface AdminSidebarProps {
  navItems?: SidebarNavItem[];
}

export function AdminSidebar({ navItems = DEFAULT_NAV_ITEMS }: AdminSidebarProps) {
  const { mobileSidebarOpen, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r shadow-sm transition-transform duration-200 md:relative md:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/admin" className="flex items-center">
            <span className="text-xl font-semibold">Admin Portal</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden" 
            onClick={toggleMobileSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarNavItem({ 
  item, 
  pathname 
}: { 
  item: SidebarNavItem; 
  pathname: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isActive = pathname === item.href || 
                  (item.children && item.children.some(child => pathname === child.href));
  
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          className={cn(
            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
            isActive 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={() => setOpen(!open)}
        >
          <item.icon className="mr-3 h-5 w-5 text-gray-500" />
          <span className="flex-1 text-left">{item.title}</span>
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium",
            isActive 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <item.icon className="mr-3 h-5 w-5 text-gray-500" />
          <span>{item.title}</span>
        </Link>
      )}
      
      {/* Render children if expanded */}
      {hasChildren && open && (
        <div className="mt-1 space-y-1 pl-8">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname === child.href 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span>{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    children: [
      { title: "All Users", href: "/admin/users" },
      { title: "Add User", href: "/admin/users/new" }
    ]
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]; 
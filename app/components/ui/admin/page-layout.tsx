"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Search, Menu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./sidebar";

// New Breadcrumb component
interface BreadcrumbItem {
  title: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Always include Dashboard as the first item
  const allItems = [{ title: "Dashboard", href: "/admin" }, ...items];
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
      {allItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
          )}
          <Link 
            href={item.href} 
            className={`hover:text-foreground ${index === allItems.length - 1 ? 'font-medium text-foreground' : ''}`}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionButton?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminPageHeader({ 
  title, 
  description, 
  actionButton,
  breadcrumbs = []
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col space-y-4">
      <div>
        {/* Breadcrumbs navigation */}
        {breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : (
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {actionButton && (
          <div className="sm:ml-auto">{actionButton}</div>
        )}
      </div>
    </div>
  );
}

interface AdminCardProps {
  title: string;
  description?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  itemCount?: number;
  itemName?: string;
  children: ReactNode;
  bulkActions?: ReactNode;
}

export function AdminCard({
  title,
  description,
  searchTerm,
  onSearchChange,
  itemCount,
  itemName = "item",
  children,
  bulkActions
}: AdminCardProps) {
  const itemText = itemCount !== undefined
    ? `${itemCount} ${itemCount === 1 ? itemName : `${itemName}s`}`
    : description;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {itemText && (
            <CardDescription>{itemText}</CardDescription>
          )}
        </div>
        {searchTerm !== undefined && onSearchChange && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${itemName}s...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </CardHeader>
      {bulkActions && (
        <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-t">
          {bulkActions}
        </div>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

// Context for sidebar state management
interface SidebarContextType {
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface AdminPageLayoutProps {
  /**
   * The title of the page, displayed in the header
   */
  title: string;
  
  /**
   * Optional description shown below the title
   */
  description?: string;
  
  /**
   * Page content
   */
  children: React.ReactNode;
  
  /**
   * Optional action button shown in the header
   */
  actionButton?: React.ReactNode;
  
  /**
   * Additional classes for the main container
   */
  className?: string;
  
  /**
   * Whether to show the content in a card
   * @default true
   */
  showCard?: boolean;
  
  /**
   * Title for the card, only used if showCard is true
   */
  cardTitle?: string;
  
  /**
   * Description for the card, only used if showCard is true
   */
  cardDescription?: string;
  
  /**
   * Background color class for the main container
   * @default "bg-gray-50"
   */
  bgColorClass?: string;
}

export function AdminPageLayout({
  title,
  description,
  children,
  actionButton,
  className,
  showCard = true,
  cardTitle,
  cardDescription,
  bgColorClass = "bg-gray-50"
}: AdminPageLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ mobileSidebarOpen, toggleMobileSidebar }}>
      <div className={cn("flex min-h-screen", bgColorClass)}>
        <AdminSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={toggleMobileSidebar}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              
              {actionButton && (
                <div className="flex items-center space-x-2">
                  {actionButton}
                </div>
              )}
            </div>
          </header>
          
          {/* Main content */}
          <main className={cn("p-4 sm:p-6", className)}>
            {showCard ? (
              <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
                {(cardTitle || cardDescription) && (
                  <div className="mb-6">
                    {cardTitle && (
                      <h2 className="text-lg font-medium text-gray-900">{cardTitle}</h2>
                    )}
                    {cardDescription && (
                      <p className="mt-1 text-sm text-gray-500">{cardDescription}</p>
                    )}
                  </div>
                )}
                {children}
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
} 
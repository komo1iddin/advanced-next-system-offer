"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

export interface AdminPageLayoutProps {
  title: string;
  description?: string;
  actionButton?: ReactNode;
  cardTitle?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  itemCount?: number;
  itemName?: string;
  children: ReactNode;
  bulkActions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminPageLayout({
  title,
  description,
  actionButton,
  cardTitle,
  searchTerm,
  onSearchChange,
  itemCount,
  itemName = "item",
  children,
  bulkActions,
  breadcrumbs = []
}: AdminPageLayoutProps) {
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <AdminPageHeader 
        title={title}
        description={description}
        actionButton={actionButton}
        breadcrumbs={breadcrumbs}
      />

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:justify-between pb-4 pt-6 px-6">
          <div>
            {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
            {typeof itemCount !== "undefined" && (
              <CardDescription>
                {itemCount} {itemCount === 1 ? itemName : `${itemName}s`}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            {onSearchChange && (
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${itemName}s...`}
                  className="pl-8 w-full md:w-[260px]"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardHeader>
        {bulkActions && (
          <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-b">
            {bulkActions}
          </div>
        )}
        <CardContent className="px-0 pt-0 pb-0 overflow-auto">
          {children}
        </CardContent>
      </Card>
    </div>
  );
} 
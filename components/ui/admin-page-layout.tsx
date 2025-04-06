import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionButton?: ReactNode;
}

export function AdminPageHeader({ title, description, actionButton }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex flex-col space-y-1">
        <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {actionButton && (
        <div className="sm:ml-auto">{actionButton}</div>
      )}
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
}

export function AdminCard({
  title,
  description,
  searchTerm,
  onSearchChange,
  itemCount,
  itemName = "item",
  children
}: AdminCardProps) {
  const itemText = itemCount !== undefined
    ? `${itemCount} ${itemCount === 1 ? itemName : `${itemName}s`} available`
    : description;

  return (
    <Card>
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
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  actionButton?: ReactNode;
  cardTitle?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  itemCount?: number;
  itemName?: string;
  children: ReactNode;
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
  children
}: AdminPageLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <AdminPageHeader
        title={title}
        description={description}
        actionButton={actionButton}
      />
      <AdminCard
        title={cardTitle || `All ${title}`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        itemCount={itemCount}
        itemName={itemName}
      >
        {children}
      </AdminCard>
    </div>
  );
} 
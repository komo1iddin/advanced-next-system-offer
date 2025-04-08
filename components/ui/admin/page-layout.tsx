"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  bulkActions
}: AdminPageLayoutProps) {
  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description || ''}</p>
        </div>
        {actionButton && (
          <div className="flex justify-end">
            {actionButton}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:justify-between pb-2 pt-6 px-6">
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
          <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-t">
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
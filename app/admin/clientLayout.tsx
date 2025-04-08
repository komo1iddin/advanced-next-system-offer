"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";
import { AdminSidebar } from "@/components/ui/admin/sidebar";

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 md:pl-[70px] lg:pl-64">
        {children}
      </main>
    </div>
  );
} 
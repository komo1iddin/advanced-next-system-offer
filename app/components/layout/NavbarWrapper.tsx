"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/app/components/layout/navbar";

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
} 
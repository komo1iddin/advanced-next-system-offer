"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to handle mobile menu closing on navigation
  const handleNavClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Nav items with their paths and labels
  const navItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/offers", label: "Offers" },
    { path: "/admin/add-offer", label: "Add Offer" },
    { path: "/admin/university-directs", label: "Universities" },
    { path: "/admin/agents", label: "Agents" },
    { path: "/admin/locations", label: "Locations" },
    { path: "/admin/tags", label: "Tags" },
  ];

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 font-bold text-xl">
            <Link href="/admin">Admin Dashboard</Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.path
                      ? "bg-primary-foreground text-primary"
                      : "hover:bg-primary-foreground/10"
                  }`}
                  onClick={handleNavClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? "bg-primary-foreground text-primary"
                    : "hover:bg-primary-foreground/10"
                }`}
                onClick={handleNavClick}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 
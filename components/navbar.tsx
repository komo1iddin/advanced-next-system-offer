"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/user-menu"

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Skip rendering on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-background"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">StudyBridge</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/universities"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/universities" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Universities
          </Link>
          <Link
            href="/programs"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/programs") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Programs
          </Link>
          <Link
            href="/scholarships"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/scholarships" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Scholarships
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link
              href="/"
              className="block py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/universities"
              className="block py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Universities
            </Link>
            <Link
              href="/programs"
              className="block py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Programs
            </Link>
            <Link
              href="/scholarships"
              className="block py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Scholarships
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}


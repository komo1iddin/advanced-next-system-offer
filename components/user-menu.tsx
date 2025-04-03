"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, UserPlus, Settings, Shield } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Get user's initials for avatar
  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/register">Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {session?.user?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
import { requireAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Layout, LayoutGrid, PlusCircle, Settings, Shield, Building2, UserPlus, Users, MapPin, Globe, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth/next";

export const metadata: Metadata = {
  title: "Admin Dashboard | StudyBridge",
  description: "Admin dashboard for managing StudyBridge platform",
};

export default async function AdminDashboardPage() {
  // Get the session to check if the user is authenticated
  const session = await getServerSession();
  
  // *** DEBUGGING START ***
  console.log("[/admin/page.tsx] Attempting to access admin dashboard...");
  if (session && session.user) {
    console.log("[/admin/page.tsx] Session found:", {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role
    });
  } else {
    console.log("[/admin/page.tsx] No session found or session.user is missing.");
  }
  // *** DEBUGGING END ***
  
  // Check if the user is authenticated
  // if (!session || !session.user) {
  //   console.log("[/admin/page.tsx] Redirecting: Not authenticated.");
  //   redirect("/auth/signin?callbackUrl=/admin&error=NotAuthenticated");
  // }
  
  // Check if the user has the admin role
  // if (session.user.role !== "admin") {
  //   console.log(`[/admin/page.tsx] Redirecting: Role is \'${session.user.role}\', not \'admin\'.`);
  //   // Redirect to the set-admin page with error message
  //   redirect(`/set-admin?error=NotAdmin&role=${session.user.role}`);
  // }
  
  console.log("[/admin/page.tsx] Access granted. Rendering admin dashboard.");
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'Admin'}. Manage your StudyBridge platform from here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Study Offers Management Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Study Offers
              </CardTitle>
              <CardDescription>Manage university study offers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/add-offer" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add New Offer
                  </span>
                </Link>
                <Link 
                  href="/admin/offers" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Manage All Offers
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Contacts Management Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contacts
              </CardTitle>
              <CardDescription>Manage agents and university contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/agents" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Manage Agents
                  </span>
                </Link>
                <Link 
                  href="/admin/university-directs" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Manage University Contacts
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Locations Management Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Locations
              </CardTitle>
              <CardDescription>Manage cities and provinces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/locations" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Manage Locations
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Tags Management Card */}
          <Card className="hover:shadow-md transition-shadow border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Tags
              </CardTitle>
              <CardDescription>Manage tags for categorizing offers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/tags" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Manage Tags
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Site Settings Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Site Settings
              </CardTitle>
              <CardDescription>Configure application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/settings" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    General Settings
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
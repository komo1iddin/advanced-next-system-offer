"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Layout, LayoutGrid, PlusCircle, Settings, Shield, Building2, UserPlus, Users, MapPin, Globe, Tag, GraduationCap, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
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
          
          {/* Universities Management Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Universities
              </CardTitle>
              <CardDescription>Manage university listings and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/universities" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Manage Universities
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
          <Card className="hover:shadow-md transition-shadow">
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
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Manage Tags
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Cache Management Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Cache Management
              </CardTitle>
              <CardDescription>Manage Redis cache and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/admin/cache" 
                  className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Manage Cache
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
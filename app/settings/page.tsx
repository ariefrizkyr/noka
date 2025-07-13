"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Wallet, Tags, LogOut } from "lucide-react";
import GeneralSettings from "./components/general-settings";
import CategoriesSettings from "./components/categories-settings";
import AccountsSettings from "./components/accounts-settings";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Failed to sign out:", error);
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Accounts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GeneralSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Categories Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoriesSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Accounts Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AccountsSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full"
          disabled={isSigningOut}
        >
          <LogOut className="mr-1 h-4 w-4" />
          {isSigningOut ? "Logging Out..." : "Logout"}
        </Button>
      </div>
    </MainLayout>
  );
}

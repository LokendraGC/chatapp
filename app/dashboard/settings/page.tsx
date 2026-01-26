"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TeamSection from "@/components/ui/dashboard/settings/teamSection";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface OrganizationData {
  id: string;
  business_name: string;
  website_url: string;
  created_at: string;
}

export default function SettingsPage() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      const response = await fetch("/api/organization/fetch");
      const data = await response.json();
      setOrganizationData(data.organization);
    };
    fetchOrganizationData();
  }, []);

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement delete workspace API call
      // const response = await fetch("/api/workspace/delete", {
      //   method: "DELETE",
      // });
      // if (!response.ok) {
      //   throw new Error("Failed to delete workspace");
      // }
      console.log("Workspace deletion not yet implemented");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting workspace:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-5xl mx-auto animate-in fade-in-0 duration-300 ">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage workspace preferences security and billing.
        </p>
      </div>

      <Card className="border-white/5 bg-[#0A0A0E]">
        <CardHeader>
          <CardTitle className="text-base font-medium text-white">
            Workspace Settings
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Manage workspace preferences security and billing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-500 text-xs">Workspace Name</Label>
              <div className="p-3 rounded-md bg-white/5 text-white border border-white/10">
                {organizationData?.business_name}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-500">Primary Website</Label>
              <div className="p-3 rounded-md bg-white/5 text-white border border-white/10">
                {organizationData?.website_url}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-500 text-xs">Default Language</Label>
              <div className="p-3 rounded-md bg-white/5 text-white border border-white/10">
                English
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-500 text-xs">Timezone</Label>
              <div className="p-3 rounded-md bg-white/5 text-white border border-white/10">
                GMT+5:45
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TeamSection />

      <Card className="border-white/5 bg-[#0A0A0E]">
        <CardHeader>
          <CardTitle className="text-base font-medium text-red-500">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Delete your workspace and all associated data. This action cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-300">
                Delete Workspace
              </p>
              <p className="text-xs text-zinc-500">
                Permanently delete all knowledge, conversations, and settings.
              </p>
            </div>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="bg-red-500/10 hover:bg-red-500/20 mt-4 cursor-pointer text-red-500 border border-red-500/20"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0A0A0E] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete Workspace
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Are you sure you want to delete your workspace? This action cannot be undone and will permanently delete all knowledge, conversations, team members, and settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  className="bg-white/5 border-white/10 text-zinc-300 hover:bg-white/5 hover:text-zinc-300"
                  disabled={isDeleting}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteWorkspace}
                  disabled={isDeleting}
                  className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                >
                  {isDeleting ? "Deleting..." : "Delete Workspace"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

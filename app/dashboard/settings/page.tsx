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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";

interface OrganizationData {
  id: string;
  business_name: string;
  website_url: string;
  created_at: string;
}

interface SocialMediaItem {
  id: string;
  platform: string;
  url: string;
}

interface ContactData {
  id: string;
  user_email: string;
  address: string;
  location_url: string;
  logo: string;
  email: string;
  phone: string;
  social_media: SocialMediaItem[];
}

const SOCIAL_MEDIA_OPTIONS = [
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "X (Twitter)", value: "x" },
  { label: "TikTok", value: "tiktok" },
  { label: "YouTube", value: "youtube" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Website", value: "website" },
];

export default function SettingsPage() {
  const { signOut } = useAuth();
  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);
  const [contactForm, setContactForm] = useState<ContactData>({
    id: "",
    user_email: "",
    address: "",
    location_url: "",
    logo: "",
    email: "",
    phone: "",
    social_media: [],
  });
  const [newSocialPlatform, setNewSocialPlatform] = useState(
    SOCIAL_MEDIA_OPTIONS[0]?.value ?? "",
  );
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [draggedSocialId, setDraggedSocialId] = useState<string | null>(null);
  const [dragOverSocialId, setDragOverSocialId] = useState<string | null>(null);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateOrganizationData = (updates: Partial<OrganizationData>) => {
    setOrganizationData((prev) =>
      prev ? { ...prev, ...updates } : (updates as OrganizationData),
    );
  };

  useEffect(() => {
    const fetchOrganizationData = async () => {
      const response = await fetch("/api/organization/fetch");
      const data = await response.json();
      setOrganizationData(data.organization);
    };
    fetchOrganizationData();
  }, []);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setIsContactLoading(true);
        const response = await fetch("/api/contact/fetch");
        const data = await response.json();
        if (data?.contact) {
          const social =
            Array.isArray(data.contact.social_media) &&
            data.contact.social_media
              ? data.contact.social_media
              : [];
          const normalized = {
            ...data.contact,
            social_media: social.map((item: any) => ({
              id: item.id || crypto.randomUUID(),
              platform: item.platform || "",
              url: item.url || "",
            })),
          };
          setContactForm(normalized);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setIsContactLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const updateContactForm = (updates: Partial<ContactData>) => {
    setContactForm((prev) => ({ ...prev, ...updates }));
  };

  const addSocialMedia = () => {
    if (!newSocialPlatform || !newSocialUrl.trim()) return;
    setContactForm((prev) => ({
      ...prev,
      social_media: [
        ...prev.social_media,
        {
          id: crypto.randomUUID(),
          platform: newSocialPlatform,
          url: newSocialUrl.trim(),
        },
      ],
    }));
    setNewSocialUrl("");
  };

  const removeSocialMedia = (id: string) => {
    setContactForm((prev) => ({
      ...prev,
      social_media: prev.social_media.filter((item) => item.id !== id),
    }));
  };

  const reorderSocialMedia = (sourceId: string, targetId: string) => {
    setContactForm((prev) => {
      const sourceIndex = prev.social_media.findIndex(
        (item) => item.id === sourceId,
      );
      const targetIndex = prev.social_media.findIndex(
        (item) => item.id === targetId,
      );
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev.social_media];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return { ...prev, social_media: updated };
    });
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      const response = await fetch("/api/contact/upsert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: contactForm.address,
          location_url: contactForm.location_url,
          logo: contactForm.logo,
          email: contactForm.email,
          phone: contactForm.phone,
          social_media: contactForm.social_media.map(({ platform, url }) => ({
            platform,
            url,
          })),
        }),
      });
      if (!response.ok) throw new Error("Failed to save contact info");
      const data = await response.json();
      if (data?.contact) {
        setContactForm({
          ...data.contact,
          social_media: (data.contact.social_media ?? []).map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            platform: item.platform || "",
            url: item.url || "",
          })),
        });
      }

      toast.success("Contact information saved successfully");
    } catch (error) {
      console.error("Error saving contact info:", error);
      toast.error("Failed to save contact information");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!organizationData?.business_name || !organizationData?.website_url) {
      toast.error("Workspace Name and Primary Website are required");
      return;
    }
    setIsSavingWorkspace(true);
    try {
      const response = await fetch("/api/organization/upsert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: organizationData.business_name,
          website_url: organizationData.website_url,
        }),
      });
      if (!response.ok) throw new Error("Failed to save workspace info");
      const data = await response.json();
      if (data?.organization) {
        setOrganizationData(data.organization);
      }
      toast.success("Workspace information saved successfully");
    } catch (error) {
      console.error("Error saving workspace info:", error);
      toast.error("Failed to save workspace information");
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/workspace/delete", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }
      toast.success("Workspace deleted permanently.");
      setIsDeleteDialogOpen(false);

      // Sign the user out and redirect them to the home page since their data is gone
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace preferences security and billing.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">
            Workspace Settings
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage workspace preferences security and billing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">
                Workspace Name
              </Label>
              <Input
                value={organizationData?.business_name || ""}
                onChange={(e) =>
                  updateOrganizationData({ business_name: e.target.value })
                }
                placeholder="Enter workspace name"
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Primary Website</Label>
              <Input
                type="url"
                value={organizationData?.website_url || ""}
                onChange={(e) =>
                  updateOrganizationData({ website_url: e.target.value })
                }
                placeholder="https://..."
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">
                Default Language
              </Label>
              <div className="p-3 rounded-md bg-muted/30 text-foreground border border-border">
                English
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Timezone</Label>
              <div className="p-3 rounded-md bg-muted/30 text-foreground border border-border">
                GMT+5:45
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveWorkspace} disabled={isSavingWorkspace}>
              {isSavingWorkspace ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">
            Contact Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage contact information for your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Address</Label>
              <Input
                value={contactForm.address}
                onChange={(e) => updateContactForm({ address: e.target.value })}
                placeholder="Enter address"
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isContactLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Location URL</Label>
              <Input
                value={contactForm.location_url}
                onChange={(e) =>
                  updateContactForm({ location_url: e.target.value })
                }
                placeholder="https://maps.google.com/..."
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isContactLoading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Email</Label>
              <Input
                value={contactForm.email}
                onChange={(e) => updateContactForm({ email: e.target.value })}
                placeholder="email@company.com"
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isContactLoading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Phone</Label>
              <Input
                value={contactForm.phone}
                onChange={(e) => updateContactForm({ phone: e.target.value })}
                placeholder="+1 555 000 0000"
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isContactLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Social Media
            </Label>
            <div className="grid gap-3 md:grid-cols-[220px,1fr,auto]">
              <select
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                className="h-10 rounded-md border border-border bg-muted/30 px-3 text-sm text-foreground"
                disabled={isContactLoading}
              >
                {SOCIAL_MEDIA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Input
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="https://..."
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isContactLoading}
              />
              <Button
                type="button"
                onClick={addSocialMedia}
                disabled={isContactLoading || !newSocialUrl.trim()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {contactForm.social_media.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No social media links added yet.
                </div>
              ) : (
                contactForm.social_media.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 ${
                      dragOverSocialId === item.id ? "bg-muted/40" : ""
                    }`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                      setDraggedSocialId(item.id);
                    }}
                    onDragOver={(event) => {
                      if (!draggedSocialId) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverSocialId(item.id);
                    }}
                    onDragLeave={() => setDragOverSocialId(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      const sourceId =
                        event.dataTransfer.getData("text/plain") ||
                        draggedSocialId;
                      if (sourceId) reorderSocialMedia(sourceId, item.id);
                      setDragOverSocialId(null);
                      setDraggedSocialId(null);
                    }}
                    onDragEnd={() => {
                      setDragOverSocialId(null);
                      setDraggedSocialId(null);
                    }}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-[120px] text-sm text-foreground capitalize">
                      {item.platform}
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground truncate">
                      {item.url}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocialMedia(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveContact} disabled={isSavingContact}>
              {isSavingContact ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <TeamSection />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium text-red-500">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Delete your workspace and all associated data. This action cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Delete Workspace
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently delete all knowledge, conversations, and settings.
              </p>
            </div>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-red-500/10 hover:bg-red-500/20 mt-4 cursor-pointer text-red-500 border border-red-500/20"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Workspace
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Delete Workspace
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to delete your workspace? This action
                    cannot be undone and will permanently delete all knowledge,
                    conversations, team members, and settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={isDeleting}
                    className="border border-border text-black bg-background hover:bg-muted"
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

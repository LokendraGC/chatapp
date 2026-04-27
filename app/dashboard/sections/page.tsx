"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SectionFormFields from "@/components/ui/dashboard/sections/SectionFormFields";
import SectionTable from "@/components/ui/dashboard/sections/SectionTable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const INITIAL_FORM_DATA: SectionFormData = {
  name: "",
  description: "",
  tone: "neutral",
  allowedTopics: "",
  blockedTopics: "",
  fallbackBehavior: "escalate",
};

const SectionsPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    [],
  );
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [formData, setFormData] = useState<SectionFormData>(INITIAL_FORM_DATA);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveSection = async () => {
    try {
      if (!formData.description.trim()) {
        toast.error("Description is required");
        return;
      }
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!formData.tone) {
        toast.error("Tone is required");
        return;
      }
      if (!selectedSources.length) {
        toast.error("Sources are required");
        return;
      }
      setIsSaving(true);
      const sectionData = {
        ...formData,
        sourceIds: selectedSources,
        status: "active",
      };

      const response = await fetch(`/api/section/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create section");
        return;
      }
      await fetchSections();
      setIsSheetOpen(false);
      toast.success("Section created successfully");
      setFormData(INITIAL_FORM_DATA);
      setSelectedSources([]);
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("An error occurred while creating the section");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSections = async () => {
    try {
      setIsLoadingSections(true);
      const response = await fetch("/api/section/fetch");
      const data = await response.json();
      const transformedSections = data.response.map((section: any) => ({
        id: section.id,
        name: section.name,
        description: section.description,
        sourceCount: section.source_ids?.length || 0,
        tone: section.tone as Tone,
        status: section.status as SectionStatus,
        allowedTopics: section.allowed_topics || "",
        blockedTopics: section.blocked_topics || "",
        sourceIds: section.source_ids || [],
        scopeLabel: section.allowed_topics || "General",
      })) as Section[];
      setSections(transformedSections);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setIsLoadingSections(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreateSection = () => {
    setSelectedSection({
      id: "new",
      name: "",
      description: "",
      sourceCount: 0,
      tone: "neutral",
      scopeLabel: "",
      status: "active",
    });
    setSelectedSources([]);
    setFormData(INITIAL_FORM_DATA);
    setIsEditing(false);
    setIsSheetOpen(true);
  };

  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      try {
        const res = await fetch("/api/knowledge/fetch");
        const data = await res.json();
        setKnowledgeSources(data.sources);
      } catch (error) {
        console.error("Error fetching knowledge sources:", error);
      }
    };
    fetchKnowledgeSources();
  }, []);

  const isPreviewMode = selectedSection?.id !== "new" && !isEditing;

  const handleDeleteSection = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSection = async () => {
    try {
      setIsSaving(true);
      setIsDeleteDialogOpen(false);

      const response = await fetch(`/api/section/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedSection?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete section");
        return;
      }

      await fetchSections();
      setIsSheetOpen(false);
      setSelectedSection(null);
      toast.success("Section deleted successfully");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("An error occurred while deleting the section");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewSection = (section: Section) => {
    setSelectedSection(section);
    setFormData({
      name: section.name,
      description: section.description,
      tone: section.tone as Tone,
      allowedTopics: section.allowedTopics || "",
      blockedTopics: section.blockedTopics || "",
      fallbackBehavior: "escalate",
    });
    setSelectedSources(section.sourceIds || []);
    setIsEditing(false);
    setIsSheetOpen(true);
  };

  const handleEditSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    setSelectedSection(section);
    setFormData({
      name: section.name,
      description: section.description,
      tone: section.tone as Tone,
      allowedTopics: section.allowedTopics || "",
      blockedTopics: section.blockedTopics || "",
      fallbackBehavior: "escalate",
    });
    setSelectedSources(section.sourceIds || []);
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  const handleUpdateSection = async () => {
    try {
      if (!formData.description.trim()) {
        toast.error("Description is required");
        return;
      }
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!formData.tone) {
        toast.error("Tone is required");
        return;
      }
      if (!selectedSources.length) {
        toast.error("Sources are required");
        return;
      }
      setIsSaving(true);
      const response = await fetch(`/api/section/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedSection?.id,
          name: formData.name,
          description: formData.description,
          tone: formData.tone,
          allowedTopics: formData.allowedTopics,
          blockedTopics: formData.blockedTopics,
          sourceIds: selectedSources,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update section");
        return;
      }
      await fetchSections();
      setIsSheetOpen(false);
      setIsEditing(false);
      toast.success("Section updated successfully");
      setFormData(INITIAL_FORM_DATA);
      setSelectedSources([]);
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("An error occurred while updating the section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">
            Sections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define behavior and tone for different topics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateSection}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <SectionTable
            sections={sections}
            isLoading={isLoadingSections}
            onPreview={handlePreviewSection}
            onEdit={handleEditSection}
            onCreateSection={handleCreateSection}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          className="w-full sm:max-w-md border-l border-border bg-card p-0 shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {selectedSection && (
            <>
              <SheetHeader className="p-6 border-b border-border">
                <SheetTitle className="text-xl text-foreground tracking-tight">
                  {selectedSection.id === "new"
                    ? "Create Section"
                    : isEditing
                      ? "Edit Section"
                      : "View Section"}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  {selectedSection.id === "new"
                    ? "Configure how the AI behaves for this specific topic."
                    : isEditing
                      ? "Update your section configuration and data sources."
                      : "Review section configuration and data sources."}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                <SectionFormFields
                  formData={formData}
                  setFormData={setFormData}
                  selectedSources={selectedSources}
                  setSelectedSources={setSelectedSources}
                  isLoadingSources={isLoadingSources}
                  isDissabled={isPreviewMode}
                  knowledgeSources={knowledgeSources}
                />
              </div>
            </>
          )}

          {selectedSection?.id === "new" && (
            <div className="px-6 py-4 border-t border-border">
              <Button
                onClick={handleSaveSection}
                disabled={isSaving}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? "Creating..." : "Create Section"}
              </Button>
            </div>
          )}

          {selectedSection?.id !== "new" && isEditing && (
            <div className="px-6 py-4 border-t border-border">
              <Button
                onClick={handleUpdateSection}
                disabled={isSaving}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? "Updating..." : "Update Section"}
              </Button>
            </div>
          )}

          {selectedSection?.id !== "new" && (
            <div className="p-6 bg-red-50 dark:bg-red-500/5 border-t-2 border-red-200 dark:border-red-500/10 rounded-b-lg">
              <h5 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                Danger Zone
              </h5>
              <p className="text-xs text-red-600/90 dark:text-red-500/70 mb-3">
                Deleting this section will remove all associated routing rules.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-2 border-red-300 dark:border-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/20"
                onClick={handleDeleteSection}
                disabled={isSaving}
              >
                Delete Section
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Section
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{selectedSection?.name}"? This
              action cannot be undone and will remove all associated routing
              rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSection}
              className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SectionsPage;

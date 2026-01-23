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
    []
  );
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [formData, setFormData] = useState<SectionFormData>(INITIAL_FORM_DATA);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      const transformedSections = data.response.map((section: Section) => ({
        id: section.id,
        name: section.name,
        description: section.description,
        sourceCount: section.source_ids?.length || 0,
        tone: section.tone as Tone,
        status: section.status as SectionStatus,
        allowedTopics: section.allowed_topics,
        blockedTopics: section.blocked_topics,
        sourceIds: section.source_ids,
        scopeLabel: section.allowed_topics || "General",
      }));
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

  const isPreviewMode = selectedSection?.id !== "new";

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
      allowedTopics: section.allowed_topics || "",
      blockedTopics: section.blocked_topics || "",
      fallbackBehavior: "escalate",
    });
    setSelectedSources(section.source_ids || []);
    setIsSheetOpen(true);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-white tracking-tight">
            Sections
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Define bihavior and tone for different topics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateSection}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-[#0A0A0E]">
        <CardContent className="p-0">
          <SectionTable
          sections={sections}
          isLoading={isLoadingSections}
          onPreview={handlePreviewSection}
          onCreateSection={handleCreateSection}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-[#0A0A0E] p-0 shadow-2xl">
          {selectedSection && (
            <>
              <SheetHeader className="p-6 border-b border-white/5">
                <SheetTitle className="text-xl text-white tracking-tight">
                  {selectedSection.id === "new"
                    ? "Create Section"
                    : "View Section"}
                </SheetTitle>
                <SheetDescription className="text-zinc-500">
                  {selectedSection.id === "new"
                    ? "Configure how the AI behaves for this specific topic."
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
            <div className="px-6 py-4 border-t border-white/5">
              <Button
                onClick={handleSaveSection}
                disabled={isSaving}
                className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSaving ? "Creating..." : "Create Section"}
              </Button>
            </div>
          )}

          {selectedSection?.id !== "new" && (
            <div className="p-6 bg-red-500/5 border-t border-red-500/10">
              <h5 className="text-sm font-medium text-red-400 mb-1">
                Danger Zone
              </h5>
              <p className="text-xs text-red-500/70 mb-3">
                Deleting this section will remove all associated routing rules.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full bg-red-500/10 text-red-500 border border-red-500/20"
                onClick={handleDeleteSection}
                disabled={isSaving}
              >
                {isSaving ? "Deleting ..." : "Delete Section"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0A0A0E] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Section
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{selectedSection?.name}"? This action cannot be undone and will remove all associated routing rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10">
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

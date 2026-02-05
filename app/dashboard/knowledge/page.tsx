"use client";

import { Button } from "@/components/ui/button";
import QuickActions from "@/components/ui/dashboard/knowledge/quickActions";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddKnowledgeModal from "@/components/ui/dashboard/knowledge/addKnowledgeModal";
import KnowledgeSources from "@/components/ui/dashboard/knowledge/KnowledgeSources";
import SourceDetailsPage from "@/components/ui/dashboard/knowledge/SourceDetailsPage";

export default function KnowledgePage() {
  const [defaultTab, setDefaultTab] = useState("website");
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [knowledgeStoringLoading, setKnowledgeStoringLoading] = useState(false);
  const [knowSourcesLoading, setKnowSourcesLoading] = useState(false);

  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    []
  );

  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openModal = (tab: string) => {
    setDefaultTab(tab);
    setIsAddWebsiteModalOpen(true);
  };

  const handleSourceClick = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setIsSheetOpen(true);
  };

  const fetchKnowledgeSources = async () => {
    setKnowSourcesLoading(true);
    try {
      const res = await fetch("/api/knowledge/fetch");
      const data = await res.json();
      setKnowledgeSources(data.sources);
    } catch (error) {
      console.error("Error fetching knowledge sources:", error);
    } finally {
      setKnowSourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeSources();
  }, []);

  const handleImport = async (data: any) => {
    setKnowledgeStoringLoading(true);

    try {
      let response;

      if (data.type === "upload" && data.file) {
        setKnowledgeStoringLoading(true);

        const formData = new FormData();
        formData.append("type", "upload");
        formData.append("file", data.file);

        response = await fetch("/api/knowledge/store", {

          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/knowledge/store", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.details ?? errData?.error ?? "Failed to store knowledge");
      }

      const res = await fetch("/api/knowledge/fetch", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const newData = await res.json();
      setKnowledgeSources(newData.sources);
      setIsAddWebsiteModalOpen(false);

      const fileName = data.type === "upload" && data.file ? data.file.name : data.url ?? data.title ?? "Source";
      toast.success(`"${fileName}" added to knowledge base.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to store knowledge";
      console.error(err);
      toast.error(message);
    } finally {
      setKnowledgeStoringLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">
            Knowledge
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your website sources, documents and more to build your
            knowledge base.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => openModal("website")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onOpenModal={openModal} />

      {/* Knowledge Sources */}
      <KnowledgeSources
        sources={knowledgeSources}
        onSourceClick={handleSourceClick}
        isLoading={knowSourcesLoading || knowledgeStoringLoading}
      />

      {/* Add Knowledge Modal */}
      <AddKnowledgeModal
        isOpen={isAddWebsiteModalOpen}
        setIsOpen={setIsAddWebsiteModalOpen}
        defaultTab={defaultTab}
        setDefaultTab={setDefaultTab}
        onImport={handleImport}
        isLoading={knowSourcesLoading || knowledgeStoringLoading}
        existingSources={knowledgeSources}
      />

      <SourceDetailsPage
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        selectedSource={selectedSource}
        onDelete={fetchKnowledgeSources}
      />
    </div>
  );
}

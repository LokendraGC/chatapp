"use client";

import { Button } from "@/components/ui/button";
import QuickActions from "@/components/ui/dashboard/knowledge/quickActions";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddKnowledgeModal from "@/components/ui/dashboard/knowledge/addKnowledgeModal";

export default function KnowledgePage() {
  const [defaultTab, setDefaultTab] = useState("website");
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [knowledgeStoringLoading, setKnowledgeStoringLoading] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    []
  );

  const openModal = (tab: string) => {
    setDefaultTab(tab);
    setIsAddWebsiteModalOpen(true);
  };

  const handleImport = async (data: any) => {
    setKnowledgeStoringLoading(true);

    try {
      let response;

      if (data.type === "upload" && data.file) {
        const formData = new FormData();
        formData.append("type", "upload");
        formData.append("file", data.file);

        response = await fetch("/api/knowledge/store", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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

      if( !response.ok ){
        throw new Error('Failed to store knowledge');
      }

      const res = await fetch('/api/knowledge/fetch', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const newData = await res.json();
      setKnowledgeSources(newData.sources);
      setIsAddWebsiteModalOpen(false); 
    } catch (err: any) {
      console.error(err);
    } finally {
      setKnowledgeStoringLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in-0 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-white tracking-tight">
            Knowledge
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your website sources, documents and more to build your
            knowledge base.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => openModal("website")}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onOpenModal={openModal} />
      {/* Add Knowledge Modal */}
      <AddKnowledgeModal
        isOpen={isAddWebsiteModalOpen}
        setIsOpen={setIsAddWebsiteModalOpen}
        defaultTab={defaultTab}
        setDefaultTab={setDefaultTab}
        onImport={handleImport}
        isLoading={knowledgeStoringLoading}
        existingSources={knowledgeSources}
      />
    </div>
  );
}

"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../sheet";
import { getTypeIcon, getStatusBadge } from "./KnowledgeSources";
import { Button } from "../../button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../alert-dialog";
import { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

type SourceStatus = "active" | "training" | "error" | "excluded";
type SourceType = "website" | "docs" | "text" | "upload";

interface SourceDetailsPageProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedSource: KnowledgeSource | null;
  onDelete?: () => void; // Callback to refresh sources list after deletion
}

export default function SourceDetailsPage({
  isOpen,
  setIsOpen,
  selectedSource,
  onDelete,
}: SourceDetailsPageProps) {
  const [isDeleteSourceDialogOpen, setIsDeleteSourceDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedSource) return null;

  const handleDeleteSource = () => {
    setIsDeleteSourceDialogOpen(true);
  };

  const confirmDeleteSource = async () => {
    if (!selectedSource) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/knowledge/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedSource.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error ?? "Failed to delete source");
      }

      setIsOpen(false);
      setIsDeleteSourceDialogOpen(false);
      toast.success(`"${selectedSource.name}" deleted successfully`);
      
      // Refresh the sources list in parent component
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete source";
      console.error("Error deleting source:", error);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-[#0A0A0E] p-0 shadow-2xl">
          <div className="flex flex-col gap-4 h-full">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl text-white tracking-tight">
                {getTypeIcon(selectedSource.type as SourceType)}
                {selectedSource.name}
              </SheetTitle>
              <SheetDescription className="text-sm text-zinc-400 truncate max-w-md">
                {selectedSource.source_url || "Manual entry"}
              </SheetDescription>
              <div className="pt-2 flex gap-2">
                {getStatusBadge(selectedSource.status as SourceStatus)}
                <span className="text-xs text-zinc-500 py-1 flex items-center">
                  Updated{" "}
                  {selectedSource.last_updated &&
                    new Date(selectedSource.last_updated).toLocaleDateString()}
                </span>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                  Content Preview
                </h4>
                <div className="p-4 rounded-lg border border-white/5 bg-black/40 font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                  {selectedSource.content ||
                    `# ${selectedSource.name}\n\n(No content preview available)`}
                </div>
              </div>
            </div>
            <SheetFooter className="p-6 border-t border-white/5 bg-[#050505]">
              <Button
                onClick={handleDeleteSource}
                variant="destructive"
                disabled={isDeleting}
                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Source"
                )}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>


      </Sheet>


      <AlertDialog open={isDeleteSourceDialogOpen} onOpenChange={setIsDeleteSourceDialogOpen}>
        <AlertDialogContent className="bg-[#0A0A0E] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Source
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{selectedSource?.name}"? This action cannot be undone and will remove all associated routing rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSource}
              disabled={isDeleting}
              className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>

  );
}

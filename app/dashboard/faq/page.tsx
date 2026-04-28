"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FaqTable from "@/components/ui/dashboard/faq/faqTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Faq } from "@/lib/generated/prisma";
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

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domain, setDomain] = useState("");

  const fetchMetadata = useCallback(async () => {
    try {
      const res = await fetch("/api/metadata/fetch");
      const json = await res.json();
      if (json.exists && json.data?.website_url) {
        setDomain(json.data.website_url);
        return json.data.website_url;
      }
    } catch (e) {
      console.error("Error fetching metadata:", e);
    }
    return "";
  }, []);

  const fetchFaqs = useCallback(async (currentDomain?: string) => {
    try {
      setIsLoadingFaqs(true);
      const activeDomain = currentDomain || domain;
      const url = activeDomain 
        ? `/api/faq/fetch?domain=${encodeURIComponent(activeDomain)}`
        : "/api/faq/fetch";
      const res = await fetch(url);
      const data = await res.json();
      setFaqs(data.faqs ?? []);
    } catch (e) {
      console.error("Error fetching FAQs:", e);
    } finally {
      setIsLoadingFaqs(false);
    }
  }, [domain]);

  useEffect(() => {
    const init = async () => {
      const d = await fetchMetadata();
      fetchFaqs(d);
    };
    init();
  }, [fetchMetadata, fetchFaqs]);

  const openAddDialog = () => {
    setSelectedFaq(null);
    setQuestion("");
    setAnswer("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (faq: Faq) => {
    setSelectedFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    if (!question.trim() || !answer.trim()) return;
    setIsSubmitting(true);
    try {
      if (selectedFaq && selectedFaq.id !== "new") {
        const res = await fetch("/api/faq/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedFaq.id,
            question: question.trim(),
            answer: answer.trim(),
          }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("FAQ updated successfully");
      } else {
        const res = await fetch("/api/faq/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.trim(),
            answer: answer.trim(),
            domain: domain,
          }),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("FAQ created successfully");
      }
      setIsDialogOpen(false);
      fetchFaqs();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (faq: Faq) => {
    setSelectedFaq(faq);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFaq = async () => {
    if (!selectedFaq) return;
    try {
      const res = await fetch(`/api/faq/delete?id=${encodeURIComponent(selectedFaq.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("FAQ deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedFaq(null);
      fetchFaqs();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete FAQ");
    }
  };

  const getReorderedFaqs = (
    list: Faq[],
    sourceId: string,
    targetId: string
  ) => {
    const sourceIndex = list.findIndex((faq) => faq.id === sourceId);
    const targetIndex = list.findIndex((faq) => faq.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return null;

    const updated = [...list];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    return updated;
  };

  const handleReorderFaqs = async (sourceId: string, targetId: string) => {
    const nextFaqs = getReorderedFaqs(faqs, sourceId, targetId);
    if (!nextFaqs) return;
    setFaqs(nextFaqs);

    try {
      const orderedIds = nextFaqs.map((faq) => faq.id);
      const res = await fetch("/api/faq/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reorder FAQs");
      fetchFaqs();
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">
            FAQ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Frequently Asked Questions.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <FaqTable
            faqs={faqs}
            isLoading={isLoadingFaqs}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onReorder={handleReorderFaqs}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedFaq ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedFaq
                ? "Update the question and answer."
                : "Add a new frequently asked question and answer."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs">Question</Label>
              <Textarea
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs">Answer</Label>
              <Textarea
                placeholder="Enter answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-2 border-border bg-background text-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDialogSubmit}
              disabled={!question.trim() || !answer.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : selectedFaq ? "Save changes" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete FAQ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border bg-background text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFaq}
              className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

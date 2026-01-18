"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Alert, AlertDescription } from "../../alert";
import { AlertCircle, FileText, Globe, Loader2, Upload } from "lucide-react";
import { Label } from "../../label";
import { Input } from "../../input";
import { Textarea } from "../../textarea";
import { Button } from "../../button";

interface AddKnowledgeModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  defaultTab: string;
  setDefaultTab: (tab: string) => void;
  onImport: (data: any) => Promise<void>;
  isLoading: boolean;
  existingSources: KnowledgeSource[];
}

export default function AddKnowledgeModal({
  isOpen,
  setIsOpen,
  defaultTab,
  setDefaultTab,
  onImport,
  isLoading,
  existingSources,
}: AddKnowledgeModalProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [docsTitle, setDocsTitle] = useState("");
  const [docsContent, setDocsContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateURL = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (err: any) {
      return false;
    }
  };

  const handleImportWrapper = async () => {
    try {
      setError(null);
      let importData: any = { type: defaultTab };

      if (defaultTab === "website") {
        if (!websiteUrl.trim()) {
          setError("Website URL is required");
          return;
        }
        if (!validateURL(websiteUrl)) {
          setError("Invalid website URL");
          return;
        }
        const normalizedInput = websiteUrl.replace(/\/$/, "");
        const exists = existingSources.some((source) => {
          if (source.type !== "website" || !source.source_url) return false;
          const normalizedSource = source.source_url.replace(/\/$/, "");
          return normalizedSource === normalizedInput;
        });
        if (exists) {
          setError("This website is already in your knowledge base.");
          return;
        }
        importData = {
          type: "website",
          url: websiteUrl,
        };
      } else if (defaultTab === "text") {
        if (!docsTitle.trim() || !docsContent.trim()) {
          setError("Title and content are required");
          return;
        }
        importData = {
          type: "text",
          title: docsTitle,
          content: docsContent,
        };
      } else if (defaultTab === "upload") {
        if (!uploadedFile) {
          setError("Please select a file to upload");
          return;
        }
        importData = {
          type: "upload",
          file: uploadedFile,
        };
      }

      await onImport(importData);
      setWebsiteUrl("");
      setDocsTitle("");
      setDocsContent("");
      setUploadedFile(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to import source");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setError(null);
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-[#0E0E12] border-white/10 text-zinc-100 p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Add New Source</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Add a new source to your knowledge base.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          className="w-full"
          defaultValue="website"
          value={defaultTab}
          onValueChange={(value) => {
            setDefaultTab(value);
            setError(null);
          }}
        >
          <div className="px-6 border-b border-white/5">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger
                value="website"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-indigo-500 cursor-pointer font-medium text-zinc-400 rounded-none px-0 py-3 text-xs uppercase tracking-wide data-[state=active]:text-white hover:text-zinc-300 transition-all focus-visible:outline-none focus-visible:ring-0"
              >
                Website
              </TabsTrigger>

              <TabsTrigger
                value="text"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-indigo-500 cursor-pointer font-medium text-zinc-400 rounded-none px-0 py-3 text-xs uppercase tracking-wide data-[state=active]:text-white hover:text-zinc-300 transition-all focus-visible:outline-none focus-visible:ring-0"
              >
                Q&A and Text
              </TabsTrigger>

              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-indigo-500 cursor-pointer font-medium text-zinc-400 rounded-none px-0 py-3 text-xs uppercase tracking-wide data-[state=active]:text-white hover:text-zinc-300 transition-all focus-visible:outline-none focus-visible:ring-0"
              >
                File Upload
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6 min-h-50 space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-500/10 border-red-500/20 text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent
              value="website"
              className="space-y-4 animate-in fade-in-0 duration-300"
            >
              <div className="p-4 rounded-lg bg-indigo-500/10 borderflex border-indigo-500/20 text-indigo-300/80 text-sm flex gap-3">
                <Globe className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-medium">Crawl Website</p>
                  <p className="text-xs text-indigo-300/80 mt-1 leading-relaxed">
                    Enter a website URL to crawl significantly or add a specific
                    page link to provide focused context.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Website URL *</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  className="bg-white/5 border-white/10 mt-1"
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="text"
              className="space-y-4 animate-in fade-in-0 duration-300"
            >
              <div className="p-4 rounded-lg bg-purple-500/10 borderflex border-purple-500/20 text-purple-300/80 text-sm flex gap-3">
                <FileText className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-medium">Raw Text</p>
                  <p className="text-xs text-purple-300/80 mt-1 leading-relaxed">
                    Paste existing FAQs, policies, or internal notes directly
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Title *</Label>
                <Input
                  type="text"
                  placeholder="Enter your title here..."
                  className="bg-white/5 border-white/10 mt-1"
                  value={docsTitle}
                  onChange={(e) => setDocsTitle(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Content *</Label>
                <Textarea
                  placeholder="Enter your content here..."
                  className="bg-white/5 border-white/10 mt-1 min-h-32"
                  value={docsContent}
                  onChange={(e) => setDocsContent(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="upload"
              className="space-y-4 animate-in fade-in-0 duration-300"
            >
              <Input
                type="file"
                id="csv-file-input"
                accept=".csv,.txt,.pdf,text/csv,text/plain,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                      setError("File size must be less than 10MB");
                      return;
                    }
                    // Validate file type
                    if (
                      !file.name.endsWith(".csv") &&
                      !file.name.endsWith(".txt") &&
                      !file.name.endsWith(".pdf")
                    ) {
                      setError("File must be a CSV, TXT, or PDF file");
                      return;
                    }

                    setUploadedFile(file);
                    if (error) setError(null);
                  }
                }}
              />

              <div
                className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/50 transition-colors bg-white/5"
                onClick={() =>
                  document.getElementById("csv-file-input")?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    // Validate file size (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                      setError("File size must be less than 10MB");
                      return;
                    }
                    // Validate file type
                    if (
                      !file.name.endsWith(".csv") &&
                      !file.name.endsWith(".txt") &&
                      !file.name.endsWith(".pdf")
                    ) {
                      setError("File must be a CSV, TXT, or PDF file");
                      return;
                    }
                    setUploadedFile(file);
                    if (error) setError(null);
                  }
                }}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {uploadedFile
                      ? uploadedFile.name
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    CSV, TXT, or PDF (max 10MB)
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              className={`bg-white min-w-[110px] text-black ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              } hover:bg-zinc-200`}
              onClick={handleImportWrapper}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Import Source"
              )}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

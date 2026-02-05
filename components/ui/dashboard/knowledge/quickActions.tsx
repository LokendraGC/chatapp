import { File, Globe, Plus, Upload } from "lucide-react";
import { Button } from "../../button";

export default function QuickActions({
  onOpenModal,
}: {
  onOpenModal: (tab: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Button
        variant="outline"
        onClick={() => onOpenModal("website")}
        className="h-auto py-8 px-6 flex flex-col items-center bg-card justify-center border border-border hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:text-foreground"
      >
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 duration-300 transition-colors">
          <Globe className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal text-foreground">
            Add Website
          </span>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed whitespace-normal wrap-break-word">
            Crawl your website or specific pages to automatically keep your
            knowledge base in sync.
          </p>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => onOpenModal("text")}
        className="h-auto py-8 px-6 flex flex-col items-center bg-card justify-center border border-border hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:text-foreground"
      >
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 duration-300 transition-colors">
          <File className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal text-foreground">
            Manual Text
          </span>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed whitespace-normal wrap-break-word">
            Manually add a text to your knowledge base to train your chatbot.
          </p>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => onOpenModal("upload")}
        className="h-auto py-8 px-6 flex flex-col items-center bg-card justify-center border border-border hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:text-foreground"
      >
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 duration-300 transition-colors">
          <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal text-foreground">
            Upload Document
          </span>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed whitespace-normal wrap-break-word">
            Upload a document to your knowledge base to train your chatbot.
          </p>
        </div>
      </Button>
    </div>
  );
}

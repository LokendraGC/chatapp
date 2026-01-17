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
        className="h-auto py-8 px-6 flex flex-col items-center bg-[#050509] justify-center border border-white/10 hover:bg-white/2 hover:border-indigo-500 transition-all duration-300 hover:text-white"
      >
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 duration-300 transition-colors">
          <Globe className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal">
            Add Website
          </span>
          <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
            Crawl your website or specific pages to automatically keep your
            knowledge base in sync.
          </p>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => onOpenModal("upload")}
        className="h-auto py-8 px-6 flex flex-col items-center bg-[#050509] justify-center border border-white/10 hover:bg-white/2 hover:border-indigo-500 transition-all duration-300 hover:text-white"
      >
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 duration-300 transition-colors">
          <Upload className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal">
            Upload Document
          </span>
          <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
            Upload a document to your knowledge base to train your chatbot.
          </p>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => onOpenModal("text")}
        className="h-auto py-8 px-6 flex flex-col items-center bg-[#050509] justify-center border border-white/10 hover:bg-white/2 hover:border-indigo-500 transition-all duration-300 hover:text-white"
      >
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 duration-300 transition-colors">
          <File className="w-6 h-6 text-zinc-400" />
        </div>
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal">
            Manual Text
          </span>
          <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
            Manually add a text to your knowledge base to train your chatbot.
          </p>
        </div>
      </Button>

    </div>
  );
}

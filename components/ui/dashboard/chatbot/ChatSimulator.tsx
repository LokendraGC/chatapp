import { RefObject, useEffect, useRef } from "react";
import { Card } from "../../card";
import { Button } from "../../button";
import { Bot, BotIcon, RefreshCw, Send, User, UserIcon } from "lucide-react";
import { ScrollArea } from "../../scroll-area";
import { cn } from "@/lib/utils";
import { Textarea } from "../../textarea";

interface ChatSimulatorProps {
  messages: any[];
  primaryColor: string;
  sections: Section[];
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSectionClick: (name: string) => void;
  activeSection: string | null;
  isTyping: boolean;
  handleReset: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export default function ChatSimulator({
  messages,
  primaryColor,
  sections,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  handleSectionClick,
  activeSection,
  isTyping,
  handleReset,
  scrollRef,
}: ChatSimulatorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollContainerRef.current) {
        // Try multiple methods to find the viewport
        const scrollArea = scrollContainerRef.current.querySelector('[data-slot="scroll-area"]');
        const viewport = scrollArea?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
        
        if (viewport) {
          // Use multiple attempts to ensure scrolling works
          const attemptScroll = () => {
            viewport.scrollTop = viewport.scrollHeight;
          };
          
          // Immediate attempt
          attemptScroll();
          
          // Delayed attempts to handle async rendering
          requestAnimationFrame(attemptScroll);
          setTimeout(attemptScroll, 50);
          setTimeout(attemptScroll, 150);
        }
      }
    };
    
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <Card className="flex-1 flex flex-col border-white/5 bg-[#0A0A0E] overflow-hidden relative shadow-2xl">
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-300">
            Test Environment
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Reset
        </Button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 min-h-0">
        <ScrollArea className="h-full p-6 relative bg-zinc-950/30">
        <div className="space-y-6 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full flex-col",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "flex max-w-[80%] gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-zinc-800",
                    msg.role === "user" ? "bg-zinc-800" : "text-white"
                  )}
                  style={
                    msg.role !== "user" ? { backgroundColor: primaryColor } : {}
                  }
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <BotIcon className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="space-y-2">
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-zinc-800 text-zinc-200 rounded-tr-sm"
                        : "bg-white text-zinc-900 rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>

                  {msg.isWelcome && sections.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 ml-1 animate-in fade-in-0 duration-300 slide-in-from-top-1">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.name)}
                          className="px-3 py-1 rounded-full border text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          {section.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[80%] gap-3 row">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>

                <div className="p-4 rounded-2xl bg-white text-zinc-900 rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      </div>

      <div className="p-4 bg-[#0A0A0E] border-t border-white/5">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeSection}
            placeholder={
              activeSection
                ? "Type a message ... "
                : "Please select a category above to start ... "
            }
            className="pt-3 min-h-12.5 max-h-37.5 pr-12 outline-none text-white bg-zinc-900/50 border-white/10 resize-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!activeSection || !input.trim()}
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 transition-colors",
              !activeSection || !input.trim() ? "bg-zinc-800 text-zinc-500" : ""
            )}
            style={
              activeSection && input.trim()
                ? { backgroundColor: primaryColor, color: "white" }
                : {}
            }
          >
            <Send className="w-4 h-4" />
          </Button>
          
        </div>
      </div>
    </Card>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Bot, ChevronDown, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";


interface ChatBotMetaData {
  id: string;
  color: string;
  welcome_message: string;
}

interface Section {
  id: string;
  name: string;
  source_ids: string[];
}

const EmbedPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [metaData, setMetaData] = useState<ChatBotMetaData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hi there, How can I help you today?",
      isWelcome: true,
      section: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make sure parent body is transparent and properly sized
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = "transparent";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.backgroundColor = "transparent";
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";
      document.documentElement.style.width = "100%";
      document.documentElement.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
    }

    if (typeof window !== "undefined") {
      window.parent.postMessage(
        {
          type: "resize",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
        },
        "*"
      );
    }
  }, []);

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      window.parent.postMessage(
        {
          type: "resize",
          width: "380px",
          height: "600px", // Increased height for better view
          borderRadius: "12px",
        },
        "*"
      );
    } else {
      window.parent.postMessage(
        {
          type: "resize",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
        },
        "*"
      );
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Invalid token");
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/widget/config?token=${token}`);
        if (!response.ok) {
          throw new Error("Failed to fetch config");
        }
        const data = await response.json();

        console.log(data);
        setMetaData(data.metadata);
        setSections(data.sections || []);

        // Initialize with actual welcome message if available
        if (data.metadata?.welcome_message) {
          setMessages([
            {
              role: "assistant",
              content: data.metadata.welcome_message,
              isWelcome: true,
              section: null,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        setError("Failed to fetch config");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [token]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollContainerRef.current) {
        // Find the ScrollArea viewport
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
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const currentSection = sections.find(
      (section) => section.name === activeSection
    );
    const sourceIds = currentSection?.source_ids || [];

    console.log("Source IDs:", sourceIds);

    const userMessage = {
      role: "user",
      content: input,
      section: activeSection,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);


    try {

      const res = await fetch("/api/chat/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          knowledge_source_ids: sourceIds,
        }),
      });

      console.log(res);

      if (res.ok) {
        const data = await res.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: data.reply,
            section: null,
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "I'm sorry, I couldn't generate a response. Please try again.",
            section: null,
          },
        ]);
      }

    } catch (error) {
      console.error("Error in sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const primaryColor = metaData?.color || "#4f46ef";

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <button
          onClick={toggleOpen}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:brightness-110 transition-all text-white hover:scale-105"
          style={{ backgroundColor: primaryColor }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      </div>
    );
  }

  const handleClickSection = (sectionName: string) => {
    setActiveSection(sectionName);
    const userMsg = {
      role: "user",
      content: `I want to talk about ${sectionName}`,
      section: null,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setInput("");
    setTimeout(() => {
      const botResponse = {
        role: "assistant",
        content: `You can ask me any question related to ${sectionName}`,
        section: sectionName,
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-full bg-[#0A0A0E] rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0E0E12] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0E0E12]"></div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-zinc-300">Support</h2>
              <span className="text-[11px] text-emerald-500 font-medium">
                Online
              </span>
            </div>
          </div>

          <button
            onClick={toggleOpen}
            className="p-2 rounded-lg transition-colors hover:bg-white/10 text-zinc-400 hover:text-white"
            aria-label="Minimize chat"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-linear-to-b from-[#0A0A0E] to-[#0E0E12] p-4"
        >
          <ScrollArea className="h-full p-6 relative bg-zinc-950/30">

            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className={cn(
                      "flex w-full gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== "user" && (
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0E0E12]"></div>
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        message.role === "user"
                          ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                          : "bg-white text-zinc-900 rounded-tl-sm"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-zinc-800">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  {message.isWelcome && sections.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-10 animate-in fade-in slide-in-from-top-1 duration-300">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleClickSection(section.name)}
                          className="px-3 py-1 rounded-full border border-white/20 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          {section.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex w-full gap-2 justify-start">
                  <div className="relative shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0E0E12]"></div>
                  </div>
                  <div className="max-w-[80%] p-4 rounded-2xl bg-white text-zinc-900 rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea >
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#0E0E12] shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!activeSection}
              placeholder={
                activeSection
                  ? "Type a message ... "
                  : "Please select a section to start"
              }
              className="pt-3 min-h-12.5 max-h-37.5 pr-12 outline-none text-white bg-zinc-900/50 border-white/10 resize-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`self-end px-4 py-3 rounded-xl font-medium text-sm transition-all ${input.trim()
                ? "hover:brightness-110"
                : "opacity-50 cursor-not-allowed"
                }`}
              style={{
                backgroundColor: input.trim() ? primaryColor : "#374151",
                color: "white",
              }}
            >
              Send
            </button>
          </div>

          <div className="mt-2 text-center">
            <Link
              href={"/"}
              className="text-[12px] text-zinc-600 font-medium hover:text-zinc-500 transition-colors"
            >
              Powered by K Xa Hajur
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmbedPage;

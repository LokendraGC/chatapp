"use client";

import { AlertCircle, Bot, ChevronDown, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make sure parent body is transparent
    document.body.style.backgroundColor = "transparent";
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
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
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop =
        scrollViewportRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        role: "assistant",
        content: `I received: "${input}". This is a demo response.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
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
      <div className="flex items-center justify-center w-14 h-14">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="w-[380px] h-[600px] bg-[#0A0A0E] rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
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
          ref={scrollViewportRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0A0A0E] to-[#0E0E12] p-4"
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : message.isWelcome
                      ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-zinc-200 border border-white/5 rounded-bl-none"
                      : "bg-zinc-800/50 text-zinc-200 border border-white/5 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-bl-none">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#0E0E12] shrink-0">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
              rows={1}
              style={{ minHeight: "44px", maxHeight: "100px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`self-end px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                input.trim()
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
        </div>
      </div>
    </div>
  );
};


export default EmbedPage;
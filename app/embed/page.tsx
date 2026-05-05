"use client";

import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  ContactIcon,
  HelpCircleIcon,
  HomeIcon,
  Mail,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import {
  FaFacebookF,
  FaFacebookMessenger,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatbHome from "@/components/ui/embed/home";
import Help from "@/components/ui/embed/help";

interface ChatBotMetaData {
  id: string;
  color: string;
  welcome_message: string;
  website_url?: string;
}

interface Section {
  id: string;
  name: string;
  source_ids: string[];
}

type SocialItem = { platform: string; url: string };
type ContactInfo = {
  email?: string;
  phone?: string;
  social_media?: SocialItem[];
};

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
  const [activeTab, setActiveTab] = useState<"home" | "contact" | "help">(
    "home",
  );
  const [showChat, setShowChat] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef<number>(0);

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
      setIsEmbedded(window.self !== window.top);
      window.parent.postMessage(
        {
          type: "resize",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
        },
        "*",
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
        "*",
      );
    } else {
      window.parent.postMessage(
        {
          type: "resize",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
        },
        "*",
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
    if (!token) return;
    const domain = metaData?.website_url || "";
    const url = `/api/contact/fetch?token=${encodeURIComponent(token)}&domain=${encodeURIComponent(domain)}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.contact) return;
        setContactInfo(data.contact as ContactInfo);
      })
      .catch(() => undefined);
  }, [token, metaData?.website_url]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollArea = scrollContainerRef.current.querySelector(
        '[data-slot="scroll-area"]',
      );
      const viewport = scrollArea?.querySelector(
        '[data-slot="scroll-area-viewport"]',
      ) as HTMLElement;

      if (viewport) {
        if (showChat) {
          // In chat mode, scroll to bottom to show latest messages
          const attemptScroll = () => {
            viewport.scrollTop = viewport.scrollHeight;
          };
          attemptScroll();
          requestAnimationFrame(attemptScroll);
          setTimeout(attemptScroll, 50);
          setTimeout(attemptScroll, 150);
        } else {
          // In tab mode (home/contact/help), always show from the top
          const scrollToTop = () => {
            viewport.scrollTop = 0;
          };
          scrollToTop();
          requestAnimationFrame(scrollToTop);
          setTimeout(scrollToTop, 50);
          setTimeout(scrollToTop, 150);
          setTimeout(scrollToTop, 300);
        }
      }
    }
  }, [messages, isTyping, isOpen, showChat, activeTab]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const currentSection = sections.find(
      (section) => section.name === activeSection,
    );
    const sourceIds = currentSection?.source_ids || [];

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
            content:
              "I'm sorry, I couldn't generate a response. Please try again.",
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

  const renderWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 underline underline-offset-2"
          >
            {part}
          </a>
        );
      }
      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const renderAssistantContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    const listLines = lines.filter((line) =>
      /^(\s*[-*]|\s*\d+\.)\s+/.test(line),
    );
    const nonListLines = lines
      .filter((line) => !/^(\s*[-*]|\s*\d+\.)\s+/.test(line))
      .map((line) => line.trim())
      .filter(Boolean);

    const listItems = listLines.map((line) =>
      line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, "").trim(),
    );

    return (
      <div className="space-y-2">
        {nonListLines.length > 0 && (
          <p className="whitespace-pre-wrap">
            {renderWithLinks(nonListLines.join("\n"))}
          </p>
        )}
        {listItems.length > 0 && (
          <ul className="list-disc pl-5 space-y-1">
            {listItems.map((item, idx) => (
              <li key={`${item}-${idx}`} className="text-sm text-zinc-900">
                {renderWithLinks(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
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

  const handleToggle = () => {
    if (Date.now() - lastTouchTimeRef.current < 400) return;
    lastTouchTimeRef.current = Date.now();
    toggleOpen();
  };

  const handleToggleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    lastTouchTimeRef.current = Date.now();
    toggleOpen();
  };

  if (!isOpen) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation">
        <button
          type="button"
          onClick={handleToggle}
          onTouchEnd={handleToggleTouch}
          className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all text-white hover:scale-105 cursor-pointer touch-manipulation select-none"
          style={{
            backgroundColor: primaryColor,
            WebkitTapHighlightColor: "transparent",
          }}
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

  const handleTabChange = (value: "home" | "contact" | "help") => {
    setActiveTab(value);
    setShowChat(false);
    setActiveSection(null);
  };

  const openChatFromContact = () => {
    setShowChat(true);
  };

  const getSocialMeta = (platform: string) => {
    const key = platform.toLowerCase();
    if (key.includes("whatsapp")) {
      return {
        label: "WhatsApp",
        icon: <FaWhatsapp className="h-4 w-4" />,
        className: "bg-emerald-100 text-emerald-600",
      };
    }
    if (key.includes("messenger")) {
      return {
        label: "Messenger",
        icon: <FaFacebookMessenger className="h-4 w-4" />,
        className: "bg-sky-100 text-sky-600",
      };
    }
    if (key.includes("facebook")) {
      return {
        label: "Facebook",
        icon: <FaFacebookF className="h-4 w-4" />,
        className: "bg-blue-100 text-blue-600",
      };
    }
    if (key.includes("instagram")) {
      return {
        label: "Instagram",
        icon: <FaInstagram className="h-4 w-4" />,
        className: "bg-pink-100 text-pink-600",
      };
    }
    if (key.includes("linkedin")) {
      return {
        label: "LinkedIn",
        icon: <FaLinkedinIn className="h-4 w-4" />,
        className: "bg-sky-100 text-sky-700",
      };
    }
    if (key === "x" || key.includes("twitter")) {
      return {
        label: "X",
        icon: <FaTwitter className="h-4 w-4" />,
        className: "bg-zinc-100 text-zinc-700",
      };
    }
    if (key.includes("youtube")) {
      return {
        label: "YouTube",
        icon: <FaYoutube className="h-4 w-4" />,
        className: "bg-red-100 text-red-600",
      };
    }
    if (key.includes("tiktok")) {
      return {
        label: "TikTok",
        icon: <FaTiktok className="h-4 w-4" />,
        className: "bg-zinc-100 text-zinc-800",
      };
    }
    return null;
  };

  return (
    <div
      className={
        isEmbedded
          ? "w-full h-full bg-transparent"
          : "w-full min-h-screen flex items-center justify-center p-4 bg-zinc-100"
      }
    >
      <div
        className={
          isEmbedded
            ? "w-full h-full bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col"
            : "w-full max-w-[380px] h-[600px] bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col"
        }
      >
        {/* Header */}
        <div className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-zinc-900">Support</h2>
              <span className="text-[11px] text-emerald-500 font-medium">
                Online
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            onTouchEnd={handleToggleTouch}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-3 rounded-lg transition-colors hover:bg-zinc-100 active:scale-95 text-zinc-500 hover:text-zinc-900 cursor-pointer touch-manipulation select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="Minimize chat"
          >
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-white p-4"
        >
          <ScrollArea className="h-full p-6 relative bg-white">
            {!showChat ? (
              <div className="space-y-4">
                {activeTab === "home" && (
                  <ChatbHome
                    onShowAllQuestions={() => handleTabChange("help")}
                    onContact={() => handleTabChange("contact")}
                    token={token}
                    domain={metaData?.website_url || ""}
                  />
                )}
                {activeTab === "help" && (
                  <Help token={token} domain={metaData?.website_url || ""} />
                )}
                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-zinc-900">
                      Contact us
                    </div>
                    <button
                      type="button"
                      onClick={openChatFromContact}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-zinc-50 transition"
                    >
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-900">
                            Support Bot
                          </div>
                          <div className="text-xs text-zinc-500">
                            Hello! How can I help you today?
                          </div>
                        </div>
                        <MessageCircle className="w-4 h-4 text-zinc-400" />
                      </div>
                    </button>
                    {(contactInfo?.phone ||
                      contactInfo?.email ||
                      (contactInfo?.social_media ?? []).length > 0) && (
                      <div className="space-y-2">
                        {contactInfo?.phone && (
                          <a
                            href={`tel:${contactInfo.phone}`}
                            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Phone className="h-4 w-4" />
                              </span>
                              <span>{contactInfo.phone}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-zinc-400" />
                          </a>
                        )}
                        {contactInfo?.email && (
                          <a
                            href={`mailto:${contactInfo.email}`}
                            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                <Mail className="h-4 w-4" />
                              </span>
                              <span>{contactInfo.email}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-zinc-400" />
                          </a>
                        )}
                        {(contactInfo?.social_media ?? []).map(
                          (item, index) => {
                            const meta = getSocialMeta(item.platform || "");
                            return (
                              <a
                                key={`${item.platform}-${index}`}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
                              >
                                <div className="flex items-center gap-3">
                                  {meta ? (
                                    <span
                                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${meta.className}`}
                                    >
                                      {meta.icon}
                                    </span>
                                  ) : (
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-medium">
                                      {item.platform?.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                  <span className="capitalize">
                                    {meta?.label ?? item.platform}
                                  </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-zinc-400" />
                              </a>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className={cn(
                        "flex w-full gap-2",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
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
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                          message.role === "user"
                            ? "bg-zinc-900 text-white rounded-tr-sm"
                            : "text-white rounded-tl-sm",
                        )}
                        style={
                          message.role !== "user"
                            ? { backgroundColor: primaryColor }
                            : {}
                        }
                      >
                        <div
                          className="whitespace-pre-wrap chat-message"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-200 bg-zinc-100">
                          <User className="w-4 h-4 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    {message.isWelcome && sections.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-10 animate-in fade-in slide-in-from-top-1 duration-300">
                        {sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => handleClickSection(section.name)}
                            className="px-3 py-1 rounded-full border border-zinc-200 text-sm text-zinc-700 cursor-pointer hover:bg-zinc-50 transition-colors"
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
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="max-w-[80%] p-4 rounded-2xl bg-zinc-100 text-zinc-900 rounded-tl-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 bg-white shrink-0">
          {showChat && (
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!showChat}
                placeholder="Type a message..."
                className="pt-3 min-h-12.5 max-h-37.5 pr-12 text-xs outline-none text-zinc-900 placeholder:text-zinc-400 bg-white border-zinc-200 resize-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`self-end px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  input.trim()
                    ? "hover:brightness-110"
                    : "opacity-50 cursor-not- allowed"
                }`}
                style={{
                  backgroundColor: input.trim() ? primaryColor : "#E5E7EB",
                  color: input.trim() ? "white" : "#9CA3AF",
                }}
              >
                Send
              </button>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              handleTabChange(value as "home" | "contact" | "help")
            }
            className="w-full mt-4 "
          >
            <TabsList className="w-full rounded-full border border-zinc-200 bg-white/95 px-2 py-6 shadow-sm">
              <TabsTrigger
                value="home"
                className="cursor-pointer flex-1 gap-2 rounded-full py-5 text-xs text-zinc-500 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <HomeIcon className="w-4 h-4" /> Home
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="cursor-pointer flex-1 gap-2 rounded-full py-5 text-xs text-zinc-500 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <ContactIcon className="w-4 h-4" /> Contact
              </TabsTrigger>
              <TabsTrigger
                value="help"
                className="cursor-pointer flex-1 gap-2 rounded-full py-5 text-xs text-zinc-500 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <HelpCircleIcon className="w-4 h-4" /> Help
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-2 text-center">
            <Link
              href={"/"}
              className="text-[12px] text-zinc-600 font-medium hover:text-zinc-500 transition-colors"
            >
              Powered by Karmi AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedPage;

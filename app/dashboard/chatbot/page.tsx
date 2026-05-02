"use client";

import ChatSimulator from "@/components/ui/dashboard/chatbot/ChatSimulator";
import EmbedCodeConfig from "@/components/ui/dashboard/chatbot/EmbedCodeConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ApartmentConfig = dynamic(
  () => import("@/components/ui/dashboard/chatbot/ApartmentConfig"),
  { ssr: false }
);

interface ChatBotMetaData {
  id: string;
  user_email: string;
  color: string;
  welcome_message: string;
  created_at: Date;
  source_ids: string[];
}

export default function ChatbotPage() {
  const [metadata, setMetadata] = useState<ChatBotMetaData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const [primaryColor, setPrimaryColor] = useState<string>("#000000");
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const metaRes = await fetch("/api/chatbot/fetch");
        const response = await metaRes.json();

        if (response && response.data) {
          const metaData = response.data;
          setMetadata(metaData);
          setPrimaryColor(metaData.color || "#4f46e5");
          setWelcomeMessage(
            metaData.welcome_message || "Hi there, How can I help you today?"
          );
          setMessages([
            {
              role: "assistant",
              content:
                metaData.welcome_message ||
                "Hi there, How can I help you today?",
              isWelcome: true,
              section: null,
            },
          ]);
        }

        const sectionData = await fetch("/api/section/fetch");
        const sections = await sectionData.json();
        setSections(sections.response || []);
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const currentSection = sections.find(
      (section) => section.name === activeSection
    );
    const sourceIds = currentSection?.sourceIds || [];

    const userMessage = {
      role: "user",
      content: input,
      section: activeSection,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    const res = await fetch("/api/chat/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        knowledge_source_ids: sourceIds,
        section_id: currentSection?.id,
      }),
    });
    if (!res.ok) {
      setIsTyping(false);
      return;
    }
    const data = await res.json();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: data.reply,
        section: null,
      },
    ]);
    setIsTyping(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSectionClick = (sectionName: string) => {
    setActiveSection(sectionName);
    const userMsg = {
      role: "user",
      content: `${sectionName}`,
      section: null,
    };
    setMessages((prevMessages) => [...prevMessages, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg = {
        role: "assistant",
        content: `I'm here to help you with ${sectionName}`,
        section: sectionName,
      };
      setMessages((prevMessages) => [...prevMessages, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleReset = () => {
    setActiveSection(null);
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        isWelcome: true,
        section: null,
      },
    ]);
    setInput("");
    setIsTyping(false);
  };

  const hasChanges = metadata
    ? primaryColor !== (metadata.color || "#4f46e5") ||
      welcomeMessage !==
        (metadata.welcome_message || "Hi there, How can I help you today?")
    : false;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/chatbot/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          color: primaryColor,
          welcome_message: welcomeMessage,
        }),
      });

      if (res.ok) {
        const response = await res.json();
        if (response.success && response.data) {
          // Update the metadata state with the new values while preserving other fields
          setMetadata((prev) => (prev ? { ...prev, ...response.data } : null));
        }
      } else {
        throw new Error("Failed to save metadata" + res.statusText);
      }
    } catch (error) {
      console.error("Error saving metadata:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300 h-[calc(100vh-10px)] overflow-auto flex flex-col">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 space-y-6 w-full animate-in fade-in-0 duration-300 lg:h-[calc(100vh-10px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Chatbot Playground
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test your assistance, customize appearance, and get started.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:min-h-0">
        <div className="lg:col-span-7 flex flex-col h-[600px] lg:h-full lg:min-h-0 space-y-4">
          <ChatSimulator
            messages={messages}
            primaryColor={primaryColor}
            sections={sections}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            handleKeyDown={handleKeyDown}
            handleSectionClick={handleSectionClick}
            activeSection={activeSection}
            isTyping={isTyping}
            handleReset={handleReset}
            scrollRef={scrollViewportRef}
          />
        </div>

        <div className="lg:col-span-5 lg:h-full lg:min-h-0 overflow-visible lg:overflow-hidden flex flex-col">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-8">
              <ApartmentConfig
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                welcomeMessage={welcomeMessage}
                setWelcomeMessage={setWelcomeMessage}
                handleSave={handleSave}
                isSaving={isSaving}
                hasChanges={hasChanges}
              />

              <EmbedCodeConfig chatbotId={metadata?.id || undefined} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

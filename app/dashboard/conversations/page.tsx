'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, Loader2, MoreHorizontal, Search, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";


interface Conversation {
  id: string,
  user: string,
  lastMessage: string,
  createdAt: string,
  time: string,
  userEmail: string,
  visitorIp?: string,
}

interface Message {
  id: string,
  role: "user" | "assistant",
  content: string,
  created_at: string,
}

export default function ConversationsPage() {

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [replyContent, setReplyContent] = useState("");
  const [issending, setIsSending] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations/fetch");
        const data = await response.json();
        setConversations(data.conversations || []);

      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation?.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    if (!selectedId) return;

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await fetch(`/api/conversations/${selectedId}/messages`);
        const data = await response.json();
        setCurrentMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

  }, [selectedId]);

  const handleReplySend = async () => {
    if (!replyContent.trim() || !selectedId) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/conversations/${selectedId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent }),
      });


      if (response.ok) {

        const newMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: replyContent,
          created_at: new Date().toISOString(),
        }

        setCurrentMessages((prevMessages) => [...prevMessages, newMsg]);
        setReplyContent("");

        setConversations((prevConversations) => prevConversations.map((conversation) => conversation.id === selectedId ? { ...conversation, lastMessage: replyContent, time: "Just Now" } : conversation));
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false);
    }
  }

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
  }, [currentMessages, isLoadingMessages]);


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleReplySend();
    }
  };

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);

  console.log("conversations", conversations);

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-black animate-in fade-in-0 duration-500">
      <div className="flex flex-col border-r border-white/10 w-[350px] md:w-[400px] bg-[#050509]">
        <div className="p-4 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-white">Inbox</h1>
            <div className="text-xs text-zinc-500">{filteredConversations.length} conversations</div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search sources"
              className="pl-10 bg-white/2 border-white/10 w-full text-white"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {isLoadingList ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ffffff]" />
                </div>
              ) : (

                filteredConversations.length > 0 ? (
                  <>
                    {
                      filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedId(conversation.id)}
                          className={cn(
                            "cursor-pointer border border-white/10 flex flex-col gap-2 p-4 text-left transition-all duration-200",
                            selectedId === conversation.id ? "bg-white/10 border-l-2 border-l-indigo-500  border-b-transparent" :
                              "border-l-2 border-l-transparent border-b-transparent"
                          )}
                        >

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "font-medium text-sm truncate max-w-45",
                                  selectedId === conversation.id
                                    ? "text-white"
                                    : "text-zinc-300"
                                )}
                              >
                                {conversation.user}

                              </span>
                              {
                                conversation?.time && (
                                  <span className="text-xs text-zinc-500">
                                    {conversation?.time}
                                  </span>
                                )
                              }
                            </div>
                            <span className="text-xs text-zinc-500">
                              {conversation?.lastMessage?.slice(0, 20)}...
                            </span>
                          </div>

                        </button>
                      ))
                    }
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center py-10">
                      <p className="text-zinc-500">No conversations found</p>
                    </div>
                  </>
                )
              )}
            </div>
          </ScrollArea>

        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a03]">
        {
          selectedConversation ? (
            <>
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-white text-sm">
                      {selectedConversation.user}
                    </h2>
                    {
                      selectedConversation.visitorIp && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                          {selectedConversation.visitorIp}
                        </span>
                      )
                    }
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

              </div>

              <div ref={scrollContainerRef} className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {
                    isLoadingMessages ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-[#ffffff]" />
                      </div>
                    ) : (
                      <div className="max-w-3xl mx-auto space-y-6 p-4 pb-4">
                        {currentMessages.map((msg, i) => (
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
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5",
                                  msg.role === "user" ? "bg-zinc-800" : "bg-indigo-500"
                                )}
                              >
                                {msg.role === "user" ? (
                                  <User className="w-4 h-4 text-zinc-400" />
                                ) : (
                                  <Bot className="w-4 h-4 text-white" />
                                )}
                              </div>

                              <div className="space-y-1">
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
                                <span className={cn(
                                  "text-[10px] text-zinc-500 px-1 block",
                                  msg.role === "user" ? "text-right" : "text-left"
                                )}>
                                  {
                                    msg.created_at ?
                                      new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                      "Just now"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </ScrollArea>
              </div>

              <div className="p-4 bg-[#0A0A0E] border-t border-white/5 shrink-0">
                <div className="relative">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a reply..."
                    className="pt-3 min-h-[44px] max-h-[150px] pr-12 outline-none text-white bg-zinc-900/50 border-white/10 resize-none rounded-xl"
                    disabled={issending}
                  />
                  <Button
                    size="icon"
                    onClick={handleReplySend}
                    disabled={!replyContent.trim() || issending}
                    className={cn(
                      "absolute right-2 bottom-2 h-8 w-8 transition-colors",
                      !replyContent.trim() || issending ? "bg-zinc-800 text-zinc-500" : "bg-indigo-500 text-white hover:bg-indigo-600"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </>
          ) : (
            <></>
          )
        }
      </div>
    </div>
  )
}
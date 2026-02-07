"use client";

import React, { useEffect, useState } from "react";
import { Bot, ChevronDown, HelpCircle } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ChatbHomeProps {
    onShowAllQuestions?: () => void;
    onContact?: () => void;
}

type FaqItem = { question: string; answer: string };

const fallbackQuestions: FaqItem[] = [
    {
        question: "How do I add a new section?",
        answer:
            "Go to the Sections area in your dashboard and click “Add Section.”",
    },
    {
        question: "How can I edit chatbot tone?",
        answer:
            "Open a section and update the Tone field, then save your changes.",
    },
    {
        question: "Where do I manage knowledge sources?",
        answer: "Use the Knowledge Base menu to add or update your sources.",
    },
];

const ChatbHome = ({ onShowAllQuestions, onContact }: ChatbHomeProps) => {
    const [questions, setQuestions] = useState<FaqItem[]>(fallbackQuestions);
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    useEffect(() => {
        fetch("/api/faq/fetch")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data?.faqs) return;
                const normalized = (data.faqs as any[]).map((item) => ({
                    question: String(item?.question ?? ""),
                    answer: String(item?.answer ?? ""),
                }));
                const filtered = normalized.filter(
                    (item) => item.question && item.answer
                );
                if (filtered.length > 0) {
                    setQuestions(filtered.slice(0, 3));
                }
            })
            .catch(() => undefined);
    }, []);


    return (
        <div className="space-y-4">
            <div className="space-y-3 rounded-2xl bg-[radial-gradient(80%_100%_at_0%_0%,rgba(59,130,246,0.16),rgba(255,255,255,0.9))] p-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-4xl font-semibold text-zinc-900 mb-4">
                            Hi, nice to see you here!👋
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-linear-to-br from-purple-500 via-sky-500 to-emerald-400">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-zinc-900"> Support Bot</div>
                            <div className="text-xs text-zinc-500">
                                Hello! How can I help you?
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onContact}
                        className="mt-3 w-full cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
                    >
                        Contact us
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <HelpCircle className="h-4 w-4" />
                Quick answers
            </div>
            <div className="space-y-2">
                {questions.map((item, index) => (
                    <Collapsible
                        key={item.question}
                        open={openIndex === index}
                        onOpenChange={(isOpen) =>
                            setOpenIndex(isOpen ? index : null)
                        }
                        className="rounded-lg hover:bg-zinc-100 cursor-pointer border border-zinc-200 bg-white px-3 py-2 shadow-sm"
                    >
                        <CollapsibleTrigger className="flex cursor-pointer py-2 w-full items-center justify-between text-left text-sm font-medium text-zinc-900">
                            <span>{item.question}</span>
                            <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 cursor-pointer py-2 text-[13px] text-zinc-600 leading-relaxed font-bold-medium">
                            {item.answer}
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
            <button
                type="button"
                onClick={onShowAllQuestions}
                className="inline-flex items-center justify-center 
                rounded-full border border-white/10 bg-[#0A0A0E] px-4 py-2 text-sm font-medium text-white/90 shadow-sm transition cursor-pointer"
            >
                Show all questions
            </button>
        </div>
    );
};

export default ChatbHome;
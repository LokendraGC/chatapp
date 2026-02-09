"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, HelpCircle, PencilIcon } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface HelpProps {
    onWriteMessage?: () => void;
    token?: string | null;
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

const Help = ({ onWriteMessage, token }: HelpProps) => {
    const [questions, setQuestions] = useState<FaqItem[]>(fallbackQuestions);
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    useEffect(() => {
        const url = token
            ? `/api/faq/public?token=${encodeURIComponent(token)}`
            : "/api/faq/fetch";
        fetch(url)
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
                    setQuestions(filtered as FaqItem[]);
                }
            })
            .catch(() => undefined);
    }, [token]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                {showForm ? (
                    <>
                        <PencilIcon className="h-4 w-4" />
                        <span>Write Message</span>
                    </>
                ) : (
                    <>
                        <HelpCircle className="h-4 w-4" />
                        <span>All questions</span>
                    </>
                )}
            </div>
            {!showForm ? (
                <>
                    <div className="space-y-2">
                        {questions.map((item, index) => (
                            <Collapsible
                                key={item.question}
                                open={openIndex === index}
                                onOpenChange={(isOpen) =>
                                    setOpenIndex(isOpen ? index : null)
                                }
                                className="rounded-lg cursor-pointer border border-zinc-200 bg-white px-3 py-2 shadow-sm"
                            >
                                <CollapsibleTrigger className="flex cursor-pointer py-2 w-full items-center justify-between text-left text-sm font-medium text-zinc-900">
                                    <span>{item.question}</span>
                                    <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2 cursor-pointer py-2 text-xs text-zinc-600 leading-relaxed">
                                    {item.answer}
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs text-zinc-500">
                            Didn&apos;t find what you were looking for?
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="inline-flex cursor-pointer w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                        >
                            Write to us
                            <span className="inline-flex h-4 w-4 items-center justify-center ">
                                <PencilIcon />
                            </span>
                        </button>
                    </div>
                </>
            ) : (
                <form
                    className="space-y-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onWriteMessage?.();
                    }}
                >
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                    <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email address"
                        type="email"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                    <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Your message"
                        rows={4}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="inline-flex flex-1 items-center cursor-pointer justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex flex-1 items-center cursor-pointer justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
};

export default Help;
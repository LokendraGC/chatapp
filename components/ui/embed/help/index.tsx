"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, HelpCircle, PencilIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface HelpProps {
  onWriteMessage?: () => void;
  token?: string | null;
  domain?: string;
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
    answer: "Open a section and update the Tone field, then save your changes.",
  },
  {
    question: "Where do I manage knowledge sources?",
    answer: "Use the Knowledge Base menu to add or update your sources.",
  },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Help = ({ onWriteMessage, token, domain }: HelpProps) => {
  const [questions, setQuestions] = useState<FaqItem[]>(fallbackQuestions);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showForm, setShowForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!token) return;
      try {
        const url = `/api/faq/fetch?token=${encodeURIComponent(token)}${domain ? `&domain=${encodeURIComponent(domain)}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const normalized = (data.faqs as any[])
          .map((item) => ({
            question: String(item?.question ?? ""),
            answer: String(item?.answer ?? ""),
          }))
          .filter((item) => item.question && item.answer);
        if (normalized.length > 0) setQuestions(normalized);
      } catch (e) {
        console.error("Failed to fetch FAQs:", e);
      }
    };
    fetchFaqs();
  }, [token, domain]);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/help/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token, domain }),
      });
      if (res.ok) {
        reset();
        setShowForm(false);
        setIsSuccess(true);
        onWriteMessage?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3">
      {!isSuccess && (
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
      )}
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-900">Email is sent, thank you</p>
          <button
            onClick={() => setIsSuccess(false)}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 mt-4"
          >
            Go back
          </button>
        </div>
      ) : !showForm ? (
        <>
          <div className="space-y-2">
            {questions.map((item, index) => (
              <Collapsible
                key={item.question}
                open={openIndex === index}
                onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}
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
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              {...register("name")}
              placeholder="Your name"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("email")}
              placeholder="Email address"
              type="email"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <textarea
              {...register("message")}
              placeholder="Your message"
              rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
              className="inline-flex flex-1 items-center cursor-pointer justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center cursor-pointer justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Help;


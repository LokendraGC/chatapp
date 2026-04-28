"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Command,
  Globe,
  LinkIcon,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "../textarea";
import { Input } from "../input";

interface InitialData {
  businessName: string;
  websiteUrl: string;
  externalLinks: string;
}

const STEPS = [
  {
    id: "name",
    label: "Business Name",
    question: "What is the name of your business?",
    description: "This will be the identity of your AI assistant.",
    icon: Building2,
    placeholder: "e.g. Acme Corp",
    type: "text",
    field: "businessName" as keyof InitialData,
  },
  {
    id: "website",
    label: "Website",
    question: "What is your website URL?",
    description: "We will scrape data from here to train your chatbot.",
    icon: Globe,
    placeholder: "https://acme.com",
    type: "url",
    field: "websiteUrl" as keyof InitialData,
  },
  {
    id: "links",
    label: "Extra Context",
    question: "Any other links to add?",
    description:
      "Add external links like Notion pages or Help docs to give your chatbot more context.",
    icon: LinkIcon,
    placeholder: "https://notion.so/docs ...",
    type: "textarea",
    badge: "Optional",
    field: "externalLinks" as keyof InitialData,
  },
];

export default function InitialForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InitialData>({
    businessName: "",
    websiteUrl: "",
    externalLinks: "",
  });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const stepData = STEPS[currentStep];
  const Icon = stepData.icon;
  const isStepValid =
    currentStep >= 2 ||
    (formData[stepData.field] && formData[stepData.field].length > 0);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/metadata/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.businessName,
          website_url: formData.websiteUrl,
          external_links: formData.externalLinks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save metadata");
      }

      await response.json();
      window.location.reload();
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      // You might want to add a toast or alert here
      alert(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    const currentField = STEPS[currentStep].field;
    const currentValue = formData[currentField];

    if (currentStep < 2 && (!currentValue || currentValue.trim().length === 0))
      return;

    if (currentStep < STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (STEPS[currentStep].type === "textarea") {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto min-h-100 flex flex-col justify-center items-center">
      <div className="fixed top-0 left-0 w-full h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="fixed top-0 right-6 md:top-8 md:right-8 text-xs font-medium text-muted-foreground uppercase tracking-widest pointer-events-none fade-in">
        Set Up Your Account
      </div>
      {isSubmitting ? (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <div className="relative w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-medium text-foreground tracking-tight mb-2">
            Scanning Your Website...
          </h2>
          <p className="text-sm text-muted-foreground font-light mb-8 leading-relaxed">
            {`Scanning ${formData.websiteUrl}...`}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "transion-all duration-300 ease-in-out transform",
            isAnimating
              ? "opacity-0 translate-y-0 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          )}
        >
          <div className="flex items-center justify-between">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full -ml-2 w-8 h-8"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <span className="text-sm font-medium text-muted-foreground uppercase">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-medium text-foreground tracking-tight mb-2">
                {stepData.question}
              </h1>
              <p className="text-sm text-muted-foreground font-light mb-8 leading-relaxed">
                {stepData.description}
              </p>
            </div>
            <div className="relative group">
              {stepData.type === "textarea" ? (
                <Textarea
                  ref={inputRef as any}
                  value={formData[stepData.field] as string}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [stepData.field]: e.target.value,
                    })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={stepData.placeholder}
                  className="w-full bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-b focus-visible:border-primary rounded-none h-auto transition-colors"
                  autoFocus
                />
              ) : (
                <Input
                  ref={inputRef as any}
                  value={formData[stepData.field] as string}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [stepData.field]: e.target.value,
                    })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={stepData.placeholder}
                  className="w-full bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-b focus-visible:border-primary rounded-none h-auto transition-colors"
                  autoFocus
                />
              )}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-8">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                {stepData.type === "textarea" ? (
                  <>
                    <Command className="w-3 h-3" />
                    <span>+ Enter</span>
                  </>
                ) : (
                  <>
                    <span>Press Enter ↵</span>
                    <span className="ml-1">to continue</span>
                  </>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid}
                className="rounded-full px-4 py-2 text-base cursor-pointer transition-all duration-300 font-medium"
              >
                {currentStep === STEPS.length - 1 ? "Submit" : "Continue"}
                {currentStep === STEPS.length - 1 ? (
                  <Sparkles className="w-4 h-4 ml-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

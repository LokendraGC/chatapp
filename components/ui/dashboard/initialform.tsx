"use client";

import { Building2, Globe, LinkIcon } from "lucide-react";
import { useRef, useState } from "react";

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
  return (
    <div className="w-full max-w-xl mx-auto min-h-100 flex flex-col justify-center items-center">
      <h1>Initial Form</h1>
    </div>
  );
}

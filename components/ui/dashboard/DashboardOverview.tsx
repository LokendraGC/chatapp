"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../spinner";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  Code,
  Copy,
  FileText,
  Globe,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Button } from "../button";
import { ScrollArea } from "../scroll-area";
import { Badge } from "../badge";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const [data, setData] = useState<null | any>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);

    fetch("/api/overview")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading)
    return (
      <div className="flex-1 flex w-full items-center justify-center p-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  if (!data) return null;

  const { botId, knowledge, sections, chats, counts } = data;

  const handleCopy = () => {
    const script = `<script src="${origin || "http://localhost:3000"}/widget.js" data-id="${data?.botId || "..."}" defer></script>`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const setupSteps = [
    {
      label: "Website Scanned",
      complete: true,
      href: "#",
      icon: Globe,
      accent: "blue",
    },
    {
      label: "Knowledge Added",
      complete: counts.knowledge > 0,
      href: "/dashboard/knowledge",
      icon: BookOpen,
      accent: "emerald",
    },
    {
      label: "Sections Configured",
      complete: false,
      href: "/dashboard/sections",
      icon: LayoutDashboard,
      accent: "violet",
    },
    {
      label: "Widget Installed",
      complete: false,
      href: "#widget",
      icon: Code,
      accent: "amber",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 w-full animate-in fade-in duration-500">
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-foreground tracking-tight">
          Setup Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {setupSteps.map((step, index) => {
            const Icon = step.icon;
            const accent = step.accent as
              | "blue"
              | "emerald"
              | "violet"
              | "amber";
            const accentStyles = {
              blue: {
                card: "border-blue-500/20 hover:border-blue-500/40 hover:border-b-blue-400 border-b-2 border-b-transparent hover:shadow-[0_4px_0_0_rgba(96,165,250,0.4)]",
                iconWrap: "border-blue-500/40 bg-blue-500/10",
                icon: "text-blue-400",
              },
              emerald: {
                card: "border-emerald-500/20 hover:border-emerald-500/40 hover:border-b-emerald-400 border-b-2 border-b-transparent hover:shadow-[0_4px_0_0_rgba(52,211,153,0.4)]",
                iconWrap: "border-emerald-500/40 bg-emerald-500/10",
                icon: "text-emerald-400",
              },
              violet: {
                card: "border-violet-500/20 hover:border-violet-500/40 hover:border-b-violet-400 border-b-2 border-b-transparent hover:shadow-[0_4px_0_0_rgba(167,139,250,0.4)]",
                iconWrap: "border-violet-500/40 bg-violet-500/10",
                icon: "text-violet-400",
              },
              amber: {
                card: "border-amber-500/20 hover:border-amber-500/40 hover:border-b-amber-400 border-b-2 border-b-transparent hover:shadow-[0_4px_0_0_rgba(251,191,36,0.4)]",
                iconWrap: "border-amber-500/40 bg-amber-500/10",
                icon: "text-amber-400",
              },
            }[accent];
            return (
              <Link href={step.href} key={index} className="block group">
                <Card
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
                    step.complete
                      ? "opacity-90 bg-muted/50 hover:bg-muted border-border"
                      : cn("bg-card hover:bg-muted/50", accentStyles.card),
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 min-h-12 flex flex-col justify-center">
                      <span
                        className={cn(
                          "text-sm font-medium block",
                          step.complete
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                      {step.complete ? (
                        <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-emerald-400">
                          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20">
                            <Icon className="size-3 text-emerald-400" />
                          </span>
                          Done
                        </span>
                      ) : (
                        <span className="mt-1.5 h-5" aria-hidden />
                      )}
                    </div>
                    <div
                      className={cn(
                        "shrink-0 size-10 rounded-lg border flex items-center justify-center transition-colors duration-200",
                        step.complete
                          ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                          : cn("group-hover:scale-105", accentStyles.iconWrap),
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5",
                          step.complete
                            ? "text-emerald-400"
                            : accentStyles.icon,
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Knowledge Base
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                asChild
              >
                <Link href="/dashboard/knowledge">Manage sources</Link>
              </Button>
            </CardHeader>

            <CardContent className="p-4 grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Pages
                  </span>
                </div>
                <span className="text-2xl font-medium text-foreground">
                  {knowledge.website || 0}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Manual Text
                  </span>
                </div>
                <span className="text-2xl font-medium text-foreground">
                  {knowledge.text || 0}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Upload Document
                  </span>
                </div>
                <span className="text-2xl font-medium text-foreground">
                  {knowledge.upload || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card min-h-90">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium text-foreground">
                  Sections
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  configure behavior for different topics
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/dashboard/sections">
                  <Plus className="w-3 h-3" />
                  Create Section
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {sections.list.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No sections found. Create your first section to get started.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-4 py-2 px-4 bg-muted/30 text-[10px] text-muted-foreground tracking-wider font-medium">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-3">Sources</div>
                      <div className="col-span-3">Tone</div>
                      <div className="col-span-1"></div>
                    </div>

                    {sections?.list.map((section: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border items-center hover:bg-muted/30 transition-colors last:border-0 group"
                      >
                        <div className="col-span-5 text-sm font-medium text-foreground">
                          {section.name}
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {section.sourceCount} Sources
                        </div>

                        <div className="col-span-3">
                          <Badge
                            variant="secondary"
                            className="bg-muted text-muted-foreground text-sm rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            {section.tone}
                          </Badge>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard/sections")}
                            size="icon"
                            className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-border bg-card min-h-80 flex flex-col overflow-hidden">
            <CardHeader className="pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-foreground">
                  Recent Chats
                </CardTitle>
                <Link
                  href="/dashboard/conversations"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="px-2 pb-2 flex-1 min-h-0">
              <div className="h-64">
                <ScrollArea className="h-full">
                  <div className="space-y-1 pr-2">
                    {chats.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No chats yet.
                      </div>
                    ) : (
                      chats.map((chat: any, i: number) => (
                        <Link
                          key={i}
                          href={`/dashboard/conversations/`}
                          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-foreground truncate max-w-45">
                              {chat.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {chat.time}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {chat.snippet}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden" id="widget">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-500 dark:text-amber-400/80" />
                  <div>
                    <CardTitle className="text-base font-medium text-foreground">
                      Install Widget
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs mt-0.5">
                      Paste this snippet before{" "}
                      <code className="text-foreground/80 bg-muted px-1 rounded">
                        &lt;/body&gt;
                      </code>{" "}
                      on your site.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="bg-muted border border-border rounded-lg p-4 overflow-hidden">
                <pre className="text-muted-foreground font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all overflow-x-auto pr-2 min-h-16">
                  <code>{`<script src="${origin || process.env.NEXT_PUBLIC_SITE_URL || ""}/widget.js" data-id="${data?.botId || "..."}" defer></script>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

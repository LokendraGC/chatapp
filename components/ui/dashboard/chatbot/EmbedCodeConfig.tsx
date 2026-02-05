"use client";

import { useState } from "react";
import { Input } from "../../input";
import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import { Code as CodeIcon, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "../../button";

export default function EmbedCodeConfig({
  chatbotId,
}: {
  chatbotId: string | undefined;
}) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_SITE_URL}/widget.js"
  data-id="${chatbotId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border bg-card overflow-hidden relative shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CodeIcon className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-foreground uppercase">
              Embed Code
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative group">
          <div className="bg-muted/30 border border-border rounded-lg p-4 overflow-hidden">
            <pre className="text-muted-foreground font-mono block overflow-x-auto text-[12px] leading-relaxed whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500/80 bg-amber-500/10 rounded-lg p-2 mt-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This code is for the chatbot embed code. You can use this code to
              embed the chatbot on your website.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import Navbar from "@/components/ui/landing/nav";
import { Footer } from "@/components/ui/landing/footer";

export default function FeaturesPage() {
  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden flex flex-col relative z-10">
      <Navbar />
      <div className="mx-auto mt-16 sm:mt-20 max-w-5xl w-full px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        {/* Top banner */}
        <div className="mb-10 rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-500/15 via-amber-500/5 to-transparent px-5 py-4 shadow-lg shadow-amber-500/10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
            Site in active development
          </p>
          <p className="mt-2 text-base text-amber-100/90">
            This site is still under active development. For now, you can read
            about the key features and properties of the{" "}
            <span className="font-semibold text-white">Karmi AI Chatbot</span>{" "}
            below.
          </p>
        </div>

        {/* Heading */}
        <section className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Karmi AI Chatbot
          </h1>
          <p className="max-w-2xl text-base text-zinc-400 md:text-lg">
            An AI-powered customer support chatbot built on Next.js and Google
            Gemini, with retrieval-augmented generation (RAG), knowledge base
            management, and an embeddable widget for your website.
          </p>
        </section>

        {/* Technology & AI model */}
        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-zinc-950/70 p-5">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Technology Stack
            </h2>
            <ul className="mt-3 space-y-1.5 text-base text-zinc-400">
              <li>
                <span className="font-medium text-zinc-100">Framework:</span>{" "}
                Next.js 16.1.1 (App Router) with React 19.2.3
              </li>
              <li>
                <span className="font-medium text-zinc-100">Language:</span>{" "}
                TypeScript
              </li>
              <li>
                <span className="font-medium text-zinc-100">Database:</span>{" "}
                PostgreSQL via Prisma ORM
              </li>
              <li>
                <span className="font-medium text-zinc-100">
                  Authentication:
                </span>{" "}
                Clerk
              </li>
              <li>
                <span className="font-medium text-zinc-100">UI:</span> Shadcn &
                Radix UI components with Tailwind CSS
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-transparent p-5">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-indigo-200">
              AI Model
            </h2>
            <div className="mt-3 space-y-1.5 text-base text-indigo-100/90">
              <p>
                <span className="font-medium text-white">Primary Model:</span>{" "}
                Google Gemini 3 Flash Preview{" "}
                <span className="text-sm text-indigo-200/80">
                  (gemini-3-flash-preview)
                </span>
              </p>
              <p>
                <span className="font-medium text-white">Temperature:</span> 0.7
                for conversational, helpful responses
              </p>
              <p>
                <span className="font-medium text-white">
                  Max Output Tokens:
                </span>{" "}
                1,000 tokens per reply
              </p>
              <p>
                <span className="font-medium text-white">Context Limit:</span>{" "}
                ~6,000 tokens (~24,000 characters)
              </p>
              <p className="mt-2 text-sm text-indigo-100/80">
                Roughly,{" "}
                <span className="font-semibold text-white">4 characters</span> ≈{" "}
                <span className="font-semibold text-white">1 token</span> in
                this app. Models process tokens, not words.
              </p>
            </div>
          </div>
        </section>

        {/* File uploads & sections */}
        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-emerald-200">
              File Uploads & Web Scraping
            </h2>
            <ul className="mt-3 space-y-1.5 text-base text-emerald-100/90">
              <li>
                <span className="font-medium text-white">Max size:</span> 10 MB
                per file
              </li>
              <li>
                <span className="font-medium text-white">
                  Supported formats:
                </span>{" "}
                CSV, TXT, PDF
              </li>
              <li>
                Content is summarized to under{" "}
                <span className="font-semibold text-white">2,000 words</span>{" "}
                for storage in the knowledge base.
              </li>
              <li>
                Web pages are scraped using ZenRows, converted to markdown, then
                passed to Gemini to:
                <ul className="mt-1 list-disc pl-5 text-sm text-emerald-100/80">
                  <li>Remove navigation, menus, CTAs, and ads</li>
                  <li>Keep only factual, informational content</li>
                  <li>Compress aggressively while preserving meaning</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-purple-200">
              Sections & Tone Control
            </h2>
            <p className="mt-3 text-base text-purple-100/90">
              Sections let you configure different behaviors and scopes for your
              chatbot.
            </p>
            <div className="mt-3 grid gap-2 text-sm text-purple-50/90 sm:grid-cols-2">
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5">
                <p className="font-semibold text-white">Tone Options</p>
                <ul className="mt-1.5 space-y-0.5">
                  <li>
                    <span className="font-medium">Strict:</span> fact-based, no
                    small talk
                  </li>
                  <li>
                    <span className="font-medium">Neutral:</span> professional
                    and concise
                  </li>
                  <li>
                    <span className="font-medium">Friendly:</span> warm and
                    conversational
                  </li>
                  <li>
                    <span className="font-medium">Empathetic:</span>{" "}
                    support-first and calming
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5">
                <p className="font-semibold text-white">Scope Rules</p>
                <ul className="mt-1.5 space-y-0.5">
                  <li>
                    <span className="font-medium">Allowed topics:</span>{" "}
                    restrict answers to e.g.{" "}
                    <span className="whitespace-nowrap">
                      “pricing, returns, shipping”
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">Blocked topics:</span> avoid
                    e.g. “competitors, refunds”
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* RAG explanation */}
        <section className="mb-12 rounded-2xl border border-blue-500/25 bg-blue-500/5 p-5">
          <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-blue-200">
            Retrieval-Augmented Generation (RAG)
          </h2>
          <p className="mt-3 text-base text-blue-50/90">
            The chatbot uses{" "}
            <span className="font-semibold text-white">
              Retrieval-Augmented Generation
            </span>{" "}
            to answer questions from your own data.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-50/90">
              <p className="font-semibold text-white">1. Retrieval</p>
              <p className="mt-1.5">
                Fetch relevant knowledge sources from the database: PDFs,
                website content, and text notes.
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-50/90">
              <p className="font-semibold text-white">2. Augmentation</p>
              <p className="mt-1.5">
                Inject that content into the prompt as{" "}
                <span className="font-semibold">context</span> alongside system
                instructions and conversation history.
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-50/90">
              <p className="font-semibold text-white">3. Generation</p>
              <p className="mt-1.5">
                Gemini 3 Flash Preview generates a final answer from the
                augmented context, returning a concise, support-focused reply.
              </p>
            </div>
          </div>
        </section>

        {/* Features & pricing overview */}
        <section className="mb-12 grid gap-6 md:grid-cols-[1.4fr,1fr]">
          <div className="rounded-2xl border border-white/5 bg-zinc-950/70 p-5">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Product Features
            </h2>
            <ul className="mt-3 space-y-1.5 text-base text-zinc-400">
              <li>Knowledge base management (files, URLs, and raw text)</li>
              <li>Conversation history and session tracking</li>
              <li>Embeddable website widget with JWT-based sessions</li>
              <li>Configurable sections, tones, and topic scopes</li>
              <li>Customizable appearance and welcome messages</li>
              <li>Team management and role-based access (via Clerk)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-5">
            <h3 className="text-base font-semibold uppercase tracking-[0.16em] text-teal-200">
              Gemini Pricing Snapshot (2026)
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-teal-50/90">
              <li>
                <span className="font-semibold text-white">Input tokens:</span>{" "}
                ≈ $0.50 per 1M tokens
              </li>
              <li>
                <span className="font-semibold text-white">Output tokens:</span>{" "}
                ≈ $3.00 per 1M tokens
              </li>
              <li>
                <span className="font-semibold text-white">
                  Audio input (if used):
                </span>{" "}
                ≈ $1.00 per 1M tokens
              </li>
            </ul>
            <p className="mt-3 text-sm text-teal-50/80">
              Charges occur when the app calls the Gemini API for chat responses
              and for summarizing new knowledge sources (web pages, long text,
              and files).
            </p>
          </div>
        </section>

        {/* Simple text flow for quick understanding */}
        <section className="mb-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
          <h3 className="text-base font-semibold uppercase tracking-[0.16em] text-zinc-300">
            End-to-End Chat Flow (High Level)
          </h3>
          <pre className="mt-3 overflow-x-auto whitespace-pre text-sm leading-relaxed text-zinc-400">
            {`User Question
   │
   ▼
 [Retrieval]
   │  Fetch knowledge sources (PDFs, websites, text)
   ▼
 [Augmentation]
   │  System Prompt + Context + Conversation History
   ▼
 [Generation]
   │  Gemini 3 Flash Preview
   ▼
 Assistant Answer`}
          </pre>
        </section>
      </div>
      <Footer />
    </main>
  );
}

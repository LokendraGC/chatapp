"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Bot,
  MessageSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Knowledge",
    href: "/dashboard/knowledge",
    icon: BookOpen,
  },
  {
    label: "Sections",
    href: "/dashboard/sections",
    icon: Layers,
  },
  {
    label: "Chatbot",
    href: "/dashboard/chatbot",
    icon: Bot,
  },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  metadata?: {
    business_name?: string;
    website_url?: string;
    external_links?: string;
  } | null;
  email?: string | null;
}

export default function Sidebar({ metadata, email }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#050509] flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2 cursor-pointer">
          {/* Logo Mark */}
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black rounded-[1px]"></div>
          </div>
          <span className="text-sm font-medium tracking-tight text-white/90">
            K Xa Hajur
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/5 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium tracking-tight text-white/90">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Profile / Bottom Area */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 group cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-xs text-zinc-400 group-hover:text-white">
              {metadata?.business_name?.slice(0, 2).toUpperCase() || ".."}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-zinc-300 truncate group-hover:text-white">
              {metadata?.business_name ? `${metadata.business_name}'s Workspace` : "Workspace"}
            </span>
            <span className="text-xs text-zinc-500 truncate">{email || "..."}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Bot,
  MessageSquare,
  Settings,
  HelpCircle,
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
    label: "FAQ",
    href: "/dashboard/faq",
    icon: HelpCircle,
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
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 cursor-pointer">
          {/* Logo Mark - inverts with theme */}
          <div className="w-8 h-8 bg-sidebar-foreground rounded-sm flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-sidebar rounded-[1px]" />
          </div>
          <Link href={'/'} className="text-sm font-medium tracking-tight text-sidebar-foreground">
            Sahayak
          </Link>
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium tracking-tight text-inherit">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

    
    </aside>
  );
}

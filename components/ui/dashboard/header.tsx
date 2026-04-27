"use client";

import * as React from "react";
import { LogOut, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SIDEBAR_ITEMS } from "./sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  metadata?: {
    business_name?: string;
    website_url?: string;
    external_links?: string;
  } | null;
  email?: string | null;
}

export default function DashboardHeader({
  metadata,
  email,
}: DashboardHeaderProps) {
  const { setTheme } = useTheme();
  const { signOut } = useClerk();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="w-full h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 flex md:hidden items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-sidebar-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-sidebar border-sidebar-border text-sidebar-foreground flex flex-col"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access dashboard features</SheetDescription>
            </SheetHeader>
            <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
              <Link
                href={"/"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 bg-sidebar-foreground rounded-sm flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-sidebar rounded-[1px]" />
                </div>
                <span className="text-sm font-medium tracking-tight text-sidebar-foreground">
                  Sahayak
                </span>
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
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
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1 hidden md:block" />
      <div className="flex items-center gap-2">
        <div className="border-r border-sidebar-border pr-4 flex items-center">
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border text-popover-foreground"
              >
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent group cursor-pointer transition-colors text-left">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                  <span className="text-xs text-sidebar-foreground/80 group-hover:text-sidebar-foreground">
                    {metadata?.business_name?.slice(0, 2).toUpperCase() || ".."}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col overflow-hidden max-w-[140px]">
                  <span className="text-sm font-medium text-sidebar-foreground/90 truncate">
                    {metadata?.business_name
                      ? `${metadata.business_name}`
                      : "Workspace"}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="w-56 bg-popover border-border text-popover-foreground"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-popover-foreground truncate">
                  {metadata?.business_name
                    ? `${metadata.business_name}'s Workspace`
                    : "Workspace"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {email || "..."}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => signOut({ redirectUrl: "/" })}
                className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

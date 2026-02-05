"use client";

import * as React from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
    metadata?: { business_name?: string; website_url?: string; external_links?: string } | null;
    email?: string | null;
}

export default function DashboardHeader({ metadata, email }: DashboardHeaderProps) {
    const { setTheme } = useTheme();
    const { signOut } = useClerk();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    return (
        <header className="w-full h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 shrink-0">
            <div className="flex-1" />
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
                            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
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
                                        {metadata?.business_name ? `${metadata.business_name}` : "Workspace"}
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
                                    {metadata?.business_name ? `${metadata.business_name}'s Workspace` : "Workspace"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{email || "..."}</p>
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
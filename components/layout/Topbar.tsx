"use client";

import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div
        className={cn(
          "flex-1 max-w-md flex items-center gap-2 rounded-xl border transition-all px-3 py-2",
          searchFocused
            ? "border-careflow-teal/60 bg-background shadow-sm shadow-careflow-teal/10"
            : "border-input bg-muted/50"
        )}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="search"
          placeholder="Search patients, encounters..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-careflow-teal" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="h-9 w-9 rounded-xl bg-careflow-teal/15 flex items-center justify-center cursor-pointer hover:bg-careflow-teal/25 transition-colors">
            <span className="text-xs font-bold text-careflow-teal">
              {getInitials(user.full_name)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

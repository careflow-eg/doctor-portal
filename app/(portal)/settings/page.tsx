"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getInitials } from "@/lib/utils";
import { Sun, Moon, Monitor, Server, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Settings" subtitle="Profile and portal preferences" />

      {/* Profile */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <User className="h-5 w-5 text-careflow-teal" />
          <h2 className="font-semibold text-foreground">Profile</h2>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-careflow-teal/15 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-careflow-teal">
              {user ? getInitials(user.full_name) : "?"}
            </span>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{user?.full_name ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs bg-careflow-teal/10 text-careflow-teal px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" />
              {user?.role ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-3">Choose your preferred color theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    theme === t.value
                      ? "border-careflow-teal bg-careflow-teal/5 text-careflow-teal"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backend config */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Backend Configuration</h2>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5">
            <span className="text-muted-foreground">API Base URL</span>
            <span className="font-mono text-foreground">
              {process.env.NEXT_PUBLIC_API_URL ?? "not configured"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5">
            <span className="text-muted-foreground">WebSocket URL</span>
            <span className="font-mono text-foreground">
              {process.env.NEXT_PUBLIC_WS_URL ?? "not configured"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

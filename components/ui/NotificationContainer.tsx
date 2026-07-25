"use client";

import { useNotificationStore } from "@/stores/notificationStore";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  error: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
  warning: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
  info: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
};

const iconColorMap = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      <AnimatePresence>
        {notifications.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border-l-4 p-4 shadow-lg backdrop-blur",
                "border border-border bg-card",
                colorMap[n.type]
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColorMap[n.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                {n.message && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

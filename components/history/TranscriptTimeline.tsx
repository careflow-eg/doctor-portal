"use client";

import { TranscriptEntry } from "@/types/dashboard";
import { formatTime } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TranscriptTimelineProps {
  entries: TranscriptEntry[];
}

export function TranscriptTimeline({ entries }: TranscriptTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Waiting for conversation to start...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => {
        const isPatient = entry.role === "patient";
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={cn(
              "flex items-start gap-3",
              isPatient ? "flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                isPatient
                  ? "bg-careflow-blue/10"
                  : "bg-careflow-teal/10"
              )}
            >
              {isPatient ? (
                <User className="h-4 w-4 text-careflow-blue" />
              ) : (
                <Bot className="h-4 w-4 text-careflow-teal" />
              )}
            </div>

            {/* Bubble */}
            <div className={cn("max-w-[75%]", isPatient && "items-end flex flex-col")}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm",
                  isPatient
                    ? "bg-careflow-blue/10 text-foreground rounded-tr-sm"
                    : "bg-careflow-teal/10 text-foreground rounded-tl-sm"
                )}
              >
                {entry.content}
              </div>
              {entry.timestamp && (
                <p className="text-[10px] text-muted-foreground mt-1 px-1">
                  {formatTime(entry.timestamp)}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

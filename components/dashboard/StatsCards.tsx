"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "teal" | "blue" | "purple" | "amber";
}

const colorMap = {
  teal: {
    icon: "bg-careflow-teal/10 text-careflow-teal dark:bg-careflow-teal/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  blue: {
    icon: "bg-careflow-blue/10 text-careflow-blue dark:bg-blue-950/40",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  purple: {
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
};

function StatCard({ card, index }: { card: StatCard; index: number }) {
  const Icon = card.icon;
  const colors = colorMap[card.color ?? "teal"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 border border-border hover:shadow-lg hover:shadow-careflow-teal/5 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">
            {card.value}
          </p>
          {card.subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          )}
          {card.trend && (
            <div className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", colors.badge)}>
              <span>{card.trend.value >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(card.trend.value)}% {card.trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", colors.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  totalPatients: number;
  totalEncounters: number;
  activeEncounters: number;
  pendingHistory: number;
}

export function StatsCards({
  totalPatients,
  totalEncounters,
  activeEncounters,
  pendingHistory,
}: StatsCardsProps) {
  const { Users, ClipboardList, Activity, Clock } = require("lucide-react");

  const cards: StatCard[] = [
    {
      title: "Total Patients",
      value: totalPatients,
      subtitle: "Registered patients",
      icon: Users,
      color: "teal",
    },
    {
      title: "Total Visits",
      value: totalEncounters,
      subtitle: "All time encounters",
      icon: ClipboardList,
      color: "blue",
    },
    {
      title: "Active Encounters",
      value: activeEncounters,
      subtitle: "Currently in progress",
      icon: Activity,
      color: "purple",
    },
    {
      title: "Pending History",
      value: pendingHistory,
      subtitle: "Awaiting collection",
      icon: Clock,
      color: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} card={card} index={i} />
      ))}
    </div>
  );
}

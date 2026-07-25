"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 mt-3 sm:mt-0">{actions}</div>}
    </div>
  );
}

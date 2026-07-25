"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full border-careflow-teal/20 border-t-careflow-teal animate-spin",
          sizeMap[size]
        )}
        style={{ borderTopColor: "var(--careflow-teal)" }}
      />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

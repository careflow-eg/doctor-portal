"use client";

import { WorkflowStep } from "@/types/encounter";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  orientation?: "horizontal" | "vertical";
}

export function WorkflowStepper({
  steps,
  orientation = "horizontal",
}: WorkflowStepperProps) {
  if (orientation === "vertical") {
    return (
      <div className="space-y-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Connector line + icon */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10",
                    step.status === "completed"
                      ? "bg-careflow-teal border-careflow-teal text-white"
                      : step.status === "active"
                      ? "border-careflow-teal bg-careflow-teal/10 text-careflow-teal"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : step.status === "active" ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-careflow-teal animate-pulse" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </motion.div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-10 mt-0.5",
                      step.status === "completed"
                        ? "bg-careflow-teal"
                        : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.status === "completed" || step.status === "active"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal stepper
  return (
    <div className="flex items-center overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={step.id} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring" }}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2 text-xs font-bold",
                  step.status === "completed"
                    ? "bg-careflow-teal border-careflow-teal text-white"
                    : step.status === "active"
                    ? "border-careflow-teal bg-careflow-teal/10 text-careflow-teal"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center max-w-[70px]",
                  step.status === "active" ? "text-careflow-teal" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-12 mx-1 mb-5 shrink-0",
                  step.status === "completed" ? "bg-careflow-teal" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

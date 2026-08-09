"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#021418] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#06171a] border border-slate-200 dark:border-teal-900/40 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Something went wrong!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#06635d] text-white text-sm font-semibold hover:bg-[#044c47] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function EncounterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Encounter Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in h-[calc(100vh-100px)]">
      <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Unable to load encounter data
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
        We encountered an error while rendering this encounter's clinical data. This might be due to a temporary connection issue.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#06635d] text-white text-sm font-semibold hover:bg-[#044c47] transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

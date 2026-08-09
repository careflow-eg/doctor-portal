"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { labService } from "@/services/labService";
import { useNotificationStore } from "@/stores/notificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LabUploadProps {
  encounterId: string;
  onSuccess?: (result: Record<string, unknown>) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function LabUpload({ encounterId, onSuccess }: LabUploadProps) {
  const { addNotification } = useNotificationStore();
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImg = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|tiff|bmp)$/i.test(file.name);
    if (!isPdf && !isImg) {
      addNotification({ type: "error", title: "Invalid file", message: "Only PDF and image files (JPG, PNG, WEBP, TIFF) are supported." });
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      addNotification({ type: "error", title: "File too large", message: "Lab reports must be under 200MB." });
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setProgress(0);

    try {
      const data = await labService.uploadLabReport(encounterId, file, (pct) => setProgress(pct));
      setResult(data);
      setState("success");
      addNotification({ type: "success", title: "Lab report processed!", message: "AI analysis complete." });
      onSuccess?.(data);
    } catch {
      setState("error");
      addNotification({ type: "error", title: "Upload failed", message: "Could not process the lab report." });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <FileText className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-foreground">Lab Report Upload</h3>
        <span className="ml-auto text-xs text-muted-foreground">PDF / Image</span>
      </div>

      <div className="p-5">
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
            dragOver ? "border-careflow-teal bg-careflow-teal/5" : "border-border hover:border-careflow-teal/50 hover:bg-muted/30",
            state === "success" && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10",
            state === "error" && "border-destructive/50 bg-destructive/5"
          )}
          onClick={() => state === "idle" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            {state === "idle" && (
              <>
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drop lab report here or{" "}
                    <span className="text-careflow-teal underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, WEBP up to 200MB</p>
                </div>
              </>
            )}

            {state === "uploading" && (
              <>
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full bg-careflow-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Processing with AI OCR...</p>
                </div>
              </>
            )}

            {state === "success" && (
              <>
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Lab report processed!</p>
                {result && (typeof result.summary === "string") && (
                  <p className="text-xs text-muted-foreground max-w-xs line-clamp-3">{result.summary}</p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setState("idle"); setResult(null); setFileName(""); }}
                  className="text-xs text-careflow-teal hover:underline"
                >
                  Upload another
                </button>
              </>
            )}

            {state === "error" && (
              <>
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Upload failed</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setState("idle"); }}
                  className="text-xs text-careflow-teal hover:underline"
                >
                  Try again
                </button>
              </>
            )}
          </div>
        </div>

        {/* Result display */}
        <AnimatePresence>
          {state === "success" && result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-xl bg-muted/50 p-4 text-sm"
            >
              <p className="font-medium text-foreground mb-2">AI Summary</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

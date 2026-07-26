"use client";

import { useState, useRef } from "react";
import { Upload, ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { radiologyService } from "@/services/radiologyService";
import { useNotificationStore } from "@/stores/notificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RadiologyUploadProps {
  encounterId: string;
  onSuccess?: (result: Record<string, unknown>) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

const MODALITIES = ["X-Ray", "CT", "MRI", "Ultrasound"];

export function RadiologyUpload({ encounterId, onSuccess }: RadiologyUploadProps) {
  const { addNotification } = useNotificationStore();
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isDicom = file.type === "application/dicom" || /\.(dcm|dicom|jpg|jpeg|png|webp|tiff|bmp)$/i.test(file.name);
    if (!isImage && !isDicom) {
      addNotification({ type: "error", title: "Invalid file", message: "Only image files (JPEG, PNG, WEBP, DICOM .dcm) are supported." });
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setProgress(0);

    try {
      const data = await radiologyService.uploadRadiologyImage(encounterId, file, (pct) => setProgress(pct));
      setResult(data);
      setState("success");
      addNotification({ type: "success", title: "Radiology analysis complete!", message: "AI findings generated." });
      onSuccess?.(data);
    } catch {
      setState("error");
      addNotification({ type: "error", title: "Upload failed", message: "Could not analyze the radiology image." });
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
        <ImageIcon className="h-5 w-5 text-purple-500" />
        <h3 className="font-semibold text-foreground">Radiology Upload</h3>
        <div className="ml-auto flex gap-1">
          {MODALITIES.map((m) => (
            <span key={m} className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 rounded px-1.5 py-0.5">
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
            dragOver ? "border-purple-500 bg-purple-500/5" : "border-border hover:border-purple-400/50 hover:bg-muted/30",
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
            accept="image/*,.dcm,.dicom"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            {state === "idle" && (
              <>
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drop radiology image or DICOM here or{" "}
                    <span className="text-purple-500 underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WEBP, DICOM (.dcm) up to 500MB
                  </p>
                </div>
              </>
            )}

            {state === "uploading" && (
              <>
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Analyzing with AI radiology model...</p>
                </div>
              </>
            )}

            {state === "success" && (
              <>
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Radiology analysis complete!</p>
                {result?.findings && (
                  <p className="text-xs text-muted-foreground max-w-xs line-clamp-2">{String(result.findings)}</p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setState("idle"); setResult(null); }}
                  className="text-xs text-careflow-teal hover:underline"
                >
                  Upload another
                </button>
              </>
            )}

            {state === "error" && (
              <>
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Analysis failed</p>
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

        <AnimatePresence>
          {state === "success" && result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-xl bg-muted/50 p-4"
            >
              <p className="font-medium text-foreground mb-2 text-sm">AI Findings</p>
              {Boolean(result.findings) && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Findings</p>
                  <p className="text-sm text-foreground">{String(result.findings)}</p>
                </div>
              )}
              {Boolean(result.impression) && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Impression</p>
                  <p className="text-sm text-foreground">{String(result.impression)}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

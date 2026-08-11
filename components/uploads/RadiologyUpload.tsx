"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { radiologyService } from "@/services/radiologyService";
import { useNotificationStore } from "@/stores/notificationStore";
import { cn } from "@/lib/utils";

interface RadiologyUploadProps {
  encounterId: string;
  onSuccess?: (result: Record<string, unknown>) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function RadiologyUpload({ encounterId, onSuccess }: RadiologyUploadProps) {
  const { addNotification } = useNotificationStore();
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const isImg = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|tiff|bmp|dcm|dicom)$/i.test(file.name);
    if (!isImg) {
      addNotification({ type: "error", title: "Invalid file", message: "Only image files (JPG, PNG, DICOM) are supported." });
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
    } catch (err: unknown) {
      setState("error");
      const msg = (err as Error)?.message || "Could not analyze the radiology image.";
      addNotification({ type: "error", title: "Upload failed", message: msg });
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
        <h2 className="font-semibold text-foreground">Radiology Scan Analysis</h2>
      </div>

      <div className="p-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.dcm,.dicom"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {state === "idle" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
              dragOver
                ? "border-careflow-teal bg-careflow-teal/5"
                : "border-border hover:border-careflow-teal/50 hover:bg-muted/30"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Click to upload scan or drag &amp; drop
            </p>
            <p className="text-xs text-muted-foreground">DICOM, PNG, JPG up to 20MB</p>
          </div>
        )}

        {state === "uploading" && (
          <div className="flex flex-col items-center py-6 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Analyzing scan with MedGemma VLM &amp; MedSAM 2.0...</p>
            </div>
            <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-semibold">
              <CheckCircle className="h-5 w-5" />
              <span>Analysis Complete ({fileName})</span>
            </div>

            {result && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs font-mono text-foreground space-y-2 max-h-48 overflow-y-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}

            <button
              onClick={() => {
                setState("idle");
                setResult(null);
              }}
              className="text-xs text-careflow-teal hover:underline font-medium"
            >
              Upload another scan
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center py-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Analysis Failed</p>
            <button
              onClick={() => setState("idle")}
              className="rounded-xl bg-careflow-teal text-white px-4 py-2 text-xs font-medium hover:bg-careflow-teal-hover transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

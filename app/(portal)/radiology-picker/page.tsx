"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BoundingBoxDrawer, BoundingBox } from "./components/BoundingBoxDrawer";
import { radiologyPickerService, SegmentationResponse } from "@/services/radiologyPickerService";
import { Scan, Activity, Zap, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RadiologyPickerPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [boxes, setBoxes] = useState<BoundingBox[]>([]);
    const [opacity, setOpacity] = useState(50);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<SegmentationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageClear = () => {
        setImageFile(null);
        setBoxes([]);
        setResult(null);
        setError(null);
    };

    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImagePreview(null);
        }
    }, [imageFile]);

    const handleRunSegmentation = async () => {
        if (!imageFile || boxes.length === 0) return;

        try {
            setIsProcessing(true);
            setError(null);
            // Format boxes as expected by API: [[x1, y1, x2, y2], ...]
            const formattedBoxes = boxes.map(b => [b.x1, b.y1, b.x2, b.y2]);

            const res = await radiologyPickerService.segmentImage(
                imageFile,
                formattedBoxes,
                opacity / 100
            );

            if (res.success) {
                setResult(res);
            } else {
                setError(res.message || "Failed to process image");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setBoxes([]);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Radiology Picker"
                subtitle="AI-Powered Medical Image Segmentation"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Editor */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-card rounded-2xl border border-border p-5">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Scan className="h-5 w-5 text-careflow-teal" /> Image Workspace
                        </h2>

                        <BoundingBoxDrawer
                            imageFile={imageFile}
                            onImageSelected={setImageFile}
                            onImageClear={handleImageClear}
                            boxes={boxes}
                            onBoxesChange={setBoxes}
                            overlayImageBase64={result?.overlay_image_base64}
                        />
                    </div>
                </div>

                {/* Right Column: Controls & Results */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl border border-border p-5">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Controls</h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Mask Opacity</label>
                                    <span className="text-sm text-muted-foreground">{opacity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={opacity}
                                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                                    disabled={isProcessing || !!result}
                                    className="w-full accent-careflow-teal"
                                />
                            </div>

                            <div className="pt-2">
                                {!result ? (
                                    <button
                                        onClick={handleRunSegmentation}
                                        disabled={!imageFile || boxes.length === 0 || isProcessing}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all",
                                            !imageFile || boxes.length === 0 || isProcessing
                                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                : "bg-careflow-teal hover:bg-careflow-teal-hover shadow-md active:scale-[0.98]"
                                        )}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Activity className="h-4 w-4 animate-pulse" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-4 w-4" /> Run Segmentation
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReset}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border border-border hover:bg-muted transition-all"
                                    >
                                        <RotateCcw className="h-4 w-4" /> New Segmentation
                                    </button>
                                )}

                                {error && (
                                    <div className="mt-3 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div className="glass-card rounded-2xl border border-border p-5 animate-fade-in">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" /> Results
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Original Image</p>
                                        {imagePreview && (
                                            <div className="relative w-full rounded-lg border border-border/50 bg-muted/30 overflow-hidden flex items-center justify-center p-2" style={{ aspectRatio: "1" }}>
                                                <img
                                                    src={imagePreview}
                                                    alt="Original"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Segmentation</p>
                                        {result.overlay_image_base64 && (
                                            <div className="relative w-full rounded-lg border border-border/50 bg-muted/30 overflow-hidden flex items-center justify-center p-2" style={{ aspectRatio: "1" }}>
                                                <img
                                                    src={`data:image/png;base64,${result.overlay_image_base64}`}
                                                    alt="Segmented"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

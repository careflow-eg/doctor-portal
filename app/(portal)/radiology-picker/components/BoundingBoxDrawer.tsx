"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X, MousePointer2 } from "lucide-react";

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface BoundingBoxDrawerProps {
  imageFile: File | null;
  onImageSelected: (file: File) => void;
  onImageClear: () => void;
  boxes: BoundingBox[];
  onBoxesChange: (boxes: BoundingBox[]) => void;
  overlayImageBase64?: string | null;
}

export function BoundingBoxDrawer({
  imageFile,
  onImageSelected,
  onImageClear,
  boxes,
  onBoxesChange,
  overlayImageBase64,
}: BoundingBoxDrawerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelected(e.target.files[0]);
    }
  };

  const getCoordinates = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Coordinates relative to the container, clamped to its boundaries
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    return { x, y };
  };

  const getScaledCoordinates = (x: number, y: number) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    return {
      x: Math.round(x * scaleX),
      y: Math.round(y * scaleY),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (overlayImageBase64) return; // Prevent drawing if we're showing results
    
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentBox({ x: coords.x, y: coords.y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentBox || overlayImageBase64) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    setCurrentBox((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        w: coords.x - prev.x,
        h: coords.y - prev.y,
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentBox || overlayImageBase64) return;

    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Only add if it's large enough (prevent accidental clicks)
    if (Math.abs(currentBox.w) > 5 && Math.abs(currentBox.h) > 5) {
      // Normalize negative widths/heights
      const startX = currentBox.w < 0 ? currentBox.x + currentBox.w : currentBox.x;
      const startY = currentBox.h < 0 ? currentBox.y + currentBox.h : currentBox.y;
      const width = Math.abs(currentBox.w);
      const height = Math.abs(currentBox.h);

      const scaledStart = getScaledCoordinates(startX, startY);
      const scaledEnd = getScaledCoordinates(startX + width, startY + height);

      onBoxesChange([
        ...boxes,
        {
          x1: scaledStart.x,
          y1: scaledStart.y,
          x2: scaledEnd.x,
          y2: scaledEnd.y,
        },
      ]);
    }
    setCurrentBox(null);
  };

  const getUnscaledBox = (box: BoundingBox) => {
    if (!imgRef.current) return { x: 0, y: 0, w: 0, h: 0 };
    
    const scaleX = imgRef.current.width / imgRef.current.naturalWidth;
    const scaleY = imgRef.current.height / imgRef.current.naturalHeight;
    
    return {
      x: box.x1 * scaleX,
      y: box.y1 * scaleY,
      w: (box.x2 - box.x1) * scaleX,
      h: (box.y2 - box.y1) * scaleY,
    };
  };

  if (!imagePreview) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50">
        <label className="flex cursor-pointer flex-col items-center justify-center space-y-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-careflow-teal/10">
            <Upload className="h-6 w-6 text-careflow-teal" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-border bg-muted/10 p-4">
      {/* Top toolbar */}
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <MousePointer2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {overlayImageBase64 ? "Showing results" : "Draw a bounding box around the area of interest"}
          </span>
        </div>
        <button
          onClick={onImageClear}
          className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="h-4 w-4" /> Clear Image
        </button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className={`relative inline-block overflow-hidden rounded-lg shadow-inner select-none touch-none ${
          !overlayImageBase64 ? "cursor-crosshair" : "cursor-default"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          ref={imgRef}
          src={imagePreview}
          alt="Radiology scan"
          className="max-h-[60vh] max-w-full object-contain pointer-events-none"
          draggable={false}
        />

        {overlayImageBase64 && (
          <img
            src={`data:image/png;base64,${overlayImageBase64}`}
            alt="Segmentation Mask"
            className="absolute left-0 top-0 h-full w-full object-contain opacity-100 pointer-events-none"
          />
        )}

        {/* Drawn Boxes */}
        {!overlayImageBase64 && boxes.map((box, i) => {
          const unscaled = getUnscaledBox(box);
          return (
            <div
              key={i}
              className="absolute border-2 border-careflow-teal bg-careflow-teal/20 pointer-events-none"
              style={{
                left: unscaled.x,
                top: unscaled.y,
                width: unscaled.w,
                height: unscaled.h,
              }}
            />
          );
        })}

        {/* Current Drawing Box */}
        {isDrawing && currentBox && (
          <div
            className="absolute border-2 border-careflow-teal border-dashed bg-careflow-teal/20 pointer-events-none"
            style={{
              left: currentBox.w < 0 ? currentBox.x + currentBox.w : currentBox.x,
              top: currentBox.h < 0 ? currentBox.y + currentBox.h : currentBox.y,
              width: Math.abs(currentBox.w),
              height: Math.abs(currentBox.h),
            }}
          />
        )}
      </div>
      
      {!overlayImageBase64 && boxes.length > 0 && (
        <div className="mt-4 flex w-full justify-between items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm">
          <span>{boxes.length} box(es) drawn</span>
          <button 
            onClick={() => onBoxesChange([])}
            className="text-xs font-semibold hover:underline"
          >
            Clear Boxes
          </button>
        </div>
      )}
    </div>
  );
}

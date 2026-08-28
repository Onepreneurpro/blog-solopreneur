'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IconCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export default function IconCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}: IconCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgElement(img);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Render crop preview canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300; // 300x300 square crop viewport
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Draw background grid pattern
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const imgWidth = imgElement.width;
    const imgHeight = imgElement.height;

    // Base scale to cover 300x300 box
    const baseScale = Math.max(size / imgWidth, size / imgHeight);
    const currentScale = baseScale * zoom;

    const drawWidth = imgWidth * currentScale;
    const drawHeight = imgHeight * currentScale;

    // Center offset + drag position
    const drawX = (size - drawWidth) / 2 + position.x;
    const drawY = (size - drawHeight) / 2 + position.y;

    ctx.drawImage(imgElement, drawX, drawY, drawWidth, drawHeight);
  }, [imgElement, zoom, position]);

  if (!isOpen || !imageSrc) return null;

  // Mouse / Touch drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleConfirmCrop = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `icon-cropped-${Date.now()}.webp`, {
          type: 'image/webp',
        });
        onCropComplete(croppedFile);
        onClose();
      },
      'image/webp',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-base">Recadrer l icône (1:1 Carré)</h3>
            <p className="text-xs text-slate-500 font-medium">Glissez l image et ajustez le zoom pour recadrer l icône.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CROP CANVAS CONTAINER */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-slate-100/70">
          <div
            className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-2xl overflow-hidden border-4 border-purple-600 shadow-xl cursor-grab active:cursor-grabbing bg-white flex items-center justify-center group"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

            {/* OVERLAY GUIDE GRID */}
            <div className="absolute inset-0 pointer-events-none border border-purple-400/30 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-purple-400/20"></div>
              <div className="border-r border-b border-purple-400/20"></div>
              <div className="border-b border-purple-400/20"></div>
              <div className="border-r border-b border-purple-400/20"></div>
              <div className="border-r border-b border-purple-400/20"></div>
              <div className="border-b border-purple-400/20"></div>
              <div className="border-r border-purple-400/20"></div>
              <div className="border-r border-purple-400/20"></div>
              <div></div>
            </div>

            {/* DRAG INSTRUCTION BADGE */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md opacity-70 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Move className="w-3 h-3 text-[#a3e635]" />
              <span>Glissez pour déplacer</span>
            </div>
          </div>

          {/* ZOOM SLIDER & CONTROLS */}
          <div className="w-full space-y-3 px-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-purple-600" /> Zoom : {zoom.toFixed(1)}x
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-purple-700 flex items-center gap-1 font-semibold underline"
              >
                <RotateCcw className="w-3 h-3" /> Réinitialiser
              </button>
            </div>

            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <ZoomIn className="w-4 h-4 text-purple-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-white">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs font-bold">
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmCrop}
            className="bg-purple-700 hover:bg-purple-800 text-white font-heading font-black text-xs rounded-xl shadow-lg gap-1.5"
          >
            <Check className="w-4 h-4 text-[#a3e635]" />
            <span>Valider le recadrage</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    open: boolean;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel, open }) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    }, [isDragging, dragStart]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    const getCroppedImg = () => {
        if (!imgRef.current || !containerRef.current) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const cropSize = 250; // Output size
            canvas.width = cropSize;
            canvas.height = cropSize;

            const containerRect = containerRef.current.getBoundingClientRect();
            const img = imgRef.current;
            const imgRect = img.getBoundingClientRect();

            // Calculation of the mask (the white circle) relative to the viewport
            const maskSize = Math.min(containerRect.width, containerRect.height) * 0.8;
            const maskXViewport = containerRect.left + (containerRect.width - maskSize) / 2;
            const maskYViewport = containerRect.top + (containerRect.height - maskSize) / 2;

            // Scale factor between actual image size and displayed size
            const scaleX = img.naturalWidth / imgRect.width;
            const scaleY = img.naturalHeight / imgRect.height;

            // Calculate source coordinates on the natural image relative to the mask
            const sx = (maskXViewport - imgRect.left) * scaleX;
            const sy = (maskYViewport - imgRect.top) * scaleY;
            const sWidth = maskSize * scaleX;
            const sHeight = maskSize * scaleY;

            ctx.save();
            // Circular crop
            ctx.beginPath();
            ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(
                img,
                sx, sy, sWidth, sHeight,
                0, 0, cropSize, cropSize
            );
            ctx.restore();

            onCropComplete(canvas.toDataURL('image/jpeg', 0.9));
        } catch (error) {
            console.error("Error cropping image:", error);
            alert("Failed to crop image. This usually happens with images from external sources. Please try another image or upload a local file.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crop Your Avatar</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    <div
                        ref={containerRef}
                        className="relative w-full aspect-square max-w-[350px] bg-black rounded-lg overflow-hidden cursor-move touch-none"
                        onMouseDown={handleMouseDown}
                    >
                        {/* The Image */}
                        <img
                            ref={imgRef}
                            src={image}
                            crossOrigin="anonymous"
                            alt="To crop"
                            className="absolute pointer-events-none origin-center transition-transform duration-75 select-none max-w-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                left: '50%',
                                top: '50%',
                                marginTop: '-50%',
                                marginLeft: '-50%',
                            }}
                            onLoad={() => {
                                // Initial center
                                setPosition({ x: 0, y: 0 });
                            }}
                        />

                        {/* The circular overlay (Mask) */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[80%] aspect-square rounded-full border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                        </div>
                    </div>

                    <div className="w-full space-y-4 px-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut className="w-4 h-4 text-muted-foreground" />
                            <Slider
                                value={[zoom]}
                                min={0.5}
                                max={3}
                                step={0.1}
                                onValueChange={([v]) => setZoom(v)}
                            />
                            <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        </div>

                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRotation(r => (r + 90) % 360)}
                                className="gap-2"
                            >
                                <RotateCw className="w-4 h-4" />
                                Rotate
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setZoom(1);
                                    setRotation(0);
                                    setPosition({ x: 0, y: 0 });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button onClick={getCroppedImg}>Apply Crop</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

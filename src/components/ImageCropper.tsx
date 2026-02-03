import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Move, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageOffset {
  left: number;
  top: number;
  width: number;
  height: number;
}

const ImageCropper = ({ imageUrl, onCrop, onCancel }: ImageCropperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [imageOffset, setImageOffset] = useState<ImageOffset>({ left: 0, top: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const updateImageOffset = useCallback(() => {
    if (imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setImageOffset({
        left: imgRect.left - containerRect.left,
        top: imgRect.top - containerRect.top,
        width: imgRect.width,
        height: imgRect.height,
      });
    }
  }, []);

  const resetCropArea = useCallback(() => {
    if (imageRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const padding = 0.1;
      setCropArea({
        x: imgRect.width * padding,
        y: imgRect.height * padding,
        width: imgRect.width * (1 - 2 * padding),
        height: imgRect.height * (1 - 2 * padding),
      });
    }
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      updateImageOffset();
      resetCropArea();
    }
  }, [imageLoaded, updateImageOffset, resetCropArea]);

  // Update offset on window resize
  useEffect(() => {
    window.addEventListener('resize', updateImageOffset);
    return () => window.removeEventListener('resize', updateImageOffset);
  }, [updateImageOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (action === 'move') {
      setIsDragging(true);
    } else {
      setIsResizing(action);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    setCropArea(prev => {
      let { x, y, width, height } = prev;
      const imgWidth = imageOffset.width;
      const imgHeight = imageOffset.height;

      if (isDragging) {
        x = Math.max(0, Math.min(imgWidth - width, x + dx));
        y = Math.max(0, Math.min(imgHeight - height, y + dy));
      } else if (isResizing) {
        if (isResizing.includes('e')) {
          width = Math.max(50, Math.min(imgWidth - x, width + dx));
        }
        if (isResizing.includes('w')) {
          const newWidth = Math.max(50, width - dx);
          const newX = x + (width - newWidth);
          if (newX >= 0) {
            width = newWidth;
            x = newX;
          }
        }
        if (isResizing.includes('s')) {
          height = Math.max(50, Math.min(imgHeight - y, height + dy));
        }
        if (isResizing.includes('n')) {
          const newHeight = Math.max(50, height - dy);
          const newY = y + (height - newHeight);
          if (newY >= 0) {
            height = newHeight;
            y = newY;
          }
        }
      }

      return { x, y, width, height };
    });
  }, [isDragging, isResizing, dragStart, imageOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  const handleCrop = useCallback(() => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scale between displayed image and natural image size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Set canvas to cropped dimensions at natural resolution
    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    // Draw cropped portion
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/png');
  }, [cropArea, onCrop]);

  // Calculate absolute positions for crop area overlay
  const cropAbsoluteLeft = imageOffset.left + cropArea.x;
  const cropAbsoluteTop = imageOffset.top + cropArea.y;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="glass-card p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg font-display font-semibold">Crop Image</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={resetCropArea} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xs:inline">Reset</span>
            </button>
            <button onClick={onCancel} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
              <X className="w-4 h-4" />
              <span className="hidden xs:inline">Cancel</span>
            </button>
            <button onClick={handleCrop} className="btn-primary px-3 py-2 text-sm flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
              <Check className="w-4 h-4" />
              <span className="hidden xs:inline">Apply</span>
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative flex-1 overflow-hidden flex items-center justify-center bg-muted/30 rounded-xl"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-[60vh] object-contain"
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />

          {imageLoaded && imageOffset.width > 0 && (
            <>
              {/* Dark overlay with hole for crop area */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(to right, 
                      rgba(0,0,0,0.6) ${cropAbsoluteLeft}px, 
                      transparent ${cropAbsoluteLeft}px, 
                      transparent ${cropAbsoluteLeft + cropArea.width}px, 
                      rgba(0,0,0,0.6) ${cropAbsoluteLeft + cropArea.width}px
                    ),
                    linear-gradient(to bottom, 
                      rgba(0,0,0,0.6) ${cropAbsoluteTop}px, 
                      transparent ${cropAbsoluteTop}px, 
                      transparent ${cropAbsoluteTop + cropArea.height}px, 
                      rgba(0,0,0,0.6) ${cropAbsoluteTop + cropArea.height}px
                    )
                  `,
                  backgroundBlendMode: 'multiply'
                }}
              />
              
              {/* Simpler overlay using 4 rectangles */}
              <div className="absolute pointer-events-none bg-black/60" style={{ 
                left: 0, top: 0, 
                width: '100%', 
                height: cropAbsoluteTop 
              }} />
              <div className="absolute pointer-events-none bg-black/60" style={{ 
                left: 0, 
                top: cropAbsoluteTop + cropArea.height, 
                width: '100%', 
                bottom: 0 
              }} />
              <div className="absolute pointer-events-none bg-black/60" style={{ 
                left: 0, 
                top: cropAbsoluteTop, 
                width: cropAbsoluteLeft, 
                height: cropArea.height 
              }} />
              <div className="absolute pointer-events-none bg-black/60" style={{ 
                left: cropAbsoluteLeft + cropArea.width, 
                top: cropAbsoluteTop, 
                right: 0, 
                height: cropArea.height 
              }} />

              {/* Crop area border */}
              <div
                className="absolute border-2 border-primary cursor-move"
                style={{
                  left: cropAbsoluteLeft,
                  top: cropAbsoluteTop,
                  width: cropArea.width,
                  height: cropArea.height,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Move indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Move className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary/40" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary/40" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/40" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/40" />
                </div>

                {/* Resize handles */}
                {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((dir) => (
                  <div
                    key={dir}
                    className={`absolute w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground ${
                      dir.includes('n') ? '-top-2' : dir.includes('s') ? '-bottom-2' : 'top-1/2 -translate-y-1/2'
                    } ${
                      dir.includes('e') ? '-right-2' : dir.includes('w') ? '-left-2' : 'left-1/2 -translate-x-1/2'
                    }`}
                    style={{ cursor: `${dir}-resize` }}
                    onMouseDown={(e) => handleMouseDown(e, dir)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Drag to move, use handles to resize
        </p>
      </div>
    </motion.div>
  );
};

export default ImageCropper;

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Move } from 'lucide-react';

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

const ImageCropper = ({ imageUrl, onCrop, onCancel }: ImageCropperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded && imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Center crop area initially (80% of image)
      const padding = 0.1;
      setCropArea({
        x: imgRect.width * padding,
        y: imgRect.height * padding,
        width: imgRect.width * (1 - 2 * padding),
        height: imgRect.height * (1 - 2 * padding),
      });
    }
  }, [imageLoaded]);

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
    if (!imageRef.current) return;

    const imgRect = imageRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setDragStart({ x: e.clientX, y: e.clientY });

    setCropArea(prev => {
      let { x, y, width, height } = prev;

      if (isDragging) {
        x = Math.max(0, Math.min(imgRect.width - width, x + dx));
        y = Math.max(0, Math.min(imgRect.height - height, y + dy));
      } else if (isResizing) {
        if (isResizing.includes('e')) {
          width = Math.max(50, Math.min(imgRect.width - x, width + dx));
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
          height = Math.max(50, Math.min(imgRect.height - y, height + dy));
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
  }, [isDragging, isResizing, dragStart]);

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
      <div className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold">Crop Image</h3>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="btn-secondary px-4 py-2 flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button onClick={handleCrop} className="btn-primary px-4 py-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Apply Crop
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

          {imageLoaded && (
            <>
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-background/60 pointer-events-none"
                style={{
                  clipPath: `polygon(
                    0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                    ${cropArea.x}px ${cropArea.y}px,
                    ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                    ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                    ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                    ${cropArea.x}px ${cropArea.y}px
                  )`
                }}
              />

              {/* Crop area */}
              <div
                className="absolute border-2 border-primary cursor-move"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
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

                {/* Resize handles */}
                {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((dir) => (
                  <div
                    key={dir}
                    className={`absolute w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground ${
                      dir.includes('n') ? '-top-2' : dir.includes('s') ? '-bottom-2' : 'top-1/2 -translate-y-1/2'
                    } ${
                      dir.includes('e') ? '-right-2' : dir.includes('w') ? '-left-2' : 'left-1/2 -translate-x-1/2'
                    } cursor-${dir}-resize`}
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

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ComparisonSliderProps {
  originalUrl: string;
  processedUrl: string;
  className?: string;
}

const ComparisonSlider = ({ originalUrl, processedUrl, className = '' }: ComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging.current) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl glass-card select-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Original Image (Background) */}
      <img
        src={originalUrl}
        alt="Original"
        className="w-full h-full object-contain"
        draggable={false}
      />
      
      {/* Processed Image (Overlay with clip) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={processedUrl}
          alt="Processed"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
      
      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-10"
        style={{ 
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          background: 'var(--gradient-primary)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-white/80 rounded-full" />
            <div className="w-0.5 h-4 bg-white/80 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-foreground/80 text-background text-xs font-medium">
        Original
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-foreground/80 text-background text-xs font-medium">
        Sketch
      </div>
    </motion.div>
  );
};

export default ComparisonSlider;

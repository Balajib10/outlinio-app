import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  processImage, 
  resizeImage,
  ProcessingSettings,
  defaultSettings,
} from '@/lib/sketchProcessing';
import {
  ExportFormat,
  createTransparentVersion,
  createA4PrintLayout,
  createColoringBookExport,
  createBWPrintExport,
  downloadCanvas,
} from '@/lib/exportUtils';

export interface UseImageProcessingReturn {
  originalImage: HTMLImageElement | null;
  processedImageUrl: string | null;
  isProcessing: boolean;
  settings: ProcessingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProcessingSettings>>;
  loadImage: (file: File) => Promise<void>;
  loadImageFromUrl: (url: string) => Promise<void>;
  loadImageFromBlob: (blob: Blob) => Promise<void>;
  processCurrentImage: () => void;
  rotateImage: (degrees: number) => void;
  exportImage: (format: ExportFormat) => void;
  reset: () => void;
  originalCanvasRef: React.RefObject<HTMLCanvasElement>;
  processedCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export function useImageProcessing(): UseImageProcessingReturn {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ProcessingSettings>(defaultSettings);
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const processCurrentImage = useCallback(() => {
    if (!originalImage || !originalCanvasRef.current || !processedCanvasRef.current) return;
    
    setIsProcessing(true);
    
    // Use requestAnimationFrame to allow UI to update
    requestAnimationFrame(() => {
      try {
        const { width, height } = resizeImage(originalImage);
        
        // Set up original canvas
        const origCanvas = originalCanvasRef.current!;
        origCanvas.width = width;
        origCanvas.height = height;
        const origCtx = origCanvas.getContext('2d', { willReadFrequently: true });
        if (!origCtx) return;
        origCtx.drawImage(originalImage, 0, 0, width, height);
        
        // Process and draw to processed canvas
        const processedCanvas = processedCanvasRef.current!;
        processedCanvas.width = width;
        processedCanvas.height = height;
        const processedCtx = processedCanvas.getContext('2d');
        if (!processedCtx) return;
        
        // First draw original to processed canvas for processing
        processedCtx.drawImage(originalImage, 0, 0, width, height);
        
        // Create temp canvas for processing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) return;
        tempCtx.drawImage(originalImage, 0, 0, width, height);
        
        // Process the image
        const processedData = processImage(tempCanvas, settings);
        processedCtx.putImageData(processedData, 0, 0);
        
        // Update preview URL
        setProcessedImageUrl(processedCanvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsProcessing(false);
      }
    });
  }, [originalImage, settings]);
  
  // Auto-process when settings change
  useEffect(() => {
    if (originalImage) {
      const debounce = setTimeout(() => {
        processCurrentImage();
      }, 100);
      return () => clearTimeout(debounce);
    }
  }, [settings, originalImage, processCurrentImage]);
  
  const loadImage = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          resolve();
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);
  
  const loadImageFromUrl = useCallback(async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setOriginalImage(img);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  const loadImageFromBlob = useCallback(async (blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }, []);

  const rotateImage = useCallback((degrees: number) => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Swap dimensions for 90/270 degree rotations
    const isVerticalRotation = Math.abs(degrees) === 90 || Math.abs(degrees) === 270;
    canvas.width = isVerticalRotation ? originalImage.height : originalImage.width;
    canvas.height = isVerticalRotation ? originalImage.width : originalImage.height;

    // Move to center, rotate, then draw
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(
      originalImage, 
      -originalImage.width / 2, 
      -originalImage.height / 2
    );

    // Create new image from rotated canvas
    const rotatedUrl = canvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => {
      setOriginalImage(newImg);
    };
    newImg.src = rotatedUrl;
  }, [originalImage]);
  
  const exportImage = useCallback(async (format: ExportFormat) => {
    if (!processedCanvasRef.current) return;
    
    const canvas = processedCanvasRef.current;
    
    try {
      switch (format) {
        case 'png':
          await downloadCanvas(canvas, 'outlinio-sketch.png', 'png');
          break;
          
        case 'jpg':
          await downloadCanvas(canvas, 'outlinio-sketch.jpg', 'jpeg', 0.95);
          break;
          
        case 'transparent': {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const transparentData = createTransparentVersion(imageData);
          
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) return;
          tempCtx.putImageData(transparentData, 0, 0);
          
          await downloadCanvas(tempCanvas, 'outlinio-sketch-transparent.png', 'png');
          break;
        }
          
        case 'print-a4': {
          const a4Canvas = createA4PrintLayout(canvas);
          await downloadCanvas(a4Canvas, 'outlinio-sketch-a4.png', 'png');
          break;
        }
          
        case 'coloring-book': {
          const coloringCanvas = createColoringBookExport(canvas);
          await downloadCanvas(coloringCanvas, 'outlinio-coloring-page.png', 'png');
          break;
        }
          
        case 'bw-print': {
          const bwCanvas = createBWPrintExport(canvas);
          await downloadCanvas(bwCanvas, 'outlinio-bw-print.png', 'png');
          break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);
  
  const reset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImageUrl(null);
    setSettings(defaultSettings);
  }, []);
  
  return {
    originalImage,
    processedImageUrl,
    isProcessing,
    settings,
    setSettings,
    loadImage,
    loadImageFromUrl,
    loadImageFromBlob,
    processCurrentImage,
    rotateImage,
    exportImage,
    reset,
    originalCanvasRef,
    processedCanvasRef,
  };
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  processImage, 
  createTransparentVersion, 
  resizeImage,
  ProcessingSettings,
  defaultSettings,
  SketchMode 
} from '@/lib/sketchProcessing';

export interface UseImageProcessingReturn {
  originalImage: HTMLImageElement | null;
  processedImageUrl: string | null;
  isProcessing: boolean;
  settings: ProcessingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProcessingSettings>>;
  loadImage: (file: File) => Promise<void>;
  loadImageFromUrl: (url: string) => Promise<void>;
  processCurrentImage: () => void;
  exportImage: (format: 'png' | 'jpg' | 'transparent') => void;
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
  
  const exportImage = useCallback((format: 'png' | 'jpg' | 'transparent') => {
    if (!processedCanvasRef.current) return;
    
    const canvas = processedCanvasRef.current;
    let dataUrl: string;
    let filename: string;
    
    if (format === 'transparent') {
      // Create transparent version
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
      
      dataUrl = tempCanvas.toDataURL('image/png');
      filename = 'outlinio-sketch-transparent.png';
    } else if (format === 'jpg') {
      dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      filename = 'outlinio-sketch.jpg';
    } else {
      dataUrl = canvas.toDataURL('image/png');
      filename = 'outlinio-sketch.png';
    }
    
    // Trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
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
    processCurrentImage,
    exportImage,
    reset,
    originalCanvasRef,
    processedCanvasRef,
  };
}

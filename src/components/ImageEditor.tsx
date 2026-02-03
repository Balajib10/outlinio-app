import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Sun, Contrast } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';
import ControlSlider from './ControlSlider';
import SketchModeSelector from './SketchModeSelector';
import ExportMenu from './ExportMenu';
import PreProcessingTools from './PreProcessingTools';
import ImageCropper from './ImageCropper';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { ProcessingSettings } from '@/lib/sketchProcessing';

interface ImageEditorProps {
  imageFile: File;
  onBack: () => void;
}

const ImageEditor = ({ imageFile, onBack }: ImageEditorProps) => {
  const {
    originalImage,
    processedImageUrl,
    isProcessing,
    settings,
    setSettings,
    loadImage,
    loadImageFromBlob,
    rotateImage,
    exportImage,
    originalCanvasRef,
    processedCanvasRef,
  } = useImageProcessing();

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null); // Store the original uploaded file URL
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    loadImage(imageFile);
    const url = URL.createObjectURL(imageFile);
    setOriginalUrl(url);
    setUploadedFileUrl(url); // Keep reference to the truly original image
    return () => URL.revokeObjectURL(url);
  }, [imageFile, loadImage]);

  // Update original URL when image changes (after rotate/crop)
  useEffect(() => {
    if (originalImage) {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(originalImage, 0, 0);
        setOriginalUrl(canvas.toDataURL('image/png'));
      }
    }
  }, [originalImage]);

  const updateSetting = <K extends keyof ProcessingSettings>(
    key: K,
    value: ProcessingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCrop = useCallback(async (croppedBlob: Blob | null) => {
    if (croppedBlob) {
      await loadImageFromBlob(croppedBlob);
    }
    setShowCropper(false);
  }, [loadImageFromBlob]);

  const handleResetToOriginal = useCallback(async () => {
    // Reset to the original uploaded image
    if (uploadedFileUrl) {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              await loadImageFromBlob(blob);
            }
          }, 'image/png');
        }
      };
      img.src = uploadedFileUrl;
    }
  }, [uploadedFileUrl, loadImageFromBlob]);

  const handleRotate = useCallback((degrees: number) => {
    rotateImage(degrees);
  }, [rotateImage]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>New Image</span>
          </button>
          
          <button
            onClick={() => setSettings(prev => ({ ...prev }))}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Adjustments
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            {originalUrl && processedImageUrl ? (
              <ComparisonSlider
                originalUrl={originalUrl}
                processedUrl={processedImageUrl}
                className="aspect-video w-full"
              />
            ) : (
              <div className="aspect-video w-full glass-card flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-muted-foreground">Processing...</p>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                Updating preview...
              </motion.div>
            )}
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Pre-processing Tools */}
            <div className="glass-card p-5">
              <PreProcessingTools
                onCrop={() => setShowCropper(true)}
                onRotate={handleRotate}
                disabled={isProcessing || !originalImage}
              />
            </div>

            {/* Sketch Mode Selector */}
            <div className="glass-card p-5">
              <SketchModeSelector
                mode={settings.mode}
                onChange={(mode) => updateSetting('mode', mode)}
              />
            </div>

            {/* Adjustments */}
            <div className="glass-card p-5 space-y-5">
              <h3 className="text-sm font-semibold">Adjustments</h3>
              
              <ControlSlider
                label="Line Thickness"
                value={settings.lineThickness}
                min={1}
                max={5}
                onChange={(v) => updateSetting('lineThickness', v)}
              />
              
              <ControlSlider
                label="Edge Intensity"
                value={settings.edgeIntensity}
                min={10}
                max={100}
                onChange={(v) => updateSetting('edgeIntensity', v)}
              />
              
              <ControlSlider
                label="Contrast"
                value={settings.contrast}
                min={0}
                max={100}
                onChange={(v) => updateSetting('contrast', v)}
                icon={<Contrast className="w-4 h-4" />}
              />
              
              <ControlSlider
                label="Noise Reduction"
                value={settings.noiseReduction}
                min={0}
                max={100}
                onChange={(v) => updateSetting('noiseReduction', v)}
              />
              
              <ControlSlider
                label="Smoothing"
                value={settings.smoothing}
                min={0}
                max={100}
                onChange={(v) => updateSetting('smoothing', v)}
              />
              
              <ControlSlider
                label="Brightness"
                value={settings.brightness}
                min={0}
                max={100}
                onChange={(v) => updateSetting('brightness', v)}
                icon={<Sun className="w-4 h-4" />}
              />
            </div>

            {/* Export */}
            <div className="glass-card p-5">
              <ExportMenu
                onExport={exportImage}
                disabled={!processedImageUrl || isProcessing}
              />
            </div>
          </motion.div>
        </div>

        {/* Hidden Canvases for Processing - use visibility instead of display:none to preserve dimensions */}
        <canvas ref={originalCanvasRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
        <canvas ref={processedCanvasRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropper && originalUrl && uploadedFileUrl && (
          <ImageCropper
            imageUrl={originalUrl}
            originalImageUrl={uploadedFileUrl}
            onCrop={handleCrop}
            onCancel={() => setShowCropper(false)}
            onResetToOriginal={handleResetToOriginal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageEditor;

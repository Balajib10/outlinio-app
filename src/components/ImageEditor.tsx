import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Sun, Contrast } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';
import ControlSlider from './ControlSlider';
import SketchModeSelector from './SketchModeSelector';
import ExportMenu from './ExportMenu';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { ProcessingSettings, SketchMode } from '@/lib/sketchProcessing';

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
    exportImage,
    originalCanvasRef,
    processedCanvasRef,
  } = useImageProcessing();

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    loadImage(imageFile);
    const url = URL.createObjectURL(imageFile);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, loadImage]);

  const updateSetting = <K extends keyof ProcessingSettings>(
    key: K,
    value: ProcessingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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

        {/* Hidden Canvases for Processing */}
        <canvas ref={originalCanvasRef} className="hidden" />
        <canvas ref={processedCanvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageEditor;

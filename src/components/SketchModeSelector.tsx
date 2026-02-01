import { motion } from 'framer-motion';
import { SketchMode } from '@/lib/sketchProcessing';
import { Pencil, PenTool, Minus, BookOpen } from 'lucide-react';

interface SketchModeSelectorProps {
  mode: SketchMode;
  onChange: (mode: SketchMode) => void;
}

const modes: { id: SketchMode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'pencil', label: 'Pencil Sketch', icon: <Pencil className="w-5 h-5" />, description: 'Soft, artistic lines' },
  { id: 'ink', label: 'Ink Outline', icon: <PenTool className="w-5 h-5" />, description: 'Bold, clean edges' },
  { id: 'lineart', label: 'Line Art', icon: <Minus className="w-5 h-5" />, description: 'Minimal, clean strokes' },
  { id: 'coloring', label: 'Coloring Page', icon: <BookOpen className="w-5 h-5" />, description: 'Thick outlines, print-ready' },
];

const SketchModeSelector = ({ mode, onChange }: SketchModeSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Sketch Style</h3>
      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => (
          <motion.button
            key={m.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(m.id)}
            className={`p-3 rounded-xl text-left transition-all duration-200 ${
              mode === m.id
                ? 'glass-card gradient-border bg-primary/5'
                : 'bg-secondary/50 hover:bg-secondary border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={mode === m.id ? 'text-primary' : 'text-muted-foreground'}>
                {m.icon}
              </span>
              <span className={`text-sm font-medium ${mode === m.id ? 'text-primary' : ''}`}>
                {m.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-7">
              {m.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SketchModeSelector;

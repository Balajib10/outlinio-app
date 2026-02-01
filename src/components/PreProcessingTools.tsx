import { motion } from 'framer-motion';
import { Crop, RotateCw, RotateCcw } from 'lucide-react';

interface PreProcessingToolsProps {
  onCrop: () => void;
  onRotate: (degrees: number) => void;
  disabled?: boolean;
}

const PreProcessingTools = ({ onCrop, onRotate, disabled }: PreProcessingToolsProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Pre-processing</h3>
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCrop}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Crop className="w-4 h-4" />
          Crop
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onRotate(-90)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Rotate Left
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onRotate(90)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RotateCw className="w-4 h-4" />
          Rotate Right
        </motion.button>
      </div>
    </div>
  );
};

export default PreProcessingTools;

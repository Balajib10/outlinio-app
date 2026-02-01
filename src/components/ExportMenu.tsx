import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, Image, FileImage, Layers } from 'lucide-react';

interface ExportMenuProps {
  onExport: (format: 'png' | 'jpg' | 'transparent') => void;
  disabled?: boolean;
}

const ExportMenu = ({ onExport, disabled }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: 'png', label: 'PNG', description: 'Lossless quality', icon: <Image className="w-4 h-4" /> },
    { id: 'jpg', label: 'JPG', description: 'Smaller file size', icon: <FileImage className="w-4 h-4" /> },
    { id: 'transparent', label: 'Transparent PNG', description: 'Lines only, no background', icon: <Layers className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="btn-primary flex items-center gap-2 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-5 h-5" />
        Download Sketch
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 glass-card p-2 space-y-1"
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onExport(option.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <span className="text-primary">{option.icon}</span>
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;

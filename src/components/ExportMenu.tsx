import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, Image, FileImage, Layers, Printer, BookOpen, FileText, Loader2 } from 'lucide-react';

export type ExportFormat = 'png' | 'jpg' | 'transparent' | 'print-a4' | 'coloring-book' | 'bw-print';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  disabled?: boolean;
}

const ExportMenu = ({ onExport, disabled }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const options = [
    { id: 'png' as const, label: 'PNG', description: 'Lossless quality', icon: <Image className="w-4 h-4" /> },
    { id: 'jpg' as const, label: 'JPG', description: 'Smaller file size', icon: <FileImage className="w-4 h-4" /> },
    { id: 'transparent' as const, label: 'Transparent PNG', description: 'Lines only, no background', icon: <Layers className="w-4 h-4" /> },
    { id: 'print-a4' as const, label: 'A4 Print Layout', description: 'Ready for A4 paper printing', icon: <Printer className="w-4 h-4" /> },
    { id: 'coloring-book' as const, label: 'Coloring Book', description: 'Optimized for coloring pages', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'bw-print' as const, label: 'B&W Print', description: 'High contrast black & white', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setIsOpen(false);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className="btn-primary flex items-center gap-2 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {isExporting ? 'Downloading...' : 'Download Sketch'}
        {!isExporting && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && !isExporting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 glass-card p-2 space-y-1 max-h-80 overflow-y-auto z-50"
          >
            <div className="text-xs text-muted-foreground px-3 py-1 font-medium">Standard Formats</div>
            {options.slice(0, 3).map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <span className="text-primary">{option.icon}</span>
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
            
            <div className="text-xs text-muted-foreground px-3 py-1 font-medium mt-2">Print-Ready Formats</div>
            {options.slice(3).map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
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

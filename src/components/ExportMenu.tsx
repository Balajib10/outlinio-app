import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown, Image, FileImage, Layers, Printer, BookOpen, FileText, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ExportFormat = 'png' | 'jpg' | 'transparent' | 'print-a4' | 'coloring-book' | 'bw-print';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  disabled?: boolean;
}

const ExportMenu = ({ onExport, disabled }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const options = useMemo(
    () => [
      { id: 'png' as const, label: 'PNG', description: 'Lossless quality', icon: <Image className="w-4 h-4" /> },
      { id: 'jpg' as const, label: 'JPG', description: 'Smaller file size', icon: <FileImage className="w-4 h-4" /> },
      { id: 'transparent' as const, label: 'Transparent PNG', description: 'Lines only, no background', icon: <Layers className="w-4 h-4" /> },
      { id: 'print-a4' as const, label: 'A4 Print Layout', description: 'Ready for A4 paper printing', icon: <Printer className="w-4 h-4" /> },
      { id: 'coloring-book' as const, label: 'Coloring Book', description: 'Optimized for coloring pages', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'bw-print' as const, label: 'B&W Print', description: 'High contrast black & white', icon: <FileText className="w-4 h-4" /> },
    ],
    []
  );

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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild disabled={disabled || isExporting}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={disabled || isExporting}
          className="btn-primary flex items-center gap-2 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isExporting ? 'Downloading...' : 'Download Sketch'}
          {!isExporting && (
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </motion.button>
      </DropdownMenuTrigger>

      {/* Portaled content (won't be clipped by parent overflow on mobile) */}
      <DropdownMenuContent
        align="center"
        sideOffset={8}
        className="z-[200] w-[min(22rem,calc(100vw-2rem))] max-h-[min(24rem,calc(100dvh-10rem))] overflow-y-auto border-border/70 bg-popover/90 backdrop-blur-xl shadow-lg"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Standard Formats</DropdownMenuLabel>

        {options.slice(0, 3).map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => handleExport(option.id)}
            className="gap-3 rounded-lg px-3 py-2.5"
          >
            <span className="text-primary">{option.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-5">{option.label}</p>
              <p className="text-xs text-muted-foreground truncate">{option.description}</p>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Print-Ready Formats</DropdownMenuLabel>

        {options.slice(3).map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => handleExport(option.id)}
            className="gap-3 rounded-lg px-3 py-2.5"
          >
            <span className="text-primary">{option.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-5">{option.label}</p>
              <p className="text-xs text-muted-foreground truncate">{option.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;

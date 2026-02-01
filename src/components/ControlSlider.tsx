import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface ControlSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}

const ControlSlider = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  step = 1,
  onChange,
  icon 
}: ControlSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
};

export default ControlSlider;

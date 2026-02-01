import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Upload, Sliders, Palette, Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: 'Upload Your Image',
    description: 'Drag & drop, paste from clipboard, or take a photo. We support JPG and PNG files up to 20MB.',
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: 'Choose Your Style',
    description: 'Select from Pencil Sketch, Ink Outline, Line Art, or Coloring Page mode for different effects.',
  },
  {
    icon: <Sliders className="w-8 h-8" />,
    title: 'Fine-tune Settings',
    description: 'Adjust line thickness, edge intensity, contrast, and more. See changes in real-time.',
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: 'Download & Share',
    description: 'Export as PNG, JPG, or transparent PNG. Print-ready quality for all your creative projects.',
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              How <span className="gradient-text">OUTLINIO</span> Works
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your photos into sketches in four simple steps. 
              No technical skills required.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground relative"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                </div>
                
                <div className="glass-card p-6 flex-1">
                  <h3 className="text-xl font-display font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link to="/" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Try It Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;

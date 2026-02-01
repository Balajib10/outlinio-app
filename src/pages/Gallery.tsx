import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Pencil, PenTool, Minus, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const examples = [
  {
    mode: 'Pencil Sketch',
    icon: <Pencil className="w-5 h-5" />,
    description: 'Soft, artistic pencil lines with natural shading',
  },
  {
    mode: 'Ink Outline',
    icon: <PenTool className="w-5 h-5" />,
    description: 'Bold, clean ink-style edges',
  },
  {
    mode: 'Line Art',
    icon: <Minus className="w-5 h-5" />,
    description: 'Minimal, clean vector-like strokes',
  },
  {
    mode: 'Coloring Page',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Thick outlines perfect for coloring',
  },
];

const Gallery = () => {
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
              Sketch Style <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore the different sketch styles available in OUTLINIO. 
              Each mode creates a unique artistic effect.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {examples.map((example, index) => (
              <motion.div
                key={example.mode}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover overflow-hidden"
              >
                <div className="aspect-video bg-muted/30 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary scale-150">{example.icon}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload an image to see this style
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary">{example.icon}</span>
                    <h3 className="font-display font-semibold">{example.mode}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
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
            <p className="text-muted-foreground mb-4">
              Ready to create your own sketches?
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
              Try All Styles Free
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;

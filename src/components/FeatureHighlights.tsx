import { motion } from 'framer-motion';
import { Zap, Lock, Cloud, Palette, Download, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Processing',
    description: 'Convert images to sketches in seconds with real-time previews.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: '100% Private',
    description: 'All processing happens in your browser. No images are ever uploaded.',
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Works Offline',
    description: 'Once loaded, the app works without an internet connection.',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: '4 Sketch Styles',
    description: 'Pencil, Ink, Line Art, and Coloring Page modes available.',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Multiple Exports',
    description: 'Download as PNG, JPG, or transparent background for print.',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Forever Free',
    description: 'No subscriptions, no hidden fees. Completely free to use.',
  },
];

const FeatureHighlights = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Why Choose <span className="gradient-text">OUTLINIO</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A professional-grade sketch converter that respects your privacy and works instantly.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-primary">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;

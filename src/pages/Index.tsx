import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UploadCard from '@/components/UploadCard';
import ImageEditor from '@/components/ImageEditor';
import FeatureHighlights from '@/components/FeatureHighlights';
import { Pencil, Sparkles } from 'lucide-react';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setSelectedFile(file);
    setIsLoading(false);
  };

  const handleBack = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    const handler = () => setSelectedFile(null);
    window.addEventListener('outlinio-go-home', handler);
    return () => window.removeEventListener('outlinio-go-home', handler);
  }, []);

  if (selectedFile) {
    return (
      <>
        <Header />
        <ImageEditor imageFile={selectedFile} onBack={handleBack} />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              100% Free • Works Offline • No Sign-up
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Turn Photos Into{' '}
              <span className="gradient-text">Clean Sketches</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your photos into beautiful pencil sketches, ink outlines, and coloring pages instantly. 
              All processing happens in your browser – completely private.
            </p>
          </motion.div>

          {/* Upload Card */}
          <UploadCard onImageSelect={handleImageSelect} isLoading={isLoading} />
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              See the Magic in Action
            </h2>
            <p className="text-muted-foreground">
              Drag the slider to compare original vs sketch
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto glass-card p-4"
          >
            <div className="aspect-video bg-muted/50 rounded-xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Pencil className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Upload an image above to see the comparison
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <FeatureHighlights />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-hover p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Ready to Create Your Sketch?
            </h2>
            <p className="text-muted-foreground mb-6">
              No sign-up required. Just upload an image and start creating.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started Free
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

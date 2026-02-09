import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Wifi, Heart, Globe, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: '100% Private',
    description: 'Your images never leave your device. All processing happens locally in your browser using advanced image algorithms.',
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: 'Works Offline',
    description: 'Once the page loads, you can use OUTLINIO without an internet connection. Perfect for on-the-go creativity.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Forever Free',
    description: 'No subscriptions, no hidden fees, no limits. OUTLINIO is completely free and always will be.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    description: 'Powered by optimized canvas algorithms, get your sketches in seconds, not minutes.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'No Account Required',
    description: 'Just visit the site and start creating. No sign-up, no login, no tracking.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Works Everywhere',
    description: 'Compatible with Chrome, Firefox, Safari, Edge, and mobile browsers on any device.',
  },
];

const About = () => {
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
              About <span className="gradient-text">OUTLINIO</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A free, privacy-first tool for artists, designers, and creators to transform photos into beautiful sketches.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12"
            >
              <h2 className="text-2xl font-display font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                We believe creative tools should be accessible to everyone. OUTLINIO was built to provide 
                professional-quality sketch conversion without the complexity of desktop software or 
                the privacy concerns of cloud-based services.
              </p>
              <p className="text-muted-foreground">
                Every feature runs entirely in your browser using HTML5 Canvas and advanced image 
                processing algorithms. Your images are never uploaded anywhere – they stay on your 
                device from start to finish.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <span className="text-primary">{value.icon}</span>
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to="/" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Start Creating
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground">
              Developed by <span className="font-semibold gradient-text">Balaji B</span>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

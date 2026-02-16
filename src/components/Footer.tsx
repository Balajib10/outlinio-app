import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import outlinioLogo from '@/assets/outlinio-logo.jpeg';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={outlinioLogo} alt="OUTLINIO" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xl font-display font-bold gradient-text">
                OUTLINIO
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Turn your photos into beautiful, clean sketches instantly. 
              100% free, works offline, and completely private.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-destructive fill-current" /> for artists everywhere
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Pencil Sketch</li>
              <li className="text-muted-foreground">Ink Outline</li>
              <li className="text-muted-foreground">Line Art</li>
              <li className="text-muted-foreground">Coloring Page</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OUTLINIO. Developed by <span className="font-semibold gradient-text">Manasathevi</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              No images are stored or uploaded to any server.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

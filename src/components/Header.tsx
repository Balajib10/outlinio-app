import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
  ];

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-primary p-0">
            <Pencil className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold gradient-text">
            OUTLINIO
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="md:hidden">
          <Link to="/" className="btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

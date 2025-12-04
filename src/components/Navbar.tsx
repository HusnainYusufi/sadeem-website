import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import logoDark from "@/assets/sunday-logo-black.svg";
import logoLight from "@/assets/sunday-logo-white.svg";

const navLinks = [
  { name: "Studio", href: "/#studio" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Packages", href: "/#packages" },
  { name: "Services", href: "/#services" },
  { name: "Contact", href: "/#contact" },
  { name: "Gallery Page", href: "/gallery" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container px-6">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex-shrink-0">
            <picture>
              <source srcSet={isScrolled ? logoDark : logoLight} media="(min-width: 768px)" />
              <img
                src={isScrolled ? logoDark : logoLight}
                alt="Sunday Studio logo"
                className="h-10 w-auto drop-shadow-sm"
                loading="lazy"
              />
            </picture>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="relative font-body text-sm tracking-wider uppercase text-foreground/80 hover:text-foreground transition-colors group"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.a>
            ))}
            <a
              href="tel:+923000846656"
              className="ml-4 px-6 py-2.5 bg-primary text-primary-foreground font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Call Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-background border-t border-border"
        >
          <div className="container px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-body text-sm tracking-wider uppercase text-foreground/80 hover:text-foreground py-2"
              >
                {link.name}
              </a>
            ))}
            <a
              href="tel:+923000846656"
              className="block text-center px-6 py-3 bg-primary text-primary-foreground font-body text-sm tracking-wider uppercase mt-4"
            >
              Call Now
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;

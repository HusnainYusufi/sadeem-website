import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <span className="font-display text-xl text-foreground">Sunday</span>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-foreground/70 ml-2">Studio</span>
          </div>
          
          <p className="text-muted-foreground text-sm text-center">
            The Largest Infinity Wall in Lahore • Best for Films, Ads & Fashion Shoots
          </p>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Sunday Studio
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

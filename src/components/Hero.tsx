import { motion } from "framer-motion";
import { ArrowDown, MessageCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/40 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground tracking-tight">
            Sunday
          </h1>
          <p className="font-body text-lg md:text-xl tracking-[0.4em] uppercase text-foreground/70 mt-2">
            Studio
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <h2 className="font-display text-lg md:text-xl lg:text-2xl tracking-[0.3em] text-foreground/80 uppercase">
            The Largest Infinity Wall in Lahore
          </h2>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Best for Films, Ads & Fashion Shoots
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#packages"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-body font-medium text-sm tracking-wider uppercase transition-all hover:scale-105 hover:shadow-elevated"
          >
            View Packages
          </a>
          <a
            href="#studio"
            className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary font-body font-medium text-sm tracking-wider uppercase transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Explore Studio
          </a>
          <a
            href="https://wa.me/923000846656"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-medium text-sm tracking-wider uppercase transition-all hover:scale-105 hover:shadow-elevated"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <a href="#studio" className="text-muted-foreground hover:text-foreground transition-colors">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown className="w-6 h-6" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;

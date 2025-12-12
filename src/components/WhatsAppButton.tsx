import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappUrl =
    "https://wa.me/923104828282?text=" +
    encodeURIComponent("Hi Sunday Studio! I'd love to chat about a booking.");

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-black text-green-400 px-5 py-3 shadow-soft-glow border border-green-400/30 hover:shadow-strong-glow transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Chat with us on WhatsApp"
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900">
        <span className="absolute inset-0 rounded-full bg-green-400/20 blur-lg animate-pulse" aria-hidden />
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="hidden sm:flex flex-col text-left">
        <span className="text-xs uppercase tracking-[0.18em] text-green-200/80">Need help?</span>
        <span className="text-sm font-semibold text-green-100">WhatsApp Us</span>
      </div>
    </motion.a>
  );
};

export default WhatsAppButton;

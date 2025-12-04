import { motion } from "framer-motion";
import { Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Contact Us
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Ready to book your shoot? Get in touch with our team
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.a
            href="tel:+923000846656"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-primary-foreground/15 transition-colors group"
          >
            <div className="w-14 h-14 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl mb-2">Call Us</h3>
            <p className="text-primary-foreground/70 text-lg">+92 300 084 6656</p>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-8 text-center"
          >
            <div className="w-14 h-14 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl mb-2">Visit Us</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Building No 13-14, Block H-3,<br />
              Main Canal Road, Near Mughal Eye,<br />
              Lahore
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-8 text-center"
          >
            <div className="w-14 h-14 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl mb-2">Call for Rates</h3>
            <p className="text-primary-foreground/70 text-sm">
              Equipment rentals & custom<br />packages available on request
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <a
            href="tel:+923000846656"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary-foreground text-primary font-body font-medium text-sm tracking-wider uppercase transition-all hover:scale-105 hover:shadow-elevated"
          >
            Book Your Session
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;

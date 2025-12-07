import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Palette, Zap, Lightbulb } from "lucide-react";

const serviceHighlights = [
  {
    title: "Art Direction",
    icon: Palette,
    description:
      "Concept-to-camera support for styling, set builds, props, and visual consistency so every frame looks intentional.",
    bullets: [
      "Moodboard development & look references",
      "Set styling, props, and wardrobe guidance",
      "On-site art direction throughout your shoot",
    ],
  },
  {
    title: "Lighting",
    icon: Lightbulb,
    description:
      "Cinema-grade lights and grip to sculpt your scene. Choose from soft, hard, and controllable fixtures for any setup.",
    bullets: [
      "Aputure 1200d/x, 600d Pro, 2600x, 80x, and more",
      "Spot lenses for creative shaping",
      "Complete grip and accessory support",
    ],
  },
  {
    title: "Generators",
    icon: Zap,
    description:
      "Silent, reliable power options with operator support so your production never pauses.",
    bullets: [
      "25–75 kVA generator options",
      "Fuel handled as per client requirement",
      "Operator included with every booking",
    ],
  },
];

const OtherServices = () => {
  return (
    <>
      <Helmet>
        <title>Sunday Studio | Art Direction, Generators & Lighting Services</title>
        <meta
          name="description"
          content="Explore Sunday Studio's art direction, generator rentals, and professional lighting services. Add these to any package and send an inquiry in one go."
        />
      </Helmet>

      <Navbar />
      <main>
        <section className="pt-32 pb-16 bg-cream-dark">
          <div className="container px-6 grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Add-ons for every package</p>
              <h1 className="font-display text-4xl md:text-5xl text-foreground">
                Art Direction, Lighting & Generators
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Build a production-ready bundle. Pick a package, layer on art direction support, request pro lighting, and book
                generators—all from one inquiry.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/#contact"
                  className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-body text-sm uppercase tracking-wider hover:opacity-90 transition"
                >
                  Send an inquiry
                </a>
                <a
                  href="/#packages"
                  className="px-6 py-3 rounded-full border border-border text-foreground font-body text-sm uppercase tracking-wider hover:bg-background transition"
                >
                  View packages
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {serviceHighlights.map((service) => (
                <div key={service.title} className="bg-background rounded-xl p-6 shadow-medium">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {service.bullets.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default OtherServices;

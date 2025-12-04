import { motion } from "framer-motion";
import { Lightbulb, Zap, Wrench, Camera } from "lucide-react";

const equipment = [
  { name: "Storm LS 1200d Pro", icon: Lightbulb },
  { name: "Storm Ls 1200x Pro", icon: Lightbulb },
  { name: "LS 600d Pro", icon: Lightbulb },
  { name: "LS 60x", icon: Lightbulb },
  { name: "LS 80x", icon: Lightbulb },
  { name: "Aputure 2600x", icon: Lightbulb },
  { name: "Spot lens for 600", icon: Camera },
  { name: "Spot lens for 1200", icon: Camera },
  { name: "Godox flash", icon: Zap },
];

const generators = [
  { name: "25 kVA Generator", power: "25 kVA" },
  { name: "50 kVA Generator", power: "50 kVA" },
  { name: "60 kVA Generator", power: "60 kVA" },
  { name: "75 kVA Generator", power: "75 kVA" },
];

const Services = () => {
  return (
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Other Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional lighting, grip & accessories available for rent
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Lighting Equipment */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-card rounded-xl p-8 shadow-medium"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-display text-2xl text-foreground">Lighting & Grip</h3>
            </div>
            <ul className="space-y-3">
              {equipment.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 text-foreground/80"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.name}
                </motion.li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Complete Accessories & Grip available
            </p>
          </motion.div>

          {/* Generators */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card rounded-xl p-8 shadow-medium"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-display text-2xl text-foreground">Generators</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              With operator, fuel excluded
            </p>
            <div className="grid grid-cols-2 gap-4">
              {generators.map((gen, index) => (
                <motion.div
                  key={gen.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-background p-4 rounded-lg text-center"
                >
                  <p className="font-display text-xl text-foreground">{gen.power}</p>
                  <p className="text-muted-foreground text-xs mt-1">Generator</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-2 text-foreground">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">Custom requirements?</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Contact us for specialized equipment needs
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Services;

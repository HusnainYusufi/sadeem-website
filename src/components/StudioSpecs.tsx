import { motion } from "framer-motion";
import studioMain from "@/assets/studio-main.jpg";
import studioDiagram from "@/assets/studio-diagram.png";

const specs = [
  { label: "Total Seamless Length", value: "105 ft", metric: "≈ 32 m" },
  { label: "Stage Area", value: "50 × 35 ft", metric: "≈ 15.2 × 10.7 m" },
  { label: "Wall Height", value: "20 ft", metric: "≈ 6.1 m" },
  { label: "Roof Clearance", value: "50 ft", metric: "≈ 15.2 m" },
];

const StudioSpecs = () => {
  return (
    <section id="studio" className="py-24 lg:py-32 bg-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Infinity Studio
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the largest infinity wall in Lahore, designed for professional film, advertising, and fashion productions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img
              src={studioMain}
              alt="Sunday Studio Infinity Wall"
              className="w-full h-auto rounded-lg shadow-elevated"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/50 rounded-lg -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <h3 className="font-display text-2xl md:text-3xl text-foreground">
              Studio Specifications
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {specs.map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card p-6 rounded-lg shadow-soft"
                >
                  <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                    {spec.label}
                  </p>
                  <p className="font-display text-2xl text-foreground">{spec.value}</p>
                  <p className="text-muted-foreground text-sm">{spec.metric}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <img
            src={studioDiagram}
            alt="Studio Dimensions Diagram"
            className="max-w-full md:max-w-2xl rounded-lg shadow-medium"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default StudioSpecs;

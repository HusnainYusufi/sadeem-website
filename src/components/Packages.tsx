import { useMemo, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Send, Star, X } from "lucide-react";
import { packages } from "@/data/packages";

type InquiryData = {
  name: string;
  email: string;
  phone: string;
  details: string;
  imageLinks: string;
  otherServices: string[];
};

const availableServices = ["Art Direction", "Lighting", "Generator"];

const FlipCard = ({
  pkg,
  index,
  onBook,
}: {
  pkg: typeof packages[0];
  index: number;
  onBook: (packageName: string) => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative h-[520px] perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="relative w-full h-full preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face */}
        <div
          className={`absolute inset-0 backface-hidden bg-background rounded-xl p-8 shadow-medium flex flex-col ${
            pkg.popular ? "ring-2 ring-primary" : ""
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {pkg.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-body uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" />
              Most Popular
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="font-display text-2xl text-foreground mb-2">{pkg.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-muted-foreground text-sm">RS.</span>
              <span className="font-display text-4xl text-foreground">{pkg.price}</span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{pkg.duration}</p>
          </div>

          <ul className="space-y-3 mb-6 flex-grow">
            {pkg.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => onBook(pkg.name)}
              className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 font-body text-sm font-medium uppercase tracking-wider text-primary-foreground transition hover:opacity-90"
            >
              Book Now
            </button>

            <div className="text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <span>Hover for more</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div
          className={`absolute inset-0 backface-hidden bg-primary rounded-xl p-8 flex flex-col justify-between ${
            pkg.popular ? "ring-2 ring-primary-foreground/20" : ""
          }`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            <h3 className="font-display text-2xl text-primary-foreground mb-2 text-center">
              {pkg.name}
            </h3>
            <p className="text-primary-foreground/80 text-sm text-center mb-6">
              What you can achieve
            </p>

            <ul className="space-y-4">
              {pkg.backDetails.map((detail, i) => (
                <motion.li
                  key={detail}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isFlipped ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="flex items-start gap-3 text-sm text-primary-foreground/90"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-foreground/50 mt-1.5 flex-shrink-0" />
                  {detail}
                </motion.li>
              ))}
            </ul>
          </div>

          <a
            href={`/?package=${encodeURIComponent(pkg.name)}#contact`}
            className="w-full inline-flex items-center justify-center py-3 font-body text-sm uppercase tracking-wider transition-all bg-primary-foreground text-primary hover:opacity-90 rounded-lg"
          >
            Book Now
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Packages = () => {
  const [activePackage, setActivePackage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState<InquiryData>({
    name: "",
    email: "",
    phone: "",
    details: "",
    imageLinks: "",
    otherServices: [],
  });

  const whatsappMessage = useMemo(
    () =>
      `Hi Sunday Studio, I'd like to book ${activePackage ?? "a package"}.\n\nName: ${
        inquiryData.name || "-"
      }\nEmail: ${inquiryData.email || "-"}\nPhone/WhatsApp: ${
        inquiryData.phone || "-"
      }\nOther Services: ${
        inquiryData.otherServices.length > 0
          ? inquiryData.otherServices.join(", ")
          : "-"
      }\nProject Details: ${inquiryData.details || "-"}\nReference Images: ${
        inquiryData.imageLinks || "-"
      }`,
    [activePackage, inquiryData],
  );

  const handleToggleService = (service: string) => {
    setInquiryData((prev) => {
      const hasService = prev.otherServices.includes(service);
      return {
        ...prev,
        otherServices: hasService
          ? prev.otherServices.filter((item) => item !== service)
          : [...prev.otherServices, service],
      };
    });
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setInquiryData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (packageName: string) => {
    setActivePackage(packageName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActivePackage(null);
  };

  const handleSendInquiry = () => {
    const whatsappUrl = `https://wa.me/923104828282?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
    setIsModalOpen(false);
  };

  return (
    <section id="packages" className="py-24 lg:py-32 bg-cream-dark">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Infinity Wall Budget
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect package for your production needs
          </p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Hover over cards to see more details
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <FlipCard key={pkg.name} pkg={pkg} index={index} onBook={openModal} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="bg-muted/50 rounded-lg p-6 space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Please Note:</strong></p>
            <p>• Rates exclude electricity (generator/WAPDA). Overtime is billed at Rs 5,000 per 30 minutes beyond the scheduled shoot time.</p>
            <p>• We will provide the infinity wall in a white background only. If the client requires a different color, the additional cost will be borne by the client.</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl bg-background p-6 shadow-elevated"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close inquiry modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 space-y-2 pr-10">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Book your package</p>
                <h3 className="font-display text-2xl text-foreground">
                  Send an inquiry for {activePackage}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share your details and any reference images (links). We’ll reply with availability and next steps.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-muted-foreground">
                  Name
                  <input
                    type="text"
                    name="name"
                    value={inquiryData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-muted bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-muted-foreground">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={inquiryData.email}
                    onChange={handleInputChange}
                    placeholder="name@email.com"
                    className="w-full rounded-lg border border-muted bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-muted-foreground">
                  Phone / WhatsApp
                  <input
                    type="tel"
                    name="phone"
                    value={inquiryData.phone}
                    onChange={handleInputChange}
                    placeholder="Include country code"
                    className="w-full rounded-lg border border-muted bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-muted-foreground">
                  Reference images or drive links
                  <input
                    type="text"
                    name="imageLinks"
                    value={inquiryData.imageLinks}
                    onChange={handleInputChange}
                    placeholder="Paste URLs (Google Drive, Dropbox, etc.)"
                    className="w-full rounded-lg border border-muted bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {availableServices.map((service) => {
                  const checked = inquiryData.otherServices.includes(service);
                  return (
                    <label
                      key={service}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                        checked ? "border-primary bg-primary/5 text-foreground" : "border-muted bg-white text-foreground/80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleService(service)}
                        className="h-4 w-4 rounded border-muted text-primary focus:ring-primary"
                      />
                      {service}
                    </label>
                  );
                })}
              </div>

              <label className="mt-4 block space-y-2 text-sm font-medium text-muted-foreground">
                Additional details
                <textarea
                  name="details"
                  value={inquiryData.details}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your shoot, timing, crew size, or any specific needs."
                  className="w-full rounded-lg border border-muted bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleSendInquiry}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-medium uppercase tracking-wider text-primary-foreground transition hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                  Send via WhatsApp
                </button>
                <p className="text-xs text-muted-foreground">
                  We’ll respond with availability and confirm add-on services.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Packages;

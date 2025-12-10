import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { packages } from "@/data/packages";
import { submitQueryToSupabase } from "@/lib/supabase";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    selectedPackage: "",
    projectType: "Studio Session",
    date: "",
    details: "",
    otherServices: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const packageParam = searchParams.get("package");

    if (packageParam) {
      setFormData((prev) => ({ ...prev, selectedPackage: packageParam }));
    }
  }, []);

  const availableServices = ["Art Direction", "Lighting", "Generator"];

  const whatsappMessage = useMemo(
    () =>
      `Hi Sunday Studio, I'd like a quote for a shoot.\n\nName: ${formData.name || "-"}\nEmail: ${formData.email || "-"}\nPhone/WhatsApp: ${formData.phone || "-"}\nPackage: ${formData.selectedPackage || "-"}\nOther Services: ${
        formData.otherServices.length > 0 ? formData.otherServices.join(", ") : "-"
      }\nProject Type: ${formData.projectType || "-"}\nPreferred Date: ${formData.date || "-"}\nProject Details: ${formData.details || "-"}`,
    [formData],
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const hasService = prev.otherServices.includes(service);
      return {
        ...prev,
        otherServices: hasService
          ? prev.otherServices.filter((item) => item !== service)
          : [...prev.otherServices, service],
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      await submitQueryToSupabase({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        selected_package: formData.selectedPackage || undefined,
        project_type: formData.projectType || undefined,
        preferred_date: formData.date || undefined,
        details: formData.details || undefined,
        other_services: formData.otherServices,
      });

      await queryClient.invalidateQueries({ queryKey: ["queries"] });

      const whatsappUrl = `https://wa.me/923000846656?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, "_blank");

      setSubmissionMessage("Submitted! Our team will review and reach out shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        selectedPackage: "",
        projectType: "Studio Session",
        date: "",
        details: "",
        otherServices: [],
      });
    } catch (error) {
      setSubmissionMessage((error as Error).message || "We could not submit your query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickWhatsApp = () => {
    const quickMessage =
      "Hi Sunday Studio, I'm interested in a quote. Can we discuss the details?";
    const whatsappUrl = `https://wa.me/923000846656?text=${encodeURIComponent(quickMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

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

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          <div className="space-y-10">
            <div className="grid md:grid-cols-3 gap-8">
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
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-10 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                  <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/60 mb-2">
                    Prefer a quick reply?
                  </p>
                  <h3 className="font-display text-2xl">Chat with us on WhatsApp</h3>
                  <p className="text-primary-foreground/70">We typically respond within a few minutes.</p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickWhatsApp}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-foreground text-primary font-body font-medium uppercase tracking-wider hover:scale-105 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </button>
              </div>

              <a
                href="tel:+923000846656"
                className="inline-flex items-center justify-center px-10 py-4 bg-primary-foreground text-primary font-body font-medium text-sm tracking-wider uppercase transition-all hover:scale-105 hover:shadow-elevated"
              >
                Book Your Session
              </a>
            </motion.div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-primary-foreground text-primary rounded-2xl p-8 lg:p-10 shadow-elevated/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Get a quote</p>
                <h3 className="font-display text-2xl">Tell us about your shoot</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm font-medium text-muted-foreground">
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your full name"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-muted-foreground">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="name@email.com"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-muted-foreground">
                Phone / WhatsApp
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Include country code"
              />
              </label>

              <label className="space-y-2 text-sm font-medium text-muted-foreground">
                Preferred Date
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-muted-foreground block mt-4">
              Package Interest
              <select
                name="selectedPackage"
                value={formData.selectedPackage}
                onChange={handleChange}
                className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.name} value={pkg.name}>
                    {pkg.name} ({pkg.duration})
                  </option>
                ))}
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </label>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Additional Services</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {availableServices.map((service) => (
                  <label
                    key={service}
                    className="flex items-center gap-3 rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground/80"
                  >
                    <input
                      type="checkbox"
                      checked={formData.otherServices.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="h-4 w-4 rounded border-muted text-primary focus:ring-primary"
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            <label className="space-y-2 text-sm font-medium text-muted-foreground block mt-4">
              Project Type
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Studio Session</option>
                <option>Commercial / Ads</option>
                <option>Fashion Shoot</option>
                <option>Film / Music Video</option>
                <option>Product Shoot</option>
                <option>Other (share details below)</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-muted-foreground block mt-4">
              Project Details
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share your production needs, crew size, lighting requirements, and any equipment you need."
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-body font-medium uppercase tracking-wider hover:scale-105 transition-transform disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : "Send via WhatsApp"}
              </button>

              <p className="text-xs text-muted-foreground text-left">
                {submissionMessage || "We will reply with a tailored quote and available slots."}
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { Calendar, ChevronDown, Clock, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { packages } from "@/data/packages";
import { submitQueryToSupabase } from "@/lib/supabase";
import { useAvailabilityQuery } from "@/hooks/useAvailability";

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
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: availabilitySlots = [] } = useAvailabilityQuery();

  const today = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, []);

  const toLocalDate = (value: string) => new Date(`${value}T00:00:00`);
  const formatLocalISO = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const selectedDate = formData.date ? toLocalDate(formData.date) : undefined;

  const bookedDates = useMemo(
    () => availabilitySlots.filter((slot) => slot.status === "booked").map((slot) => toLocalDate(slot.date)),
    [availabilitySlots],
  );

  const holdDates = useMemo(
    () => availabilitySlots.filter((slot) => slot.status === "hold").map((slot) => toLocalDate(slot.date)),
    [availabilitySlots],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const packageParam = searchParams.get("package");

    if (packageParam) {
      setFormData((prev) => ({ ...prev, selectedPackage: packageParam }));
    }
  }, []);

  useEffect(() => {
    if (availabilitySlots.length === 0 || formData.date) return;

    const nextSlot =
      availabilitySlots.find((slot) => slot.status !== "booked" && new Date(slot.date) >= today) || availabilitySlots[0];

    if (nextSlot) {
      setFormData((prev) => ({ ...prev, date: nextSlot.date }));
    }
  }, [availabilitySlots, formData.date, today]);

  const availableServices = ["Art Direction", "Lighting", "Generator"];

  const formatDisplayDate = (iso?: string) =>
    iso
      ? toLocalDate(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
      : "Not selected";

  const handleDateSelect = (iso: string) => {
    setFormData((prev) => ({ ...prev, date: iso }));
    setDatePickerOpen(false);
  };

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
    const whatsappUrl = `https://wa.me/923104828282?text=${encodeURIComponent(quickMessage)}`;
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

              <label className="space-y-3 text-sm font-medium text-muted-foreground sm:col-span-2">
                Preferred Date
                <div className="rounded-xl border border-muted bg-background/50 p-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tap to pick a date</p>
                    <span className="text-xs font-medium text-foreground/80">
                      Selected: <span className="text-foreground">{formatDisplayDate(formData.date)}</span>
                    </span>
                  </div>

                  <Popover.Root open={isDatePickerOpen} onOpenChange={setDatePickerOpen}>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-muted bg-background px-4 py-3 text-left text-sm text-foreground shadow-soft transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formData.date ? formatDisplayDate(formData.date) : "Select a date"}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition ${isDatePickerOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </Popover.Trigger>
                    <Popover.Content
                      align="center"
                      sideOffset={8}
                      collisionPadding={12}
                      className="z-50 w-[min(360px,calc(100vw-2.5rem))] max-w-full rounded-xl border border-muted bg-background p-4 shadow-elevated/30"
                    >
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) return;
                          handleDateSelect(formatLocalISO(date));
                        }}
                        disabled={[{ before: today }, ...bookedDates]}
                        modifiers={{ booked: bookedDates, hold: holdDates }}
                        modifiersClassNames={{
                          booked: "bg-rose-500 text-white hover:bg-rose-500 focus-visible:ring-rose-500",
                          hold: "bg-amber-200 text-amber-950 hover:bg-amber-200",
                        }}
                        className="mx-auto w-full"
                        classNames={{
                          months: "flex flex-col gap-4 w-full",
                          month: "space-y-4 w-full",
                          caption: "flex items-center justify-between px-2 text-sm font-semibold",
                          caption_label: "text-sm font-semibold",
                          nav: "flex items-center gap-2",
                          nav_button:
                            "h-8 w-8 inline-flex items-center justify-center rounded-md border border-muted bg-background hover:bg-muted text-muted-foreground transition",
                          table: "w-full border-collapse",
                          head_row: "grid grid-cols-7 gap-1 text-[11px] text-muted-foreground sm:gap-2",
                          head_cell: "text-center font-medium",
                          row: "grid grid-cols-7 gap-1 sm:gap-2",
                          cell: "text-center text-xs sm:text-sm",
                          day:
                            "aspect-square w-full rounded-lg text-sm text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                          day_today: "border border-primary/40",
                          day_disabled: "opacity-40 cursor-not-allowed",
                          day_outside: "text-muted-foreground/50",
                        }}
                        components={{
                          IconLeft: () => <ChevronDown className="h-4 w-4 rotate-90" />,
                          IconRight: () => <ChevronDown className="h-4 w-4 -rotate-90" />,
                        }}
                      />

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-primary" /> Selected date
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-amber-200 border border-amber-300" /> On hold
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-rose-500" /> Booked (disabled)
                        </span>
                        <span className="text-[11px] text-muted-foreground/80">Live view from the portal — booked dates stay red.</span>
                      </div>
                    </Popover.Content>
                  </Popover.Root>

                  <input type="hidden" name="date" value={formData.date} />
                </div>
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
                {isSubmitting ? "Posting..." : "Post a query"}
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

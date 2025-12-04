import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, Maximize2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import studioMain from "@/assets/studio-main.jpg";
import studioDiagram from "@/assets/studio-diagram.png";

const galleryItems = [
  {
    src: studioMain,
    alt: "Infinity wall in cinematic lighting",
    category: "Studio",
    mood: "Cinematic",
    accent: "#f4c95d",
  },
  {
    src: studioDiagram,
    alt: "Studio floor plan with equipment zones",
    category: "Layout",
    mood: "Blueprint",
    accent: "#9dd7ff",
  },
  {
    src: studioMain,
    alt: "Editorial portrait setup on seamless stage",
    category: "Portrait",
    mood: "Editorial",
    accent: "#eac4ff",
  },
  {
    src: studioDiagram,
    alt: "Lighting grid and rigging schematic",
    category: "Technical",
    mood: "Precision",
    accent: "#b6f3c5",
  },
  {
    src: studioMain,
    alt: "Fashion lookbook shot in studio",
    category: "Fashion",
    mood: "Runway",
    accent: "#ffdfb6",
  },
  {
    src: studioDiagram,
    alt: "Overhead layout for large productions",
    category: "Layout",
    mood: "Spatial",
    accent: "#9ad0ff",
  },
];

const GalleryPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const currentLightboxItem = useMemo(
    () => (lightboxIndex !== null ? galleryItems[lightboxIndex] : null),
    [lightboxIndex],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryItems.length));
      if (event.key === "ArrowLeft")
        setLightboxIndex((prev) => (prev === null ? galleryItems.length - 1 : (prev - 1 + galleryItems.length) % galleryItems.length));
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const downloadImage = (src: string, name: string) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = name.replace(/\s+/g, "-").toLowerCase() || "sunday-studio-gallery";
    link.rel = "noopener";
    link.click();
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const next = direction === "in" ? prev + 0.25 : prev - 0.25;
      return Math.min(Math.max(next, 1), 3);
    });
    setOffset((prev) => ({ x: prev.x / 2, y: prev.y / 2 }));
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (zoom <= 1 || event.pointerType !== "mouse") return;
    setIsDragging(true);
    panStart.current = { x: event.clientX, y: event.clientY };
    offsetStart.current = offset;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = event.clientX - panStart.current.x;
    const deltaY = event.clientY - panStart.current.y;
    setOffset({ x: offsetStart.current.x + deltaX, y: offsetStart.current.y + deltaY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const highlightTrail = useMemo(() => {
    const looped = [...galleryItems, ...galleryItems];
    return looped.map((item, index) => ({
      ...item,
      key: `${item.alt}-${index}`,
      isActive: index % galleryItems.length === activeIndex,
    }));
  }, [activeIndex]);

  return (
    <>
      <Helmet>
        <title>Gallery | Sunday Studio</title>
        <meta
          name="description"
          content="Browse Sunday Studio's cinematic gallery with immersive navigation, zoom, and downloads for your next production."
        />
      </Helmet>
      <Navbar />
      <main className="bg-background text-foreground pt-28">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="container px-6 relative py-16 lg:py-24">
            <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Immersive Gallery</p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight">
                  Curated frames for film, fashion, and fearless storytelling
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Swipe through cinematic sequences, dive into technical layouts, and download what inspires you. Every asset is
                  ready for decks, pitches, and client approvals.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => openLightbox(activeIndex)}
                    className="px-6 py-3 bg-primary text-primary-foreground uppercase tracking-wider font-body text-sm hover:opacity-90 transition"
                  >
                    Launch immersive view
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadImage(galleryItems[activeIndex].src, galleryItems[activeIndex].alt)}
                    className="px-6 py-3 border border-primary/40 text-foreground uppercase tracking-wider font-body text-sm hover:border-primary"
                  >
                    Quick download
                  </button>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">05</p>
                    <p className="uppercase tracking-[0.2em]">Lighting looks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">03</p>
                    <p className="uppercase tracking-[0.2em]">Layout decks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">4K</p>
                    <p className="uppercase tracking-[0.2em]">Download ready</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 bg-primary/10 blur-3xl" />
                <motion.div
                  className="relative rounded-3xl overflow-hidden border border-primary/10 shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <motion.img
                      key={activeIndex}
                      src={galleryItems[activeIndex].src}
                      alt={galleryItems[activeIndex].alt}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.05, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/90 to-transparent p-6 text-background">
                    <p className="uppercase tracking-[0.2em] text-xs">{galleryItems[activeIndex].category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <h2 className="text-xl font-semibold">{galleryItems[activeIndex].alt}</h2>
                      <span className="flex items-center gap-2 text-sm" style={{ color: galleryItems[activeIndex].accent }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: galleryItems[activeIndex].accent }} />
                        {galleryItems[activeIndex].mood}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-background">
          <div className="container px-6 space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Swipeable storyline</p>
                <h2 className="font-display text-3xl md:text-4xl">A kinetic reel of the studio</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)}
                  className="p-3 rounded-full border border-border hover:border-primary"
                  aria-label="Previous frame"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % galleryItems.length)}
                  className="p-3 rounded-full border border-border hover:border-primary"
                  aria-label="Next frame"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-muted/40 border border-border/60">
              <motion.div
                drag="x"
                dragConstraints={{ left: -600, right: 600 }}
                className="flex gap-6 px-6 py-8"
              >
                {galleryItems.map((item, index) => (
                  <motion.button
                    key={item.alt}
                    onClick={() => setActiveIndex(index)}
                    whileHover={{ y: -8 }}
                    className={`group relative w-[280px] shrink-0 overflow-hidden rounded-2xl border ${
                      activeIndex === index ? "border-primary" : "border-border"
                    } bg-background/70 shadow-soft text-left`}
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground">{item.category}</p>
                      <h3 className="text-lg font-semibold leading-snug">{item.alt}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.accent }} />
                        {item.mood} energy
                      </div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </motion.button>
                ))}
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {highlightTrail.map((item) => (
                <div
                  key={item.key}
                  className={`relative rounded-2xl overflow-hidden border border-border/60 backdrop-blur ${
                    item.isActive ? "bg-primary/10" : "bg-muted/30"
                  }`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={item.src} alt={item.alt} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-[11px] text-muted-foreground">{item.category}</p>
                      <p className="text-sm text-foreground/80">{item.alt}</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.accent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-foreground text-background">
          <div className="container px-6 space-y-10">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-background/60">Tactile grid</p>
                <h2 className="font-display text-3xl md:text-4xl">Touch, inspect, and download</h2>
                <p className="max-w-2xl text-background/80 mt-3">
                  Hover to reveal specs, tap to open the immersive viewer, or download the asset instantly. Built for quick client handoffs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openLightbox(activeIndex)}
                className="px-5 py-3 border border-background/30 rounded-full flex items-center gap-2 uppercase tracking-[0.2em] text-sm"
              >
                <Maximize2 className="w-4 h-4" /> Fullscreen gallery
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={`${item.alt}-grid`}
                  whileHover={{ y: -8 }}
                  className="relative overflow-hidden rounded-2xl border border-background/20 bg-background/5"
                >
                  <button type="button" className="w-full" onClick={() => openLightbox(index)}>
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition duration-500 hover:scale-105" />
                    </div>
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 hover:opacity-100 transition" />
                  <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-xs text-background/70">{item.category}</p>
                      <p className="text-sm font-medium">{item.alt}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => downloadImage(item.src, item.alt)}
                        className="p-2 rounded-full bg-background/30 hover:bg-background/50 text-foreground"
                        aria-label={`Download ${item.alt}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openLightbox(index)}
                        className="p-2 rounded-full bg-background/30 hover:bg-background/50 text-foreground"
                        aria-label={`Open ${item.alt}`}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container px-6 rounded-3xl border border-border/60 bg-muted/30 backdrop-blur">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Need a custom pull?</p>
                <h3 className="font-display text-2xl">Tell us what you need for your pitch deck</h3>
                <p className="text-muted-foreground max-w-xl">
                  Share the aspect ratios, moods, or lighting looks you're after. We'll prep a tailored gallery with download links.
                </p>
              </div>
              <a
                href="mailto:contact@sundaystudio.pk?subject=Gallery%20Pull%20Request"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full uppercase tracking-[0.2em] text-sm"
              >
                Request a pull
              </a>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {currentLightboxItem && (
          <motion.div
            className="fixed inset-0 z-[60] bg-foreground/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div
              key={currentLightboxItem.src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 28 }}
              className="relative max-w-6xl w-full"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-background hover:text-background/70"
                aria-label="Close gallery"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="relative overflow-hidden rounded-3xl border border-background/30 bg-background/10 p-4">
                <div
                  className="relative"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <img
                    src={currentLightboxItem.src}
                    alt={currentLightboxItem.alt}
                    className="max-h-[80vh] max-w-full object-contain select-none mx-auto"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transition: isDragging ? "none" : "transform 180ms ease-out",
                      cursor: zoom > 1 ? "grab" : "zoom-in",
                    }}
                    draggable={false}
                  />
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    type="button"
                    className="p-3 rounded-full bg-background/70 text-foreground border border-border/60 hover:border-primary"
                    onClick={() => setLightboxIndex((prev) => (prev === null ? galleryItems.length - 1 : (prev - 1 + galleryItems.length) % galleryItems.length))}
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    className="p-3 rounded-full bg-background/70 text-foreground border border-border/60 hover:border-primary"
                    onClick={() => setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryItems.length))}
                    aria-label="Next image"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between bg-background/80 text-foreground rounded-full px-4 py-2 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: currentLightboxItem.accent }} />
                    <p className="text-sm font-medium">{currentLightboxItem.alt}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{currentLightboxItem.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleZoom("out")}
                      className="px-3 py-1 rounded-full border border-border text-sm hover:border-primary"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium min-w-[4rem] text-center">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => handleZoom("in")}
                      className="px-3 py-1 rounded-full border border-border text-sm hover:border-primary"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadImage(currentLightboxItem.src, currentLightboxItem.alt)}
                      className="ml-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default GalleryPage;

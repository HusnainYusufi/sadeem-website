import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, Plus, X, ZoomIn } from "lucide-react";
import studioMain from "@/assets/studio-main.jpg";
import studioDiagram from "@/assets/studio-diagram.png";
import logoDark from "@/assets/sunday-logo-black.svg";

const galleryImages = [
  { src: studioMain, alt: "Sunday Studio Main Space", category: "Studio" },
  { src: studioDiagram, alt: "Studio Floor Plan", category: "Layout" },
  { src: studioMain, alt: "Infinity Wall Setup", category: "Studio" },
  { src: studioDiagram, alt: "Equipment Layout", category: "Layout" },
  { src: studioMain, alt: "Lighting Setup", category: "Studio" },
  { src: studioDiagram, alt: "Space Overview", category: "Layout" },
];

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const categories = ["All", "Studio", "Layout"];
  const filteredImages = filter === "All"
    ? galleryImages
    : galleryImages.filter(img => img.category === filter);

  const currentImage = useMemo(
    () => (selectedIndex !== null ? filteredImages[selectedIndex] : null),
    [filteredImages, selectedIndex],
  );

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= filteredImages.length) {
      setSelectedIndex(null);
    }
  }, [filteredImages.length, selectedIndex]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleNext = () => {
    if (!filteredImages.length) return;
    setSelectedIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % filteredImages.length;
    });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePrev = () => {
    if (!filteredImages.length) return;
    setSelectedIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + filteredImages.length) % filteredImages.length;
    });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const next = direction === "in" ? prev + 0.25 : prev - 0.25;
      return Math.min(Math.max(next, 1), 3);
    });
    setOffset((prev) => ({ x: prev.x / 2, y: prev.y / 2 }));
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (selectedIndex === null) return;
    event.preventDefault();
    handleZoom(event.deltaY < 0 ? "in" : "out");
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (zoom <= 1 || event.pointerType !== "mouse") return;
    setIsPanning(true);
    panStart.current = { x: event.clientX, y: event.clientY };
    offsetStart.current = offset;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isPanning) return;
    const deltaX = event.clientX - panStart.current.x;
    const deltaY = event.clientY - panStart.current.y;
    setOffset({ x: offsetStart.current.x + deltaX, y: offsetStart.current.y + deltaY });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleDoubleClick = () => {
    setZoom((prev) => {
      const next = prev >= 2 ? 1 : prev + 1;
      if (next === 1) setOffset({ x: 0, y: 0 });
      return Math.min(next, 3);
    });
  };

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Studio Gallery
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Explore our professional photography space
          </p>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setFilter(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 font-body text-sm uppercase tracking-wider transition-all ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/30 text-foreground hover:border-primary"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={`${image.alt}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer bg-muted"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ZoomIn className="w-10 h-10 text-background" />
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-background font-body text-sm">{image.alt}</p>
                  <span className="text-background/70 text-xs uppercase tracking-wider">{image.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {currentImage && selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
              onClick={closeLightbox}
            >
              <div className="absolute top-4 left-6 flex items-center gap-3 pointer-events-none">
                <div className="rounded-full bg-background/90 shadow-soft px-4 py-2">
                  <img
                    src={logoDark}
                    alt="Sunday Studio black logo"
                    className="h-8 w-auto"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-background/80">
                  Gallery Carousel
                </span>
              </div>
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 right-6 text-background hover:text-background/70 transition-colors"
                onClick={closeLightbox}
              >
                <X className="w-8 h-8" />
              </motion.button>

              <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                <button
                  type="button"
                  className="pointer-events-auto bg-background/60 text-foreground rounded-full p-3 hover:bg-background transition"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePrev();
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="pointer-events-auto bg-background/60 text-foreground rounded-full p-3 hover:bg-background transition"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/70 text-foreground rounded-full px-4 py-2 shadow-soft pointer-events-auto">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-background"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleZoom("out");
                  }}
                  aria-label="Zoom out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium min-w-[4rem] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-background"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleZoom("in");
                  }}
                  aria-label="Zoom in"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.div
                key={currentImage.src}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", damping: 24 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(event, info) => {
                  if (info.offset.x > 120) {
                    handlePrev();
                  } else if (info.offset.x < -120) {
                    handleNext();
                  }
                }}
                className="relative max-w-5xl w-full flex items-center justify-center"
                onClick={(event) => event.stopPropagation()}
                onWheel={handleWheel}
              >
                <div className="relative overflow-hidden rounded-2xl bg-background/60 p-3">
                  <div
                    className="relative"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onDoubleClick={handleDoubleClick}
                  >
                    <img
                      src={currentImage.src}
                      alt={currentImage.alt}
                      className="max-h-[80vh] max-w-[80vw] object-contain select-none"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        transition: isPanning ? "none" : "transform 180ms ease-out",
                        cursor: zoom > 1 ? "grab" : "zoom-in",
                      }}
                      draggable={false}
                    />
                  </div>
                  <p className="absolute left-4 bottom-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Swipe, zoom, or double tap to explore
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Gallery;

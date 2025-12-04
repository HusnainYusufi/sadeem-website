import { useEffect, useRef, useState } from "react";

const interactiveSelectors = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[data-cursor='interactive']",
];

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const coordsRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const updateSupport = (event: MediaQueryListEvent | MediaQueryList) => {
      setEnabled(event.matches);
    };

    updateSupport(mediaQuery);
    mediaQuery.addEventListener("change", updateSupport);

    return () => mediaQuery.removeEventListener("change", updateSupport);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("custom-cursor-enabled", enabled);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const interactiveSelector = interactiveSelectors.join(",");

    const updateCursorPosition = () => {
      if (!cursorRef.current) return;

      const { x, y } = coordsRef.current;
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      rafIdRef.current = null;
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;

      coordsRef.current = { x: event.clientX, y: event.clientY };

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateCursorPosition);
      }

      setVisible(true);

      const target = event.target as Element | null;
      setActive(Boolean(target?.closest(interactiveSelector)));
    };

    const handleLeaveWindow = () => setVisible(false);
    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleCancel = () => {
      setPressed(false);
      setVisible(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleCancel();
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerleave", handleLeaveWindow);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
    window.addEventListener("blur", handleCancel);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeaveWindow);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
      window.removeEventListener("blur", handleCancel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] hidden md:block">
      <div
        ref={cursorRef}
        className={`custom-cursor ${visible ? "opacity-100" : "opacity-0"} ${active ? "cursor-active" : ""} ${pressed ? "cursor-pressed" : ""}`}
      />
    </div>
  );
};

export default CustomCursor;

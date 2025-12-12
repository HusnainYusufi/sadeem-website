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
  const [enabled, setEnabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const coordsRef = useRef({ x: -100, y: -100 });
  const renderedCoordsRef = useRef({ x: -100, y: -100 });
  const activeRef = useRef(false);
  const visibleRef = useRef(false);
  const pressedRef = useRef(false);

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
    if (!enabled) return;

    const interactiveSelector = interactiveSelectors.join(",");

    const updateCursorPosition = () => {
      if (!cursorRef.current) return;

      const { x: targetX, y: targetY } = coordsRef.current;
      const current = renderedCoordsRef.current;

      const deltaX = targetX - current.x;
      const deltaY = targetY - current.y;

      current.x += deltaX * 0.22;
      current.y += deltaY * 0.22;

      cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;

      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        rafIdRef.current = requestAnimationFrame(updateCursorPosition);
      } else {
        rafIdRef.current = null;
      }
    };

    const handleMove = (event: PointerEvent) => {
      coordsRef.current = { x: event.clientX, y: event.clientY };

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateCursorPosition);
      }

      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }

      const target = event.target as Element | null;
      const isActive = Boolean(target?.closest(interactiveSelector));

      if (isActive !== activeRef.current) {
        activeRef.current = isActive;
        setActive(isActive);
      }
    };

    const handleLeaveWindow = () => {
      if (visibleRef.current) {
        visibleRef.current = false;
        setVisible(false);
      }

      if (activeRef.current) {
        activeRef.current = false;
        setActive(false);
      }
    };

    const handleDown = () => {
      if (!pressedRef.current) {
        pressedRef.current = true;
        setPressed(true);
      }
    };

    const handleUp = () => {
      if (pressedRef.current) {
        pressedRef.current = false;
        setPressed(false);
      }
    };

    const handleCancel = () => {
      if (pressedRef.current) {
        pressedRef.current = false;
        setPressed(false);
      }

      if (visibleRef.current) {
        visibleRef.current = false;
        setVisible(false);
      }

      if (activeRef.current) {
        activeRef.current = false;
        setActive(false);
      }
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
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeaveWindow);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  useEffect(() => {
    const root = document.documentElement;

    if (enabled) {
      root.classList.add("custom-cursor-enabled");
    } else {
      root.classList.remove("custom-cursor-enabled");
    }

    return () => {
      root.classList.remove("custom-cursor-enabled");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="custom-cursor-layer pointer-events-none fixed inset-0 z-[10000] hidden md:block"
      aria-hidden="true"
      inert
    >
      <div
        ref={cursorRef}
        className={`custom-cursor ${visible ? "opacity-100" : "opacity-0"} ${active ? "cursor-active" : ""} ${pressed ? "cursor-pressed" : ""}`}
      />
    </div>
  );
};

export default CustomCursor;

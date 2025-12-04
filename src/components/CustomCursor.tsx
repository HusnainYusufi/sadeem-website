import { useEffect, useState } from "react";

const interactiveSelectors = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[data-cursor='interactive']",
  "section",
];

const CustomCursor = () => {
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const interactiveSelector = interactiveSelectors.join(",");

    const handleMove = (event: MouseEvent) => {
      setCoords({ x: event.clientX, y: event.clientY });
      setVisible(true);

      const target = event.target as Element | null;
      setActive(Boolean(target?.closest(interactiveSelector)));
    };

    const handleLeaveWindow = () => setVisible(false);
    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeaveWindow);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeaveWindow);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  const cursorTransform = `translate3d(${coords.x}px, ${coords.y}px, 0) translate(-50%, -50%)`;

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] hidden md:block">
      <div
        className={`custom-cursor ${visible ? "opacity-100" : "opacity-0"} ${active ? "cursor-active" : ""} ${pressed ? "cursor-pressed" : ""}`}
        style={{ transform: cursorTransform }}
      />
      <div
        className={`custom-cursor-dot ${visible ? "opacity-100" : "opacity-0"} ${active ? "cursor-active" : ""} ${pressed ? "cursor-pressed" : ""}`}
        style={{ transform: cursorTransform }}
      />
    </div>
  );
};

export default CustomCursor;

import { CONFIG } from "@/content/config";
import { GitOwlIframe } from "@/content/gitowl-iframe";
import { LocalStorage } from "@/content/local-storage";
import { useCallback, useState } from "preact/hooks";

export default function Drawer() {
  const [width, setWidth] = useState(() => {
    return LocalStorage.getDrawerWidth();
  });
  const [isOpen, setIsOpen] = useState(() => {
    return LocalStorage.getDrawerIsOpen();
  });

  const handleDrag = useCallback((e: MouseEvent) => {
    const width = document.body.clientWidth - e.clientX;
    if (width < CONFIG.MIN_DRAWER_WIDTH) return;
    setWidth(width + "px");
    LocalStorage.setDrawerWidth(width + "px");
  }, []);

  return (
    <div
      className={`owl-drawer ${
        isOpen ? "owl-translate-x-0" : "owl-translate-x-full"
      }`}
      style={{ width }}
    >
      <div
        className="owl-draggable-wall"
        onMouseDown={() => {
          console.log("drawer wall mouse down");
          const prevUserSelect = document.body.style.userSelect;
          document.body.style.userSelect = "none";
          document.addEventListener("mousemove", handleDrag);
          document.addEventListener(
            "mouseup",
            () => {
              console.log("drawer wall mouse up");
              document.body.style.userSelect = prevUserSelect;
              document.removeEventListener("mousemove", handleDrag);
            },
            { once: true }
          );
        }}
      />
      <button
        className="owl-button"
        onClick={() => {
          setIsOpen(!isOpen);
          LocalStorage.setDrawerIsOpen(!isOpen);
        }}
      >
        GitOwl
      </button>
      <GitOwlIframe />
    </div>
  );
}

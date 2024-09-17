import { CONFIG } from "@/content/config";
import { GitOwlIframe } from "@/content/gitowl-iframe";
import { LocalStorage } from "@/content/local-storage";
import { log } from "@/content/log";
import { useCallback, useEffect, useState } from "preact/hooks";

export default function Drawer() {
  const { width, onMouseDown } = useDrawerWidth();
  const { isOpen, onToggleOpen } = useDrawerIsOpen();

  return (
    <div
      className={`owl-drawer ${
        isOpen ? "owl-translate-x-0" : "owl-translate-x-full"
      }`}
      style={{ width }}
    >
      <div className="owl-draggable-wall" onMouseDown={onMouseDown} />
      <button className="owl-button" onClick={onToggleOpen}>
        GitOwl
      </button>
      <GitOwlIframe />
    </div>
  );
}

function useDrawerWidth() {
  const [width, setWidth] = useState(() => {
    return LocalStorage.getDrawerWidth();
  });

  useEffect(() => {
    LocalStorage.setDrawerWidth(width);
  }, [width]);

  const handleDrag = useCallback((e: MouseEvent) => {
    const width = document.body.clientWidth - e.clientX;
    if (width < CONFIG.MIN_DRAWER_WIDTH) return;
    setWidth(width + "px");
  }, []);

  const onMouseDown = useCallback(() => {
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener(
      "mouseup",
      () => {
        log("drawer wall mouse up");
        document.body.style.userSelect = prevUserSelect;
        document.removeEventListener("mousemove", handleDrag);
      },
      { once: true }
    );
  }, [handleDrag]);

  return { width, onMouseDown };
}

function useDrawerIsOpen() {
  const [isOpen, setIsOpen] = useState(() => {
    return LocalStorage.getDrawerIsOpen();
  });

  const onToggleOpen = () => {
    setIsOpen(!isOpen);
    LocalStorage.setDrawerIsOpen(!isOpen);
    if (!isOpen) {
      chrome.runtime.sendMessage("gitowl-open");
    }
  };

  return { isOpen, onToggleOpen };
}

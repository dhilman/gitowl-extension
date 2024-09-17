import config from "@/config";
import LocalStorage from "@/content/local-storage";
import { getCurrentPath } from "@/content/path-finder";
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
    if (width < config.minDrawerWidth) return;
    setWidth(width + "px");
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
          document.addEventListener("mouseup", () => {
            console.log("drawer wall mouse up");
            document.body.style.userSelect = prevUserSelect;
            document.removeEventListener("mousemove", handleDrag);
          });
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

const frameScriptSrc = chrome.runtime.getURL("src/frame/index.html");

function GitOwlIframe() {
  const path = getCurrentPath();
  // TODO: add query param to path
  const pathWithQuery = `${path}?closed=false`;
  const b64 = btoa(pathWithQuery);
  return <div>Path: {pathWithQuery}</div>;
  // return (
  //   <iframe src={frameScriptSrc + "?path=" + b64} className="owl-iframe" />
  // );
}

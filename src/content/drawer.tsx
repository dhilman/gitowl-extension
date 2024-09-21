import { IFRAME_INITIAL_SRC } from "@/content/app-state";
import { useDrawerIsOpen, useDrawerSize } from "@/content/drawer-hooks";

export default function Drawer() {
  const { width, buttonTopPercentage, onMouseDown } = useDrawerSize();
  const { isOpen, onToggleOpen } = useDrawerIsOpen();

  return (
    <div
      className={`owl-drawer ${
        isOpen ? "owl-translate-x-0" : "owl-translate-x-full"
      }`}
      style={{ width: width + "px" }}
    >
      <div
        className="owl-btn-container"
        style={{ top: `${buttonTopPercentage}%` }}
      >
        <button
          className="owl-btn"
          style={{
            position: "static",
          }}
          onClick={onToggleOpen}
        >
          GitOwl
        </button>
        {isOpen && <DragHandle onMouseDown={onMouseDown} />}
      </div>
      <iframe
        id="gitowl-iframe"
        src={IFRAME_INITIAL_SRC}
        className="owl-iframe"
      />
    </div>
  );
}

let _iframe: HTMLIFrameElement | null = null;
export function getExtensionIframe() {
  if (_iframe) return _iframe;
  _iframe = document.getElementById("gitowl-iframe") as HTMLIFrameElement;
  return _iframe;
}

interface DragHandleProps {
  onMouseDown: (e: MouseEvent) => void;
}

function DragHandle({ onMouseDown }: DragHandleProps) {
  return (
    <div className="owl-drag-handle" onMouseDown={onMouseDown}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="5" r="1" />
        <circle cx="19" cy="5" r="1" />
        <circle cx="5" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
        <circle cx="19" cy="19" r="1" />
        <circle cx="5" cy="19" r="1" />
      </svg>
    </div>
  );
}

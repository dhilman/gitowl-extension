import { useDrawerIsOpen, useDrawerSizeV2 } from "@/content/drawer-hooks";
import { GitOwlIframe } from "@/content/gitowl-iframe";

export default function Drawer() {
  const { width, buttonTopPercentage, onMouseDown } = useDrawerSizeV2();
  const { isOpen, onToggleOpen } = useDrawerIsOpen();

  return (
    <div
      className={`owl-drawer ${
        isOpen ? "owl-translate-x-0" : "owl-translate-x-full"
      }`}
      style={{ width: width + "px" }}
    >
      <div
        style={{
          position: "fixed",
          zIndex: 80,
          top: `${buttonTopPercentage}%`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          color: "black",
          transform: "translateX(-100%)",
          // border only on the left side
          borderRadius: "8px 0px 0px 8px",
          overflow: "hidden",
        }}
      >
        <button
          className="owl-button"
          style={{
            position: "static",
          }}
          onClick={onToggleOpen}
        >
          GitOwl
        </button>
        {isOpen && <DragHandle onMouseDown={onMouseDown} />}
      </div>
      <GitOwlIframe />
    </div>
  );
}

interface DragHandleProps {
  onMouseDown: (e: MouseEvent) => void;
}

function DragHandle({ onMouseDown }: DragHandleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "static",
        padding: "6px 0px",
        cursor: "grab",
        borderTop: "1px solid rgb(0, 0, 0, 0.05)",
        color: "rgb(0, 0, 0, 0.2)",
      }}
      onMouseDown={onMouseDown}
    >
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

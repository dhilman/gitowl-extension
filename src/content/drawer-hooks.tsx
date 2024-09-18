import { LocalStorage } from "@/content/local-storage";
import { log } from "@/content/log";
import { useCallback, useRef, useState } from "preact/hooks";

export function useDrawerIsOpen() {
  const [isOpen, setIsOpen] = useState(() => {
    return LocalStorage.getDrawerIsOpen();
  });

  const onToggleOpen = () => {
    setIsOpen(!isOpen);
    LocalStorage.setDrawerIsOpen(!isOpen);
    if (!isOpen) {
      const iframe = getGitOwlIframe();
      iframe?.contentWindow?.postMessage("gitowl-open", "*");
    }
  };

  return { isOpen, onToggleOpen };
}

const MIN_DRAWER_WIDTH = 300;

export function useDrawerSize() {
  const [width, setWidth] = useState(() => {
    return LocalStorage.getDrawerWidth();
  });
  const [buttonTopPct, setButtonTopPct] = useState(() => {
    return LocalStorage.getDrawerBtnTop();
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs to store mutable variables without causing re-renders
  const initialWidthRef = useRef(width);
  const initialTopRef = useRef(buttonTopPct);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currWidthRef = useRef(width);
  const currTopRef = useRef(buttonTopPct);
  const restoreUserSelectFuncRef = useRef<(() => void) | null>(null);

  const onDragMove = useCallback((e: MouseEvent) => {
    const deltaX = startXRef.current - e.clientX;
    const newWidth = initialWidthRef.current + deltaX;

    if (newWidth > MIN_DRAWER_WIDTH) {
      setWidth(newWidth);
      currWidthRef.current = newWidth;
    }

    const deltaY = startYRef.current - e.clientY;
    const deltaYPercentage = (deltaY / window.innerHeight) * 100;
    const newTopPct = initialTopRef.current - deltaYPercentage;
    log("new top %", newTopPct);

    if (newTopPct > 0 && newTopPct < 85) {
      setButtonTopPct(newTopPct);
      currTopRef.current = newTopPct;
    }
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    restoreUserSelectFuncRef.current?.();
    LocalStorage.setDrawerWidth(currWidthRef.current);
    LocalStorage.setDrawerBtnTop(currTopRef.current);
  }, [onDragMove]);

  const onDragStart = useCallback(
    (e: MouseEvent) => {
      // Disable pointer events for the body and the iframe while dragging
      const prevPointerEvent = document.body.style.pointerEvents;
      const iframe = getGitOwlIframe();
      document.body.style.pointerEvents = "none";
      iframe.style.pointerEvents = "none";
      restoreUserSelectFuncRef.current = () => {
        document.body.style.pointerEvents = prevPointerEvent;
        iframe.style.pointerEvents = "auto";
      };

      // Initialize refs with current state
      initialWidthRef.current = width;
      initialTopRef.current = buttonTopPct;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
    },
    [onDragMove, width, buttonTopPct]
  );

  const { onMouseDown } = useDraggable({
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return { width, buttonTopPercentage: buttonTopPct, onMouseDown, isDragging };
}

function getGitOwlIframe() {
  return document.getElementById("gitowl-iframe") as HTMLIFrameElement;
}

interface UseDraggableOptions {
  onDragStart: (e: MouseEvent) => void;
  onDragMove: (e: MouseEvent) => void;
  onDragEnd: () => void;
}

export function useDraggable(options: UseDraggableOptions) {
  const animationFrameRef = useRef<number | null>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(() => {
          options.onDragMove(e);
          animationFrameRef.current = null;
        });
      }
    },
    [options.onDragMove]
  );

  const onMouseUp = useCallback(() => {
    options.onDragEnd();
    document.removeEventListener("mousemove", onMouseMove);
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    log("Drawer drag ended");
  }, [options.onDragEnd, onMouseMove]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      options.onDragStart(e);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp, { once: true });
      log("Drawer drag started");
    },
    [options.onDragStart, onMouseMove, onMouseUp]
  );

  return { onMouseDown };
}

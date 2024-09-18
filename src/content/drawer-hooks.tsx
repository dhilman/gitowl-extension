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

export function useDrawerSizeV2() {
  const [width, setWidth] = useState<number>(MIN_DRAWER_WIDTH);
  const [buttonTopPercentage, setButtonTopPercentage] = useState<number>(10);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs to store mutable variables without causing re-renders
  const initialWidthRef = useRef<number>(width);
  const initialTopRef = useRef<number>(buttonTopPercentage);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const restoreUserSelectFuncRef = useRef<(() => void) | null>(null);

  const onDragMove = useCallback((e: MouseEvent) => {
    const deltaX = startXRef.current - e.clientX;
    const newWidth = initialWidthRef.current + deltaX;

    if (newWidth > MIN_DRAWER_WIDTH) {
      setWidth(newWidth);
    }

    const deltaY = startYRef.current - e.clientY;
    const deltaYPercentage = (deltaY / document.body.clientHeight) * 100;
    const newTopPercentage = initialTopRef.current - deltaYPercentage;

    log("newTopPercentage", newTopPercentage);

    if (newTopPercentage > 0 && newTopPercentage < 85) {
      setButtonTopPercentage(newTopPercentage);
    }
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    restoreUserSelectFuncRef.current?.();
  }, [onDragMove]);

  const onDragStart = useCallback(
    (e: MouseEvent) => {
      log("Drawer drag ended");

      // Disable pointer events for the body and the iframe
      const prevUserSelect = document.body.style.userSelect;
      const iframe = getGitOwlIframe();
      document.body.style.userSelect = "none";
      iframe.style.pointerEvents = "none";
      restoreUserSelectFuncRef.current = () => {
        document.body.style.userSelect = prevUserSelect;
        iframe.style.pointerEvents = "auto";
      };

      // Initialize refs with current state
      initialWidthRef.current = width;
      initialTopRef.current = buttonTopPercentage;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
    },
    [onDragMove, width, buttonTopPercentage]
  );

  const { onMouseDown } = useDraggable({
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return { width, buttonTopPercentage, onMouseDown, isDragging };
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

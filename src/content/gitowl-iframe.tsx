import { LocalStorage } from "@/content/local-storage";
import { getCurrentPath } from "@/content/path-finder";
import { useEffect, useState } from "preact/hooks";

export function GitOwlIframe() {
  const source = useIframeSrc();
  return <iframe id="gitowl-iframe" src={source} className="owl-iframe" />;
}

const current = {
  url: window.location.href,
  path: getCurrentPath(),
};

function useIframeSrc() {
  const [source, setSource] = useState(() => {
    return createIframeSrcWithQuery(current.path);
  });

  // Listen to changes in the URL through a mutation observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (current.url === window.location.href) return;
      current.url = window.location.href;

      const newSource = getCurrentPath();
      if (current.path === newSource) return;
      current.path = newSource;
      setSource(createIframeSrcWithQuery(current.path));
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return source;
}

function getFrameBaseSrc() {
  if (import.meta.env.DEV) {
    if (window.location.host.startsWith("localhost")) {
      return window.location.origin + "/src/frame/index.html";
    }
  }
  return chrome.runtime.getURL("src/frame/index.html");
}

const FRAME_SRC = getFrameBaseSrc();
const VERSION = import.meta.env.VITE_GITOWL_VERSION;

function createIframeSrcWithQuery(path: string) {
  const isClosed = !LocalStorage.getDrawerIsOpen();
  path += "?";
  path += "version=" + VERSION;
  if (isClosed) {
    path += "&closed=true";
  }
  const b64 = btoa(path);
  return FRAME_SRC + "?path=" + b64;
}

import { LocalStorage } from "@/content/local-storage";
import { getCurrentPath } from "@/content/path-finder";
import { useEffect, useState } from "preact/hooks";

export function GitOwlIframe() {
  const source = useIframeSrc();
  return <iframe src={source} className="owl-iframe" />;
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

const FRAME_SRC = chrome.runtime.getURL("src/frame/index.html");
const VERSION = import.meta.env.VITE_GITOWL_VERSION;

function createIframeSrcWithQuery(path: string) {
  const isClosed = !LocalStorage.getDrawerIsOpen();
  const pathWithQuery = `${path}?closed=${isClosed}&version=${VERSION}`;
  const b64 = btoa(pathWithQuery);
  return FRAME_SRC + "?path=" + b64;
}

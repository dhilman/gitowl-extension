import { LocalStorage } from "@/content/local-storage";
import { log } from "@/content/log";
import { getCurrentPath } from "@/content/path-finder";
import { sendMessage } from "@/content/send-message";

interface AppState {
  url: string;
  path: string;
}

export const AppState: AppState = {
  url: window.location.href,
  path: getCurrentPath(),
};

export function syncAppState() {
  sendMessage({
    id: Date.now(),
    type: "gitowl",
    path: AppState.path,
    isOpen: LocalStorage.getDrawerIsOpen(),
  });
}

// Setup path change observer
const observer = new MutationObserver(() => {
  if (AppState.url === window.location.href) return;
  AppState.url = window.location.href;

  const newPath = getCurrentPath();
  if (AppState.path === newPath) return;
  AppState.path = newPath;
  syncAppState();
});
observer.observe(document.body, { childList: true, subtree: true });

class ExtensionIframe {
  static version = import.meta.env.VITE_GITOWL_VERSION;

  static getBaseSrc() {
    if (import.meta.env.DEV) {
      if (window.location.host.startsWith("localhost")) {
        return window.location.origin + "/src/frame/index.html";
      }
    }
    return chrome.runtime.getURL("src/frame/index.html");
  }

  static src(path: string) {
    const isClosed = !LocalStorage.getDrawerIsOpen();
    path += "?";
    path += "version=" + this.version;
    if (isClosed) {
      path += "&closed=true";
    }
    const b64 = btoa(path);
    return this.getBaseSrc() + "?path=" + b64;
  }
}

log("initial path", AppState.path);
export const IFRAME_INITIAL_SRC = ExtensionIframe.src(AppState.path);

const BASE_URL = import.meta.env.VITE_BASE_URL + "/git";

function log(...args: any[]) {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}

function getGitOwlUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("path");
  if (!encoded) return BASE_URL + "/";
  return BASE_URL + atob(encoded);
}

// Inject the iframe
const iframe = document.createElement("iframe");
iframe.src = getGitOwlUrl();
iframe.style.width = "100%";
iframe.style.minHeight = "100vh";
iframe.style.border = "none";
iframe.style.margin = "0";

document.body.appendChild(iframe);

// Listen to messages from the main script and relay to the inner iframe.
window.addEventListener("message", (event) => {
  if (
    typeof event.data === "object" &&
    "type" in event.data &&
    event.data.type === "gitowl"
  ) {
    iframe.contentWindow?.postMessage(event.data, "*");
  }
});

log("frame script loaded");

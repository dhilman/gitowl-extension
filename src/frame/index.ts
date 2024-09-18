const BASE_URL = import.meta.env.VITE_BASE_URL;

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

// Listen to messages from the main script, remove `closed` query param on open.
// Navigation within the iframe doesn't result in update of the iframe src, thus
// once the iframe has been opened, will not update the src again, to avoid
// resetting the iframe to its initial URL.
window.addEventListener("message", (event) => {
  if (event.data === "gitowl-open") {
    log("message received opening");
    const url = new URL(iframe.src);
    if (!url.searchParams.has("closed")) {
      return;
    }
    url.searchParams.delete("closed");
    iframe.src = url.toString();
    return;
  }
});

log("frame script loaded");
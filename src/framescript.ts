/**
 * Script injected into the frame.html.
 * Responsible for:
 * - constructing GitOwl URL from its `path` query param
 * - injecting the GitOwl iframe
 * - listening to `gitowl-open` message from main script and updating the iframe src
 */


const baseURL = "https://gitowl.dev/git"

const urlSearchParams = new URLSearchParams(window.location.search)
const encodedPath = urlSearchParams.get("path")
let path = "/"
if (encodedPath) {
  path = atob(encodedPath)
}

// Inject the iframe
const iframe = document.createElement("iframe")
iframe.src = baseURL + path
iframe.style.width = "100%"
iframe.style.minHeight = "100vh"
iframe.style.border = "none"
iframe.style.margin = "0"

document.body.appendChild(iframe)

// Listen to messages from the main script, remove `closed` query param on open.
// Navigation within the iframe doesn't result in update of the iframe src, thus
// once the iframe has been opened, will not update the src again, to avoid
// resetting the iframe to its initial URL.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "gitowl-open") {
    console.log("message received opening")
    const url = new URL(iframe.src)
    if (!url.searchParams.has("closed")) {
      return
    }
    url.searchParams.delete("closed")
    iframe.src = url.toString()
    return
  }
})

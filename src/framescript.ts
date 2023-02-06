
const baseURL = "https://staging.gitowl.dev/git"

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
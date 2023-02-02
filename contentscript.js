
const StorageKey = {
  drawerWidth: "drawerWidth",
  drawerIsOpen: "drawerIsOpen"
}

const Config = {
  version: chrome.runtime.getManifest().version,
  baseURL: "https://staging.gitowl.dev/git/",
  minDrawerWidth: 350,
  ignorePaths: ["settings", "pulls", "codespaces", "marketplace", "explore", "notifications", "topic", "login"],
  debug: true,
  drawerWidth() {
    const w = localStorage.getItem(StorageKey.drawerWidth) || Config.minDrawerWidth + "px"
    log("retrieved drawer width", w)
    return w
  },
  setDrawerWidth(width) {
    localStorage.setItem(StorageKey.drawerWidth, width)
    log("set drawer width", width)
  },
  drawerIsOpen() {
    if (!getCurrentBasePath()) return false
    const isOpen = localStorage.getItem(StorageKey.drawerIsOpen)
    if (isOpen) return isOpen === "true"
    return true
  },
  setDrawerIsOpen(isOpen) {
    localStorage.setItem(StorageKey.drawerIsOpen, isOpen)
    log("set drawer is open", isOpen)
  }
}

function log (...args) {
  if (Config.debug) { console.log(...args) }
}

if (!window.ghAnalytics && window.location.href.includes("github.com")) {
  window.ghAnalytics = {}
  run()
} else {
  log("content script already loaded")
}

function run() {
  const components = createComponents()

  const root = document.querySelector(":root")

  if (Config.drawerIsOpen()) {
    root.style.setProperty("--owl-drawer-width", Config.drawerWidth())
  }

  components.button.onclick = () => {
    const curValue = root.style.getPropertyValue("--owl-drawer-width")
    const isOpening = curValue === "0px" || curValue === ""
    root.style.setProperty("--owl-drawer-width", isOpening ? Config.drawerWidth() : "0px")
    Config.setDrawerIsOpen(isOpening)
  }

  const onMouseMove = (event) => {
    const width = document.body.clientWidth - event.clientX
    if (width < Config.minDrawerWidth) return
    const widthPx = `${width}px`
    root.style.setProperty("--owl-drawer-width", widthPx)
    Config.setDrawerWidth(widthPx)
  }

  components.drag.addEventListener("mousedown", () => {
    document.body.style.userSelect = "none"
    document.addEventListener("mousemove", onMouseMove)
  })

  document.addEventListener("mouseup", () => {
    document.body.style.userSelect = "auto"
    document.removeEventListener("mousemove", onMouseMove)
  })

  listenToPathChange((path) => {
    log("path changed", path)
    components.drawer.removeChild(components.iframe)
    components.iframe = createIframe()
    components.drawer.prepend(components.iframe)
    if (Config.drawerIsOpen()) {
      root.style.setProperty("--owl-drawer-width", Config.drawerWidth())
    }
  })
}

function createComponents() {
  const button = createButton()
  document.body.appendChild(button)

  const drawer = createDrawer()
  const iframe = createIframe()
  drawer.appendChild(iframe)

  const drag = createDraggableWall()
  drawer.appendChild(drag)

  document.body.appendChild(drawer)
  return { button, drawer, iframe, drag }
}

function createButton() {
  const b = document.createElement("button")
  b.classList.add("owl-button")

  const text = document.createElement("div")
  text.innerText = "Git Owl"
  text.classList.add("owl-button-text")
  b.appendChild(text)

  return b
}

function createDrawer() {
  const div = document.createElement("div")
  div.classList.add("owl-drawer")
  return div
}

function createDraggableWall() {
  const div = document.createElement("div")
  div.classList.add("owl-draggable-wall")
  return div
}


function createIframe() {
  const iframe = document.createElement("iframe")
  iframe.src = getIframeSrc()
  log("created iframe with src", iframe.src)
  iframe.classList.add("owl-iframe")
  return iframe
}

function listenToPathChange(callback) {
  let currentPath = getCurrentBasePath()
  const observer = new MutationObserver(() => {
    const newPath = getCurrentBasePath()
    if (newPath !== "" && newPath !== currentPath) {
      currentPath = newPath
      callback(currentPath)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function getIframeSrc() {
  const path = getCurrentBasePath()
  if (path === "") {
    return Config.baseURL
  }
  return Config.baseURL + path + "?v=" + Config.version
}

function getCurrentBasePath() {
  const path = location.pathname
  // path -> split
  // /owner/repo -> ["", "owner", "repo"]
  // /owner -> ["", "owner"]
  // /owner/repo/pulls -> ["", "owner", "repo", "pulls"]
  const split = path.split("/")
  if (split.length < 1) {
    return ""
  }
  if (Config.ignorePaths.includes(split[1])) {
    return ""
  }
  if (split.length === 2) {
    return split[1]
  }
  return split[1] + "/" + split[2]
}

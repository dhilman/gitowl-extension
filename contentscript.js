
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

if (shouldRun()) {
  window.ghAnalytics = {}
  run()
} else {
  log("content script already loaded")
}


function shouldRun() {
  if (window.ghAnalytics) return false
  href = window.location.href
  if (href.includes("github.com")) return true
  if (href.includes("npmjs.com")) return true
  if (href.includes("pypi.org")) return true
  return false
}

function run() {
  const components = createComponents()

  componentOpenCloseSetup(components)

  components.button.onclick = () => {
    componentsOpenCloseToggle(components)
  }

  const onMouseMove = (event) => {
    const width = document.body.clientWidth - event.clientX
    if (width < Config.minDrawerWidth) return
    const widthPx = `${width}px`
    components.drawer.style.width = widthPx
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
  })
}

function componentsOpenCloseToggle(components) {
  if (Config.drawerIsOpen()) {
    closeDrawer(components)
    Config.setDrawerIsOpen(false)
  } else {
    openDrawer(components)
    Config.setDrawerIsOpen(true)
  }
}

function componentOpenCloseSetup(components) {
  if (Config.drawerIsOpen()) {
    openDrawer(components)
  } else {
    closeDrawer(components)
  }
}

function openDrawer(components) {
  components.drawer.classList.remove("owl-translate-x-0")
  components.drawer.classList.add("owl-translate-x-full")
}

function closeDrawer(components) {
  components.drawer.classList.remove("owl-translate-x-full")
  components.drawer.classList.add("owl-translate-x-0")
}

function createComponents() {
  const drawer = createDrawer()

  const button = createButton()
  drawer.appendChild(button)

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
  div.style.width = Config.drawerWidth()
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
  let path = ""
  if (location.hostname === "github.com") {
    path = location.pathname
  } else if (location.hostname === "www.npmjs.com") {
    const repoLinkElement = document.querySelector('[aria-labelledby*="repository-link"]')
    if (!repoLinkElement) return ""
    if (!repoLinkElement.href) return ""
    path = new URL(repoLinkElement.href).pathname
  } else if (location.hostname === "pypi.org") {
    const repoLinkElementChild = document.querySelector(".fa-github")
    if (!repoLinkElementChild) return ""
    const repoLinkElement = repoLinkElementChild.parentElement
    if (!repoLinkElement) return ""
    if (!repoLinkElement.href) return ""
    path = new URL(repoLinkElement.href).pathname
  }

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

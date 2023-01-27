
const StorageKey = {
  drawerWidth: "drawerWidth",
  drawerIsOpen: "drawerIsOpen"
}

const Config = {
  baseURL: "https://gitowl.dev/",
  minDrawerWidth: 350,
  drawerWidth() {
    return localStorage.getItem(StorageKey.drawerWidth) || Config.minDrawerWidth + "px"
  },
  setDrawerWidth(width) {
    localStorage.setItem(StorageKey.drawerWidth, width)
  },
  drawerIsOpen() {
    if (!getOwnerRepoString()) return false
    const isOpen = localStorage.getItem(StorageKey.drawerIsOpen)
    if (isOpen) return isOpen === "true"
    return true
  },
  setDrawerIsOpen(isOpen) {
    localStorage.setItem(StorageKey.drawerIsOpen, isOpen)
  }
}

if (!window.ghAnalytics && window.location.href.includes("github.com")) {
  window.ghAnalytics = {}
  run()
} else {
  console.log("content script already loaded")
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
    components.iframe.src = getIframeSrc()
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
  iframe.classList.add("owl-iframe")
  return iframe
}

function listenToPathChange(callback) {
  let currentPath = getOwnerRepoString()
  const observer = new MutationObserver(() => {
    const newPath = getOwnerRepoString()
    if (newPath !== "" && newPath !== currentPath) {
      currentPath = newPath
      callback(currentPath)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function getIframeSrc() {
  const ownerRepo = getOwnerRepoString()
  if (ownerRepo === "") {
    return Config.baseURL
  }
  return Config.baseURL + "?url=" + ownerRepo
}

function getOwnerRepoString() {
  const path = location.pathname
  const split = path.split("/")
  if (split.length < 3) {
    return ""
  }
  if (split[1] === "topic") {
    return ""
  }
  return split[1] + "/" + split[2]
}

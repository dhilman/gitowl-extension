
const StorageKey = {
  drawerWidth: "drawerWidth",
  drawerIsOpen: "drawerIsOpen"
}

const Config = {
  baseURL: "https://gitapp.dhilman.com/",
  drawerWidth() {
    return localStorage.getItem(StorageKey.drawerWidth) || "300px"
  },
  setDrawerWidth(width) {
    localStorage.setItem(StorageKey.drawerWidth, width)
  },
  drawerIsOpen() {
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

  components.button.onclick = () => {
    const isOpening = components.drawer.style.display === "none"
    components.drawer.style.display = isOpening ? "block" : "none"
    components.button.style.right = isOpening ? components.drawer.style.width : "0"
    Config.setDrawerIsOpen(isOpening)
  }

  const onMouseMove = (event) => {
    const width = `${document.body.clientWidth - event.clientX}px`
    components.drawer.style.width = width
    components.button.style.right = width
    Config.setDrawerWidth(width)
  }

  components.drag.addEventListener("mousedown", () => {
    components.drag.style.width = "100%"
    components.drag.style.opacity = "0.1"
    document.addEventListener("mousemove", onMouseMove)
  })

  document.addEventListener("mouseup", () => {
    components.drag.style.width = "4px"
    components.drag.style.opacity = "0.5"
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
  /** @type {CSSStyleDeclaration} */
  const styles = {
    position: "fixed",
    top: "10%",
    right: Config.drawerIsOpen() ? Config.drawerWidth() : "0",
    padding: "0.5rem",
    border: "none",

    borderTopLeftRadius: "0.375rem",
    borderBottomLeftRadius: "0.375rem",

    background: "dodgerblue",
  }
  Object.assign(b.style, styles)

  b.onmouseover = () => {
    b.style.background = "royalblue"
  }
  b.onmouseout = () => {
    b.style.background = "dodgerblue"
  }

  const text = document.createElement("div")
  text.innerText = "Git Owl"
  /** @type {CSSStyleDeclaration} */
  const textStyles = {
    color: "white",
    writingMode: "tb",
    transform: "rotate(180deg)",
    fontWeight: "600",
    fontSize: "1.1rem",
  }
  Object.assign(text.style, textStyles)

  b.appendChild(text)

  return b
}

function createDrawer() {
  const div = document.createElement("div")
  /** @type {CSSStyleDeclaration} */
  const styles = {
    position: "fixed",
    display: Config.drawerIsOpen() ? "block" : "none",
    top: "0",
    right: "0",
    width: Config.drawerWidth(),
    height: "100%",
    zIndex: 200,
    boxShadow: "rgb(0 0 0 / 64%) 0px 10px 20px",
  }
  Object.assign(div.style, styles)
  return div
}

function createDraggableWall() {
  const div = document.createElement("div")
  /** @type {CSSStyleDeclaration} */
  const styles = {
    position: "fixed",
    top: "0",
    width: "4px",
    opacity: "0.5",
    height: "100%",
    zIndex: 250,
    backgroundColor: "gray",
    cursor: "ew-resize",
  }
  Object.assign(div.style, styles)
  return div
}


function createIframe() {
  const iframe = document.createElement("iframe")
  iframe.src = getIframeSrc()
  /** @type {CSSStyleDeclaration} */
  const styles = {
    width: "100%",
    height: "100%",
    margin: "0",
    padding: "0",
    border: "none",
  }
  Object.assign(iframe.style, styles)
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
  return split[1] + "/" + split[2]
}

const StorageKey = {
  drawerWidth: "git-owl-drawer-width",
  drawerIsOpen: "git-owl-drawer-is-open",
}

function getFrameBaseSrc() {
  return chrome.runtime.getURL("frame.html")
}

export const Config = {
  minDrawerWidth: 300,
  version: chrome.runtime.getManifest().version,
  frameBaseSrc: getFrameBaseSrc(),
  websites: ["github.com", "npmjs.com", "pypi.org"],
  ignorePaths: ["settings", "pulls", "codespaces", "marketplace", "explore", "notifications", "topic", "login"],
  debug: true,
}

export function log(...args: any) {
  if (Config.debug) {
    console.log(...args)
  }
}

export function drawerWidth() {
  const w = localStorage.getItem(StorageKey.drawerWidth) || Config.minDrawerWidth + "px"
  log("retrieved drawer width", w)
  return w
}

export function setDrawerWidth(width: string) {
  localStorage.setItem(StorageKey.drawerWidth, width)
  log("set drawer width", width)
}

export function drawerIsOpen() {
  if (!getCurrentPath()) return false
  const isOpen = localStorage.getItem(StorageKey.drawerIsOpen)
  if (isOpen) return isOpen === "true"
  return true
}

export function setDrawerIsOpen(isOpen: boolean) {
  localStorage.setItem(StorageKey.drawerIsOpen, String(isOpen))
  log("set drawer is open", isOpen)
}

const WebsitePathFinder = {
  github: () => {
    return location.pathname
  },
  npmjs: () => {
    const repoLinkElement = document.querySelector('[aria-labelledby*="repository-link"]')
    if (!repoLinkElement) return ""
    const href = repoLinkElement.getAttribute("href")
    if (!href) return ""
    return new URL(href).pathname
  },
  pypi: () => {
    let href = getHrefFromParent(".fa-github")
    if (href) return new URL(href).pathname

    href = getHrefFromParent(".fa-star")
    if (href) return new URL(href).pathname

    return ""
  }
}

function getHrefFromParent(query: string) {
  const element = document.querySelector(query)
  if (!element) return ""
  const href = element.parentElement.getAttribute("href")
  if (!href) return ""
  return href
}

export function getFrameSrc() {
  const path = getCurrentPath()
  if (!path) return Config.frameBaseSrc
  const b64 = btoa(path)
  return `${Config.frameBaseSrc}?path=${b64}&v=${Config.version}`
}

export function listenToPathChange(callback: () => void) {
  let currentPath = getCurrentPath()
  const observer = new MutationObserver(() => {
    const newPath = getCurrentPath()
    if (newPath !== "" && newPath !== currentPath) {
      currentPath = newPath
      callback()
    }
  })
  observer.observe(document.body, {childList: true, subtree: true})
}

/**
 * Returns the path to the element of interest on the current website.
 * On github.com, this is the website path (user or repository).
 * On npmjs.com and pypi.org, finds the link to the repository and returns its path.
 */
function getCurrentPath(): string {
  let path = ""
  if (location.hostname === "github.com") {
    path = WebsitePathFinder.github()
  } else if (location.hostname === "www.npmjs.com") {
    path = WebsitePathFinder.npmjs()
  } else if (location.hostname === "pypi.org") {
    path = WebsitePathFinder.pypi()
  }
  return path
}

const StorageKey = {
  drawerWidth: "git-owl-drawer-width",
  drawerIsOpen: "git-owl-drawer-is-open",
}

function getFrameBaseSrc() {
  return chrome.runtime.getURL("frame.html")
}

const manifest = chrome.runtime.getManifest()

export const Config = {
  minDrawerWidth: 300,
  version: manifest.version,
  frameBaseSrc: getFrameBaseSrc(),
  websites: ["github.com", "npmjs.com", "pypi.org"],
  ignorePaths: ["settings", "pulls", "codespaces", "marketplace", "explore", "notifications", "topic", "login"],
  debug: (manifest.update_url === undefined),
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
    const path = location.pathname
    for (const ignorePath of Config.ignorePaths) {
      if (path.startsWith(`/${ignorePath}`)) return ""
    }
    return path
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
 * On github.com, this is the URL path (user or repository).
 * On npmjs.com and pypi.org, tries to find the link to the repository and returns its path.
 */
export function getCurrentPath(): string {
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

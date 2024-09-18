/**
 * Returns the path to be used for the GitOwl iframe.
 * Either the repository or user name.
 * Uses different strategies to find the path based on the website.
 */
export function getCurrentPath() {
  if (location.hostname === "github.com") {
    return github();
  } else if (location.hostname === "www.npmjs.com") {
    return npmjs();
  } else if (location.hostname === "pypi.org") {
    return pypi();
  }
  return "";
}

const GITHUB_IGNORE_PATHS = [
  "/settings",
  "/pulls",
  "/codespaces",
  "/marketplace",
  "/explore",
  "/notifications",
  "/topic",
  "/login",
];

function github() {
  const path = location.pathname;
  if (GITHUB_IGNORE_PATHS.some((v) => path.startsWith(v))) return "";
  return path;
}

function npmjs() {
  const repoLinkElement = document.querySelector(
    '[aria-labelledby*="repository-link"]'
  );
  if (!repoLinkElement) return "";
  const href = repoLinkElement.getAttribute("href");
  if (!href) return "";
  return new URL(href).pathname;
}

function pypi() {
  let href = getHrefFromParent(".fa-github");
  if (href) return new URL(href).pathname;

  href = getHrefFromParent(".fa-star");
  if (href) return new URL(href).pathname;

  return "";
}

function getHrefFromParent(query: string) {
  const element = document.querySelector(query);
  if (!element) return "";
  const href = element.parentElement?.getAttribute("href");
  if (!href) return "";
  return href;
}

import Components from "./components";
import {Config, log} from "./utils";

if (shouldRun()) {
  // @ts-ignore
  window.gitowl = {}
  run()
} else {
  log("content script already loaded")
}

function shouldRun() {
  // @ts-ignore
  if (window.gitowl) return false
  for (const website of Config.websites) {
    if (location.href.includes(website)) return true
  }
  return false
}

function run() {
  const components = new Components()

  components.setup()
}


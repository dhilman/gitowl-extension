import Drawer from "@/content/drawer";
import { render } from "preact";

console.log("frame script");

function setup() {
  const appFrame = getOrCreateAppFrame();

  console.log("rendering app frame");
  render(<Drawer />, appFrame);
}

function getOrCreateAppFrame() {
  const appFrame = document.querySelector("#gitowl-frame");
  if (appFrame) return appFrame;

  console.log("creating app frame");
  const newAppFrame = document.createElement("div");
  newAppFrame.id = "gitowl-frame";
  document.body.appendChild(newAppFrame);
  return newAppFrame;
}

setup();

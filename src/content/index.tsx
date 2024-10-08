import Drawer from "@/content/drawer";
import { log } from "@/content/log";
import { render } from "preact";
import styles from "./styles.css?inline";

function setup() {
  const appFrame = getOrCreateAppFrame();

  log("rendering app frame");
  render(
    <>
      <style>{styles}</style>
      <Drawer />
    </>,
    appFrame
  );
}

function getOrCreateAppFrame() {
  const appFrame = document.querySelector("#gitowl-frame");
  if (appFrame) return appFrame;

  log("creating app frame");
  const newAppFrame = document.createElement("div");
  newAppFrame.id = "gitowl-frame";
  document.body.appendChild(newAppFrame);
  return newAppFrame;
}

setup();

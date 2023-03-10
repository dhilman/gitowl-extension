import "./styles.css";
import {
  Config,
  drawerIsOpen,
  drawerWidth,
  getCurrentPath,
  listenToPathChange,
  setDrawerIsOpen,
  setDrawerWidth
} from "./utils";

export default class Components {
  button: HTMLButtonElement;
  drawer: HTMLDivElement;
  wall: HTMLDivElement;
  frame: HTMLIFrameElement;

  constructor() {
    this._createButton();
    this._createDrawer();
    this._createWall();
    this._createFrame();

    this.drawer.appendChild(this.button);
    this.drawer.appendChild(this.wall);
    this.drawer.appendChild(this.frame);
  }

  onMouseMove(e: MouseEvent) {
    const width = document.body.clientWidth - e.clientX;
    if (width < Config.minDrawerWidth) return;
    const widthPx = width + "px";
    setDrawerWidth(widthPx);
    this.drawer.style.width = widthPx;
  }

  setup() {
    document.body.appendChild(this.drawer);

    this.button.addEventListener("click", () => this.openToggle());

    const onMouseMove = this.onMouseMove.bind(this);

    this.wall.addEventListener("mousedown", () => {
      const defaultUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", () => {
        document.body.style.userSelect = defaultUserSelect;
        document.removeEventListener("mousemove", onMouseMove);
      }, { once: true })
    })

    listenToPathChange(() => {
      this.frame.contentWindow.location.replace(this.createFrameSrc());
    })

  }

  openToggle() {
    if (this.isOpen()) {
      this.close();
      setDrawerIsOpen(false);
      return
    }
    this.open();
    setDrawerIsOpen(true);
  }

  sendMessage(message: string) {
    chrome.runtime.sendMessage( message );
  }

  isOpen() {
    return this.drawer.classList.contains("owl-translate-x-0");
  }

  open() {
    this.sendMessage("gitowl-open")
    this.drawer.classList.remove("owl-translate-x-full");
    this.drawer.classList.add("owl-translate-x-0");
  }

  close() {
    this.drawer.classList.remove("owl-translate-x-0");
    this.drawer.classList.add("owl-translate-x-full");
  }

  _createButton() {
    const el = document.createElement('button');
    el.classList.add('owl-button');
    el.innerText = "Git Owl";
    this.button = el;
  }

  _createDrawer() {
    const el = document.createElement('div');
    el.classList.add('owl-drawer');
    el.style.width = drawerWidth();

    this.drawer = el;

    drawerIsOpen() ? this.open() : this.close();
  }

  _createWall() {
    const el = document.createElement('div');
    el.classList.add('owl-draggable-wall');

    this.wall = el;
  }

  _createFrame() {
    const el = document.createElement('iframe');
    el.classList.add('owl-iframe');
    el.src = this.createFrameSrc();

    this.frame = el;
  }

  /**
   * Creates the src for iframe, query param `path` is the base64 encoded path/suffix
   * to be appended to the base GitOwl URL by frame script.
   *
   * Query param `closed` is used to indicate whether the **initial** state of the drawer.
   */
  createFrameSrc() {
    const closed = !this.isOpen()
    const path = getCurrentPath()
    const pathWithVersionQuery = `${path}?v=${Config.version}&closed=${closed}`
    const b64 = btoa(pathWithVersionQuery)
    return `${Config.frameBaseSrc}?path=${b64}`
  }

}

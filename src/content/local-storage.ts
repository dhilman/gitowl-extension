namespace LocalStorageKeys {
  export const DRAWER_WIDTH_PX = "git-owl-drawer-width";
  export const DRAWER_BTN_TOP_PCT = "git-owl-btn-top";
  export const DRAWER_IS_OPEN = "git-owl-drawer-is-open";
}

const DEFAULT_DRAWER_WIDTH = 350;
const DEFAULT_DRAWER_BTN_TOP = 10;

export class LocalStorage {
  static getDrawerWidth() {
    const width = localStorage.getItem(LocalStorageKeys.DRAWER_WIDTH_PX);
    if (width) {
      return safeParseFloat(width) || DEFAULT_DRAWER_WIDTH;
    }
    return DEFAULT_DRAWER_WIDTH;
  }

  static setDrawerWidth(width: number) {
    localStorage.setItem(LocalStorageKeys.DRAWER_WIDTH_PX, width.toFixed(2));
  }

  static getDrawerBtnTop() {
    const top = localStorage.getItem(LocalStorageKeys.DRAWER_BTN_TOP_PCT);
    if (top) {
      return safeParseFloat(top) || DEFAULT_DRAWER_BTN_TOP;
    }
    return DEFAULT_DRAWER_BTN_TOP;
  }

  static setDrawerBtnTop(top: number) {
    localStorage.setItem(LocalStorageKeys.DRAWER_BTN_TOP_PCT, top.toFixed(2));
  }

  static getDrawerIsOpen() {
    return localStorage.getItem(LocalStorageKeys.DRAWER_IS_OPEN) === "true";
  }

  static setDrawerIsOpen(isOpen: boolean) {
    localStorage.setItem(LocalStorageKeys.DRAWER_IS_OPEN, isOpen.toString());
  }
}

function safeParseFloat(value: string) {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return null;
  }
  return parsed;
}

import { CONFIG } from "@/content/config";

export class LocalStorage {
  static drawerWidthKey = "git-owl-drawer-width";
  static drawerIsOpenKey = "git-owl-drawer-is-open";

  static getDrawerWidth() {
    return (
      localStorage.getItem(this.drawerWidthKey) || CONFIG.DEFAULT_DRAWER_WIDTH
    );
  }

  static setDrawerWidth(width: string) {
    localStorage.setItem(this.drawerWidthKey, width);
  }

  static getDrawerIsOpen() {
    return localStorage.getItem(this.drawerIsOpenKey) === "true";
  }

  static setDrawerIsOpen(isOpen: boolean) {
    localStorage.setItem(this.drawerIsOpenKey, isOpen.toString());
  }
}

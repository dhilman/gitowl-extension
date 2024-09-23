const BASE_URL = import.meta.env.VITE_BASE_URL;

chrome.runtime.setUninstallURL(BASE_URL + "/uninstall");

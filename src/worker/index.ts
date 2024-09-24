const BASE_URL = import.meta.env.VITE_BASE_URL;

chrome.runtime.setUninstallURL(BASE_URL + "/uninstall");

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (!isExternalMessage(message)) return;
    if (message.action === "store-token") {
      chrome.storage.local.set({ token: message.token });
      return;
    }
    if (message.action === "delete-token") {
      chrome.storage.local.remove("token");
      return;
    }
  }
);

type ExternalMessage =
  | {
      action: "store-token";
      token: string;
    }
  | {
      action: "delete-token";
    };

function isExternalMessage(message: any): message is ExternalMessage {
  if (typeof message !== "object" || message === null) return false;
  return (
    message?.action === "store-token" || message?.action === "delete-token"
  );
}

import { getExtensionIframe } from "@/content/drawer";
import { log } from "@/content/log";

const State = {
  ackListener: null,
  messageId: null,
} as {
  ackListener: null | ((e: MessageEvent) => void);
  messageId: null | number;
};

interface GitowlMessage {
  id: number;
  type: "gitowl";
  path: string;
  isOpen: boolean;
}

export function sendMessage(message: GitowlMessage) {
  if (State.ackListener) {
    log("removing old ack listener");
    window.removeEventListener("message", State.ackListener);
  }

  State.messageId = message.id;

  function handleAck(event: MessageEvent) {
    if (!isAckMessage(event.data)) return;
    if (event.data.id !== State.messageId) return;
    log("message ack", message.id);
    State.ackListener = null;
    State.messageId = null;
    window.removeEventListener("message", handleAck);
  }

  State.ackListener = handleAck;
  window.addEventListener("message", handleAck);
  postMessageWithRetry(message, 500);
}

function postMessageWithRetry(message: GitowlMessage, initialBackoff: number) {
  if (State.messageId !== message.id) {
    log("stopping message sending", message.id);
    return;
  }
  log("posting message", message);
  const iframe = getExtensionIframe();
  iframe.contentWindow?.postMessage(message, "*");
  setTimeout(
    () => postMessageWithRetry(message, initialBackoff * 2),
    initialBackoff
  );
}

interface AckMessage {
  id: number;
  type: "gitowl-ack";
}

function isAckMessage(eventData: any): eventData is AckMessage {
  return (
    typeof eventData === "object" &&
    eventData.type === "gitowl-ack" &&
    typeof eventData.id === "number"
  );
}

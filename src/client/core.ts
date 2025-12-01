import type { CursorMessage, InitMessage, ServerMessage } from "../server/types.js";
import type { CursorClientOptions } from "./types.js";

// Creates a WebSocket connection to the server and handles sending and receiving cursor messages
export function createCursorConnection(options: CursorClientOptions): void {
  const { url, userId, pageId, onCursor, onLeave } = options; // Destructure options
  const throttleMs = options.throttleMs ?? 0; 

  const ws = new WebSocket(url);

  let resolvedUserId = userId;
  let resolvedPageId = pageId;
  let lastSent = 0;

  const handleMouseMove = (event: MouseEvent) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const now = performance.now();
    if (now - lastSent < throttleMs) return;
    lastSent = now;

    const message: CursorMessage = {
      type: "cursor",
      x: event.clientX,
      y: event.clientY,
      userId: resolvedUserId,
      pageId: resolvedPageId,
    };

    ws.send(JSON.stringify(message));
  };

  ws.onopen = () => {
    console.log("[mirromaus] connected to", url);
    const initMessage: InitMessage = {
      type: "init",
      userId: resolvedUserId,
      pageId: resolvedPageId,
    };
    ws.send(JSON.stringify(initMessage));
    window.addEventListener("mousemove", handleMouseMove);
  };

  ws.onmessage = (event) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      return;
    }

    const msg = parsed as ServerMessage;
    if (msg.type === "init-ack") {
      resolvedUserId = msg.userId;
      if (msg.pageId) {
        resolvedPageId = msg.pageId;
      }
      return;
    }
    if (msg.type === "cursor-leave") {
      onLeave?.(msg);
      return;
    }
    if (msg.type !== "cursor") return;

    onCursor?.(msg);
  };

  const cleanup = () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };

  ws.onclose = cleanup;
  ws.onerror = () => {
    cleanup();
  };
}

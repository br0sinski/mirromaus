import type { CursorMessage } from "../server/types.js";
import type { CursorClientOptions } from "./types.js";

// Creates a WebSocket connection to the server and handles sending and receiving cursor messages
export function createCursorConnection(options: CursorClientOptions): void {
  const { url, userId, pageId, onCursor } = options; // Destructure options
  const throttleMs = options.throttleMs ?? 750; 

  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[mirromaus] connected to", url);
  };

  ws.onmessage = (event) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      return;
    }

    const msg = parsed as CursorMessage;
    if (msg.type !== "cursor") return;

    onCursor?.(msg);
  };

  let lastSent = 0;

  window.addEventListener("mousemove", (event) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const now = performance.now();
    if (now - lastSent < throttleMs) return;
    lastSent = now;

    const message: CursorMessage = {
      type: "cursor",
      x: event.clientX,
      y: event.clientY,
      userId,
      pageId,
    };

    ws.send(JSON.stringify(message));
  });
}

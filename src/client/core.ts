import type { CoordinateSpace, CursorMessage, InitMessage, ServerMessage } from "../shared/types.js";
import type { CursorClientOptions } from "./types.js";

// Creates a WebSocket connection to the server and handles sending and receiving cursor messages
export function createCursorConnection(options: CursorClientOptions): void {
  const { url, userId, pageId, trackingElement, onCursor, onLeave} = options; // Destructure options
  const throttleMs = options.throttleMs ?? 0; 

  const ws = new WebSocket(url);

  let resolvedUserId = userId;
  let resolvedPageId = pageId;
  let lastSent = 0;

  // Determine the active tracking element - either the provided one or null for viewport tracking
  const activeTrackingElement = trackingElement ?? null;
  const coordinateSpace: CoordinateSpace = activeTrackingElement ? "element" : "viewport";

  // Define the target for mousemove events based on tracking element
  const target: EventTarget & {
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
  } = (activeTrackingElement ?? window) as typeof window;

  /* Handle mouse move events and send cursor position messages depending on:
    * - Throttling settings
    * - Coordinate space (viewport vs element)
    * - User and page identifiers
    * 
    * definertly not the cleanest option but it gets the job done for now
  */
  const handleMouseMove = (event: MouseEvent) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const now = performance.now();
    if (now - lastSent < throttleMs) return;
    lastSent = now;

    let x = event.clientX;
    let y = event.clientY;
    if (activeTrackingElement) {
      const rect = activeTrackingElement.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const message: CursorMessage = {
      type: "cursor",
      x,
      y,
      userId: resolvedUserId,
      pageId: resolvedPageId,
      space: coordinateSpace,
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
    target.addEventListener("mousemove", handleMouseMove);
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
    target.removeEventListener("mousemove", handleMouseMove);
  };

  ws.onclose = cleanup;
  ws.onerror = () => {
    cleanup();
  };
}

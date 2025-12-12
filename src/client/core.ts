import type { CoordinateSpace, CursorMessage, InitMessage, ServerMessage } from "../shared/types.js";
import type { CursorClientOptions } from "./types.js";

// Creates a WebSocket connection to the server and handles sending and receiving cursor messages
export function createCursorConnection(options: CursorClientOptions): void {
  const { url, userId, pageId, trackingElement, onCursor, onLeave } = options; // Destructure options
  const throttleMs = options.throttleMs ?? 0;

  // Validate URL
  if (!url || typeof url !== 'string') {
    throw new Error('[mirromaus] Invalid URL: url must be a non-empty string');
  }
  if (!isValidWebSocketUrl(url)) {
    throw new Error('[mirromaus] Invalid WebSocket URL: must be ws:// or wss://');
  }

  // Validate throttleMs
  if (throttleMs < 0) {
    throw new Error('[mirromaus] Invalid throttleMs: must be >= 0');
  }
  if (!Number.isFinite(throttleMs)) {
    throw new Error('[mirromaus] Invalid throttleMs: must be a finite number');
  }

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

  console.log("Just for Debug Purposes:")
  console.log("url: ", url);
  console.log("pageId: ", pageId);
  console.log("throttleMs: ", throttleMs);
  console.log("trackingElement: ", trackingElement);
  console.log("activeTrackingElement: ", activeTrackingElement);
  console.log("coordinateSpace: ", coordinateSpace);

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


    // relative x and y coordinates to the tracking element, if applicable
    let relativeX: number | undefined;
    let relativeY: number | undefined;
    if (activeTrackingElement) {
      const rect = activeTrackingElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        x = localX;
        y = localY;


        // most important part 
        // calculates the relative coordinates within the element and sends that along
        // since every user might have different scaling / sizes for the element
        relativeX = clamp01(localX / rect.width);
        relativeY = clamp01(localY / rect.height);
      } else {
        console.warn("[mirromaus] Tracking element has no size; falling back to viewport coordinates.");
      }
    }

    const message: CursorMessage = {
      type: "cursor",
      x,
      y,
      userId: resolvedUserId,
      pageId: resolvedPageId,
      space: coordinateSpace,
      relativeX,
      relativeY,
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
    } catch (error) {
      console.error('[mirromaus] Failed to parse message:', error);
      return;
    }

    if (!parsed || typeof parsed !== 'object') {
      console.error('[mirromaus] Invalid message format: expected object');
      return;
    }

    const msg = parsed as ServerMessage;
    if (!msg.type) {
      console.error('[mirromaus] Invalid message: missing type field');
      return;
    }

    if (msg.type === "init-ack") {
      if (typeof msg.userId !== 'string') {
        console.error('[mirromaus] Invalid init-ack message: userId must be string');
        return;
      }
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
    if (msg.type !== "cursor") {
      console.warn('[mirromaus] Unknown message type:', (msg as any).type);
      return;
    }

    if (typeof msg.x !== 'number' || typeof msg.y !== 'number') {
      console.error('[mirromaus] Invalid cursor message: x and y must be numbers');
      return;
    }

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

// validates if a string is a valid WebSocket URL

function isValidWebSocketUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
  } catch {
    return false;
  }
}
// 
function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
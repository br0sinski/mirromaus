import { createCursorConnection } from "./core.js";
import type { CursorDomClientOptions } from "./types.js";
import type { CursorMessage } from "../server/types.js";


// Here is where the magic happens - we actually render the cursors in the DOM
export function startDomCursors(options: CursorDomClientOptions): void {
 /**
  * 
  * Starts rendering remote cursors in the DOM based on received cursor messages
  * @param options Configuration options for the cursor DOM client
  * url - WebSocket server URL
  * userId - Optional user identifier
  * pageId - Optional page identifier
  * throttleMs - Optional throttle interval for sending cursor messages - higher means less messages and thus laggier/less accurate in the rendering
  * container - Optional DOM element to contain the cursor elements - defaults to document.body, but should be replaced in pracitce
  * smoothMs - Optional smoothing duration in milliseconds for cursor movement transitions - higher means smoother but more laggy
  */
  const {
    url,
    userId,
    pageId,
    throttleMs,
    container = document.body,
    smoothMs = 120,
  } = options;

  // For now fine, in future should be replaced by a database or backend or whatever
  const cursors = new Map<string, HTMLDivElement>();

  // Inject default styles for cursor elements
  injectDefaultCursorStyles(smoothMs);

  // Adds a mapped cursor element for a given user ID
  function getOrCreateCursor(userId: string): HTMLDivElement {
    let el = cursors.get(userId);
    if (!el) {
    // Create a new cursor element for the user if it doesn't exist
      el = document.createElement("div");
      el.className = "mirromaus-cursor";
      container.appendChild(el);
      cursors.set(userId, el);
    }

    return el;
  }

  // Handles incoming cursor messages and updates the corresponding cursor element's position
  function handleRemoteCursor(msg: CursorMessage) {
    const id = msg.userId ?? "Error: no userId (no backend?)";
    const el = getOrCreateCursor(id);
    el.style.transform = `translate(${msg.x}px, ${msg.y}px)`;
    console.log(`[mirromaus] cursor from ${id} at (${msg.x}, ${msg.y})`);
  }
    // Create the WebSocket connection and set up message handling
  createCursorConnection({
    url,
    userId,
    pageId,
    throttleMs,
    onCursor: handleRemoteCursor,
  });
}

// Injects default CSS styles for cursor elements into the document head - can be customized or replaced
// maybe I should allow using a custom element for the cursor?
function injectDefaultCursorStyles(smoothMs: number) {
  if (document.getElementById("mirromaus-cursor-style")) return;

  const style = document.createElement("style");
  style.id = "mirromaus-cursor-style";
  style.textContent = `
    .mirromaus-cursor {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      background: rgba(0, 255, 115, 0.9);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform ${smoothMs}ms linear;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
}

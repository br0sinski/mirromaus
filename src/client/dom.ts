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
    createCursorElement,
  } = options;

  if(!createCursorElement) {
    console.warn("[mirromaus] No createCursorElement provided, using default cursor element creation.");
    injectDefaultCursorStyles(smoothMs);
  }

  // For now fine, in future should be replaced by a database or backend or whatever
  const cursors = new Map<string, HTMLDivElement>();

  // Adds a mapped cursor element for a given user ID
  function getOrCreateCursor(cursorUserId: string): HTMLDivElement {
    let el = cursors.get(cursorUserId);
    if (!el) {
      el = createCursorElement?.(cursorUserId) ?? createDefaultCursorElement(cursorUserId);
      if (createCursorElement) {
        ensureTransformSmoothing(el, smoothMs);
      }
      if (window.getComputedStyle(el).position === "static") {
        el.style.position = "fixed";
        el.style.top = "0";
        el.style.left = "0";
      }
      container.appendChild(el);
      cursors.set(cursorUserId, el);
    }
    return el;
  }

  // Handles incoming cursor messages and updates the corresponding cursor element's position
  function handleRemoteCursor(msg: CursorMessage) {
    const id = msg.userId ?? "Error: no userId (no backend?)";
    const el = getOrCreateCursor(id);
    const translation = `translate(${msg.x}px, ${msg.y}px) translate(-50%, -50%)`;
    el.style.transform = translation;
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
export function injectDefaultCursorStyles(smoothMs: number) {
  if (document.getElementById("mirromaus-cursor-style")) return;

  const style = document.createElement("style");
  style.id = "mirromaus-cursor-style";
  style.textContent = `
    .mirromaus-cursor {
      position: fixed;
      top: 0;
      left: 0;
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

export function createDefaultCursorElement(userId: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "mirromaus-cursor";
    el.dataset.userId = userId;
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    return el;
}

// Ensure custom cursors still get smooth transform animations, i dont know if this should be disabled if someone wants to do their own animations
function ensureTransformSmoothing(el: HTMLElement, smoothMs: number): void {
  const transformTransition = `transform ${smoothMs}ms linear`;
  const current = el.style.transition.trim();
  if (!current) {
    el.style.transition = transformTransition;
  } else if (!current.includes("transform")) {
    el.style.transition = `${current}, ${transformTransition}`;
  }
  if (!el.style.willChange) {
    el.style.willChange = "transform";
  }
}

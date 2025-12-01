import { CursorClientOptions } from "./types.js";
import type { CursorMessage } from "../server/types.js";

// Init the cursor client by opening the WebSocket connection
export function initCursorClient(options: CursorClientOptions): void {
    const { url, userId, pageId, onCursor } = options;
    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log("[mirromaus] Connected to cursor server at", url);
    };

    ws.onmessage = (event) => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(event.data);
        } catch {
            // ignore invalid JSON
            return;
        }
        const msg = parsed as CursorMessage;
        if (msg.type !== 'cursor') return;
        
        if (onCursor) {
            onCursor(msg);
        }
    };

    window.addEventListener("mousemove", (event) => {
        if(ws.readyState !== WebSocket.OPEN) return;

        const message: CursorMessage = {
            type: 'cursor',
            x: event.clientX,
            y: event.clientY,
            userId,
            pageId,
        };

        ws.send(JSON.stringify(message));
    });


}
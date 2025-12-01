/* What should the Server do? The server should for now do the following

- Accept WS Connections
- Remember that Clients have connected, what clients have disconnected
- Broadcast a message from all connected clients of cursor position in x intervall

More specific:

1. Manage Connections
 -> Who is connected?
 -> Who joined, who left?

2. Understand messages
 -> What does a client recieve?
 -> Is it a cursor motion?

3. Broadcast messages
 -> To who do we need to send the cursor message?
 -> Everyone? Only certain clients?

*/

import { WebSocketServer } from "ws";
import type  { CursorServerOptions, Client, CursorMessage } from "./types.js";
import { handleConnect, handleDisconnect, handleCursorMessage } from "./core.js";

export function createCursorServer(options: CursorServerOptions = {}) {
    const port = options.port || 1337;
    const wss  = new WebSocketServer({ port });

    wss.on("connection", (ws) => {
        const client: Client = {
            socket: ws,
            userId: generateUserId(),
            pageId: undefined,
        };

        handleConnect(client);

        ws.on("message", (data) => {
            let parsed: unknown;
            try {
                parsed = JSON.parse(data.toString());
            } catch {
                // ignore invalid JSON
                return;
            }
            const msg = parsed as CursorMessage;
            if (msg.type !== 'cursor') return;

            handleCursorMessage(client, msg);
        });

        ws.on("close", () => {
            handleDisconnect(client);
        });
    });

    console.log(`[mirromaus] Cursor server started on ws://localhost:${port}`);

    return wss;
}

function generateUserId(): string {
    return Math.random().toString(36).substring(2, 10);
}
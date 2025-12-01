import type { Client, CursorMessage, InitMessage } from "./types.js";
import { addClient, removeClient, getClients } from "./state.js";
import { WebSocket } from "ws";


// Handler for new client connections -> adds the client to local array
export function handleConnect(client: Client): void {
    addClient(client);
    console.log("[mirromaus] Client connected. Total clients:", getClients().length);
}

// Handler for client disconnections -> removes the client from local array
export function handleDisconnect(client: Client): void {
    removeClient(client);
    console.log("[mirromaus] Client disconnected. Total clients:", getClients().length);
}

// Handler for incoming cursor messages -> broadcasts to all other connected clients
export function handleCursorMessage(sender: Client, message: CursorMessage): void {
    const currentClients = getClients();
    const resolvedPageId = sender.pageId ?? message.pageId;
    const payloadMessage: CursorMessage = {
        ...message,
        userId: message.userId ?? sender.userId,
        pageId: resolvedPageId,
    };
    const payload = JSON.stringify(payloadMessage);

    for (const client of currentClients) {
        if (client === sender) continue;
        if (resolvedPageId && client.pageId && client.pageId !== resolvedPageId) continue;

        const socket = client.socket as WebSocket;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(payload);
        }
    }
}

// Handler for handshake/init messages -> keeps client metadata up to date
export function handleInitMessage(client: Client, message: InitMessage): void {
    if (message.pageId) {
        client.pageId = message.pageId;
    }
}




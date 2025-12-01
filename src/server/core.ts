import type { Client, CursorLeaveMessage, CursorMessage, InitMessage } from "./types.js";
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

    if (!client.userId) return;

    const leaveMessage: CursorLeaveMessage = {
        type: "cursor-leave",
        userId: client.userId,
        pageId: client.pageId,
    };

    const payload = JSON.stringify(leaveMessage);
    const remainingClients = getClients();
    for (const other of remainingClients) {
        if (other === client) continue;
        if (client.pageId && other.pageId && other.pageId !== client.pageId) continue;
        const socket = other.socket as WebSocket;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(payload);
        }
    }
}

// Handler for incoming cursor messages -> broadcasts to all other connected clients
export function handleCursorMessage(sender: Client, message: CursorMessage): void {
    const currentClients = getClients();
    const resolvedPageId = sender.pageId ?? message.pageId;
    const payloadMessage: CursorMessage = {
        ...message,
        userId: message.userId ?? sender.userId,
        pageId: resolvedPageId,
        space: message.space,
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




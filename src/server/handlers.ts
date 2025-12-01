import type { Client, CursorMessage } from "./types";
import { addClient, removeClient, getClients } from "./state";
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
    for(const client of currentClients) {

        if (client.pageId !== sender.pageId) continue; // stupid simpler filter to only broadcast to same page

        if(client !== sender) {
            const socket = client.socket as WebSocket;
            if(socket.readyState === WebSocket.OPEN) {
                const payload = JSON.stringify(message);
                socket.send(payload);
            }
        }
    }
}




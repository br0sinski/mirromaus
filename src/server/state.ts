import type { Client } from "./types.js";

// Later replace the array with something more robust like a database or something

const clients: Client[] = [];

export function addClient(client: Client): void {
    clients.push(client);
    console.log("[mirromaus] Added client. Total clients:", clients.length);
}

export function removeClient(client: Client): void {
    const index = clients.indexOf(client);
    if (index !== -1) {
        clients.splice(index, 1);
    }
    console.log("[mirromaus] Removed client. Total clients:", clients.length);
}

export function getClients(): Client[] {
    return [...clients];
}
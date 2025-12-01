import type { Client } from "./types";

// Later replace the array with something more robust like a database or something

const clients: Client[] = [];

export function addClient(client: Client): void {
    clients.push(client);
}

export function removeClient(client: Client): void {
    const index = clients.indexOf(client);
    if (index !== -1) {
        clients.splice(index, 1);
    }
}

export function getClients(): Client[] {
    return [...clients];
}
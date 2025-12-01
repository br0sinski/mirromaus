import type { WebSocket } from "ws";

export interface CursorMessage {
    type: 'cursor';
    x: number;
    y: number;
    userId?: string;   
    pageId?: string;
}

export interface Client {
    socket: WebSocket;
    userId?: string;
    pageId?: string;
}

export interface CursorServerOptions {
    port?: number;
}
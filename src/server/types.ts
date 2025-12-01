import type { WebSocket } from "ws";

export interface CursorMessage {
    type: 'cursor';
    x: number;
    y: number;
    userId?: string;   
    pageId?: string;
}

export interface InitMessage {
    type: 'init';
    userId?: string;
    pageId?: string;
}

export interface InitAckMessage {
    type: 'init-ack';
    userId: string;
    pageId?: string;
}

export type ClientMessage = CursorMessage | InitMessage;
export type ServerMessage = CursorMessage | InitAckMessage;

export interface Client {
    socket: WebSocket;
    userId?: string;
    pageId?: string;
}

export interface CursorServerOptions {
    port?: number;
}
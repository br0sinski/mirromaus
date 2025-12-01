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

export interface CursorLeaveMessage {
    type: 'cursor-leave';
    userId: string;
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

export type ClientMessage = CursorMessage | InitMessage;
export type ServerMessage = CursorMessage | InitAckMessage | CursorLeaveMessage;

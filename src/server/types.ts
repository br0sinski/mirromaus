import type { WebSocket } from "ws";
import type {
    ClientMessage,
    CursorLeaveMessage,
    CursorMessage,
    InitAckMessage,
    InitMessage,
    ServerMessage,
} from "../shared/types.js";

export type {
    ClientMessage,
    CursorLeaveMessage,
    CursorMessage,
    InitAckMessage,
    InitMessage,
    ServerMessage,
};

export interface Client {
    socket: WebSocket;
    userId?: string;
    pageId?: string;
}

export interface CursorServerOptions {
    port?: number;
}

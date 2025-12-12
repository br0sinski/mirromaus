export type CoordinateSpace = "viewport" | "element";

// Message sent from client to server to represent cursor position
export interface CursorMessage {
  type: "cursor";
  x: number;
  y: number;
  userId?: string;
  pageId?: string;
  space?: CoordinateSpace;
  relativeX?: number;
  relativeY?: number;
}
export interface InitMessage {
  type: "init";
  userId?: string;
  pageId?: string;
}
export interface InitAckMessage {
  type: "init-ack";
  userId: string;
  pageId?: string;
}
// 
export interface CursorLeaveMessage {
  type: "cursor-leave";
  userId: string;
  pageId?: string;
}

export type ClientMessage = CursorMessage | InitMessage;
export type ServerMessage = CursorMessage | InitAckMessage | CursorLeaveMessage;

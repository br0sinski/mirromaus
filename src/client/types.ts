import type { CursorLeaveMessage, CursorMessage } from "../shared/types.js";

export interface CursorClientOptions {
    url: string;
    userId?: string;
    pageId?: string;
    throttleMs?: number;
    onCursor?: (message: CursorMessage) => void;
    onLeave?: (message: CursorLeaveMessage) => void;
    trackingElement?: HTMLElement | null;
}

export interface CursorDomClientOptions {
  url: string;
  userId?: string;
  pageId?: string;
  throttleMs?: number;
  container?: HTMLElement;  
  smoothMs?: number;      
  createCursorElement?: (userId: string) => HTMLDivElement; 
  trackingElement?: HTMLElement | null;
}
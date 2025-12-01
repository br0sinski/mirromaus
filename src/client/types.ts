import type { CursorMessage } from "../server/types.js";

export interface CursorClientOptions {
    url: string;
    userId?: string;
    pageId?: string;
    throttleMs?: number;
    onCursor?: (message: CursorMessage) => void;
}

export interface CursorDomClientOptions {
  url: string;
  userId?: string;
  pageId?: string;
  throttleMs?: number;
  container?: HTMLElement;  
  smoothMs?: number;      
  createCursorElement?: (userId: string) => HTMLDivElement; 
}
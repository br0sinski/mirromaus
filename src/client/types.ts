import type { CursorMessage } from "../server/types.js";

export interface CursorClientOptions {
    url: string;
    userId?: string;
    pageId?: string;
    onCursor?: (message: CursorMessage) => void;
}
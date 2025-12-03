/* What should the Client do? The Client should for now do the following

- Open WS Connections
- Send cursor position on mouse move in x intervall
- Receive cursor positions from other clients and render them
- It should kind of look like this: user moved mouse from a to b in 1s -> send begin position, then end position draw the cursor for everyone in a line
    (thus remove the details, otherwise it will spam the server with too many messages)
*/

export * from "./types.js";
export { createCursorConnection } from "./core.js";
export { startMirromaus } from "./dom.js";

/* What should the Server do? The server should for now do the following

- Accept WS Connections
- Remember that Clients have connected, what clients have disconnected
- Broadcast a message from all connected clients of cursor position in x intervall

More specific:

1. Manage Connections
 -> Who is connected?
 -> Who joined, who left?

2. Understand messages
 -> What does a client recieve?
 -> Is it a cursor motion?

3. Broadcast messages
 -> To who do we need to send the cursor message?
 -> Everyone? Only certain clients?

*/


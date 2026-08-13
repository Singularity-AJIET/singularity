// Store connected SSE clients
const clients = new Set();
/**
 * Add a new SSE client connection.
 */
export function addClient(res) {
    clients.add(res);
    res.on('close', () => {
        clients.delete(res);
    });
}
/**
 * Broadcast a counter status update to all connected SSE clients.
 */
export function broadcastCounterUpdate(counters) {
    const data = JSON.stringify(counters);
    for (const client of clients) {
        client.write(`data: ${data}\n\n`);
    }
}

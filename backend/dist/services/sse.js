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
// Store connected SSE clients for countdown events
const countdownClients = new Set();
/**
 * Add a new SSE client connection for countdown updates.
 */
export function addCountdownClient(res) {
    countdownClients.add(res);
    res.on('close', () => {
        countdownClients.delete(res);
    });
}
/**
 * Broadcast countdown status update to all connected clients.
 */
export function broadcastCountdownUpdate(state) {
    const data = JSON.stringify(state);
    for (const client of countdownClients) {
        client.write(`data: ${data}\n\n`);
    }
}

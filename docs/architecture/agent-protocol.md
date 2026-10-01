# Architecture: Agent Protocol Specification

The **AIPanel Agent Protocol** governs encrypted communication between the **AIPanel Desktop Client** and the remote **AIPanel Server Agent** (listening on TCP port 9876).

---

## 1. Protocol Stack

```
┌──────────────────────────────────────────────┐
│           JSON-RPC 2.0 / WebSocket           │
├──────────────────────────────────────────────┤
│           mTLS (Mutual TLS 1.3)              │
├──────────────────────────────────────────────┤
│                   TCP                        │
└──────────────────────────────────────────────┘
```

- **Control Messages**: Authenticated JSON-RPC 2.0 over HTTPS.
- **Log & Telemetry Streaming**: Bidirectional WebSocket connection (`/ws/stream`) with heartbeat ping-pong intervals of 15 seconds.

---

## 2. Core RPC Methods

### `agent.ping`
Returns server agent version, uptime, and host operating system details.

### `deploy.execute`
Instructs the agent to initiate an atomic deployment.
```json
{
  "jsonrpc": "2.0",
  "method": "deploy.execute",
  "params": {
    "project": "marketplace",
    "version": "v1.8.4",
    "strategy": "native",
    "artifact_url": "sftp://...",
    "health_check": {
      "path": "/health",
      "expected_status": 200,
      "timeout_seconds": 30
    }
  },
  "id": 1
}
```

### `deploy.rollback`
Instructs the agent to atomically revert traffic to the previous healthy release directory.

### `services.status`
Returns CPU, memory, uptime, and status for all managed services (PostgreSQL, Redis, background workers).

### `logs.tail`
Initiates a WebSocket log stream for a specific service or application release.

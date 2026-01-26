# x-request-id — Request Tracing

## Overview

`x-request-id` is a **unique identifier** assigned to **each logical request** in the Ticketing system.

Its purpose is to:

- trace a request end-to-end
- correlate frontend errors with backend logs
- simplify debugging in a distributed system

> **One request → one ID → propagated everywhere**

---

## Header name

```
x-request-id
```

- Type: `string`
- Format: `UUID v4`
- Scope: **request-level** (not session-level)

---

## Core rules

1. A request ID is **generated once**
2. It is **never regenerated mid-request**
3. It is **propagated through all layers**
4. It is **included in logs and error responses**

---

## Where x-request-id is generated

### 1️⃣ Page / HTML / RSC requests

For requests that load pages (HTML, RSC, layouts), there is **no client JavaScript yet**.

Therefore, `x-request-id` is generated in **Next.js middleware**.

```ts
const requestId =
  request.headers.get('x-request-id') ?? randomUUID();
```

---

### 2️⃣ Client-side API requests

For requests initiated from React components:

- `x-request-id` is generated in `clientRequest`
- Components and pages **never** generate request IDs directly

```ts
fetch(url, {
  headers: {
    'x-request-id': generateRequestId(),
  },
});
```

---

## Propagation flows

### 📄 Client static files request  
(HTML / RSC / layouts)

```
Browser request /
  ↓
Next.js middleware
  └─ generate x-request-id
      ↓
Server Components
  └─ headers().get('x-request-id')
      ↓
serverRequest()
  └─ forward x-request-id
      ↓
Ingress
      ↓
Express requestId middleware
  └─ req.requestId === SAME ID
```

---

### 🔁 Client API request

```
React Component
  ↓
service.signupUser()
  ↓
makeRequest()
  ↓
clientRequest()
  ├─ generate x-request-id
  ↓
Next.js server
  ├─ headers().get('x-request-id')
  ↓
serverRequest()
  ├─ forward x-request-id
  ↓
Ingress
  ↓
Express middleware
  ├─ req.requestId = x-request-id
  ↓
Controllers / logs / errors
```

---

## Backend handling (Express)

### Middleware

```ts
export function requestId(req, _res, next) {
  req.requestId = req.header('x-request-id') ?? crypto.randomUUID();
  next();
}
```

---

## Error handling

Backend error responses **must include** `requestId`:

```json
{
  "code": "BUSINESS_RULE",
  "message": "User already exists",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Logging

All logs **must include** the request ID:

```ts
console.log(`[${req.requestId}] User signup attempt`);
```

---

## What NOT to do

- ❌ Generate request IDs in React components
- ❌ Store request IDs in cookies
- ❌ Reuse request IDs across page loads
- ❌ Regenerate request IDs mid-request
- ❌ Cache responses that include request IDs

---

## Why this exists

In a distributed system:

- requests cross service boundaries
- logs are asynchronous
- errors surface far from their cause

`x-request-id` is the **single thread** that ties everything together.

---

## Related modules

- `middleware/proxy.ts`
- `lib/http/clientRequest.ts`
- `lib/http/serverRequest.ts`
- `middlewares/requestId.ts` (backend)

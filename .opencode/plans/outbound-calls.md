# Plan: Outbound Calls (Business-Initiated Calls)

## Changes

### 1. backend/services/whatsappCallManager.js
- Add `pendingOutboundCalls` Map
- Add `initiateOutboundCall()` function
- Add `resolvePendingOutboundCall()` function
- Export new functions

### 2. backend/server.js
- Handle BIC webhook events (direction: BUSINESS_INITIATED)
- Add `POST /api/call/outbound` endpoint
- Add socket `start-outbound-call` event handler

### 3. frontend/dashboard.html
- Add outbound call section with country code selector

### 4. frontend/app.js
- Add outbound call logic

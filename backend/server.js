// =========================================================================
// 📞 WHATSAPP VOICE SDK BACKEND ENGINE — WEBRTC CALL SIGNALING SERVER
// =========================================================================
// Developed by Luis Damian Veliz, Majority Co-founder and CTO of NEURO IA S.A.S.
// This server acts as a real-time WebRTC bridge to Gemini Live API and Meta.
// Supports production PostgreSQL with automatic auto-migrations.

require('dotenv').config();
process.on('unhandledRejection', (reason) => console.error('[System] Unhandled Rejection:', reason?.message || reason));
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const db = require('./database');

// Import telephony and AI engine services
const whatsappCallManager = require('./services/whatsappCallManager');
const geminiLiveBridge = require('./services/geminiLiveBridge');

// Initialize Express and Socket.io for the live dashboard
const app = express();
const server = http.createServer(app);
let io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve frontend static files in production
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// =========================================================================
// 📡 LIVE LOG BROADCAST TO FRONTEND DASHBOARD
// =========================================================================
function sendSandboxLog(type, message, details = '') {
  const timestamp = new Date().toLocaleTimeString();
  const logPayload = { timestamp, type, message, details };
  
  // Print to Node server console
  console.log(`[${type}] ${message}`, details ? `(${JSON.stringify(details)})` : '');
  
  // Emit to all dashboard browser clients
  io.emit('sandbox-log', logPayload);
}

// =========================================================================
// 🔌 SOCKET.IO CONNECTIONS (Browser State Control)
// =========================================================================
let activeConnections = new Set();

function setupSocketHandlers(socketIoInstance) {
  console.log('[SDK Socket] ✅ setupSocketHandlers called — registering connection handler on io');
  
  socketIoInstance.on('connection', async (socket) => {
    console.log('[SDK Socket] 🔌 New socket connection detected:', socket.id, '| userData:', JSON.stringify(socket.userData || {}));
    
    // Avoid duplicate log listeners
    activeConnections.add(socket);
    sendSandboxLog('SYSTEM', '🔌 Admin client connected to monitoring socket.');

    // Send current persistent config to the connecting client
    try {
      const currentConfig = await db.getConfig();
      console.log('[SDK Socket] Config loaded OK — phoneNumberId:', currentConfig.phoneNumberId ? '✅' : '❌', 'geminiApiKey:', currentConfig.geminiApiKey ? '✅' : '❌');
      
      socket.emit('current-config', {
        metaAccessToken: currentConfig.metaAccessToken,
        phoneNumberId: currentConfig.phoneNumberId,
        wabaId: currentConfig.wabaId,
        metaVerifyToken: currentConfig.metaVerifyToken,
        geminiApiKey: currentConfig.geminiApiKey,
        iceServers: currentConfig.iceServers
      });
      console.log('[SDK Socket] current-config emitted to', socket.id);
    } catch (dbErr) {
      console.error('[SDK Socket] ❌ CRITICAL: db.getConfig() FAILED:', dbErr.message);
      // Still emit empty config so the dashboard doesn't hang
      socket.emit('current-config', {
        metaAccessToken: '', phoneNumberId: '', wabaId: '',
        metaVerifyToken: 'whatsapp_voice_sdk_verify_token',
        geminiApiKey: '', iceServers: ''
      });
    }

    // Listen for live config updates from the dashboard UI
    socket.on('update-config', async (configData, ack) => {
      console.log('[SDK Socket] 📥 update-config received from', socket.id, '| keys:', Object.keys(configData).join(','));
      
      try {
        const success = await db.saveConfig(configData);
        
        if (success) {
          const updated = await db.getConfig();
          sendSandboxLog('CONFIG', '⚙️ Database: Credentials saved and synced successfully.', {
            metaVerifyToken: updated.metaVerifyToken,
            phoneNumberId: updated.phoneNumberId,
            wabaId: updated.wabaId,
            hasMetaToken: !!updated.metaAccessToken,
            hasGeminiKey: !!updated.geminiApiKey
          });

          // If Meta Token and Phone ID are set, enable calling automatically
          if (updated.metaAccessToken && updated.phoneNumberId) {
            sendSandboxLog('META', '📡 Enabling incoming call service on Meta API...');
            whatsappCallManager.setCallingEnabled(updated.phoneNumberId, updated.metaAccessToken, true)
              .then(() => {
                sendSandboxLog('META', '🟢 WhatsApp Calling enabled successfully.');
              })
              .catch(err => {
                sendSandboxLog('ERROR', '🔴 Fallo al intentar habilitar WhatsApp Calling en Meta.', err.message);
              });
          }

          socket.emit('config-updated', { success: true });
          if (typeof ack === 'function') ack({ success: true });
          console.log('[SDK Socket] ✅ config-updated emitted (success) to', socket.id);
        } else {
          socket.emit('config-updated', { success: false });
          if (typeof ack === 'function') ack({ success: false, error: 'save_failed' });
          console.log('[SDK Socket] ❌ config-updated emitted (failed) to', socket.id);
        }
      } catch (saveErr) {
        console.error('[SDK Socket] ❌ CRITICAL: update-config handler crashed:', saveErr.message);
        socket.emit('config-updated', { success: false });
        if (typeof ack === 'function') ack({ success: false, error: saveErr.message });
      }
    });

    socket.on('clear-config', async (ack) => {
      console.log('[SDK Socket] 📥 clear-config received from', socket.id);
      try {
        const current = await db.getConfig();
        // Disable Meta calling if it was enabled
        if (current.phoneNumberId && current.metaAccessToken) {
          try {
            await whatsappCallManager.setCallingEnabled(current.phoneNumberId, current.metaAccessToken, false);
          } catch (err) {
            console.warn('[SDK Socket] Warning disabling Meta calls:', err.message);
          }
        }

        const success = await db.saveConfig({
          metaAccessToken: '',
          phoneNumberId: '',
          wabaId: '',
          metaVerifyToken: 'whatsapp_voice_sdk_verify_token',
          geminiApiKey: ''
        });

        if (success) {
          sendSandboxLog('CONFIG', '⚙️ Database: Credentials destroyed (Session Closed).');
          socket.emit('config-cleared', { success: true });
          if (typeof ack === 'function') ack({ success: true });
        } else {
          socket.emit('config-cleared', { success: false });
          if (typeof ack === 'function') ack({ success: false, error: 'clear_failed' });
        }
      } catch (clearErr) {
        console.error('[SDK Socket] ❌ CRITICAL: clear-config handler crashed:', clearErr.message);
        socket.emit('config-cleared', { success: false });
        if (typeof ack === 'function') ack({ success: false, error: clearErr.message });
      }
    });

    // 📞 START OUTBOUND CALL (Business-Initiated Call)
    socket.on('start-outbound-call', async (data, ack) => {
      const to = data?.to;
      if (!to) {
        if (typeof ack === 'function') ack({ success: false, error: 'Phone number required' });
        return;
      }
      sendSandboxLog('SYSTEM', `📞 Starting outbound call to ${to}...`);
      try {
        const cfg = await db.getConfig();
        if (!cfg.phoneNumberId || !cfg.metaAccessToken) throw Error('Meta credentials not configured');
        if (!cfg.geminiApiKey) throw Error('Gemini API Key not configured');
        const voice = cfg.geminiVoice || process.env.GEMINI_LIVE_VOICE || 'Aoede';
        const sp = 'You are the official voice assistant of NEURO IA S.A.S. You are starting an outbound WhatsApp call. Speak naturally, friendly, concise and brief. Maximum 2 sentences per turn. DO NOT use markdown, emojis or asterisks. Respond in the same language as the user.';
        let geminiCallId = null;
        let onAudioForGemini = () => {};
        const r = await whatsappCallManager.initiateOutboundCall({to,phoneNumberId:cfg.phoneNumberId,accessToken:cfg.metaAccessToken,iceServers:cfg.iceServers,onAudioFromWhatsApp:(p)=>onAudioForGemini(p),onCallEnded:()=>{sendSandboxLog('WEBRTC','Outbound call ended.');if(geminiCallId)geminiLiveBridge.closeSession(geminiCallId);io.emit('outbound-state',{state:'ended'});},onStatusChange:(s)=>{sendSandboxLog('WHATSAPP','Status: '+s);io.emit('outbound-state',{state:s});}});
        const cid = r.callId;
        geminiCallId = cid;
        await geminiLiveBridge.createSession(cid,cfg.geminiApiKey,sp,voice,(b)=>r.sendAudioToWhatsApp(b),()=>{const d=whatsappCallManager.clearQueuedAudio(cid);sendSandboxLog('GEMINI','Interruption. '+d+' frames.');},(e)=>sendSandboxLog('ERROR','Gemini error.',e.message));
        onAudioForGemini = (p) => geminiLiveBridge.sendAudio(cid, p);
        geminiLiveBridge.setAssistantAudioStateProvider(cid,()=>whatsappCallManager.getPlaybackBacklogMs(cid)>Number(process.env.VOICE_BARGE_IN_BACKLOG_MS||250));
        geminiLiveBridge.startInitialGreeting(cid);
        sendSandboxLog('SYSTEM','Outbound call established with '+to);
        io.emit('outbound-state',{state:'connected',callId:cid});
        if(typeof ack==='function') ack({success:true,callId:cid});
      } catch(e) {
        sendSandboxLog('ERROR','Outbound call error.',e.message);
        io.emit('outbound-state',{state:'failed',error:e.message});
        if(typeof ack==='function') ack({success:false,error:e.message});
      }
    });

    socket.on('end-outbound-call', async (data, ack) => {
      const callId = data?.callId;
      if (callId) {
        whatsappCallManager.endCall(callId);
        geminiLiveBridge.closeSession(callId);
        sendSandboxLog('SYSTEM', 'Outbound call ended by user.');
      }
      if (typeof ack === 'function') ack({ success: true });
    });

    socket.on('disconnect', () => {
      activeConnections.delete(socket);
    });
  });
}

// Inyectar compatibilidad con un IO externo (del servidor principal)
function setExternalIO(externalIo) {
  console.log('[SDK Socket] 🔄 setExternalIO called — replacing local io with main backend io');
  io = externalIo;
  setupSocketHandlers(io);
  console.log('[SDK Socket] ✅ External IO configured and handlers registered');
}

// Iniciar Socket.io local si se ejecuta directamente
if (require.main === module) {
  setupSocketHandlers(io);
}

// =========================================================================
// 🌐 API REST ENDPOINTS
// =========================================================================

// Grouped helper routes for modular integration
const router = express.Router();

router.get('/config', async (req, res) => {
  const currentConfig = await db.getConfig();
  res.json(currentConfig);
});

router.post('/config', async (req, res) => {
  const success = await db.saveConfig(req.body);
  if (success) {
    const updated = await db.getConfig();
    sendSandboxLog('CONFIG', '⚙️ API REST: Configuration updated in database.');
    res.json({ success: true, config: updated });
  } else {
    res.status(500).json({ success: false, error: 'Could not save configuration.' });
  }
});

router.post('/config/clear', async (req, res) => {
  try {
    const current = await db.getConfig();
    // Disable Meta calling if it was enabled
    if (current.phoneNumberId && current.metaAccessToken) {
      try {
        await whatsappCallManager.setCallingEnabled(current.phoneNumberId, current.metaAccessToken, false);
      } catch (err) {
        console.warn('[Server REST] Warning disabling Meta calls:', err.message);
      }
    }

    const success = await db.saveConfig({
      metaAccessToken: '',
      phoneNumberId: '',
      wabaId: '',
      metaVerifyToken: 'whatsapp_voice_sdk_verify_token',
      geminiApiKey: ''
    });

    if (success) {
      sendSandboxLog('CONFIG', '⚙️ API REST: Credentials destroyed (Session securely closed).');
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Could not purge configuration.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Webhook Verification (GET): Required by Meta to verify the tunnel
router.get('/webhook', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const currentConfig = await db.getConfig();

  sendSandboxLog('META', '🔍 Meta Graph API is requesting webhook verification...');

  if (mode && token) {
    if (mode === 'subscribe' && token === currentConfig.metaVerifyToken) {
      sendSandboxLog('META', '🟢 Webhook verified and linked successfully in Meta Developers.');
      return res.status(200).send(challenge);
    } else {
      sendSandboxLog('META', '🔴 Validation error: The Verify Token entered in Meta does not match the database.', {
        tokenReceived: token,
        tokenExpected: currentConfig.metaVerifyToken
      });
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// 2. Call Event Reception (POST): Processes real Meta events in real time
router.post('/webhook', async (req, res) => {
  const { body } = req;
  
  // Respond immediately to Meta to avoid retries and timeouts (Meta's 5 second limit)
  res.status(200).json({ success: true });

  try {
    const currentConfig = await db.getConfig();

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry && body.entry[0];
      const change = entry && entry.changes && entry.changes.find(c => c.field === 'calls');
      
      if (!change) return;

      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      const callData = value?.calls && value.calls[0];

      if (!callData || !phoneNumberId) return;

      const callId = callData.id;
      const callerPhone = callData.from;
      const eventType = callData.event; // 'connect', 'terminate', 'rejected', 'failed', 'no_answer'

      sendSandboxLog('WHATSAPP', `📱 Call event. ID: ${callId} | From: ${callerPhone} | Event: ${eventType}`);

      // Business-Initiated Call: Meta sent SDP answer for outbound call
      if (eventType === 'connect' && callData.direction === 'BUSINESS_INITIATED') {
        const answerSdp = callData.session?.sdp;
        const bizOpaqueData = callData.biz_opaque_callback_data;
        if (bizOpaqueData && answerSdp) {
          sendSandboxLog('WHATSAPP', `📞 BIC response received for ${bizOpaqueData}`);
          whatsappCallManager.resolvePendingOutboundCall(bizOpaqueData, answerSdp, callId);
        }
        return;
      }

      if (eventType === 'connect' && callData.session && callData.session.sdp_type === 'offer') {
        const offerSdp = callData.session.sdp;
        sendSandboxLog('WHATSAPP', `🔔 Incoming call from ${callerPhone}. SDP Offer detected.`);
        io.emit('call-state', { state: 'incoming', caller: callerPhone });
        
        // Start the actual call flow and negotiation
        startIncomingCallFlow(callId, offerSdp, callerPhone, currentConfig);
      } else if (eventType === 'terminate' || eventType === 'rejected' || eventType === 'failed' || eventType === 'no_answer') {
        sendSandboxLog('WHATSAPP', `🔴 Call ended or rejected (${eventType}) by ${callerPhone}. Cleaning up channels.`);
        io.emit('call-state', { state: 'terminated', caller: callerPhone });
        
        whatsappCallManager.endCall(callId);
        geminiLiveBridge.closeSession(callId);
      }
    }
  } catch (err) {
    console.error('[Webhook POST Error]:', err.message);
  }
});

// Registrar rutas locales si corre de forma independiente
if (require.main === module) {
  app.use('/api', router);
  app.use('/webhook', router);
}

// =========================================================================
// ⚙️ HOT CONTROL FLOW: WebRTC NEGOTIATION & GEMINI LIVE BRIDGE
// =========================================================================

async function startIncomingCallFlow(callId, sdpOffer, callerId, config) {
  try {
    // Check if node-datachannel is installed/compiled in the local environment
    try {
      require('node-datachannel');
    } catch (e) {
      sendSandboxLog('ERROR', '🔴 WebRTC unavailable: Native module "node-datachannel" is not compiled in this environment.');
      sendSandboxLog('SYSTEM', '💡 To answer real calls on Windows: Install C++ Build Tools or run on Linux / Render.');
      io.emit('webrtc-state', { state: 'failed' });
      return;
    }

    sendSandboxLog('WEBRTC', '🛠️ Initializing WebRTC channel for Meta Calling...');
    io.emit('webrtc-state', { state: 'connecting' });

    // 1. Create the WebSocket session to Gemini Live
    sendSandboxLog('GEMINI', '🧠 Connecting WebSocket to Gemini Live (Google AI Studio)...');
    io.emit('gemini-state', { state: 'connecting' });

    let callBridge = null;

    const assistantVoice = config.geminiVoice || process.env.GEMINI_LIVE_VOICE || 'Aoede';

    const systemPrompt = `You are the official voice assistant of NEURO IA S.A.S.
    You are answering a real WhatsApp voice call.
    - Speak naturally, friendly, concise and brief. Maximum 2 sentences per turn.
    - DO NOT use markdown, emojis or asterisks in your voice response.
    - You have no external tools in this base SDK. Do not promise that you scheduled, transferred, purchased or registered anything.
    - If the client asks for an external action, honestly explain that this demo only converses by voice.
    - Respond in the same language as the user.`;

    await geminiLiveBridge.createSession(
      callId,
      config.geminiApiKey,
      systemPrompt,
      assistantVoice,
      // Callback: PCM audio received from Gemini -> Send to WhatsApp track
      (pcm24kBuffer) => {
        if (callBridge && callBridge.sendAudioToWhatsApp) {
          callBridge.sendAudioToWhatsApp(pcm24kBuffer);
        }
      },
      // Callback: User voice interruption (Barge-in) -> Clear RTP queue
      () => {
        sendSandboxLog('GEMINI', '🎤 User voice interruption. Clearing playback buffer.');
        const dropped = whatsappCallManager.clearQueuedAudio(callId);
        sendSandboxLog('WEBRTC', `🧹 RTP queue cleared after interruption (${dropped} frames dropped).`);
      },
      (err) => {
        sendSandboxLog('ERROR', '🔴 Critical error in Gemini Live WebSocket.', err.message);
        io.emit('gemini-state', { state: 'failed' });
      }
    );

    sendSandboxLog('GEMINI', '🟢 Connection established and voice session ready with Gemini Live.');
    io.emit('gemini-state', { state: 'connected' });

    // 2. Resolve the WebRTC call and perform SDP exchange with Meta
    sendSandboxLog('WEBRTC', '📡 Performing SDP Answer exchange with Meta Graph API...');
    callBridge = await whatsappCallManager.handleIncomingCall({
      callId,
      offerSdp: sdpOffer,
      phoneNumberId: config.phoneNumberId,
      accessToken: config.metaAccessToken,
      iceServers: config.iceServers,
      // Audio received from the user's phone -> Send to Gemini Live
      onAudioFromWhatsApp: (pcm16Buffer) => {
        geminiLiveBridge.sendAudio(callId, pcm16Buffer);
      },
      onCallEnded: () => {
        sendSandboxLog('WEBRTC', `🔴 WebRTC channel for call ${callId} disconnected.`);
        io.emit('webrtc-state', { state: 'disconnected' });
        geminiLiveBridge.closeSession(callId);
      }
    });

    geminiLiveBridge.setAssistantAudioStateProvider(callId, () => {
      return whatsappCallManager.getPlaybackBacklogMs(callId) > Number(process.env.VOICE_BARGE_IN_BACKLOG_MS || 250);
    });
    geminiLiveBridge.startInitialGreeting(callId);

    sendSandboxLog('WEBRTC', '🟢 Call answered and bidirectionally linked successfully.');
    io.emit('webrtc-state', { state: 'connected' });

  } catch (error) {
    sendSandboxLog('ERROR', '🔴 Failed to answer incoming call.', error.message);
    io.emit('webrtc-state', { state: 'failed' });
    whatsappCallManager.endCall(callId);
    geminiLiveBridge.closeSession(callId);
  }
}

// Start the integrated server or export depending on context
if (require.main === module) {
  const PORT = process.env.PORT || 3006;
  server.listen(PORT, async () => {
    // Initialize the database (PostgreSQL or JSON fallback)
    await db.initDatabase();

    console.log(`\n=============================================================`);
    console.log(`📞 WHATSAPP VOICE SDK BACKEND ENGINE STARTED SUCCESSFULLY`);
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`⚡ WhatsApp WebRTC & Gemini Live Engine Linked`);
    console.log(`🔌 Live Socket Log Monitor active.`);
    console.log(`📞 Outbound calls (BIC) available via Socket.IO`);
    console.log(`=============================================================\n`);
  });
} else {
  // Export router and initialization function for main backend
  module.exports = {
    router,
    db,
    setExternalIO,
    processIncomingCall: async (value, entry) => {
      const currentConfig = await db.getConfig();
      const callData = value?.calls && value.calls[0];
      if (!callData) return;
      const callId = callData.id;
      const callerPhone = callData.from;
      const eventType = callData.event;

      sendSandboxLog('WHATSAPP', `📱 Call event (Smart Route). ID: ${callId} | From: ${callerPhone} | Event: ${eventType}`);

      if (eventType === 'connect' && callData.session && callData.session.sdp_type === 'offer') {
        const offerSdp = callData.session.sdp;
        sendSandboxLog('WHATSAPP', `🔔 Incoming call from ${callerPhone}. SDP Offer detected.`);
        if (io) io.emit('call-state', { state: 'incoming', caller: callerPhone });
        startIncomingCallFlow(callId, offerSdp, callerPhone, currentConfig);
      } else if (eventType === 'terminate' || eventType === 'rejected' || eventType === 'failed' || eventType === 'no_answer') {
        sendSandboxLog('WHATSAPP', `🔴 Call ended or rejected (${eventType}) by ${callerPhone}. Cleaning up channels.`);
        if (io) io.emit('call-state', { state: 'terminated', caller: callerPhone });
        whatsappCallManager.endCall(callId);
        geminiLiveBridge.closeSession(callId);
      }
    }
  };
}

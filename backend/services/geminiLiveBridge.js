/**
 * geminiLiveBridge.js
 * Conexión en Tiempo Real con IA de Voz (Gemini Live).
 * Mantiene una conexión WebSocket bidireccional continua procesando buffers PCM (16-bit, 16kHz)
 * desde/hacia WhatsApp Calling. Permite transformar comandos de voz en invocación de herramientas (Function Calling).
 */

const WebSocket = require('ws');

const GEMINI_WS_URL = process.env.GEMINI_LIVE_WS_URL
    || 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
const MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const BARGE_IN_RMS_THRESHOLD = Number(process.env.VOICE_BARGE_IN_RMS || 0.26);
const BARGE_IN_MIN_FRAMES = Math.max(1, Number(process.env.VOICE_BARGE_IN_MIN_FRAMES || 10));
const BARGE_IN_COOLDOWN_MS = Math.max(500, Number(process.env.VOICE_BARGE_IN_COOLDOWN_MS || 1200));
const BARGE_IN_AI_SPEAKING_WINDOW_MS = Math.max(500, Number(process.env.VOICE_BARGE_IN_AI_SPEAKING_WINDOW_MS || 1400));
const IGNORE_AUDIO_AFTER_INTERRUPT_MS = Math.max(300, Number(process.env.VOICE_IGNORE_AUDIO_AFTER_INTERRUPT_MS || 900));
const INPUT_CHUNK_BYTES = Math.max(2048, Number(process.env.GEMINI_LIVE_INPUT_CHUNK_BYTES || 4096));
const GREETING_DELAY_MS = Math.max(0, Number(process.env.VOICE_GREETING_DELAY_MS || 1000));
const VAD_PREFIX_PADDING_MS = Math.max(0, Number(process.env.GEMINI_LIVE_VAD_PREFIX_PADDING_MS || 250));
const VAD_SILENCE_DURATION_MS = Math.max(300, Number(process.env.GEMINI_LIVE_VAD_SILENCE_DURATION_MS || 1000));
const VAD_START_SENSITIVITY = process.env.GEMINI_LIVE_VAD_START_SENSITIVITY || 'START_SENSITIVITY_LOW';
const VAD_END_SENSITIVITY = process.env.GEMINI_LIVE_VAD_END_SENSITIVITY || 'END_SENSITIVITY_LOW';
const ENABLE_INPUT_TRANSCRIPTION = process.env.GEMINI_LIVE_INPUT_TRANSCRIPTION !== 'false';
const ENABLE_OUTPUT_TRANSCRIPTION = process.env.GEMINI_LIVE_OUTPUT_TRANSCRIPTION !== 'false';
const SEND_LOCAL_INTERRUPT_SIGNAL = process.env.VOICE_LOCAL_INTERRUPT_SIGNAL === 'true';
const LOG_TRANSCRIPTS = process.env.VOICE_TRANSCRIPT_LOGS === 'true';

// Active sessions: Map<callId, SessionState>
const sessions = new Map();

/**
 * Create a Gemini Live session for a call.
 *
 * @param {string} callId
 * @param {string} apiKey — Gemini API key from database or environment
 * @param {string} systemPrompt — Bot's instructions/personality
 * @param {string} voice — Gemini voice name (Aoede, Puck, Charon, etc.)
 * @param {Function} onAudio — Callback for received audio PCM 24kHz buffer from Gemini
 * @param {Function} onInterrupted — Callback when user interrupts Gemini (barge-in)
 * @param {Function} onError — Callback on fatal error
 * @param {object} options — Additional tool declarations and callbacks
 * @returns {Promise<void>}
 */
async function createSession(callId, apiKey, systemPrompt, voice = 'Aoede', onAudio, onInterrupted, onError, options = {}) {
    const resolvedApiKey = apiKey || process.env.GEMINI_LIVE_API_KEY || process.env.GEMINI_API_KEY;
    if (!resolvedApiKey) throw new Error('[GeminiBridge] GEMINI_API_KEY not set');

    const url = `${GEMINI_WS_URL}?key=${resolvedApiKey}`;
    const ws = new WebSocket(url);

    const state = {
        ws,
        ready: false,
        onAudio,
        onInterrupted,
        onFunctionCall: options.onFunctionCall || null,
        onInputTranscription: options.onInputTranscription || null,
        onOutputTranscription: options.onOutputTranscription || null,
        onError,
        audioQueue: [],
        callId,
        assistantAudioStateProvider: null,
        initialGreetingActive: false,
        initialGreetingStarted: false,
        bargeInEnabledAt: 0,
        consecutiveSpeechFrames: 0,
        modelAudioActiveUntil: 0,
        sendCount: 0,
        sendBytes: 0,
        receiveCount: 0,
    };
    sessions.set(callId, state);

    return new Promise((resolve, reject) => {
        ws.on('open', () => {
            // Setup tool declarations: end_call natively + any dynamic options
            const functionDeclarations = [
                {
                    name: 'end_call',
                    description: 'End the call gracefully after saying goodbye',
                    parameters: {
                        type: 'OBJECT',
                        properties: {
                            farewell_message: {
                                type: 'STRING',
                                description: 'Final message to say before ending',
                            },
                        },
                        required: [],
                    },
                },
                ...((options && Array.isArray(options.functionDeclarations)) ? options.functionDeclarations : []),
            ];

            const setupMsg = {
                setup: {
                    model: `models/${MODEL}`,
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: voice },
                            },
                        },
                    },
                    realtimeInputConfig: {
                        activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
                        turnCoverage: 'TURN_INCLUDES_ONLY_ACTIVITY',
                        automaticActivityDetection: {
                            disabled: false,
                            startOfSpeechSensitivity: VAD_START_SENSITIVITY,
                            prefixPaddingMs: VAD_PREFIX_PADDING_MS,
                            endOfSpeechSensitivity: VAD_END_SENSITIVITY,
                            silenceDurationMs: VAD_SILENCE_DURATION_MS,
                        },
                    },
                    ...(ENABLE_INPUT_TRANSCRIPTION ? { inputAudioTranscription: {} } : {}),
                    ...(ENABLE_OUTPUT_TRANSCRIPTION ? { outputAudioTranscription: {} } : {}),
                    systemInstruction: {
                        parts: [{ text: systemPrompt }],
                    },
                    tools: [
                        {
                            functionDeclarations,
                        },
                    ],
                },
            };

            ws.send(JSON.stringify(setupMsg));
            console.log(`[GeminiBridge] Session setup sent for call ${callId} | tools=${functionDeclarations.map(t => t.name).join(',')}`);
        });

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());

                // Setup Complete
                if (msg.setupComplete) {
                    state.ready = true;
                    state.initialGreetingActive = true;
                    console.log(`[GeminiBridge] Session ready for call ${callId}`);
                    resolve();
                    return;
                }

                // Audio from Gemini
                if (msg.serverContent?.modelTurn?.parts) {
                    if (state.ignoreAudioUntil && Date.now() < state.ignoreAudioUntil) {
                        return; // Ignore ghost audio
                    }

                    for (const part of msg.serverContent.modelTurn.parts) {
                        if (part.inlineData?.data) {
                            state.receiveCount++;
                            if (state.receiveCount === 1) {
                                console.log(`[GeminiBridge] *** FIRST AUDIO FROM GEMINI *** dataLen=${part.inlineData.data.length} (${callId})`);
                            }
                            state.modelAudioActiveUntil = Date.now() + BARGE_IN_AI_SPEAKING_WINDOW_MS;
                            const audioBuf = Buffer.from(part.inlineData.data, 'base64');
                            if (onAudio) onAudio(audioBuf);
                        }
                    }
                }

                // Transcriptions
                if (msg.serverContent?.inputTranscription?.text) {
                    const text = msg.serverContent.inputTranscription.text.trim();
                    if (text) {
                        if (LOG_TRANSCRIPTS) console.log(`[GeminiBridge Transcript IN] ${text} (${callId})`);
                        if (state.onInputTranscription) state.onInputTranscription(text);
                    }
                }

                if (msg.serverContent?.outputTranscription?.text) {
                    const text = msg.serverContent.outputTranscription.text.trim();
                    if (text) {
                        if (LOG_TRANSCRIPTS) console.log(`[GeminiBridge Transcript OUT] ${text} (${callId})`);
                        if (state.onOutputTranscription) state.onOutputTranscription(text);
                    }
                }

                // Handle turn completion & interruptions
                if (msg.serverContent?.turnComplete) {
                    if (msg.serverContent?.interrupted) {
                        console.log(`[GeminiBridge] *** INTERRUPTED *** — clearing outbound queue (${callId})`);
                        if (!state.initialGreetingActive && Date.now() >= (state.bargeInEnabledAt || 0)) {
                            if (state.onInterrupted) state.onInterrupted();
                        }
                    }

                    if (state.initialGreetingActive) {
                        state.initialGreetingActive = false;
                        state.bargeInEnabledAt = Date.now() + 500;
                        console.log(`[GeminiBridge] Initial greeting completed; barge-in enabled (${callId})`);
                    }
                }

                // Function call (Tool Calling)
                if (msg.toolCall?.functionCalls?.length > 0) {
                    for (const fc of msg.toolCall.functionCalls) {
                        console.log(`[GeminiBridge] Tool call: ${fc.name} (${callId})`);

                        // Soporte nativo para colgar llamada de forma limpia y graciosa
                        if (fc.name === 'end_call') {
                            const whatsappCallManager = require('./whatsappCallManager');
                            console.log(`[GeminiBridge] Ejecutando colgado nativo por end_call (${callId})`);
                            sendToolResponse(callId, fc.name, fc.id, { success: true });
                            setTimeout(() => {
                                whatsappCallManager.endCall(callId);
                            }, 2000); // 2s delay for final goodbye audio
                            continue;
                        }

                        if (state.onFunctionCall) {
                            state.onFunctionCall(fc.name, fc.args || {}, fc.id);
                        }
                    }
                }

            } catch (e) {
                console.error(`[GeminiBridge] Parse error (${callId}):`, e.message);
            }
        });

        ws.on('error', (err) => {
            console.error(`[GeminiBridge] WebSocket error (${callId}):`, err.message);
            sessions.delete(callId);
            if (onError) onError(err);
            reject(err);
        });

        ws.on('close', (code, reason) => {
            console.log(`[GeminiBridge] Session closed (${callId}) code=${code}`);
            sessions.delete(callId);
        });
    });
}

/**
 * Send a PCM audio chunk to Gemini for the given call.
 * PCM must be 16-bit, 16kHz, mono.
 */
function sendAudio(callId, pcmBuffer) {
    const state = sessions.get(callId);
    if (!state || !pcmBuffer || pcmBuffer.length === 0 || !state.ready) return;

    // Keep the initial greeting intact
    if (state.initialGreetingActive) return;

    // --- LOCAL VAD (Barge-in detection) ---
    let sumSquares = 0;
    for (let i = 0; i < pcmBuffer.length; i += 2) {
        const sample = pcmBuffer.readInt16LE(i) / 32768.0;
        sumSquares += sample * sample;
    }
    const rms = Math.sqrt(sumSquares / (pcmBuffer.length / 2));
    
    const now = Date.now();
    const assistantPlaybackActive = typeof state.assistantAudioStateProvider === 'function'
        ? !!state.assistantAudioStateProvider()
        : false;
    const aiLikelySpeaking = now <= (state.modelAudioActiveUntil || 0) || assistantPlaybackActive;
    const aboveSpeechThreshold = rms >= BARGE_IN_RMS_THRESHOLD;

    if (aboveSpeechThreshold && aiLikelySpeaking && now >= (state.bargeInEnabledAt || 0)) {
        state.consecutiveSpeechFrames = (state.consecutiveSpeechFrames || 0) + 1;
    } else if (rms < BARGE_IN_RMS_THRESHOLD * 0.65 || !aiLikelySpeaking) {
        state.consecutiveSpeechFrames = 0;
    }

    if (
        state.consecutiveSpeechFrames >= BARGE_IN_MIN_FRAMES &&
        (!state.lastInterruptTime || now - state.lastInterruptTime > BARGE_IN_COOLDOWN_MS)
    ) {
        console.log(`[GeminiBridge] 🎤 Sustained speech detected (RMS: ${rms.toFixed(3)}, frames:${state.consecutiveSpeechFrames}). Interrupting Gemini...`);
        state.lastInterruptTime = now;
        state.consecutiveSpeechFrames = 0;
        state.ignoreAudioUntil = now + IGNORE_AUDIO_AFTER_INTERRUPT_MS;

        if (state.onInterrupted) state.onInterrupted();

        if (SEND_LOCAL_INTERRUPT_SIGNAL) {
            _sendRealtimeText(state, '[SISTEMA] El cliente interrumpió. Detén tu respuesta actual y atiende el audio del cliente.');
        }
    }
    // --------------------------------------

    if (!state.inputPcmBuffer) state.inputPcmBuffer = Buffer.alloc(0);
    state.inputPcmBuffer = Buffer.concat([state.inputPcmBuffer, pcmBuffer]);

    while (state.inputPcmBuffer.length >= INPUT_CHUNK_BYTES) {
        const chunk = state.inputPcmBuffer.subarray(0, INPUT_CHUNK_BYTES);
        state.inputPcmBuffer = state.inputPcmBuffer.subarray(INPUT_CHUNK_BYTES);

        state.sendCount++;
        state.sendBytes += chunk.length;
        if (state.sendCount === 1) {
            console.log(`[GeminiBridge] *** FIRST AUDIO SENT TO GEMINI *** pcmLen=${chunk.length} (${callId})`);
        }
        if (state.sendCount % 50 === 0) {
            console.log(`[GeminiBridge DIAG] sent=${state.sendCount} chunks (${INPUT_CHUNK_BYTES}B each), ${state.sendBytes} bytes, received=${state.receiveCount} from Gemini (${callId.substring(0,20)})`);
        }
        _sendAudioChunk(state, chunk);
    }
}

function _sendAudioChunk(state, pcmBuffer) {
    if (state.ws.readyState !== WebSocket.OPEN) return;
    
    const msg = {
        realtimeInput: {
            audio: {
                data: pcmBuffer.toString('base64'),
                mimeType: 'audio/pcm;rate=16000'
            }
        }
    };
    state.ws.send(JSON.stringify(msg));
}

function _sendRealtimeText(state, text) {
    if (!state || state.ws.readyState !== WebSocket.OPEN || !text) return false;
    state.ws.send(JSON.stringify({
        realtimeInput: {
            text,
        },
    }));
    return true;
}

/**
 * Send a tool call result back to Gemini.
 */
function sendToolResponse(callId, toolName, toolId, result) {
    const state = sessions.get(callId);
    if (!state || state.ws.readyState !== WebSocket.OPEN) return;

    const msg = {
        toolResponse: {
            functionResponses: [
                {
                    name: toolName,
                    id: toolId,
                    response: { result },
                },
            ],
        },
    };
    state.ws.send(JSON.stringify(msg));
}

/**
 * Send a system instruction as a user turn to guide Gemini during a live call.
 */
function sendSystemMessage(callId, text) {
    const state = sessions.get(callId);
    return _sendRealtimeText(state, text);
}

function startInitialGreeting(callId) {
    const state = sessions.get(callId);
    if (!state || state.ws.readyState !== WebSocket.OPEN) return false;
    if (state.initialGreetingStarted) return true;

    state.initialGreetingActive = true;
    state.initialGreetingStarted = true;
    setTimeout(() => {
        const freshState = sessions.get(callId);
        if (freshState?.ws?.readyState === WebSocket.OPEN) {
            _sendRealtimeText(freshState, '[SISTEMA] La conexión de audio ya está aceptada por WhatsApp. Saluda al cliente según tu SALUDO INICIAL.');
        }
    }, GREETING_DELAY_MS);
    return true;
}

/**
 * Close and cleanup a Gemini session for a call.
 */
function closeSession(callId) {
    const state = sessions.get(callId);
    if (!state) return;

    if (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING) {
        state.ws.close(1000, 'Call ended');
    }
    sessions.delete(callId);
    console.log(`[GeminiBridge] Session closed for call ${callId}`);
}

function hasSession(callId) {
    return sessions.has(callId);
}

/**
 * Build the system prompt for a voice call from the client's bot config.
 */
function buildVoiceSystemPrompt(botConfig, businessName, welcomeMessage, knowledgeContext = '') {
    const biz = businessName || botConfig?.business_name || 'la empresa';
    const name = `Asistente de ${biz}`;
    const personality = botConfig?.personality || 'amable y profesional';

    const knowledgeSection = knowledgeContext?.trim()
        ? `\n\nBASE DE CONOCIMIENTO (usa esta información para responder preguntas):\n${knowledgeContext.substring(0, 50000)}`
        : '';

    return `Eres ${name}, el asistente de voz de ${biz}. Estás atendiendo una llamada de WhatsApp.

INSTRUCCIONES IMPORTANTES:
- Habla de forma natural, concisa y amigable. Máximo 2-3 oraciones por respuesta.
- En llamada, prioriza turnos cortos: pregunta una cosa a la vez y espera la respuesta.
- Si debes mencionar opciones, nombra máximo 3 opciones y evita leer listas largas.
- NO uses markdown, asteriscos, listas, ni emojis. Solo texto hablado natural.
- Si el usuario quiere hablar con un humano, aclara que no puedes transferir la llamada en vivo todavía y ofrece continuar ayudando de forma breve.
- Si el usuario se despide claramente, llama a end_call.
- Responde SIEMPRE en el mismo idioma que habla el usuario.
- SOLO habla de temas relacionados con ${biz}. Si preguntan algo fuera del contexto, redirige amablemente.

PERSONALIDAD: ${personality}${knowledgeSection}

SALUDO INICIAL:
${welcomeMessage || `Hola, hablas con ${name} de ${biz}. ¿En qué puedo ayudarte?`}`;
}

function setOnInterrupted(callId, callback) {
    const state = sessions.get(callId);
    if (state) state.onInterrupted = callback;
}

function setAssistantAudioStateProvider(callId, provider) {
    const state = sessions.get(callId);
    if (state && typeof provider === 'function') {
        state.assistantAudioStateProvider = provider;
    }
}

function setTranscriptionHandlers(callId, handlers = {}) {
    const state = sessions.get(callId);
    if (!state) return;
    if (typeof handlers.onInputTranscription === 'function') {
        state.onInputTranscription = handlers.onInputTranscription;
    }
    if (typeof handlers.onOutputTranscription === 'function') {
        state.onOutputTranscription = handlers.onOutputTranscription;
    }
}

module.exports = {
    createSession,
    sendAudio,
    sendToolResponse,
    sendSystemMessage,
    startInitialGreeting,
    closeSession,
    hasSession,
    buildVoiceSystemPrompt,
    setOnInterrupted,
    setAssistantAudioStateProvider,
    setTranscriptionHandlers,
};

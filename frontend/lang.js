const i18n = {
  current: 'es',
  translations: {
    es: {
      /* Nav / Header */
      'dashboard.title': 'Consola — WhatsApp Voice SDK Control Panel',
      'dashboard.heading': 'Consola de Voz y <span>Depuración</span>',
      'dashboard.subtitle': 'Configura tus tokens de Meta y Google para enlazar llamadas reales de WhatsApp en caliente.',
      'server.listening': 'Servidor Escuchando (Puerto 3006)',
      'nav.console': 'Consola',
      'nav.sdk': 'SDK Developers',
      'nav.landing': 'Landing B2B',

      /* Config Form */
      'config.title': 'Credenciales de la API y Gemini',
      'config.security': '<i class="fa-solid fa-shield-halved" style="color: #25d366;"></i> <strong>Seguridad B2B:</strong> Tu configuración es dinámica y se aislará en nuestro Enrutador Inteligente.',
      'config.webhook_url': 'URL de Webhook para Meta:',
      'config.session': 'Sesión:',
      'config.clear_session': 'Limpiar Sesión',
      'config.phone_id': 'Phone Number ID',
      'config.waba_id': 'WABA ID (opcional)',
      'config.access_token': 'Access Token (permanente)',
      'config.verify_token': 'Meta Webhook Verify Token',
      'config.gemini_key': 'Gemini Live API Key (AI Studio)',
      'config.save': 'Guardar y Conectar en Caliente',
      'config.phone_placeholder': '1123011100896276',
      'config.waba_placeholder': '2408134146358606',
      'config.meta_token_placeholder': 'Escriba o pegue su Access Token de Meta aquí...',
      'config.gemini_placeholder': 'Tu API Key de Google AI Studio',

      /* Outbound Call */
      'call.title': 'Llamada Saliente',
      'call.desc': 'Inicia una llamada desde el sistema a cualquier número de WhatsApp. El usuario debe haber otorgado permiso previamente (callback_permission_status: ENABLED).',
      'call.country': 'Código de País',
      'call.number': 'Número WhatsApp',
      'call.call_btn': 'Llamar',
      'call.hangup_btn': 'Colgar',
      'call.ready': 'Listo para llamar',
      'call.calling': 'Llamando a +{number}...',
      'call.initiated': 'Llamada iniciada',
      'call.connected': 'Conectado',
      'call.failed': 'Falló: {error}',
      'call.ended': 'Finalizada',
      'call.rejected': 'Rechazada',
      'call.ringing': 'Timbrando...',

      /* Status LEDs */
      'status.meta': 'Meta Webhook',
      'status.webrtc': 'WebRTC Channel',
      'status.gemini': 'Gemini Live WebSocket',

      /* Terminal */
      'terminal.title': 'live_logs@whatsapp_voice_sdk:~',
      'terminal.badge': 'LIVE DEBUGR',
      'terminal.startup': 'Consola depuradora de llamadas iniciada. Esperando enlace con el backend...',

      /* Carousel */
      'carousel.title': 'Asistente de Configuración Meta (Paso a Paso)',
      'carousel.step': 'Paso {current} de {total}',
      'carousel.prev': 'Anterior',
      'carousel.next': 'Siguiente',
      'carousel.complete': '¡Completado!',

      /* Requirements / Info */
      'req.title': 'Paso 1: Requisitos previos',
      'req.intro': 'Antes de empezar con la API de llamadas, asegúrate de lo siguiente:',
      'req.cloud_api': 'Tu número de empresa se usa con la <strong>API de la nube</strong> (no con la aplicación de WhatsApp Business tradicional).',
      'req.cloud_tip': '<i class="fa-solid fa-triangle-exclamation" style="color: var(--neon-yellow); margin-right: 6px;"></i><strong style="color: var(--text-main);">Recomendación clave:</strong> Los números con WhatsApp en la nube son los únicos que valen. Se recomienda usar un número nuevo o eliminar sus cuentas de WhatsApp personales/business para migrar a WhatsApp en la nube.',
      'req.migration_guide': 'Ver Guía de Migración Oficial <i class="fa-solid fa-up-right-from-square" style="font-size: 0.75rem;"></i>',
      'req.subscribe_calls': 'Suscribe tu aplicación al campo de webhook <strong><code>calls</code></strong> (a menos que quieras usar SIP).',
      'req.subscribe_waba': 'La misma app también debe estar suscrita a la <strong>cuenta de WhatsApp Business</strong> de tu número de teléfono del negocio.',
      'req.permissions': 'Esta app debe tener permisos de mensajes (<strong><code>whatsapp_business_messaging</code></strong>) para el número comercial.',
      'req.message_limit': 'La empresa debe tener un límite de mensajes diario de al menos <strong>2.000 destinatarios únicos</strong>.',
      'req.enable_calling': 'Activar las funciones de llamada en el <strong>número de teléfono de tu negocio</strong>.',

      'info.title': 'Integración Oficial y Sin Riesgos',
      'info.badge': 'Uso oficial de Meta APIs (0% Riesgo de Baneo o Bloqueos)',
      'info.body': 'Este sistema se conecta de forma directa a los servidores de Meta mediante las APIs en la nube de WhatsApp y WebRTC corporativas. Al usar canales oficiales y documentados, <strong>no existe ningún riesgo de penalización o suspensión de número</strong> para tu negocio, garantizando máxima estabilidad corporativa.',
      'info.docs_title': 'Documentación de Voz de Meta',
      'info.docs_desc': 'Acceda a la guía oficial de desarrolladores de Meta para revisar a fondo el protocolo de integración de voz y WebRTC en la nube:',
      'info.docs_btn': '<i class="fa-solid fa-up-right-from-square"></i> Documentación de Voz de Meta',
      'info.demo_title': '¿Deseas una Demostración Comercial?',
      'info.demo_desc': 'Si deseas una demostración interactiva en tiempo real o negociar la integración en caliente en tus servidores, ponte en contacto directo por WhatsApp con nuestro equipo.',
      'info.demo_btn': '<i class="fa-brands fa-whatsapp" style="font-size: 1.1rem;"></i> Contactar por WhatsApp',

      /* Footer */
      'footer.terms': 'Términos y Condiciones',
      'footer.privacy': 'Políticas de Privacidad',
      'footer.copyright': '&copy; 2026 NEURO IA S.A.S. Todos los derechos reservados. Licencia de Distribución Comercial Autorizada.',

      /* Logs app.js */
      'log.connecting': 'Conectando con el Servidor de Voz en {url}...',
      'log.connected': '🟢 Conexión activa con el backend. Cargando datos de persistencia...',
      'log.disconnected': '🔴 Se perdió la conexión con el servidor backend.',
      'log.connect_error': '⚠️ No se pudo conectar por Socket.IO. La consola intentará usar HTTP directo.',
      'log.meta_loaded': '✅ Credenciales de Meta cargadas correctamente desde la base de datos.',
      'log.meta_missing': '⚠️ Faltan credenciales de Meta (Phone Number ID o Access Token) en la base de datos.',
      'log.gemini_loaded': '🧠 API Key de Gemini cargada correctamente desde la base de datos.',
      'log.gemini_missing': '⚠️ Falta configurar la Gemini API Key para que el bot pueda responder.',
      'log.config_loaded': 'Configuración cargada vía {source}.',
      'log.http_error': 'No se pudo cargar configuración por HTTP: {error}',
      'log.webrtc_connected': '🟢 Conexión WebRTC completamente establecida y activa.',
      'log.gemini_connected': '🧠 Canal de voz activo en directo con Gemini Live.',
      'log.call_incoming': '🔔 ¡Llamada real detectada! Emisor: {caller}',
      'log.call_terminated': '📴 Llamada finalizada por el emisor.',
      'log.fields_required': '⚠️ Por favor, ingresa los campos requeridos (*) antes de guardar.',
      'log.fields_alert': 'Por favor, completa los campos requeridos (*): Phone Number ID, Access Token y Gemini API Key.',
      'log.saving': '⚙️ Sincronizando credenciales en caliente con la base de datos...',
      'log.http_retry': '⏳ La configuración sigue sin confirmación. Reintentando HTTP...',
      'log.saving_http': '⚙️ Guardando configuración por HTTP...',
      'log.saved_ok': '🟢 Credenciales guardadas con éxito (Aisladas en Enrutador B2B).',
      'log.saved_alert': '¡Credenciales seguras guardadas! La sesión durará 30 minutos.',
      'log.save_error': '🔴 Error al intentar guardar la configuración en la base de datos.',
      'log.save_error_alert': 'Hubo un error al guardar la configuración en el servidor.',
      'log.destroying': '⚙️ Destruyendo credenciales persistentes en el servidor...',
      'log.destroyed_socket': '🟢 Sesión destruida con éxito vía WebSockets.',
      'log.destroyed_http': '🟢 Sesión destruida con éxito vía API REST (Fallback).',
      'log.destroy_warning': '⚠️ No se pudo confirmar la destrucción remota en el backend REST, pero la interfaz local ha sido purgada.',
      'log.confirm_destroy': '¿Estás seguro de que deseas destruir las credenciales del server y cerrar la sesión?',
      'log.destroy_alert': 'Sesión destruida y credenciales borradas del servidor.',
      'log.call_started': '📞 Iniciando llamada saliente a +{number}...',
      'log.call_started_ok': '🟢 Llamada iniciada. ID: {id}',
      'log.call_start_error': '🔴 Error al iniciar llamada: {error}',
      'log.call_ending': '📴 Finalizando llamada saliente...',
      'log.call_ended': 'Llamada finalizada.',
      'log.session_expired': '⚠️ Sesión expirada. Por seguridad las credenciales se han destruido en el servidor.',
      'log.timeout_remaining': 'La sesión durará 30 minutos.',

      /* Carousel steps */
      'step1.title': '1. Registrarse en Meta Developers',
      'step2.title': '2. Crear una Aplicación de Negocio',
      'step3.title': '3. Agregar el Producto WhatsApp',
      'step4.title': '4. Entrar a Configuración de la API',
      'step5.title': '5. Configurar URL de Devolución',
      'step6.title': '6. Suscribirse a Campos de Webhook',
      'step7.title': '7. Copiar Credenciales a la Consola',
      'step8.title': '8. Guardar y Conectar en Caliente',
      'step5.note': '<i class="fa-solid fa-stopwatch"></i> <strong>Nota:</strong> Al guardar en el Dashboard, tienes <b>30 minutos exactos</b> para probar. Luego la sesión se destruye.',

      /* Developers page */
      'dev.badge': '🚀 MOTOR DE VOZ IA CON SOBERANÍA TECNOLÓGICA',
      'dev.heading': 'Experience liftoff with the <span>WhatsApp Voice SDK</span>',
      'dev.subtitle': 'Ahorra meses de desarrollo de código WebRTC complejo, Opus RTP streams y decodificaciones. Te entregamos la única plantilla en Node.js ultra-documentada para conectar llamadas telefónicas de WhatsApp con Gemini Live en tiempo real.',
      'dev.explore': 'Explorar Características',
      'pricing.title': 'Adquiere la Licencia del Repositorio',
      'pricing.desc': 'Llévate el código de producción completo y lanza agentes de voz en tu país hoy mismo.',
      'pricing.price': 'Contáctanos:',
      'pricing.what_you_get': '<i class="fa-solid fa-box-open"></i> ¿Qué recibes al comprar?',
      'pricing.get_desc': 'Entregamos acceso directo al Repositorio Git para que clones <b>exactamente el mismo código</b> con el que acabas de hacer la prueba de conexión en la demo. Funcional al 100% <i>Out-of-the-Box</i>.',
      'pricing.feature1': '<b>Libertad Total de Modificación:</b> Adapta y escala la lógica a tu propio modelo de negocio.',
      'pricing.feature2': '<b>Código WebRTC Completo:</b> Negociación SDP de WhatsApp Calls con node-datachannel.',
      'pricing.feature3': '<b>Puente Gemini Live:</b> Audio WebSocket bidireccional fluido a 24kHz.',
      'pricing.feature4': '<b>Base de Datos Persistente:</b> Capa de almacenamiento local o PostgreSQL.',
      'pricing.feature5': '<b>Documentación bilingüe:</b> Explicado línea por línea en español e inglés.',
      'pricing.contact': '<i class="fa-brands fa-whatsapp" style="font-size: 1.25rem;"></i> Contactar',
      'features.arch_title': '🛠&nbsp; Especificaciones de Arquitectura',
      'features.arch_desc': 'Un kit diseñado para desarrolladores profesionales y startups que exigen código limpio y escalable.',
      'feat.persistence': 'Persistencia Segura',
      'feat.persistence_desc': 'Credenciales almacenadas de manera local. Listo para ser migrado a PostgreSQL o Prisma con un par de líneas.',
      'feat.latency': 'Baja Latencia',
      'feat.latency_desc': 'Transcodificación en caliente de Opus RTP a Raw PCM (16kHz) garantizando respuestas de voz inmediatas con IA.',
      'feat.modifiable': '100% Modificable',
      'feat.modifiable_desc': 'Código Node.js modular sin ofuscación ni dependencias innecesarias, con documentación bilingüe.',
      'guide.title': '<i class="fa-solid fa-book-open text-violet"></i> Estructura de Integración Rápida',
      'guide.desc': 'Bypassa meses de investigación de la API de Meta siguiendo este stepper estructural para configurar tu entorno de producción:',
      'guide.step1': 'Crear App en Meta Developers',
      'guide.step1_desc': 'Entra a <a href="https://developers.facebook.com/" target="_blank">Meta for Developers</a>, crea una App de tipo <b>Negocios (Business)</b> y agrégale el producto <b>WhatsApp</b>.',
      'guide.step2': 'Configurar el Webhook en Meta',
      'guide.step2_desc': 'Apunta la URL del Webhook a tu servidor expuesto (ej. mediante Ngrok a <code>http://localhost:3006/webhook</code>). Usa como Verify Token el mismo que guardes en tu base de datos.',
      'guide.step3': 'Llamar y Conectar en Vivo',
      'guide.step3_desc': 'Obtén tu <b>Phone Number ID</b>, guarda los valores en la Consola y llama directamente al número. El backend capturará la señal e iniciará el puente en tiempo real.',
    },
    en: {
      /* Nav / Header */
      'dashboard.title': 'Console — WhatsApp Voice SDK Control Panel',
      'dashboard.heading': 'Voice Console & <span>Debugging</span>',
      'dashboard.subtitle': 'Configure your Meta and Google tokens to hot-link real WhatsApp calls.',
      'server.listening': 'Server Listening (Port 3006)',
      'nav.console': 'Console',
      'nav.sdk': 'SDK Developers',
      'nav.landing': 'B2B Landing',

      /* Config Form */
      'config.title': 'API & Gemini Credentials',
      'config.security': '<i class="fa-solid fa-shield-halved" style="color: #25d366;"></i> <strong>B2B Security:</strong> Your config is dynamic and isolated in our Smart Router.',
      'config.webhook_url': 'Webhook URL for Meta:',
      'config.session': 'Session:',
      'config.clear_session': 'Clear Session',
      'config.phone_id': 'Phone Number ID',
      'config.waba_id': 'WABA ID (optional)',
      'config.access_token': 'Access Token (permanent)',
      'config.verify_token': 'Meta Webhook Verify Token',
      'config.gemini_key': 'Gemini Live API Key (AI Studio)',
      'config.save': 'Save & Hot Connect',
      'config.phone_placeholder': '1123011100896276',
      'config.waba_placeholder': '2408134146358606',
      'config.meta_token_placeholder': 'Enter or paste your Meta Access Token here...',
      'config.gemini_placeholder': 'Your Google AI Studio API Key',

      /* Outbound Call */
      'call.title': 'Outbound Call',
      'call.desc': 'Start a call from the system to any WhatsApp number. The user must have granted permission (callback_permission_status: ENABLED).',
      'call.country': 'Country Code',
      'call.number': 'WhatsApp Number',
      'call.call_btn': 'Call',
      'call.hangup_btn': 'Hang Up',
      'call.ready': 'Ready to call',
      'call.calling': 'Calling +{number}...',
      'call.initiated': 'Call initiated',
      'call.connected': 'Connected',
      'call.failed': 'Failed: {error}',
      'call.ended': 'Ended',
      'call.rejected': 'Rejected',
      'call.ringing': 'Ringing...',

      /* Status LEDs */
      'status.meta': 'Meta Webhook',
      'status.webrtc': 'WebRTC Channel',
      'status.gemini': 'Gemini Live WebSocket',

      /* Terminal */
      'terminal.title': 'live_logs@whatsapp_voice_sdk:~',
      'terminal.badge': 'LIVE DEBUG',
      'terminal.startup': 'Call debug console started. Waiting for backend connection...',

      /* Carousel */
      'carousel.title': 'Meta Setup Assistant (Step by Step)',
      'carousel.step': 'Step {current} of {total}',
      'carousel.prev': 'Previous',
      'carousel.next': 'Next',
      'carousel.complete': 'Completed!',

      /* Requirements / Info */
      'req.title': 'Step 1: Prerequisites',
      'req.intro': 'Before getting started with the Calls API, make sure of the following:',
      'req.cloud_api': 'Your business number uses the <strong>Cloud API</strong> (not the traditional WhatsApp Business app).',
      'req.cloud_tip': '<i class="fa-solid fa-triangle-exclamation" style="color: var(--neon-yellow); margin-right: 6px;"></i><strong style="color: var(--text-main);">Key recommendation:</strong> Only cloud API WhatsApp numbers work. Use a new number or remove personal/business WhatsApp accounts to migrate to the cloud.',
      'req.migration_guide': 'View Official Migration Guide <i class="fa-solid fa-up-right-from-square" style="font-size: 0.75rem;"></i>',
      'req.subscribe_calls': 'Subscribe your app to the <strong><code>calls</code></strong> webhook field (unless you want to use SIP).',
      'req.subscribe_waba': 'The same app must be subscribed to the <strong>WhatsApp Business Account</strong> of your business phone number.',
      'req.permissions': 'This app must have message permissions (<strong><code>whatsapp_business_messaging</code></strong>) for the business number.',
      'req.message_limit': 'The business must have a daily message limit of at least <strong>2,000 unique recipients</strong>.',
      'req.enable_calling': 'Enable calling features on your <strong>business phone number</strong>.',

      'info.title': 'Official & Risk-Free Integration',
      'info.badge': 'Official Meta APIs usage (0% Risk of Ban or Block)',
      'info.body': 'This system connects directly to Meta servers using the WhatsApp Cloud API and enterprise WebRTC. By using official, documented channels, <strong>there is no risk of number penalty or suspension</strong> for your business, ensuring maximum corporate stability.',
      'info.docs_title': 'Meta Voice Documentation',
      'info.docs_desc': 'Access Meta\'s official developer guide to review the voice and WebRTC cloud integration protocol in detail:',
      'info.docs_btn': '<i class="fa-solid fa-up-right-from-square"></i> Meta Voice Documentation',
      'info.demo_title': 'Want a Commercial Demo?',
      'info.demo_desc': 'If you want an interactive real-time demo or negotiate a hot integration on your servers, contact us directly on WhatsApp.',
      'info.demo_btn': '<i class="fa-brands fa-whatsapp" style="font-size: 1.1rem;"></i> Contact via WhatsApp',

      /* Footer */
      'footer.terms': 'Terms & Conditions',
      'footer.privacy': 'Privacy Policies',
      'footer.copyright': '&copy; 2026 NEURO IA S.A.S. All rights reserved. Authorized Commercial Distribution License.',

      /* Logs app.js */
      'log.connecting': 'Connecting to Voice Server at {url}...',
      'log.connected': '🟢 Connection active with backend. Loading persistence data...',
      'log.disconnected': '🔴 Lost connection to backend server.',
      'log.connect_error': '⚠️ Could not connect via Socket.IO. Console will try direct HTTP.',
      'log.meta_loaded': '✅ Meta credentials loaded successfully from database.',
      'log.meta_missing': '⚠️ Missing Meta credentials (Phone Number ID or Access Token) in database.',
      'log.gemini_loaded': '🧠 Gemini API Key loaded successfully from database.',
      'log.gemini_missing': '⚠️ Gemini API Key not configured. The bot won\'t be able to respond.',
      'log.config_loaded': 'Configuration loaded via {source}.',
      'log.http_error': 'Could not load config via HTTP: {error}',
      'log.webrtc_connected': '🟢 WebRTC connection fully established and active.',
      'log.gemini_connected': '🧠 Voice channel active with Gemini Live.',
      'log.call_incoming': '🔔 Real call detected! From: {caller}',
      'log.call_terminated': '📴 Call ended by the caller.',
      'log.fields_required': '⚠️ Please fill in all required fields (*) before saving.',
      'log.fields_alert': 'Please complete the required fields (*): Phone Number ID, Access Token and Gemini API Key.',
      'log.saving': '⚙️ Syncing credentials hot with database...',
      'log.http_retry': '⏳ Config still unconfirmed. Retrying via HTTP...',
      'log.saving_http': '⚙️ Saving config via HTTP...',
      'log.saved_ok': '🟢 Credentials saved successfully (Isolated in B2B Router).',
      'log.saved_alert': 'Secure credentials saved! Session will last 30 minutes.',
      'log.save_error': '🔴 Error saving configuration to database.',
      'log.save_error_alert': 'There was an error saving the configuration on the server.',
      'log.destroying': '⚙️ Destroying persistent credentials on server...',
      'log.destroyed_socket': '🟢 Session destroyed successfully via WebSockets.',
      'log.destroyed_http': '🟢 Session destroyed successfully via REST API (Fallback).',
      'log.destroy_warning': '⚠️ Could not confirm remote destruction on backend REST, but local interface has been purged.',
      'log.confirm_destroy': 'Are you sure you want to destroy all server credentials and close the session?',
      'log.destroy_alert': 'Session destroyed and credentials cleared from server.',
      'log.call_started': '📞 Initiating outbound call to +{number}...',
      'log.call_started_ok': '🟢 Call initiated. ID: {id}',
      'log.call_start_error': '🔴 Error starting call: {error}',
      'log.call_ending': '📴 Ending outbound call...',
      'log.call_ended': 'Call ended.',
      'log.session_expired': '⚠️ Session expired. Credentials have been destroyed on the server for security.',
      'log.timeout_remaining': 'Session will last 30 minutes.',

      /* Carousel steps */
      'step1.title': '1. Register at Meta Developers',
      'step2.title': '2. Create a Business App',
      'step3.title': '3. Add WhatsApp Product',
      'step4.title': '4. Go to API Settings',
      'step5.title': '5. Configure Webhook URL',
      'step6.title': '6. Subscribe to Webhook Fields',
      'step7.title': '7. Copy Credentials to Console',
      'step8.title': '8. Save & Hot Connect',
      'step5.note': '<i class="fa-solid fa-stopwatch"></i> <strong>Note:</strong> After saving in the Dashboard, you have <b>exactly 30 minutes</b> to test. Then the session self-destructs.',

      /* Developers page */
      'dev.badge': '🚀 AI VOICE ENGINE WITH TECHNOLOGICAL SOVEREIGNTY',
      'dev.heading': 'Experience liftoff with the <span>WhatsApp Voice SDK</span>',
      'dev.subtitle': 'Save months of complex WebRTC code, Opus RTP stream, and decoding development. We deliver the only ultra-documented Node.js template to connect WhatsApp phone calls with Gemini Live in real time.',
      'dev.explore': 'Explore Features',
      'pricing.title': 'Get the Repository License',
      'pricing.desc': 'Take the full production code and launch voice agents in your country today.',
      'pricing.price': 'Contact us:',
      'pricing.what_you_get': '<i class="fa-solid fa-box-open"></i> What you get when you buy:',
      'pricing.get_desc': 'We deliver direct Git repository access so you can clone <b>the exact same code</b> you tested in the demo. 100% functional Out-of-the-Box.',
      'pricing.feature1': '<b>Full Modification Freedom:</b> Adapt and scale the logic to your own business model.',
      'pricing.feature2': '<b>Complete WebRTC Code:</b> SDP negotiation for WhatsApp Calls with node-datachannel.',
      'pricing.feature3': '<b>Gemini Live Bridge:</b> Seamless bidirectional WebSocket audio at 24kHz.',
      'pricing.feature4': '<b>Persistent Database:</b> Local storage layer or PostgreSQL.',
      'pricing.feature5': '<b>Bilingual documentation:</b> Explained line by line in Spanish and English.',
      'pricing.contact': '<i class="fa-brands fa-whatsapp" style="font-size: 1.25rem;"></i> Contact Us',
      'features.arch_title': '🛠&nbsp; Architecture Specifications',
      'features.arch_desc': 'A kit designed for professional developers and startups who demand clean, scalable code.',
      'feat.persistence': 'Secure Persistence',
      'feat.persistence_desc': 'Credentials stored locally. Ready to migrate to PostgreSQL or Prisma in a couple of lines.',
      'feat.latency': 'Low Latency',
      'feat.latency_desc': 'Hot transcoding from Opus RTP to Raw PCM (16kHz) guaranteeing immediate AI voice responses.',
      'feat.modifiable': '100% Modifiable',
      'feat.modifiable_desc': 'Modular Node.js code with no obfuscation or unnecessary dependencies, with bilingual documentation.',
      'guide.title': '<i class="fa-solid fa-book-open text-violet"></i> Quick Integration Structure',
      'guide.desc': 'Skip months of Meta API research by following this structural stepper to set up your production environment:',
      'guide.step1': 'Create App in Meta Developers',
      'guide.step1_desc': 'Go to <a href="https://developers.facebook.com/" target="_blank">Meta for Developers</a>, create a <b>Business</b> type App and add the <b>WhatsApp</b> product.',
      'guide.step2': 'Configure Webhook in Meta',
      'guide.step2_desc': 'Point the Webhook URL to your exposed server (e.g., via Ngrok at <code>http://localhost:3006/webhook</code>). Use the same Verify Token you saved in your database.',
      'guide.step3': 'Call & Connect Live',
      'guide.step3_desc': 'Get your <b>Phone Number ID</b>, save the values in the Console and call the number directly. The backend will capture the signal and start the real-time bridge.',
    },
  },

  _initRan: false,
  _fallbacks: {},

  _init() {
    if (this._initRan) return;
    this._initRan = true;

    const saved = localStorage.getItem('neurocall_lang');
    if (saved === 'es' || saved === 'en') {
      this.current = saved;
    } else {
      this.current = navigator.language?.startsWith('es') ? 'es' : 'en';
    }

    document.documentElement.lang = this.current;
    this._bindToggle();
    this._translateDOM();
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === this.current);
    });
  },

  _bindToggle() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang-btn');
        if (lang === 'es' || lang === 'en') {
          this.setLang(lang);
        }
      });
    });
  },

  _translateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const isHtml = el.getAttribute('data-i18n-html') === 'true';
      const text = this.t(key);
      if (text !== null) {
        if (isHtml) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text !== null) el.placeholder = text;
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      const text = this.t(key);
      if (text !== null) el.value = text;
    });

    document.documentElement.lang = this.current;
  },

  t(key, vars = {}) {
    const text = this.translations[this.current]?.[key];
    if (text === undefined) {
      if (!this._fallbacks[key]) {
        this._fallbacks[key] = true;
      }
      return null;
    }
    let result = text;
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return result;
  },

  setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    this.current = lang;
    localStorage.setItem('neurocall_lang', lang);
    this._translateDOM();
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === lang);
    });
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  },
};

function __(key, vars = {}) {
  return i18n.t(key, vars) || key;
}

document.addEventListener('DOMContentLoaded', () => i18n._init());

# NeuroCall — WhatsApp Voice SDK

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/WebRTC-Live_Voice-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Gemini-AI_Bridge-orange?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/WhatsApp-Business_API-25D366?style=for-the-badge&logo=whatsapp" />
  <img src="https://img.shields.io/badge/License-Commercial-red?style=for-the-badge" />
</p>

> **SDK comercial para desplegar agentes de voz IA sobre WhatsApp Business.  
> Desarrollado por [NEURO IA S.A.S.](https://wa.me/593987865420)**

---

## ¿Qué es NeuroCall?

NeuroCall es un motor de llamadas de voz impulsado por Inteligencia Artificial que se integra directamente con tu número de **WhatsApp Business**. Procesa audio en tiempo real, transcribe y genera respuestas naturales usando **Google Gemini**, y las devuelve al cliente como voz fluida — todo en menos de 1 segundo de latencia.

```
Cliente llama por WA  ──►  WhatsApp Cloud API
                                  │
                            Webhook recibe
                                  │
                         WebRTC Audio Bridge
                                  │
                        Gemini Live AI Engine
                                  │
                      Respuesta de voz en tiempo real
                                  │
                     ◄──  Cliente recibe respuesta
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Servidor | Node.js + Express |
| Tiempo real | Socket.IO + WebRTC (node-datachannel) |
| IA de voz | Google Gemini Live API |
| Mensajería | WhatsApp Cloud API (Meta) |
| Base de datos | SQLite (database.js) |
| Consola | Dashboard HTML + Vanilla JS |

---

## Estructura del Repositorio

```
whatsapp-voice-sdk_dev/
├── backend/
│   ├── server.js                    # Servidor principal Express + Socket.IO
│   ├── database.js                  # Gestión de base de datos SQLite
│   ├── database.json                # Esquema de configuración
│   ├── package.json                 # Dependencias del proyecto
│   ├── .env.example                 # Plantilla de variables de entorno
│   └── services/
│       ├── geminiLiveBridge.js      # Puente de audio con Gemini Live
│       └── whatsappCallManager.js   # Gestión de llamadas WhatsApp
└── frontend/
    ├── dashboard.html               # Consola de administración
    ├── app.js                       # Lógica de la consola
    ├── styles.css                   # Estilos de la consola
    └── desarrolladores.html         # Documentación interactiva
```

---

## Instalación Rápida

### Prerrequisitos

- Node.js v18 o superior
- Cuenta de **WhatsApp Business API** (Meta for Developers)
- API Key de **Google Gemini**
- Servidor con IP pública o túnel (ngrok, Cloudflare Tunnel, etc.)

### 1. Clonar e instalar

```bash
git clone https://github.com/gglveliz-byte/whatsapp-voice-sdk_dev.git
cd whatsapp-voice-sdk_dev/backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# WhatsApp Business
PHONE_NUMBER_ID=tu_phone_number_id
WABA_ID=tu_waba_id
META_TOKEN=tu_meta_access_token
META_VERIFY_TOKEN=tu_token_de_verificacion

# Google Gemini
GEMINI_API_KEY=tu_api_key_de_gemini

# Servidor
PORT=3006
```

### 3. Arrancar el servidor

```bash
node server.js
```

El servidor correrá en `http://localhost:3006`.  
Accede a la consola de administración en: `http://localhost:3006/dashboard.html`

---

## Configurar el Webhook de WhatsApp

En el panel de [Meta for Developers](https://developers.facebook.com):

1. Ve a tu App → **WhatsApp → Configuración**
2. En **Webhook**, agrega la URL: `https://tu-dominio.com/webhook`
3. En **Verify Token**, escribe el mismo valor que pusiste en `.env`
4. Suscribe el evento: `messages`

---

## Consola de Administración

La consola web incluida te permite:

- 🔗 Conectar tu número de WhatsApp Business en tiempo real
- 📊 Monitorear el estado de los agentes (WebRTC, Meta, Gemini)
- 📟 Ver logs en vivo de las llamadas activas
- ⚙️ Configurar credenciales sin tocar el código

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/webhook` | Verificación del webhook de Meta |
| `POST` | `/webhook` | Recepción de mensajes/llamadas |
| `GET` | `/health` | Estado del servidor |
| `WS` | `/socket.io` | Canal en tiempo real (Socket.IO) |

---

## Licencia Comercial

Este repositorio está protegido bajo **Licencia Comercial Privada**.

- ✅ Uso permitido para instalaciones autorizadas por NEURO IA S.A.S.
- ❌ Redistribución no permitida sin autorización escrita
- ❌ Uso en sistemas de fraude, spam o acoso estrictamente prohibido
- ❌ Ingeniería inversa para crear productos competidores no permitida

Para adquirir una licencia comercial:  
📩 **[Contactar a NEURO IA S.A.S.](https://wa.me/593987865420)**

---

<p align="center">
  Desarrollado con ❤️ por <strong>NEURO IA S.A.S.</strong><br>
  © 2026 — Todos los derechos reservados
</p>

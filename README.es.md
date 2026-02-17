# ig-unfollow

> Identificá y dejá de seguir masivamente las cuentas de Instagram que no te siguen de vuelta — directamente desde tu navegador, sin instalación.

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e?logo=javascript&logoColor=black)
![Sin dependencias](https://img.shields.io/badge/dependencias-ninguna-brightgreen)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)
![Versión](https://img.shields.io/badge/version-2.0-informational)

---

## Para qué sirve

**ig-unfollow** es un script que corre en `instagram.com` usando tu sesión activa. Hace lo siguiente:

1. Obtiene tu lista completa de **seguidos** y **seguidores** vía la API de Instagram
2. Calcula quién **no te sigue de vuelta**
3. Los muestra en una interfaz limpia y con buscador
4. Te permite **seleccionar y dejar de seguirlos** con pausas automáticas de seguridad

Sin app, sin servidor, sin ingresar tu contraseña — usa la sesión que ya tenés abierta en el navegador.

---

## ⚠️ Aviso Legal

**Esta herramienta viola los Términos de Servicio de Instagram.**

Las posibles consecuencias incluyen bloqueos temporales de acciones, shadowban o suspensión de la cuenta. Usala bajo tu propio riesgo. El autor no acepta responsabilidad por ninguna penalización en la cuenta.

---

## Funcionalidades

| Funcionalidad | Detalle |
|---|---|
| **Detección de no-seguidores** | Compara la lista de seguidos con la de seguidores |
| **Delays anti-ban** | 8–15s entre unfollows, pausa de 2–5 min cada 10 acciones |
| **Límite diario** | Máximo de 120 unfollows/día (guardado en `localStorage`) |
| **Límite por sesión** | Máximo 60 unfollows por ejecución del script |
| **Whitelist** | Protegé cuentas específicas para que nunca sean removidas |
| **Búsqueda y filtro** | Filtrá la lista por nombre de usuario o nombre real |
| **Exportar** | Descargá la lista de no-seguidores en CSV o JSON |
| **Pausar / Reanudar** | Control total durante el proceso de unfollow |
| **Registro de actividad** | Log persistente de todas las acciones entre sesiones |
| **Scroll virtual** | Maneja listas de cualquier tamaño sin lag |
| **Sin dependencias** | Vanilla JavaScript puro, sin librerías externas |
| **Sin servidor** | Corre 100% en tu navegador usando tus propias cookies de sesión |

---

## Cómo usarlo

Hay dos formas de ejecutar el script. Ambas hacen lo mismo — solo cambia cómo cargás el código.

### Método 1 — Consola del navegador (más rápido)

1. Abrí [instagram.com](https://www.instagram.com) y asegurate de estar logueado
2. Abrí las DevTools:
   - **Windows / Linux:** `F12`
   - **Mac:** `Cmd + Option + I`
3. Hacé clic en la pestaña **Console**
4. Abrí `bookmarklet.html` de este repositorio en tu navegador y copiá el código
5. Pegalo en la consola y presioná **Enter**
6. Aparece un panel oscuro — hacé clic en **Scan**

### Método 2 — Bookmarklet (reutilizable)

1. Abrí `bookmarklet.html` en tu navegador
2. Hacé clic en **Copy Code**
3. Creá un nuevo marcador en tu navegador:
   - Clic derecho en la barra de marcadores → **Añadir página / Añadir marcador**
   - Pegá el código en el campo **URL** (no en el nombre)
   - Poné un nombre como `IG Unfollow`
4. Navegá a `instagram.com` y hacé clic en tu marcador
5. Hacé clic en **Scan**

---

## Cómo usar el panel

Una vez que el script carga, aparece un panel en la página:

```
┌─────────────────────────────────────────────┐
│  Instagram Unfollow                     [×]  │
│  Following: 1.240  │  Non-followers: 318     │
│  ─────────────────────────────────────────  │
│  [ Scan ]  [ Select All ]  [ Export ]        │
│  Buscar por usuario o nombre...              │
│  ┌─────────────────────────────────────────┐ │
│  │ 🛡 @usuario        Nombre         [ ] │ │
│  │ 🛡 @usuario2       Nombre         [ ] │ │
│  └─────────────────────────────────────────┘ │
│  [ Unfollow (0) ]                   [Pause]  │
└─────────────────────────────────────────────┘
```

| Acción | Cómo |
|---|---|
| **Scan** | Carga ambas listas y encuentra los no-seguidores |
| **Seleccionar** | Hacé clic en una fila para marcar/desmarcar |
| **Select All** | Selecciona todos los visibles (respeta el filtro de búsqueda) |
| **Whitelist** | Pasá el cursor sobre una fila → hacé clic en el ícono de escudo |
| **Export** | Descarga CSV o JSON de la lista filtrada actual |
| **Unfollow** | Inicia el proceso de dejar de seguir con delays de seguridad |
| **Pause / Resume** | Pausa la cola de unfollows en cualquier momento |
| **Escape** | Cierra el panel (solo cuando no está ejecutando unfollows) |

**Pestañas:**
- **Non-Followers** — la lista principal
- **Whitelist** — cuentas que protegiste
- **Activity** — registro de escaneos, unfollows y errores

---

## Sistema de seguridad

El script tiene un sistema anti-detección de múltiples capas:

| Mecanismo | Valor | Propósito |
|---|---|---|
| Delay entre unfollows | 8–15s aleatorio | Imitar comportamiento humano |
| Pausa larga ocasional | 20–40s (10% de probabilidad) | Aleatoriedad extra |
| Pausa por lote cada 10 | 2–5 min aleatorio | Prevenir rate limiting |
| Límite diario | 120 unfollows | Guardado en `localStorage` |
| Límite por sesión | 60 unfollows | Por ejecución del script |
| Backoff exponencial | 1–10 min en errores | Recuperación automática de rate limits |
| Detección de challenge | Para inmediatamente | Evita loops de verificación de cuenta |

**Tiempos estimados:**
- Escanear 1.000 cuentas: ~2 min
- Dejar de seguir 50 cuentas: ~10–15 min
- Dejar de seguir 120 cuentas (máximo diario): ~30–45 min

---

## Cómo funciona (técnico)

El script usa la API REST interna de Instagram — los mismos endpoints que usa la app web:

```
GET  /api/v1/friendships/{userId}/following/?count=100
GET  /api/v1/friendships/{userId}/followers/?count=100
POST /api/v1/friendships/destroy/{targetId}/
```

La autenticación se maneja automáticamente usando las cookies que ya están en tu navegador:
- `ds_user_id` — tu ID de usuario de Instagram
- `csrftoken` — token de protección CSRF

Nunca se lee, transmite ni almacena ninguna contraseña. El script solo se comunica con `instagram.com`.

---

## Privacidad y seguridad

- Corre **completamente en tu navegador** — sin servidores externos
- **No** lee, almacena ni transmite tu contraseña ni datos personales
- Usa **únicamente tu sesión activa de Instagram** (cookies generadas por Instagram)
- Todos los datos (whitelist, log, conteo diario) se guardan en `localStorage` de tu navegador
- Podés inspeccionar el código fuente completo en [`src/script-main.js`](src/script-main.js)

---

## Archivos

| Archivo | Descripción |
|---|---|
| [`src/script-main.js`](src/script-main.js) | Código fuente completo y legible |
| [`bookmarklet.html`](bookmarklet.html) | Guía de configuración + código minificado embebido |
| [`COPY_CODE.html`](COPY_CODE.html) | Interfaz mínima de copiar y pegar |
| [`README.md`](README.md) | Documentación en inglés |
| [`README.es.md`](README.es.md) | Documentación en español |

---

## Solución de problemas

**"Not logged in" o sin CSRF token**
→ Asegurate de estar logueado en Instagram. Cerrá las pestañas duplicadas de Instagram, recargá e intentá de nuevo.

**El escaneo se traba o devuelve 0 usuarios**
→ Instagram puede estar limitando las peticiones. Esperá unos minutos e intentá de nuevo. Asegurate de seguir a alguien.

**Los unfollows fallan inmediatamente**
→ Puede que hayas llegado a un bloqueo temporal. Esperá 24 horas antes de reintentar. Probá con menos usuarios a la vez.

**Challenge required — el script para**
→ Instagram está pidiendo verificación. Abrí Instagram normalmente, completá la verificación que pida, y esperá antes de usar el script de nuevo.

**El bookmarklet no funciona**
→ Confirmá que la URL guardada empiece con `javascript:`. Algunos navegadores bloquean bookmarklets — probá el método de consola en su lugar.

---

## Riesgos

| Riesgo | Probabilidad | Acción |
|---|---|---|
| Bloqueo temporal de unfollow | Alta | Esperá 24 horas |
| Shadowban | Media | Parar la automatización, publicar orgánicamente |
| Bloqueo de acciones | Media | Reducir toda la actividad de la cuenta |
| Suspensión de cuenta | Baja | Apelar a soporte de Instagram |

**Consejos para reducir riesgos:**
- Probá con 5–10 unfollows primero y esperá 24h
- Nunca usarlo más de una vez por semana
- Parar inmediatamente si Instagram marca tu cuenta

---

## Licencia

MIT — libre para usar, modificar y distribuir. Ver [LICENSE](LICENSE).

Este proyecto no está afiliado, respaldado ni asociado con Instagram ni Meta Platforms, Inc.

---

*Última actualización: Febrero 2026 · v2.0*

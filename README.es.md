# ig-unfollow

> Identificá y dejá de seguir masivamente las cuentas de Instagram que no te siguen de vuelta — directamente desde la consola del navegador, sin instalación.

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES2022-f7df1e?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/dependencias-ninguna-brightgreen" alt="Sin dependencias">
  <img src="https://img.shields.io/badge/licencia-MIT-blue" alt="Licencia">
  <img src="https://img.shields.io/badge/versión-3.0-blueviolet" alt="Versión">
  <img src="https://img.shields.io/badge/anti--ban-avanzado-orange" alt="Anti-Ban">
  <img src="https://img.shields.io/badge/servidor-no_necesario-success" alt="Sin servidor">
</p>

---

## Para qué sirve

**ig-unfollow** es una herramienta que corre directamente en `instagram.com` usando tu sesión activa. Hace lo siguiente:

1. Obtiene tu lista completa de **seguidos** y **seguidores** vía la API interna de Instagram
2. Identifica quién **no te sigue de vuelta** (no-seguidores)
3. Detecta **fans** — personas que te siguen pero vos no seguís de vuelta
4. Muestra todo en una interfaz oscura, limpia y con buscador
5. Te permite **seleccionar y dejar de seguirlos** con protección anti-ban multicapa

**Sin app, sin servidor, sin credenciales** — usa únicamente tu sesión activa del navegador.

---

## ⚠️ Aviso Legal

**Esta herramienta viola los Términos de Servicio de Instagram.**

Las posibles consecuencias incluyen bloqueos temporales de acciones, shadowban o suspensión de la cuenta. Usala bajo tu propio riesgo. El autor no acepta responsabilidad por ninguna penalización. Siempre probá con números pequeños primero.

---

## ✨ Funcionalidades (v3.0)

### Funciones Principales
| Funcionalidad | Detalle |
|---|---|
| **Detección de no-seguidores** | Diff completo entre seguidos y seguidores |
| **Detección de fans** | Ve quién te sigue pero no seguís de vuelta |
| **Whitelist** | Protegé cuentas para que nunca sean removidas |
| **Búsqueda y filtro** | Búsqueda en tiempo real por usuario o nombre |
| **Opciones de orden** | Ordenar por nombre (A-Z / Z-A), verificados, privados/públicos |
| **Exportar** | Descargar como CSV, JSON o TXT (solo usernames) |
| **Scroll virtual** | Maneja cualquier tamaño de lista sin lag |

### Sistema Anti-Ban
| Funcionalidad | Detalle |
|---|---|
| **Delays con jitter** | 10–20s entre unfollows con aleatoriedad humana |
| **Randomización de fingerprint** | Headers variados para evitar patrones de detección |
| **Límite por hora** | Máximo 25 unfollows/hora (configurable) |
| **Límite diario** | Máximo 100 unfollows/día en `localStorage` |
| **Límite por sesión** | Máximo 50 unfollows por ejecución |
| **Pausas por lote** | 3–7 min de pausa cada 7 acciones |
| **Pausas de seguridad forzadas** | 5–10 min obligatorios cada 30 requests |
| **Backoff exponencial** | 1.5–15 min en errores con multiplicador |
| **Monitor de conexión** | Detecta problemas de red, espera reconexión |
| **Simulación de navegación** | Pausas "idle" aleatorias de 3–8s |
| **Detección de challenges** | Para inmediatamente ante verificaciones |

### Interfaz
| Funcionalidad | Detalle |
|---|---|
| **UI tema oscuro** | Panel overlay moderno y limpio |
| **Badges de verificado** | ✓ para cuentas verificadas |
| **Indicador privado** | 🔒 para cuentas privadas |
| **Tiempo estimado (ETA)** | Estimación antes de iniciar unfollows |
| **Barra de progreso** | Progreso en tiempo real con indicador de velocidad |
| **Pausar / Reanudar / Detener** | Control total del proceso |
| **Registro de actividad** | Log persistente con estadísticas |
| **Panel de configuración** | Ajustá todos los límites y timing |
| **Atajos de teclado** | Esc, Ctrl+F, Ctrl+A, Space, 1-4 para pestañas |
| **Salida de consola rica** | Banner coloreado, tablas y progreso en DevTools |

### Técnico
| Funcionalidad | Detalle |
|---|---|
| **Sin dependencias** | Vanilla JavaScript puro |
| **Sin servidor** | Corre 100% en tu navegador |
| **API v1 REST** | Endpoints modernos y estables |
| **Seguro** | Nunca lee ni transmite tu contraseña |

---

## 🚀 Inicio Rápido

### Método 1 — Consola del navegador (más rápido)

1. Abrí [instagram.com](https://www.instagram.com) y logueate
2. Abrí las DevTools:
   - **Windows / Linux:** `F12`
   - **Mac:** `Cmd + Option + I`
3. Hacé clic en la pestaña **Console**
4. Copiá el código de [`src/script-main.js`](src/script-main.js)
5. Pegalo en la consola y presioná **Enter**
6. Hacé clic en **🔍 Scan** en el panel que aparece

### Método 2 — Bookmarklet (reutilizable)

1. Abrí `bookmarklet.html` en tu navegador
2. Copiá el código
3. Creá un nuevo marcador → pegá el código como **URL**
4. Navegá a `instagram.com` → hacé clic en tu marcador
5. Hacé clic en **🔍 Scan**

> Consultá [`GETTING_STARTED.md`](GETTING_STARTED.md) para instrucciones detalladas paso a paso.

---

## 📖 Cómo Usar

### El Panel

Una vez cargado, aparece un panel oscuro superpuesto:

```
┌─────────────────────────────────────────────────────┐
│  Instagram Unfollow  [v3.0]              [?]  [×]   │
│  ─────────────────────────────────────────────────  │
│  Following: 1.240 · Non-followers: 318 · Fans: 87  │
│  Protected: 12 · Today: 0/100 · Hour: 0/25         │
│  ─────────────────────────────────────────────────  │
│  ✓ 1.240 following · 318 no te siguen · 87 fans    │
│  ─────────────────────────────────────────────────  │
│  [Buscar...                    ] [Orden: Default ▾] │
│  ─────────────────────────────────────────────────  │
│  Non-Followers | Whitelist | Activity | Settings    │
│  ─────────────────────────────────────────────────  │
│  [🔍 Scan] [Select All] [Clear] [📥 Export] [👥 Fans]│
│  ┌─────────────────────────────────────────────────┐│
│  │ [pic] @user1 ✓      Nombre          🛡️  [☐]   ││
│  │ [pic] @user2 🔒     Nombre               [☐]   ││
│  │ [pic] @user3        Nombre               [☑]   ││
│  └─────────────────────────────────────────────────┘│
│  ⏱ Tiempo estimado para 3 usuarios: ~1min          │
│  ─────────────────────────────────────────────────  │
│  [ Unfollow (1) ]              [⏸ Pause] [■ Stop]  │
└─────────────────────────────────────────────────────┘
```

### Acciones

| Acción | Cómo |
|---|---|
| **Scan** | Carga ambas listas y calcula no-seguidores + fans |
| **Seleccionar** | Clic en una fila para marcar/desmarcar |
| **Select All** | Selecciona todos los visibles (respeta filtro + whitelist) |
| **Whitelist** | Pasá el cursor → clic en 🛡️ |
| **Export** | Descarga CSV, JSON o TXT de la lista actual |
| **Toggle vista** | Alternar entre No-seguidores y Fans |
| **Ordenar** | Desplegable: alfabético, verificados primero, privado/público |
| **Unfollow** | Inicia el proceso con delays de seguridad |
| **Pause / Resume** | Pausa la cola en cualquier momento |
| **Stop** | Cancela el proceso completamente |
| **Settings** | Ajustar límites, timing, gestionar datos |

### Atajos de Teclado

| Tecla | Acción |
|---|---|
| `Esc` | Cerrar panel |
| `Ctrl+F` | Enfocar búsqueda |
| `Ctrl+A` | Seleccionar todos |
| `Ctrl+D` | Deseleccionar todos |
| `Space` | Pausar/Reanudar (durante unfollow) |
| `1` `2` `3` `4` | Cambiar pestañas |

### Pestañas

- **Non-Followers** — lista principal de quienes no te siguen de vuelta
- **Whitelist** — cuentas protegidas (con opción de limpiar todo)
- **Activity** — log completo con estadísticas: total, hoy, esta semana, errores
- **Settings** — ajustar todos los parámetros de seguridad + gestión de datos

---

## 🛡️ Sistema de Seguridad

El sistema anti-ban v3.0 usa múltiples capas de protección:

| Capa | Mecanismo | Propósito |
|---|---|---|
| 1 | Delays con jitter (10–20s) | Timing humano con varianza |
| 2 | 5% probabilidad de pausa muy larga (50–100s) | Aleatoriedad extrema |
| 3 | 10% probabilidad de pausa extendida (25–50s) | Jitter adicional |
| 4 | Simulación de navegación (8% prob.) | Pausas "idle" de 3–8s |
| 5 | Pausa por lote cada 7 (3–7 min) | Prevenir detección de ráfagas |
| 6 | Pausa forzada cada 30 requests (5–10 min) | Cooldown obligatorio |
| 7 | Límite por hora: 25 | Rate limit horario |
| 8 | Límite diario: 100 | Rate limit diario |
| 9 | Límite por sesión: 50 | Límite por ejecución |
| 10 | Backoff exponencial (1.5–15 min) | Recuperación de errores |
| 11 | Monitor de conexión | Detectar problemas de red |
| 12 | Detección de challenge/feedback | Stop inmediato ante flags |
| 13 | Randomización de fingerprint | Variar headers de request |

### Tiempos Estimados

| Acción | Tiempo Aproximado |
|---|---|
| Escanear 1.000 cuentas | ~3–5 min |
| Dejar de seguir 20 cuentas | ~8–12 min |
| Dejar de seguir 50 cuentas | ~25–40 min |
| Dejar de seguir 100 cuentas (máximo diario) | ~1–2 horas |

### Salida de Consola

La herramienta da feedback rico en la consola de DevTools:

```
╔══════════════════════════════════════╗
║   Instagram Unfollow Tool v3.0       ║
║   github.com/RanuK12/ig-unfollow     ║
╚══════════════════════════════════════╝
[IG-Unfollow] Initializing...
[IG-Unfollow] Checking connection...
[IG-Unfollow] Following: 500 loaded (page 5)
[IG-Unfollow] Scan complete!
┌──────────────────────────┬───────┐
│ Following                │ 1240  │
│ Followers                │ 922   │
│ Non-followers            │ 318   │
│ Fans (follow you only)   │ 87    │
└──────────────────────────┴───────┘
[IG-Unfollow] ✓ Unfollowed @user (1/50)
[IG-Unfollow] Batch pause: 4.2min (7/50)
```

---

## ⚙️ Cómo Funciona (Técnico)

El script usa la API REST interna de Instagram — los mismos endpoints que usa la web:

```
GET  /api/v1/friendships/{userId}/following/?count=100&max_id=...
GET  /api/v1/friendships/{userId}/followers/?count=100&max_id=...
POST /api/v1/friendships/destroy/{targetId}/
```

La autenticación usa cookies que ya están en tu navegador:
- `ds_user_id` — tu ID de usuario de Instagram
- `csrftoken` — token de protección CSRF

**Nunca se lee, transmite ni almacena ninguna contraseña.**

### Técnicas Anti-Detección

1. **Randomización de headers** — Incluye ocasionalmente `X-IG-Connection-Speed` y `X-IG-Bandwidth-Speed-KBPS` con valores aleatorios
2. **Jitter de timing** — Distribución no uniforme de delays que imita comportamiento humano
3. **Simulación de actividad** — 8% de requests incluyen una pausa de "navegación" previa
4. **Backoff dinámico** — Exponencial con multiplicador 2.5x en errores consecutivos

---

## 🔒 Privacidad y Seguridad

- Corre **completamente en tu navegador** — sin servidores externos
- **No** lee, almacena ni transmite tu contraseña
- Usa **únicamente tu sesión activa** (cookies de Instagram)
- Datos locales guardados en `localStorage`:
  - Whitelist (`ig_unf_whitelist`)
  - Log de actividad (`ig_unf_log`)
  - Conteo diario (`ig_unf_daily`)
- Código fuente completo: [`src/script-main.js`](src/script-main.js) — inspeccioná cada línea

---

## 📁 Estructura del Proyecto

```
ig-unfollow/
├── src/
│   └── script-main.js      # Código fuente completo (v3.0)
├── bookmarklet.html         # Guía de setup + código embebido
├── COPY_CODE.html           # Interfaz mínima de copiar y pegar
├── GETTING_STARTED.md       # Guía paso a paso
├── README.md                # Documentación en inglés
├── README.es.md             # Documentación en español
└── LICENSE                  # Licencia MIT
```

---

## 🔧 Solución de Problemas

| Problema | Solución |
|---|---|
| "Not logged in" / sin CSRF token | Logueate en Instagram. Cerrá pestañas duplicadas. Recargá. |
| El escaneo devuelve 0 usuarios | Esperá unos minutos (rate limit). Asegurate de seguir a alguien. |
| Los unfollows fallan inmediatamente | Bloqueo temporal. Esperá 24+ horas. |
| "Challenge required" | Completá la verificación de Instagram, luego esperá 24h+ |
| El bookmarklet no funciona | Asegurate de que la URL empiece con `javascript:`. Probá la consola. |
| "Connection lost" | Revisá internet. La herramienta reintenta por 2 minutos. |
| La configuración no se guarda | La config es por sesión. Ajustá después de cada carga. |
| El script no carga | Asegurate de estar en `instagram.com`. Recargá e intentá de nuevo. |

---

## ⚡ Evaluación de Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Bloqueo temporal de unfollow | Media | Límites integrados + esperar 24h |
| Shadowban | Baja-Media | Parar automatización, publicar orgánicamente |
| Bloqueo de acciones | Media | Reducir actividad inmediatamente |
| Suspensión de cuenta | Muy Baja | Apelar a soporte de Instagram |

### Mejores Prácticas

- **Empezá chico:** Probá con 5–10 unfollows, esperá 24 horas
- **Máximo semanal:** Nunca usarlo más de una vez por semana
- **Monitoreá:** Observá comportamiento inusual de Instagram después de usar
- **Pará inmediatamente** si recibís alguna solicitud de verificación
- **Bajá los límites** en Settings si tenés dudas (20/día es muy seguro)
- **No combines** con otras herramientas de automatización

---

## 🆚 Changelog

### v3.0 (Actual)
- Randomización avanzada de fingerprint
- Monitor de conexión con auto-reconexión
- Límite horario (25/hora)
- Pausas de seguridad forzadas cada 30 requests
- Detección de fans (quién te sigue pero no seguís de vuelta)
- Opciones de orden (alfabético, verificados, privados/públicos)
- Badges de verificado ✓ y privado 🔒
- Estimaciones de tiempo (ETA)
- Atajos de teclado completos
- Pestaña de configuración (ajustar todos los parámetros)
- Botón de cancelar para detener el proceso
- Exportar TXT (solo usernames)
- Salida de consola rica (logs coloreados, tablas, progreso)
- Estadísticas de actividad (total, hoy, esta semana, errores)
- Mejor manejo de errores (NetworkError, feedback_required)
- Delays de simulación de navegación

### v2.0
- Migración a API v1 REST
- UI tema oscuro con scroll virtual
- Sistema de whitelist
- Exportar (CSV/JSON)
- Pausar/Reanudar
- Log de actividad
- Límites diarios/sesión
- Backoff exponencial

### v1.0
- Unfollow básico con GraphQL
- Interfaz simple de consola

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Así podés ayudar:

1. Hacé fork del repositorio
2. Creá una rama: `git checkout -b feature/mi-feature`
3. Hacé tus cambios en `src/script-main.js`
4. Probá exhaustivamente en tu propia cuenta
5. Enviá un pull request

### Guías
- Mantené el script como archivo único (sin build tools ni dependencias)
- Mantené o aumentá los delays de seguridad (nunca reducir límites default)
- Probá con cuentas reales antes de enviar
- Actualizá la documentación para features nuevas

---

## 📜 Licencia

MIT — libre para usar, modificar y distribuir. Ver [LICENSE](LICENSE).

Este proyecto no está afiliado, respaldado ni asociado con Instagram ni Meta Platforms, Inc.

---

<p align="center">
  <sub>Hecho con ❤️ para la comunidad de Instagram · v3.0 · Mayo 2026</sub>
</p>

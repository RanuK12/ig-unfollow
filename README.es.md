# Instagram Unfollow Tool

**Una herramienta ligera para identificar y dejar de seguir usuarios que no te siguen en Instagram.**

## ⚠️ Advertencia Legal

**Esta herramienta viola los Términos de Servicio de Instagram.**

Posibles consecuencias:
- Bloqueos temporales de acción (horas a días)
- Restricciones permanentes en dejar de seguir
- Shadowban
- Suspensión temporal o permanente de cuenta

**Úsala bajo tu propio riesgo. El desarrollador no acepta responsabilidad por penalizaciones en tu cuenta.**

## 🎯 Características

- ✅ Escanea todos los usuarios que sigues en tiempo real
- ✅ Identifica automáticamente quién no te sigue
- ✅ Selección manual antes de ejecutar
- ✅ Pausas de seguridad automáticas (4-6s entre desfollows, pausa de 30s cada 5)
- ✅ Interfaz limpia y moderna
- ✅ Sin dependencias externas
- ✅ Se ejecuta completamente en tu navegador

---

## 📋 Guía Rápida

### 1. Copia el Código del Bookmarklet

Abre `bookmarklet.html` y copia el código JavaScript que aparece.

### 2. Crea un Marcador en tu Navegador

**Chrome / Edge / Brave:**
```
1. Click derecho en la barra de marcadores
2. Click en "Añadir página"
3. En el campo URL, pega el código (no en el nombre)
4. Nómbralo "Instagram Unfollow"
5. Guardar
```

**Firefox:**
```
1. Presiona Ctrl+Shift+D
2. Nuevo marcador
3. Pega el código en el campo Dirección
4. Guardar
```

**Safari:**
```
1. Presiona Cmd+Y
2. Click derecho → Editar dirección
3. Pega el código
4. Guardar
```

### 3. Úsalo

```
1. Abre instagram.com
2. Haz click en tu marcador
3. Haz click en "Escanear"
4. Selecciona usuarios para dejar de seguir
5. Haz click en "Deseleccionar"
6. Confirma
7. Espera a que termine
```

---

## ⏱️ Tiempos

La herramienta incluye pausas automáticas de seguridad:

| Acción | Tiempo | Propósito |
|--------|--------|----------|
| Entre desfollows | 4-6 segundos (aleatorio) | Evitar detección |
| Cada 5 desfollows | Pausa de 30 segundos | Seguridad de límite de tasa |

**Tiempos estimados:**
- Escanear 1650 usuarios: 2-5 minutos
- Dejar de seguir 100 usuarios: 8-12 minutos
- Dejar de seguir 500 usuarios: 40-60 minutos

---

## 🔍 Cómo Funciona

```
1. Se autentica usando las cookies de tu sesión en Instagram
2. Obtiene usuarios seguidos vía GraphQL (50 a la vez)
3. Filtra usuarios donde follows_viewer = false
4. Los muestra en la interfaz para revisión manual
5. Envía peticiones de unfollow con pausas integradas
```

**Técnico:**
- Query Hash: `3dec7e2c57367ef3da3d987d89f9dbc8`
- Endpoint API: `/web/friendships/{userID}/unfollow/`
- Autenticación: cookies `ds_user_id` + `csrftoken`

---

## 📁 Archivos del Proyecto

| Archivo | Propósito |
|---------|----------|
| `bookmarklet.html` | Guía de setup + código del bookmarklet |
| `instagram-unfollow.js` | Código fuente completo (comentado) |
| `instagram-unfollow.min.js` | Versión minificada |
| `README.md` | Documentación en inglés |
| `README.es.md` | Documentación en español |

---

## ⚠️ Consejos de Seguridad Importantes

1. **Prueba primero:** Deja de seguir 1-2 usuarios, espera 24h para ver si Instagram reacciona
2. **No abuses:** Máximo una vez por semana, no diariamente
3. **Monitorea tu cuenta:** Observa bloqueos de acción o shadowbanning
4. **Sin copias de seguridad:** Guarda tu lista de seguidos externamente primero
5. **Para si te bloquean:** Si Instagram bloquea desfollows, espera días antes de intentar

---

## 🚨 Riesgos

| Problema | Probabilidad | Solución |
|----------|-------------|----------|
| Acción de unfollow bloqueada | Alta | Espera 24 horas |
| Shadowban | Media | Para la automatización, usa normalmente por semanas |
| Cuenta restringida | Media | Reduce toda actividad, espera |
| Suspensión | Baja | Apela a soporte de Instagram |

---

## 🐛 Resolución de Problemas

**"No autenticado"**
- Asegúrate de estar logueado en Instagram
- Cierra otras pestañas de Instagram
- Limpia cookies del navegador
- Intenta de nuevo

**El bookmarklet no se ejecuta**
- Verifica que el código comience con `javascript:`
- Revisa la consola del navegador (F12)
- Intenta crear el marcador de nuevo

**No puedo ver la lista de usuarios**
- Espera a que se complete el escaneo
- Observa la barra de progreso
- Podría ser lento por límites de tasa de la API

**Los desfollows fallan**
- Instagram podría haberte bloqueado temporalmente
- Espera 24 horas
- Intenta con menos usuarios la próxima vez
- Asegúrate de estar aún logueado

---

## 🔐 Privacidad

- ✅ Se ejecuta completamente en tu navegador
- ✅ Sin servidores de fondo
- ✅ Sin logging de datos
- ✅ Sin almacenamiento de contraseñas
- ✅ Sin peticiones externas excepto a la API de Instagram

---

## ⚖️ Descargo de Responsabilidad

Este proyecto **NO** está afiliado con Instagram ni Meta. Usar automatización viola sus Términos de Servicio. Úsalo completamente bajo tu propio riesgo.

---

## 📝 Licencia

MIT License - Libre para usar, modificar y distribuir

---

**Última actualización:** Enero 2026
**Versión:** 2.0

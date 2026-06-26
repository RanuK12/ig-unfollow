# 🔒 Guía de Seguridad - ig-unfollow v3.0

**PRIORIDAD MÁXIMA: Cómo no ser bloqueado por Instagram**

---

## ⚡ Resumen Rápido (Lee esto PRIMERO)

| Si necesitas | Haz esto |
|---|---|
| **Usar por primera vez** | Desigue 3-5 máximo. Espera 24h. |
| **Frecuencia segura** | 1-2 veces por semana, no diariamente |
| **Bloqueo temporal** | Espera 48h sin usar la herramienta |
| **Challenge pedido** | Para inmediatamente, verifica en web |
| **Indicador rojo** | DETÉN TODO. Pausa obligatoria. |

---

## 🚨 Señales de Alerta (DETÉN SI VES ESTAS)

### Nivel 🔴 CRÍTICO (Para INMEDIATAMENTE)
```
❌ "Challenge Required" → Instagram pide verificación
❌ Indicador de riesgo: Rojo (80%+)
❌ "Action Blocked" en IG
❌ "Suspicious activity"
❌ Error 403 (Forbidden)
```

**Acción:** Detén el script. Espera 24 horas. NO vuelvas a usarlo.

### Nivel 🟠 ALTO (Sé cauteloso)
```
⚠️ Indicador: Naranja (70-80%)
⚠️ Rate limits frecuentes (429)
⚠️ Error 401 (Session expirada)
```

**Acción:** Pausa. Espera 2 horas. Intenta después con máximo 5 unfollows.

### Nivel 🟡 MODERADO (Normal)
```
ℹ️ Indicador: Amarillo (50-70%)
ℹ️ Algunos rate limits ocasionales
ℹ️ Delays aumentando
```

**Acción:** Continúa pero lentamente. Monitorea activamente.

---

## 📊 Cómo Funcionan los Límites (v3.0)

### Límite Diario: 100 unfollows
- Se reinicia a medianoche (hora del servidor de Instagram)
- Se cuenta cada unfollow exitoso
- Si llegas a 100, debes esperar hasta el día siguiente

### Límite de Sesión: 40 unfollows
- Se reinicia cuando cierras el script
- No acumula entre sesiones
- Si llega a 40, cierra el script y abre después

### Límite de Antigüedad: 2 horas
- El script cancela automáticamente después de 2 horas
- Cierra y abre de nuevo para reiniciar

### Indicador de Riesgo (0-100%)
Combina:
- **Progreso diario** (40 puntos)
- **Progreso de sesión** (30 puntos)
- **Rate limits** (20 puntos)
- **Errores** (10 puntos)

⚠️ **ROJO (70%+):** Pausa obligatoria

---

## 🛡️ Mejores Prácticas por Nivel de Riesgo

### Nivel 1: PRINCIPIANTE (Primera vez)
```
Sesión 1:   3-5 unfollows  → espera 24h
Sesión 2:   5-10 unfollows → espera 24h
Sesión 3:   10-15 unfollows → espera 48h
```
**Patrón:** Muy lento. Demuestra que eres humano.

### Nivel 2: INTERMEDIO (Ya usaste antes)
```
Por semana:  2-3 sesiones de 20-30 unfollows
Por sesión:  Máximo 30 (menos del límite 40)
Espaciado:   Mínimo 24h entre sesiones
```
**Patrón:** Moderado. Instagram está acostumbrado.

### Nivel 3: AVANZADO (Cuentas establecidas)
```
Por semana:  3-4 sesiones de 30-40 unfollows
Por sesión:  40 máximo (límite de sesión)
Espaciado:   Mínimo 12h entre sesiones
Límite diario: 100 (máximo por ley del script)
```
**Patrón:** Agresivo pero controlado.

> ⚠️ **Nunca excedas los límites del script** — existen por razones de seguridad.

---

## 🔐 Validación de Sesión (NUEVO v3.0)

El script verifica cada 30 segundos:
- ✅ Estás en `instagram.com`
- ✅ Tu CSRF token es válido
- ✅ Tu ID de usuario está en las cookies
- ✅ Menos de 2 horas desde que empezó

Si alguno falla: **La operación se detiene inmediatamente.**

**Por qué es importante:** Evita que el script continúe si Instagram te ha desloguado (significa que detectó algo).

---

## ⏱️ Delays Anti-Patrón (MEJORADO v3.0)

### v2.0 (Viejo)
```
Delay fijo: 8-15 segundos → PREDECIBLE
Bot detection: 🔴 FÁCIL
```

### v3.0 (Nuevo)
```
Base: 10-18 segundos
+ Jitter: ±35% aleatorio
= Resultado: 8-24 segundos IMPREDECIBLE

Ejemplo:
- Unfollow 1: 13s
- Unfollow 2: 18s
- Unfollow 3: 11s
- Unfollow 4: 22s
+ Cada 8: pausa de 3-7 minutos

Bot detection: 🟢 DIFÍCIL
```

**Cómo funciona:** Cada delay es diferente. Instagram no puede predecir el patrón.

---

## 🚀 Si Eres Bloqueado

### Bloqueo Temporal (24-48 horas)
```
Síntoma: "Action Blocked" o "Try Later"
Duración: 24-72 horas típicamente
Causa: Demasiadas acciones seguidas

Solución:
1. DETÉN inmediatamente
2. Espera 48 horas completas
3. Usa tu cuenta NORMALMENTE (scroll, like, comment)
4. NO intentes burlar el bloqueo
5. Después de 48h, intenta nuevamente con máximo 5 unfollows
```

### Shadowban (Reducción de alcance)
```
Síntoma: Tus posts no aparecen en hashtags/explorar
Duración: 2-3 semanas típicamente
Causa: Patrón bot detectado

Solución:
1. DETÉN la herramienta COMPLETAMENTE
2. Espera 2 semanas sin usar nada automatizado
3. Usa solo acciones humanas (posts, stories, comments)
4. Después de 2 semanas, vuelve gradualmente
```

### Suspensión Permanente
```
Síntoma: Acceso denegado a la cuenta
Duración: PERMANENTE o 30+ días
Causa: Violación grave de TOS

NO HAY SOLUCIÓN. Intenta apelar en Instagram.
NUNCA vuelvas a usar la herramienta.
```

---

## 🔍 Monitoreo: Cómo Saber Si Estás Seguro

### Checklist Diario
- [ ] ¿Puedo ver mis stories?
- [ ] ¿Puedo dar like a posts?
- [ ] ¿Puedo comentar?
- [ ] ¿Mi feed se ve normal?
- [ ] ¿Aparecen mis posts en hashtags?

Si respuestas "No" a cualquiera: **DETÉN INMEDIATAMENTE**

---

## 📱 Horarios Seguros vs Riesgosos

### 🟢 SEGURO (Actividad humana típica)
```
10am - 2pm:  Prime time máximo
3pm - 8pm:   Bueno también
```

### 🔴 RIESGO (Patrón bot)
```
2am - 5am:   Actividad bot típica
Domingos 2am-3am: Menor concurrencia
```

**Consejo:** Usa durante el día, no de madrugada.

---

## 🔑 Mejores Prácticas Generales

1. **No uses VPN/Proxy**
   - Instagram detecta IPs atípicas
   - Usa tu IP real de casa

2. **No uses en múltiples dispositivos**
   - Una sesión por dispositivo
   - Espera entre sesiones

3. **No combines herramientas**
   - No hagas follow masivo después de unfollow
   - No uses bot de likes simultáneamente
   - Espera 24h entre herramientas

4. **Activa 2FA**
   - Mejora la seguridad general
   - Instagram ve que cuidas la cuenta

5. **Lee el indicador de riesgo**
   - Cuando está naranja/rojo: PAUSA
   - No es decorativo, es ciencia

6. **Mantén logs limpios**
   - Limpia el historial regularmente
   - No dejes evidencia en localStorage

---

## 🛠️ Solución de Errores Específicos

### "Challenge Required"
```
Causa: Instagram pidió verificación
Acción: 
  1. Verifica en web (SMS, email, app)
  2. Espera 24 horas
  3. NO intentes usar herramienta
  4. Vuelve después
```

### Error 429 (Rate Limit)
```
Causa: Demasiadas requests en poco tiempo
Acción:
  1. Pausa el script
  2. Espera 5-10 minutos
  3. Reinicia con máximo 5 unfollows
```

### Error 401/403 (Sesión expirada)
```
Causa: Instagram deslogueó tu sesión
Acción:
  1. Detén el script
  2. Recarga instagram.com
  3. Re-ingresa si es necesario
  4. Vuelve a ejecutar el script
```

### "No CSRF token"
```
Causa: No estás en instagram.com
Acción:
  1. Ve a instagram.com
  2. Asegúrate de estar logueado
  3. Carga el script de nuevo
```

---

## 📋 Changelog v3.0 (Cambios de Seguridad)

```
v2.0 → v3.0:
- Delays: 8-15s → 10-18s + jitter 35% (IMPREDECIBLE)
- Pausas: 2-5m → 3-7m (MÁS ESPACIADAS)
- Diarios: 120 → 100 (MÁS CONSERVADOR)
- Sesión: 60 → 40 (MÁS CORTO)
- Backoff: 60s → 120s (ESCALADA MÁS AGRESIVA)
- SessionValidator: NUEVO (VERIFICACIÓN CONSTANTE)
- Indicador de Riesgo: NUEVO (VISUAL)
- Límite sesión: NUEVO (2h máximo)
- Jitter: NUEVO (ANTI-PATRÓN)
```

---

## 🆘 Soporte

- **Bug de seguridad?** email: reporte@github.com (URGENTE)
- **Pregunta?** Lee FAQ en TROUBLESHOOTING.md
- **Bloqueado?** Nada que podamos hacer, es Instagram

---

## ⚖️ Responsabilidad Legal

**TL;DR:** Usas bajo tu propio riesgo. El autor NO acepta responsabilidad.

- Instagram puede cambiar sus APIs en cualquier momento
- Instagram puede cambiar sus políticas de bloqueo
- Este script podría dejar de funcionar en horas
- Tu cuenta podría ser suspendida aunque sigas TODO aquí

**Usa solo si entiendes los riesgos.**

---

**Última actualización:** Junio 2026 (v3.0)
**Mantenedor:** RanuK12
**Licencia:** MIT — Usa libremente pero a tu riesgo

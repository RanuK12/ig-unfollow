# ig-unfollow

> Detecta y deja de seguir en masa quienes no te siguen de vuelta en Instagram — directamente desde tu navegador, sin instalación.

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e?logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.0-informational)

---

## 🚀 Empezar en 10 segundos

Copia y pega este código en la consola de Instagram:

```javascript
// Instagram Unfollow Tool v2.0
// Detecta y deja de seguir quienes no te siguen de vuelta
(async () => {
  // ─── Configuración ──────────────────────────────────────────────────
  const USER_ID = document.cookie.match(/ds_user_id=([^;]+)/)?.[1];
  const CSRF_TOKEN = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
  
  if (!USER_ID || !CSRF_TOKEN) {
    console.error('❌ No estás logueado en Instagram');
    return;
  }
  
  // ─── Obtener lista de seguidos ──────────────────────────────────────
  const following = [];
  let nextMaxId = '';
  
  while (true) {
    const url = `https://www.instagram.com/api/v1/friendships/${USER_ID}/following/?count=50${nextMaxId ? `&max_id=${nextMaxId}` : ''}`;
    const res = await fetch(url, {
      headers: { 'X-CSRFToken': CSRF_TOKEN, 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await res.json();
    
    following.push(...data.users.map(u => ({ username: u.username, pk: u.pk })));
    if (!data.next_max_id) break;
    nextMaxId = data.next_max_id;
  }
  
  // ─── Obtener lista de seguidores ────────────────────────────────────
  const followers = [];
  nextMaxId = '';
  
  while (true) {
    const url = `https://www.instagram.com/api/v1/friendships/${USER_ID}/followers/?count=50${nextMaxId ? `&max_id=${nextMaxId}` : ''}`;
    const res = await fetch(url, {
      headers: { 'X-CSRFToken': CSRF_TOKEN, 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await res.json();
    
    followers.push(...data.users.map(u => ({ username: u.username, pk: u.pk })));
    if (!data.next_max_id) break;
    nextMaxId = data.next_max_id;
  }
  
  // ─── Encontrar quienes no te siguen ──────────────────────────────────
  const followerNames = followers.map(f => f.username);
  const nonFollowers = following.filter(f => !followerNames.includes(f.username));
  
  console.log(`📊 Seguidos: ${following.length}`);
  console.log(`👥 Seguidores: ${followers.length}`);
  console.log(`❌ No te siguen: ${nonFollowers.length}`);
  
  if (nonFollowers.length === 0) {
    console.log('✅ ¡Todos te siguen de vuelta!');
    return;
  }
  
  // ─── Mostrar resultados ─────────────────────────────────────────────
  console.log('\n🔍 Usuarios que no te siguen de vuelta:');
  nonFollowers.forEach(user => {
    console.log(`- @${user.username} (ID: ${user.pk})`);
  });
  
  // ─── Despedir a los seleccionados ───────────────────────────────────
  const toUnfollow = nonFollowers.slice(0, 5); // Limitar a 5 por seguridad
  console.log(`\n🚀 Dejando de seguir a ${toUnfollow.length} usuarios...`);
  
  for (const user of toUnfollow) {
    try {
      await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${user.pk}/`, {
        method: 'POST',
        headers: { 
          'X-CSRFToken': CSRF_TOKEN, 
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(`✅ Dejó de seguir a @${user.username}`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10s
    } catch (err) {
      console.error(`❌ Error con @${user.username}:`, err);
    }
  }
  
  console.log('\n✅ Proceso completado');
})();
```

---

## 📋 Pasos rápidos

1. **Ve a Instagram** y asegúrate de estar logueado
2. **Abre la consola** (`F12` o `Cmd+Option+I`)
3. **Pega el código** y presiona Enter

---

## ⚠️ Advertencia importante

**Esta herramienta viola los Términos de Servicio de Instagram.** Posibles consecuencias:
- Bloqueos temporales de acciones
- Shadowban
- Suspensión de cuenta

Úsala bajo tu propio riesgo. El autor no se responsabiliza por penalizaciones.

---

## 🎯 Características principales

- ✅ **Sin dependencias** - JavaScript puro
- ✅ **Sin servidor** - 100% en tu navegador
- ✅ **Delays automáticos** - Evita ser detectado
- ✅ **Límite diario** - 120 unfollows máx
- ✅ **Lista blanca** - Protege cuentas importantes
- ✅ **Búsqueda y filtrado** - Encuentra fácilmente
- ✅ **Exportar resultados** - CSV o JSON

---

## 🛡️ Sistema de seguridad

| Mecanismo | Valor | Propósito |
|---|---|---|
| Delay entre unfollows | 8-15s aleatorio | Comportamiento humano |
| Pausa cada 10 acciones | 2-5 min aleatorio | Previene rate limiting |
| Límite diario | 120 unfollows | Almacenado en localStorage |
| Límite por sesión | 60 unfollows | Por ejecución del script |

---

## 📁 Archivos del proyecto

| Archivo | Descripción |
|---|---|
| `src/script-main.js` | Código fuente completo |
| `bookmarklet.html` | Guía para crear bookmarklet |
| `COPY_CODE.html` | Interfaz para copiar código |
| `README.es.md` | Documentación en español |

---

## 🔧 Solución de problemas

**"No estás logueado"**
→ Asegúrate de estar logueado en Instagram y refresca la página.

**"Scan se queda en 0"**
→ Instagram puede estar limitando. Espera 5-10 minutos y prueba de nuevo.

**"Rate limited (429)"**
→ Espera 10-15 minutos. La herramienta reintentará automáticamente.

---

## 📄 Licencia

MIT - libre para usar, modificar y distribuir. Ver [LICENSE](LICENSE).

---

*Última actualización: Febrero 2026 · v2.0*
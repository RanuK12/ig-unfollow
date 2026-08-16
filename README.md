# Instagram Unfollow

🚀 **Deja de seguir en Instagram a quienes no te siguen de vuelta — en 30 segundos y sin instalar nada**

## 📋 ¿Qué hace?

Este script identifica cuentas que no te siguen de vuelta y te permite dejar de seguirse con un clic. Funciona directamente desde tu navegador, sin apps ni instalaciones.

## 💡 Cómo usarlo (3 pasos)

1️⃣ **Abrí Instagram** en tu navegador y aseguráte de estar logueado
2️⃣ **Pegá este código** en la consola de desarrolladores:

```javascript
// Código minificado del bookmarklet (ejemplo)
const script = document.createElement('script');
script.src = 'https://raw.githubusercontent.com/RanuK12/ig-unfollow/main/bookmarklet.js';
script.onload = () => console.log('Instagram Unfollow cargado');
document.body.appendChild(script);
```
3️⃣ **Hacé clic en 'Scan'** en el panel que aparece y seleccioná las cuentas a dejar de seguir

## 🛠️ Detalles técnicos

- **Funciona con:** Instagram web (no app móvil)
- **No requiere:** Instalación, login adicional o datos personales
- **Seguridad:** Todo en tu navegador, sin servidores externos
- **Límites:** Máximo 120 unfollows por día

## ⚠️ Advertencia

Este script viola los términos de servicio de Instagram. Puede resultar en bloques temporales o suspensiones de cuenta. Usa con cuidado.

## 📄 Licencia

MIT — Código abierto, sin garantías. Ver [LICENSE](LICENSE).
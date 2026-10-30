# Análisis del video: "antes / después" de UI generada por IA

Video de ~36 s (formato vertical). Muestra tres rediseños donde una interfaz con look "IA slop" se convierte en algo que parece hecho por un diseñador/front-end senior. El trend lo inició Damir Sokolovsky (@heydamir) con el post *"Unslopping a vibecoded dashboard"* en X (más de 1,4 M de vistas), y él mismo anunció que publicaría su propia skill "unslop" para Claude.

| Tiempo | Caso |
|---|---|
| 0–5 s | App móvil de running ("Hey Alex!" → "Morning run") |
| 6–15 s | Dashboard web SaaS ("EmberAI" → "Ember") con medidas de spacing superpuestas |
| 26–31 s | App móvil de estudio ("Cells and Energy") con un panel lateral de tokens |

---

## Caso 1 — App de running

| Aspecto | Antes (slop) | Después |
|---|---|---|
| Fondo | Degradado saturado azul→violeta en toda la pantalla | Casi negro neutro; el color aparece solo como *luz* dentro de cada tarjeta |
| Tarjetas | Cada tarjeta con un degradado distinto y saturado (violeta, naranja, rosa, cian) | Tarjetas negras con un brillo de color localizado, ligado al significado (ritmo cardíaco → rojo/naranja; ritmo → azul; distancia → magenta) |
| Encabezado | Saludo genérico "Hey Alex! 👋 / Ready for today's run?" | Contexto real: eyebrow mono pequeño "WED, 28 OCT · 7:12" + título "Morning run" |
| Número principal | "5.24 km" en la misma fuente sans que todo lo demás | Número héroe en una tipografía display (estilo matriz de puntos / LED), unidad degradada a caption: "kilometres · +12% vs last week" |
| Íconos | Emojis (🏃 ⚡ ❤️ 🎯 🚀 🏠 📊 🏆 👤) | Íconos de línea finos, mismo grosor de trazo, monocromos |
| Visualización de datos | Una onda senoidal genérica | Una visualización específica por métrica: mini-barras para el ritmo, dial radial con ticks para el pulso, track punteado con slider para la meta semanal |
| Detalles tipográficos | "5:12 min/km" | "5′12 /km" (prima tipográfica, unidad pequeña y apagada) |
| CTA | Botón píldora con degradado rosa-violeta "Start Run 🚀" | Fila oscura con botón circular blanco ▶ + "Start run" + estado "• GPS READY" en mono |
| Tab bar | Emojis con labels debajo | Íconos de línea sin labels dentro de una cápsula |
| Jerarquía | Todas las tarjetas gritan igual | Una tarjeta héroe dominante; el resto subordinado |

## Caso 2 — Dashboard "EmberAI"

El "antes" aparece con medidas superpuestas: **15, 22, 37, 42, 28, 38 px**. Ninguna sigue una escala → el spacing arbitrario es uno de los síntomas principales.

| Aspecto | Antes (slop) | Después |
|---|---|---|
| Paleta | Violeta en todo: fondo, tarjetas, barras, badges | Grises neutros oscuros, bordes hairline de 1 px, color reservado para datos |
| Marca | "EmberAI" + badge "PRO" + ícono con destellos ✨ | "Ember", glifo monocromo simple. Se quitó el "AI" y el badge |
| Título | "Welcome back, Damir! 👋" con texto en degradado | "October **2026**": título contextual en dos tonos (mes en blanco, año en gris) |
| Labels | MAYÚSCULAS con tracking + emoji: "💰 PAID THIS MONTH" | Sentence case pequeño y apagado: "Paid this month" |
| Copy | "+12%!!", "🔥", "+4.2% this month!!" | "+12% vs last month" en mono; el verde solo en la cifra |
| Navegación | Emoji por ítem; activo = relleno violeta saturado | Set de íconos de línea consistente; activo = gris sutil; chevrons para expandir |
| Contadores | Píldoras de colores en cada ítem (12 rojo, "New ✨", 18, 64, 210…) | Números apagados alineados a la derecha, sin píldora |
| Secciones | "NAVIGATION", "📋 PLANS" | "Navigation", "Plans" en gris tenue |
| Codificación de color | Arbitraria | Puntos de color por plan que coinciden con las líneas del gráfico (el color = dato) |
| Gráfico | Barras-píldora violetas con una destacada | Curvas suaves multi-serie con eje Y, sin cuadrícula pesada, colores ligados a la leyenda |
| Imagen | Clip-art de tarjeta de crédito tipo emoji | Render realista de tarjetas oscuras |
| Búsqueda | "Search anything…" + píldora violeta "⌘K" | "Search" + teclas ⌘ y K como keycaps separadas |
| Spacing | Valores arbitrarios | Normalizado a una escala |

## Caso 3 — App de estudio

Aquí el "después" viene con un **panel lateral que documenta las pasadas aplicadas**, que es la pista más valiosa del método:

- **Spacing**: Gap 24 · Gutter 20 · Padding 22 · Filler 20 · Width 107 · Radius 28
- **Type**: Font Jakarta (Plus Jakarta Sans) · Title 28 · Heading 36 · Body 18
- **Colour**: Canvas · Shadow 0% · Button · Quests
- **Symbols**: Tabs · Actions · Chip · Mascot
- **Structure**: Streaks *(añadido)* · Tab bar *(glass)*

| Aspecto | Antes (slop) | Después |
|---|---|---|
| Copy | "Good evening 👋", "Exam in 91 days ✨", "Start 🚀", "Keep every heart ❤️", "📚 Quests", "✨ AI-powered study plan" | Mismo texto sin emojis; se elimina "AI-powered" |
| Contraste | Botón gris lavanda que parece deshabilitado; tarjetas pastel lavadas | Tarjeta blanca sobre canvas casi negro; botón negro sólido "▶ Start" |
| Acento | Ninguno o todo igual de apagado | **Un** color saturado con significado: tarjeta amarilla de Quests |
| Personalidad | Ninguna | Mascota (zorro/gato naranja) que rompe el borde de la tarjeta = identidad de marca |
| Estructura | Chips sueltos ("0 XP today", "1 drill left") | Nueva sección "Streaks" con números grandes ("0d current / 0d best") y glow de color |
| Sombras | Sombras suaves genéricas | Shadow 0%: planos limpios, separación por contraste |
| Tab bar | Emojis | Íconos propios, tab bar tipo "glass" |

---

## Patrones comunes extraídos

**Lo que delata a la UI generada por IA**
1. Degradados violeta/azul/rosa como fondo, en tarjetas, botones y texto.
2. Emojis usados como íconos y como decoración en el copy.
3. Copy genérico y entusiasta: "Welcome back!", "Hey X!", "!!", "AI-powered", 🔥🚀✨.
4. Spacing arbitrario (37 px, 42 px, 15 px…) sin escala.
5. Todo con el mismo peso visual: sin jerarquía, cada tarjeta compite.
6. Badges/píldoras de colores en todos lados (PRO, New, contadores).
7. Labels en MAYÚSCULAS con tracking + emoji.
8. Gráficos genéricos (onda senoidal, barras-píldora) que no comunican nada específico.
9. Clip-art o emojis en lugar de imágenes reales.
10. Botones que parecen deshabilitados o, al contrario, que gritan con degradados.

**Lo que hace el diseñador senior**
1. Base neutra (casi negro o blanco roto) + **un** acento con significado.
2. Color como luz/atmósfera o como codificación de datos, nunca como relleno decorativo.
3. Íconos de un solo set, trazo uniforme, monocromos.
4. Títulos con contexto (fecha, nombre de la actividad) en lugar de saludos.
5. Números héroe con tipografía display; unidades y deltas pequeños, en mono y apagados.
6. Microvisualizaciones específicas para cada tipo de dato.
7. Spacing, tipos, radios y colores como tokens explícitos; el trabajo se hace por pasadas: **spacing → type → colour → symbols → structure**.
8. Detalles de oficio: keycaps reales, prima tipográfica (5′12), números tabulares, estados del sistema ("GPS READY"), títulos en dos tonos.
9. Personalidad intencional (mascota, tipografía display) en un solo punto, no regada por todos lados.
10. Quitar antes que agregar: menos badges, menos colores, menos efectos.

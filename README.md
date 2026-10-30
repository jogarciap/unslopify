# unslopify

Una skill para que Claude (u otra IA) rediseñe interfaces con look "IA slop" (degradados violeta, emojis como íconos, "Welcome back! 👋", spacing arbitrario) y queden como si las hubiera hecho un diseñador / front-end senior.

*An agent skill that turns AI-looking ("vibecoded") UIs into ones that look designed by a senior designer. The skill itself is written in English so any model can use it.*

## Qué hace

Por defecto rediseña solo la página principal (o la que indiques). Si pides **toda la página**, mapea todas las páginas del sitio y las rediseña con un sistema compartido. Funciona también con sitios hechos en Wix, Squarespace o Webflow: arma un prototipo aparte con el contenido real.

0. **Captura el "antes"**: escaneo del código y capturas en móvil, tablet y escritorio, antes de tocar nada. Trabaja en una rama o con respaldo.
1. **Audita** el código con un scanner (`scripts/slop_audit.py`, solo Python estándar) que detecta emojis, degradados, texto en degradado, paletas violeta, glows, glassmorphism, copy genérico, "!!", spacing fuera de escala, exceso de tamaños de fuente y radios, `transition: all` y animaciones infinitas. También revisa si está listo para publicar: título, meta description, favicon, viewport, menú móvil, página 404, links muertos, emails y teléfonos sin link, texto placeholder, riesgos de scroll horizontal, inputs de menos de 16 px (zoom en iPhone) y hovers que se quedan pegados en móvil.
2. **Define una dirección** en una frase: base neutra, un acento con significado, un solo toque de personalidad. Si pides opciones, arma 2 o 3 versiones (A/B/C) de una sección para que elijas antes de seguir.
3. **Aplica ocho pasadas**, en orden: spacing → type → colour → symbols → **material gráfico** → structure/copy → **movimiento** → **listo para publicar**.
   - *Material gráfico*: un test de encaje (público, metáfora, lugar, estado, marca y calidad) decide si conviene agregar una mascota, una ilustración metafórica (por ejemplo, una llama para las rachas), un render del producto o un gráfico hecho con los datos.
   - *Movimiento*: transiciones con propiedad, curva y duración precisas (ease-out, ~200 ms, solo `transform` y `opacity`), un solo momento animado por página y respeto por `prefers-reduced-motion`. GSAP, Lenis, React Bits o 21st.dev solo cuando la página lo pide.
   - *Listo para publicar*: sin scroll horizontal, menú móvil, detalles nativos de móvil (inputs de 16 px, sin hover pegado, `100dvh`), títulos, meta descriptions, favicon, email clickeable, sin links rotos, sin texto placeholder, empty states, mensajes de error, página 404 y una **prueba de estrés** con nombres larguísimos, números enormes y listas vacías.
4. **Verifica** con el scanner y con `scripts/page_check.mjs`, que abre la página en 360, 390, 768 y 1440 px y revisa overflow, links, metadatos, botones táctiles chicos, errores de consola y si existe un 404.
5. **Entrega una propuesta**: `scripts/make_report.py` arma un HTML autocontenido con capturas antes/después lado a lado, puntajes, cambios por pasada con archivos, la decisión de material gráfico, la checklist de publicación, lo que quedó propuesto y cómo revertir.
6. **Revisión con recuadros**: en el informe puedes dibujar un recuadro sobre cualquier captura y escribir qué cambiar. Cada comentario lleva la ubicación y los elementos que quedaron dentro (por ejemplo `h2.section-title "El problema…"`).
   - En Claude (claude.ai, app de escritorio o Claude Code con Artifacts), se publica en el panel lateral una vista de revisión: solo un selector de dispositivo (escritorio, tablet, móvil) y el antes y el después en grande. Arrastras sobre una captura y se abre el compositor de comentarios de Claude: con **Send to Claude** el pedido le llega a la sesión, que edita el código, vuelve a capturar y republica en el mismo link.
   - En cualquier otro lugar, los comentarios quedan en la página y se copian como prompt (**Copiar para Claude**) o se descargan como JSON.

Ejemplo incluido: [`examples/before.html`](examples/before.html) da **134 (very sloppy)** y [`examples/after.html`](examples/after.html) da **0 (clean)**.

## Instalación

### Claude Code (como plugin)

```
/plugin marketplace add jogarciap/unslopify
/plugin install unslopify@unslopify
```

### Claude Code (como skill suelta)

Copia la carpeta `skills/unslopify` a `~/.claude/skills/` (global) o a `.claude/skills/` dentro de tu proyecto.

### Claude.ai / app de escritorio

Comprime la carpeta `skills/unslopify` en un `.zip` y súbela en *Settings → Capabilities → Skills*.

### Otras IAs (Cursor, Codex, Copilot, Gemini…)

Copia el contenido de `skills/unslopify/SKILL.md` (y los archivos de `references/` si caben) a las reglas del proyecto: `AGENTS.md`, `.cursor/rules/unslopify.mdc`, `.github/copilot-instructions.md`, etc. El scanner funciona con cualquier agente que pueda ejecutar Python.

## Uso

Pídele al agente algo como:

> Unslop this dashboard. / Hacé que esta landing no parezca hecha con IA.

La respuesta incluye un informe `unslop-report.html` con el antes y el después.

O corre las herramientas directamente:

```
python skills/unslopify/scripts/slop_audit.py src/
python skills/unslopify/scripts/slop_audit.py src/ --json
```

```
# desde la carpeta del proyecto (usa su Playwright)
node <ruta>/skills/unslopify/scripts/page_check.mjs http://localhost:5173 unslop/after
```

## Estructura

```
.claude-plugin/          manifiestos de plugin y marketplace
skills/unslopify/
  SKILL.md               instrucciones de la skill
  references/
    slop-patterns.md     catálogo de señales de slop y su arreglo
    graphic-material.md  cuándo y cómo agregar mascotas, metáforas y renders
    motion.md            curvas, duraciones, hover en táctil y cuándo usar GSAP/Lenis
    ship-readiness.md    móvil, metadatos, links, placeholders, estados y 404
    report.md            esquema de changes.json y cómo se arma el informe
    review-loop.md       panel lateral, recuadros y cómo aplicar los comentarios
    case-studies.md      tres casos antes/después
    tokens.md            tokens base (CSS y Tailwind)
  scripts/
    slop_audit.py        scanner estático (slop + listo para publicar)
    page_check.mjs       chequeo en navegador con Playwright + capturas
    make_report.py       informe HTML antes/después (con --fragment para Artifacts)
    report_annotate.js   modo anotación que se incrusta en el informe
examples/                demo antes/después
docs/analisis-del-video.md  análisis original de los rediseños (en español)
docs/consejos-reels.md      consejos de dos reels (movimiento, A/B/C, prueba de estrés, móvil)
```

## Créditos

Basado en el análisis de rediseños "antes/después" que se volvieron tendencia a partir del post *"Unslopping a vibecoded dashboard"* de Damir Sokolovsky (@heydamir) en X. Este repo no incluye imágenes de esos posts; solo las conclusiones de diseño.

## Licencia

MIT

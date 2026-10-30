# unslop-ui

Una skill para que Claude (u otra IA) rediseñe interfaces con look "IA slop" (degradados violeta, emojis como íconos, "Welcome back! 👋", spacing arbitrario) y queden como si las hubiera hecho un diseñador / front-end senior.

*An agent skill that turns AI-looking ("vibecoded") UIs into ones that look designed by a senior designer. The skill itself is written in English so any model can use it.*

## Qué hace

1. **Audita** el código con un scanner (`scripts/slop_audit.py`, solo Python estándar) que detecta emojis, degradados, texto en degradado, paletas violeta, glows, glassmorphism, copy genérico, "!!", spacing fuera de escala y exceso de tamaños de fuente y radios.
2. **Define una dirección** en una frase: base neutra, un acento con significado, un solo toque de personalidad.
3. **Aplica cinco pasadas**, en orden: spacing → type → colour → symbols → structure/copy.
4. **Verifica** volviendo a correr el scanner y, si puede, comparando capturas antes/después.

Ejemplo incluido: [`examples/before.html`](examples/before.html) da **134 (very sloppy)** y [`examples/after.html`](examples/after.html) da **0 (clean)**.

## Instalación

### Claude Code (como plugin)

```
/plugin marketplace add TU-USUARIO/unslop-ui
/plugin install unslop-ui@unslop-ui
```

### Claude Code (como skill suelta)

Copia la carpeta `skills/unslop-ui` a `~/.claude/skills/` (global) o a `.claude/skills/` dentro de tu proyecto.

### Claude.ai / app de escritorio

Comprime la carpeta `skills/unslop-ui` en un `.zip` y súbela en *Settings → Capabilities → Skills*.

### Otras IAs (Cursor, Codex, Copilot, Gemini…)

Copia el contenido de `skills/unslop-ui/SKILL.md` (y los archivos de `references/` si caben) a las reglas del proyecto: `AGENTS.md`, `.cursor/rules/unslop-ui.mdc`, `.github/copilot-instructions.md`, etc. El scanner funciona con cualquier agente que pueda ejecutar Python.

## Uso

Pídele al agente algo como:

> Unslop this dashboard. / Hacé que esta landing no parezca hecha con IA.

O corre el scanner directamente:

```
python skills/unslop-ui/scripts/slop_audit.py src/
python skills/unslop-ui/scripts/slop_audit.py src/ --json
```

## Estructura

```
.claude-plugin/          manifiestos de plugin y marketplace
skills/unslop-ui/
  SKILL.md               instrucciones de la skill
  references/
    slop-patterns.md     catálogo de señales de slop y su arreglo
    case-studies.md      tres casos antes/después
    tokens.md            tokens base (CSS y Tailwind)
  scripts/slop_audit.py  scanner estático
examples/                demo antes/después
docs/analisis-del-video.md  análisis original de los rediseños (en español)
```

## Créditos

Basado en el análisis de rediseños "antes/después" que se volvieron tendencia a partir del post *"Unslopping a vibecoded dashboard"* de Damir Sokolovsky (@heydamir) en X. Este repo no incluye imágenes de esos posts; solo las conclusiones de diseño.

## Licencia

MIT

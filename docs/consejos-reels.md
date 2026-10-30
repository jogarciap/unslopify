# Consejos de dos reels sobre diseño con IA

Notas de dos videos cortos y qué parte de cada uno quedó en la skill.

## Reel 1: skills de diseño de Emil Kowalski

El video plantea que pedirle a la IA "make it look better" solo llega hasta cierto punto. La propuesta es darle al agente una guía de diseño más específica. Las skills de Emil Kowalski (design engineer que trabajó en Linear y Vercel; se encuentran en `emilkowal.ski/skill`) se agrupan en cuatro ideas:

| Skill del video | Qué hace | Dónde quedó en unslopify |
|---|---|---|
| **animate** | Usa la curva, la duración y las propiedades correctas en vez de una transición al azar. En pantalla aparecen `ease-out`, `200ms` y `transform` en lugar de `transition: all`. | Pasada 7, *Movimiento*: tokens de curva y duración, solo `transform` y `opacity`, nunca `transition: all`. El escáner marca `transition: all`. Detalle en `references/motion.md`. |
| **prototype** | Arma varias versiones de una interfaz (A/B/C) para comparar direcciones. | Paso 2 del flujo: si el usuario pide opciones, se construyen 2 o 3 direcciones de una sección clave antes de rediseñar todo. Por defecto, una sola dirección. |
| **break-ui** | Prueba de estrés: el diseño con nombres largos, listas vacías y números enormes ("Demo data" frente a "Worst case"). | Pasada 8: subsección *Stress test*, con los casos que hay que probar y cómo corregirlos. |
| **mobile-native** | Detalles molestos de móvil: hover que se queda pegado e inputs que hacen zoom en la página. | Pasada 8: *Mobile-native details*, con inputs de 16 px o más, hover solo en `@media (hover: hover)`, `100dvh`, safe areas e `inputmode`. El escáner marca ambos problemas. |

## Reel 2: tres herramientas para que una web no se vea slop

El video dice que una web hecha con Claude Code se ve slop si no usa ciertas herramientas o sistemas. Muestra sitios con scroll animado (un render de audífonos que se mueve con el scroll, por ejemplo) y menciona:

- **GSAP**: anima cualquier cosa con timelines y scroll.
- **Lenis**: scroll suave ("buttery").
- **React Bits**: biblioteca de componentes animados, como texto en movimiento, botones y fondos.
- **21st.dev**: biblioteca de componentes de interfaz.

La idea es pasarle a Claude Code los repos (`greensock/GSAP`, `darkroomengineering/lenis`, `DavidHDev/react-bits`) para que las instale y las use.

**Cómo quedó en la skill:** como herramientas opcionales dentro de la pasada 7. La skill las recomienda cuando la página pide una experiencia de scroll más rica, como un lanzamiento de producto, un portafolio o una historia editorial. No las recomienda en tiendas, dashboards, formularios ni herramientas. Además exige adaptar cualquier componente copiado a los tokens del proyecto, porque un efecto de biblioteca pegado tal cual (partículas, anillos de texto giratorio, tarjetas "mágicas") se vuelve una nueva señal de slop. Antes de agregar una dependencia hay que preguntar.

## Lo que no se incorporó

- Instalar las librerías siempre. Contradice la regla de "un solo momento animado" y agrega peso a páginas que no lo necesitan.
- Copiar los efectos tal como aparecen en las demos.

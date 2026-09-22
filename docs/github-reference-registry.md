# GitHub Reference Registry

## 2026-09-22 — Research Agent MVP

| Repository                                                    | Category                               | Decision       | What we learned                                                                                                                                                                           |
| ------------------------------------------------------------- | -------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [foilstack/foilstack](https://github.com/foilstack/foilstack) | Trading-card inventory and recognition | Reference only | A card product benefits from separating identity/inventory from later interpretation. Nucleus keeps its own TypeScript, Supabase, and provenance model. No code or dependency was copied. |

The research-agent MVP uses project-native tools and Supabase RLS rather than importing an external Agent framework. This avoids new credential surfaces and keeps the data boundary auditable.

## 2026-09-22 - Skill-guided interface refinement

| Repository | Category | Decision | What we learned |
| --- | --- | --- | --- |
| [DamageLabs/sports-card-tracker](https://github.com/DamageLabs/sports-card-tracker) | Sports-card collection product | Reference only | Collection browsing, private collections, metadata and market views are distinct user jobs. Nucleus keeps its existing routes but makes these jobs clearer on the public entry page. |
| [MarkNenadov/imago](https://github.com/MarkNenadov/imago) | Card identification and collection management | Reference only | Card identity and image-assisted review should lead to explicit review, not silent data creation. Nucleus retains its confirmation-first scanning language. |
| [rhanka/pokemon-cards](https://github.com/rhanka/pokemon-cards) | Mobile collector PWA | Reference only | A collector product benefits from clear separation between a durable personal collection and transient market assistance. Nucleus preserves private-holding boundaries in the homepage and research desk. |

No external code, styles, components, or dependencies were copied. The interface refinement uses the project-native Next.js, CSS Modules, image pipeline, and Lucide dependency already present in the repository.

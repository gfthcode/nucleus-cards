# GitHub Reference Registry

## 2026-09-22 — Research Agent MVP

| Repository                                                    | Category                               | Decision       | What we learned                                                                                                                                                                           |
| ------------------------------------------------------------- | -------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [foilstack/foilstack](https://github.com/foilstack/foilstack) | Trading-card inventory and recognition | Reference only | A card product benefits from separating identity/inventory from later interpretation. Nucleus keeps its own TypeScript, Supabase, and provenance model. No code or dependency was copied. |

The research-agent MVP uses project-native tools and Supabase RLS rather than importing an external Agent framework. This avoids new credential surfaces and keeps the data boundary auditable.

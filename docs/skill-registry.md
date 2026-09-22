# Skill Registry

| Skill                 | Trigger                                          | Decision      | Notes                                                                                                                  |
| --------------------- | ------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `supabase:supabase`   | Supabase Auth, RLS, schema, user data            | Use           | Requires ownership-scoped RLS and no public service-role keys.                                                         |
| `card-research-agent` | Evidence-based card, player, collection research | Project skill | Uses read-only tools, distinguishes demo/limited/verified evidence, and requires confirmation before any write action. |

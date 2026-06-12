# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## Notes

- npm, pas pnpm (`npm run dev`, etc.)
- Toutes les données persistantes (médias, et Postgres via docker-compose) vivent dans `editeur-livres/` à la racine — gitignoré, jamais commité
- DB pilotée par `DATABASE_URI` ; SSL via `?sslmode=require` dans l'URL (rien en dur dans le code)

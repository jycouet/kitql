---
'@kitql/eslint-config': patch
---

`kitql-lint` only looks up config files (`.prettierrc.js`, `.oxfmtrc.json`, `.prettierignore`) for the selected tools, so no more noisy `"<file>" not found` logs for unused tools.

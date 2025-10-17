---
'@kitql/eslint-config': patch
---

- add new flag `--tools` to specify the tools to use (`eslint`, `prettier`, `oxlint`, `tsgolint`) (default: `eslint`, `prettier`)
- [BREAKING] remove `--lint-only` & `--format-only` flags, use `--tools` instead

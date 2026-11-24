---
'@kitql/helpers': minor
---

BREAKING: remove `midTrim`, use `strTrimMid` instead

fix: `strTrimMid` never returns more than `len`, `dateCompact` no longer mutates its `Date` argument

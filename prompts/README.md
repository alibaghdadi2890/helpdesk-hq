# prompts/

Versioned prompts, one file per version, added from Chapter 2 (Lesson 2.5).

```
prompts/
  reply.v1.md
  reply.v2.md
  triage.v1.md
```

Each file starts with a header that the loader checks:

```markdown
---
id: reply.v2
model: ${LLM_MODEL}
temperature: 0.2
changed: "Rule 4 now says which wins when helpfulness and no-promises conflict."
---
```

Rules: never edit a version that has been evaluated; copy it to the next number instead.
The `id` must match the file name. `make prompts-check` (Exercise 2.5) enforces both.

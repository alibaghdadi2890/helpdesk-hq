# evals/

Eval runners and their baselines, built from Chapter 2.

The cases live in `data/evals/`:

| File | Cases | Chapter | What a case checks |
|---|---:|---|---|
| `replies-25.json` | 25 | 2 | `expect` reply or escalate; `mustMention` facts as regexes; `mustNotMention` phrases; `expectedSources` article slugs |
| `triage-40.json` | 40 | 3 | `expectedTeam`, `expectEscalation`, `mustCall` and `mustNotCall` tools |
| `tool-tasks-15.json` | 15 | 3 | A question and a regex the final answer must match |

What you add here:

```
evals/
  run.ts                 make eval NAME=reply PROMPT=reply.v1 RUNS=3
  graders/               code checks first, a model judge only for what code cannot check
  baselines/reply.json   the scores CI compares against
results/                 one JSON per run (ignored by Git)
```

Patterns are matched case-insensitively. Arabic cases have `"language": "ar"` and the reply
must be in Arabic.

# src/ai/

Empty on purpose. This is where your AI code goes, chapter by chapter:

| Chapter | You add |
|---|---|
| 1 | `llm.ts`: one adapter for model calls, with usage and cost on every response; `classify.ts` |
| 2 | `reply.ts`: reply drafts with prompts from `prompts/` and context trimming |
| 3 | `agent/loop.ts`, `agent/tools.ts`: the triage agent loop and its tools |
| 4 | `retrieval/`: chunking, embeddings in pgvector, hybrid search |

Rules the rest of the code follows: every database call goes through `withTenant()`, and
nothing here reads an environment variable directly except through one config module.

# src/ai/

This is where your AI code goes. Chapter 1 starts you with skeletons: the types are written,
the function bodies are TODOs that the Exercises tab walks you through. Chapter by chapter:

| Chapter | You add |
|---|---|
| 1 | `llm.ts`: one adapter for model calls, with usage and cost on every response; `classify.ts`, `format.ts`; the task adds `classify-ticket.ts` |
| 2 | `reply.ts`: reply drafts with prompts from `prompts/` and context trimming |
| 3 | `agent/loop.ts`, `agent/tools.ts`: the triage agent loop and its tools |
| 4 | `retrieval/`: chunking, embeddings in pgvector, hybrid search |

Rules the rest of the code follows: every database call goes through `withTenant()`, and
only `llm.ts` reads the model settings (key, model, prices) from the environment.

// src/shared/llm/interfaces/LLMOutputAdapter.ts

export interface LLMOutputAdapter<T> {
  parse(rawResult: unknown): T;
}

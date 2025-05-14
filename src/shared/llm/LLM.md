# LLM Integration Guide

### Overview

Sequenzia uses a **provider-agnostic, task-driven architecture** for interacting with Large Language Models (LLMs).

- **Providers**: OpenAI, Anthropic, Google, Local models, etc.
    
- **Tasks**: Functional outputs we request from LLMs (e.g., `remi`, `chords`, `extraction`).
    

---

## ✅ Folder Structure

```
/shared/llm/
├── providers/    <-- Provider-specific caller services & profiles
├── tasks/        <-- Task-specific schemas, adapters, parsers, helpers
├── services/     <-- Generic utilities (e.g., prompt builders)
├── interfaces/   <-- Shared type contracts
├── LLMCallerService.ts  <-- Unified entry point (model, prompt, task)

```

## 🧩 Adding a New Provider

If you're integrating a **new LLM provider** (e.g., Google Gemini, Local models):

1. **Create a provider folder:**
    
```
/providers/google/
├── GoogleCallerService.ts
└── googleProfile.ts

```
    
2. **Implement GoogleCallerService.ts:**
    
    - This function performs the raw API call.
        
    - Signature: `export async function callGoogleModel(prompt: string, model: LLMModel): Promise<unknown> { ... }`
        
        
3. **Define googleProfile.ts:**
    
    - Maps supported tasks → schema (optional) + adapter.
        
    - Example:
        
```
import type { ProviderProfile } from '@/shared/llm/interfaces/ProviderProfile';

export const GoogleProfile: ProviderProfile = {
  provider: 'google',
  tasks: {
    remi: {
      adapter: (raw) => raw // TODO: normalize Google output
    },
    chords: {
      adapter: (raw) => raw // TODO: parse chords output
    }
  }
};

```
        
4. **Update ProviderProfiles.ts:**
    
```
import { GoogleProfile } from './google/googleProfile';

export const ProviderProfiles = {
  openai: OpenAIProfile,
  anthropic: AnthropicProfile,
  google: GoogleProfile
};

```
    
5. **Update ModelToProvider.ts:**
    
```
export const ModelToProvider = {
  'gpt-4o': 'openai',
  'claude-3': 'anthropic',
  'gemini-1.5': 'google'
} as const;

```


## 🛠️ Adding a New Task

If you're adding a new **task type** (e.g., `extraction`):

**Create task folder:**
```
/tasks/extraction/
├── adapters/
├── helpers/
├── parsers/
└── schemas/

```

**Define schema (if applicable):**
```
export const ExtractionResponseFormat = z.object({
  result: z.array(z.string())
});

```

**Write adapter:**
```
export const ExtractionOutputAdapter = {
  parse(raw: unknown): string[] {
    // Normalize raw output into expected structure
    return typeof raw === 'string' ? raw.split(',') : [];
  }
};

```

**Update each Provider's profile:**  
Example in openaiProfile.ts:
```
import { ExtractionResponseFormat } from '@/shared/llm/tasks/extraction/schemas/extractionResponseFormat';
import { ExtractionOutputAdapter } from '@/shared/llm/tasks/extraction/adapters/extractionOutputAdapter';

tasks: {
  extraction: {
    schema: {
      name: 'extraction_tokens',
      schema: ExtractionResponseFormat
    },
    adapter: ExtractionOutputAdapter.parse
  }
}

```

**Use it in code:**
```
const extractionResult = await callLLM<string[]>('gpt-4o', 'Extract these items:', 'extraction');

```

**Update LLMTask  type:**
```
export type LLMTask = 'remi' | 'chords' | 'extraction';

```

## 📦 How it Works (Call Flow Recap)

Consumer calls:
  callLLM(model, prompt, task)

→ Resolves model → provider
→ Resolves provider → profile (tasks → schema/adapter)
→ Dispatches to correct provider caller (OpenAI, Claude, Local, etc.)
→ Parses result through task-specific adapter
→ Returns normalized typed output

|Concept|Role|
|---|---|
|**Provider**|The LLM vendor (OpenAI, Anthropic, Google, Local)|
|**Task**|The kind of structured output we want (remi, chords, extraction)|
|**Profile**|Per-provider map of how tasks are handled (schema + adapter)|
|**callLLM()**|The single entrypoint that hides all this complexity|

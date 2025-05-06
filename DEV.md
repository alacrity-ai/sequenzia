## 🛠️ Developer Mode (Dev Tools Guide)

This document describes how to enable **dev mode** in Sequenzia and use the developer tooling exposed through the browser console.

---

### ✅ How to Enable Dev Mode

1. Open the browser's **Developer Console** (e.g., press `F12` or `Cmd+Option+I`).
    
2. Run the following command: `toggleDevMode()`

This will:

- Enable developer logging
    
- Persist the setting in `localStorage`
    
- Expose useful developer utilities via the global `DEVTOOLS` object
    

You can disable it by running the same command again: `toggleDevMode()`

### 🧰 Available Tools: `window.DEVTOOLS`

Once dev mode is enabled, `window.DEVTOOLS` is defined and exposes the following functions:

#### 🔄 State & Configuration

```
DEVTOOLS.devGetAppState()
// → Returns the current application state

DEVTOOLS.dumpState()
// → Logs full app state with timestamp (via devLog)
```

#### 🎛️ Sequencer Tools

```
DEVTOOLS.devGetSequencers()
// → Returns an array of all active Sequencer instances

DEVTOOLS.dumpSequencers()
// → Logs the list of sequencers with timestamp
```

#### 📝 Logging Utilities

```
DEVTOOLS.log('Something happened', { detail: 42 })
// Logs as structured JSON with timestamp, only in dev mode
```

### 🧪 Contributing New Dev Tools

To add a new dev function:

1. Create a new file under `src/shared/dev/tools/` or expand an existing module
    
2. Export your function normally
    
3. Add it to `getAllDevTools()` in `tools/index.ts`

Example:
```
// src/shared/dev/tools/uiTools.ts
export function forceUIRedraw() {
  // Your implementation
}
```

Then include it in `index.ts`:
```
import * as uiTools from './uiTools.js';

export function getAllDevTools() {
  return {
    ...sequencerTools,
    ...stateTools,
    ...uiTools
  };
}
```

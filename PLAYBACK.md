## **High-Level Overview: Playback System Architecture**

### **1. Central Transport System**

- The function `startTransport(bpm, opts)` creates a time base by scheduling an `animationFrame` loop.
    
- It calculates the **current beat** from the real-time clock using `performance.now()` and the BPM.
    
- On each tick (via `requestAnimationFrame`), it:
    
    - Calculates the new beat.
        
    - Calls all registered transport listeners with that `beat` value.
        
    - Handles looping if the end beat is reached.
        
- Each sequencer registers its own `onBeatUpdate(handler)` to receive beat updates.
    

---

### **2. Sequencer-Level Playback**

Each `Sequencer` instance does the following:

#### A. **Handles a Track**

- Holds its own array of `Note` objects, each with `pitch`, `start`, `duration`, and `velocity`.
    

#### B. **Plays Notes on Transport Update**

- Registers a `_beatHandler` with `onBeatUpdate`.
    
- On each beat update:
    
    - Iterates over every note in its track.
        
    - If the beat is within `[note.start, note.start + duration]` and the note hasn't already played:
        
        - Calls `playNote(...)` → which calls `loadAndPlayNote(...)` to trigger the instrument.
            
        - Triggers animation effects.
            
    - Tracks active notes via `_activeNoteKeys` so notes don’t replay unnecessarily.
        

#### C. **Manages Its Own Instrument**

- Caches its instrument in `this._instrument`.
    
- Each call to `playNote(...)` passes through the full pipeline: `loadAndPlayNote(...)`.
    

---

### **3. Note Playback Pipeline**

The path `playNote(...)` → `loadAndPlayNote(...)` involves:

- Retrieving the instrument via its name.
    
- Resolving the correct MIDI note or sample.
    
- Scheduling playback (typically via `AudioBufferSourceNode` or MIDI trigger on SF2/WebAudioFont).
    
- Velocity, pan, and volume are passed into that pipeline.
    

---

## **How the System Interacts Under Load**

With 10+ tracks and hundreds of notes:

- Each **frame** (i.e. each `requestAnimationFrame`) triggers **every track’s note list to be re-scanned**.
    
- For every note, comparisons like `note.start < beat && beat <= note.start + duration` are computed.
    
- If not yet triggered, the note is **played immediately** (leading to polyphonic bursts).
    
- This can create CPU spikes, GC pressure, and **audio timing drift** due to late triggering.
    
- **Redundant `loadAndPlayNote` calls** may re-resolve instrument assets even if cached.
    

---

## **Key Inefficiencies Right Now**

|Component|Inefficiency|
|---|---|
|**Transport Loop**|Fires at ~60fps, but iterates over every note every tick.|
|**Note Activation**|Linear scan through all notes, with redundant checks.|
|**Redundant Lookups**|Notes use string-based keys and dynamically constructed handlers.|
|**No Pre-Scheduling**|Notes are played in "real time" based on current beat, not pre-scheduled into the audio graph.|
|**No Batching**|Notes aren't grouped or scheduled ahead of time using Web Audio’s latency-tolerant scheduling.|
|**loadAndPlayNote**|Called per note; even if it's caching internally, it's per-trigger overhead.|

---

## Summary: How the Components Interact

```
Browser clock → Transport.tick()
                ↳ Updates current beat
                ↳ Notifies sequencers

Each Sequencer:
  ↳ Iterates over all notes
  ↳ Checks: "Should this note play?"
  ↳ If yes:
      ↳ Calls playNote()
          ↳ Calls loadAndPlayNote()
              ↳ Resolves instrument
              ↳ Triggers note via Audio API

```

Better flow:

```
Browser clock → Transport.tick()
                ↳ Updates current beat
                ↳ Notifies sequencers

Each Sequencer:
  ↳ Maintains a pre-sorted, beat-indexed note queue
  ↳ Checks: "Is it time to schedule next N notes?"
    ↳ If yes:
        ↳ Schedule note with AudioContext.currentTime + offset
        ↳ Avoid re-checking already scheduled notes

```

Even better flow:

```
User presses Play →
  For each sequencer:
    ⤷ Pre-schedule all notes into AudioContext timeline
  Once all tracks are ready:
    ⤷ Call audioContext.resume() (or start transport timer)
```

e.g.
```
const startAt = audioContext.currentTime + 0.1; // slight future to ensure scheduling time

for (const seq of sequencers) {
  await seq.preparePlayback(startAt); // or .scheduleNotes(startAt)
}

audioContext.resume(); // Launch all scheduled notes
startTransport(bpm, { startBeat: 0 }); // If needed, for UI syncing
```

```
On pause:
  → Store pauseBeat = currentBeat
  → Stop all pending AudioNodes (e.g. via .stop())

On resume:
  → Set newStartTime = AudioContext.currentTime + smallDelay
  → For each sequencer:
      ⤷ Schedule all notes where note.start ≥ pauseBeat
          → note.time = newStartTime + (note.start - pauseBeat) * beatDuration
  → audioContext.resume()
  → startTransport(bpm, { startBeat: pauseBeat }) // UI syncing
```

🛠 Optimization Suggestion
In each sequencer, pre-sort this.notes once by note.start, and maintain an internal nextNoteIndex. On resume:

```
while (nextNoteIndex < notes.length && notes[nextNoteIndex].start < resumeBeat) {
  nextNoteIndex++;
}

for (let i = nextNoteIndex; i < notes.length; i++) {
  const note = notes[i];
  const offsetSec = (note.start - resumeBeat) * beatDuration;
  instrument.start({
    note: midi,
    time: audioContext.currentTime + offsetSec,
    duration: note.duration * beatDuration,
    velocity: note.velocity ?? 100
  });
}
```

This is minimal and scales very well.

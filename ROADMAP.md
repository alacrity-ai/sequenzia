# Roadmap


## Immediate Todos
- Volume:
  - [x] Add volume to json (project file) configuration
  - [x] Handle volume in json import / export
  - [x] Handle volume in midi import/export
  - [x] Handle volume in wav export
- Panning:
  - [x] Add pan to json (project file) configuration
  - [x] Handle panning in json import / export
  - [x] Handle panning in sf2 engine
  - [x] Handle panning in midi import/export
  - [x] Handle panning in wav export
- Velocity:
  - [x] Add velocity to json (project file) notes
  - [x] Support velocity in loadAndPlayNote for sf2
  - [x] Support velocity in loadAndPlayNote for webaudiofont
  - [x] Add UI Elements for adjusting velocity
  - [x] Verify velocity works for:
    - [x] Midi export
    - [x] Midi import
    - [x] Wav export
    - [x] Project file import/export
- Selection:
  - [x] Be able to resize groups of notes
  - [ ] Be able to hold CTRL and then left click on notes to select them (multiple unconnected)
  - [x] Remove select mode entirely, and put velocity mode within it
  - [x] Holding down V should show note velocities regardless of the note render mode
  - [ ] Add "humanize" to the velocity modal that looks at beats/measure/timesignature to articulate velocity on strong vs weak beats

## Future Todos
- QOL:
  - [ ] Smarter snap durations, auto shift down to the note value you're on
  - [ ] Add alternate note placement mode option in the user config (on mouse down note placement into sizing)
  - [ ] Hold down alt or something to see all the hotkeys on all UI elements.
- Sequencer Grid:
  - [x] Re-implement sequencer grid drawing entirely.
    - [x] Replace the existing sequencer element with one based from the example in: gridtest.html
    - [x] Thoroughly test after integration
    - [x] Style pass, to make sure it looks as good as the original or better
- JSX Refactor
  - [ ] Create all UI components via JSX
  - [ ] Refactor UI/handler classes into a clean architecture, separated from business code
  - [ ] Use /setup only as orchestration layer
- Playback Enhancements:
  - [ ] Add loop start/loop end to global playhead
  - [ ] Add playhead follow mode to sequencer topbar (follows playhead, or scrolls when playhead reaches end of screen)
- Note Editing:
  - [ ] Add Quantize Modal for Quantizing groups of selected notes
  - [ ] Add Recording for keyboard
    - [ ] Support live quantization

## Bugs
- Critical Bugs:
  - [ ] Dragging down on a note, and running off of the note can lock handler mode in a weird state where a note has to be placed to do anything.  Drag threshold should be more forgiving moving down.
  - [ ] Velocity not being honored on webaudiofont drums
  - [ ] When pressing play after a fresh stop, always starts from the beginning - ignores if user manually moved playhead to a spot
  - [x] webaudiofont instrument wav export is silent. OfflineAudioContext issue. (related to currentTime?)
- Small Bugs:
  - [x] Drum tracks on Wav export throw: Sample not found: '50', Sample not found: '53', etc
  - [x] Double check that we aren't loading instruments/updating state when every note is played. The playhead looks a bit stuttery on playback
  - [x] If loading midi files back to back, will crash on second load
  - [x] If paused, note placement does not preview sound
  - [x] When pasting a cluster of notes, it's possible for some of those notes to be pasted out of bounds (into the piano roll label on the left)
  - [x] If previewing a note (note placement mode) while playblack is ocurring, significant slowdown ensues

## Phase 0: Refactor to TS
- [x] Complete all js -> ts refactoring

## Phase 1: Core Functionality

- [x] Handle resizing of groups of selected notes
- Add velocity
  - [x] Give notes a velocity property
  - [x] Make sure it is saved properly, and loaded properly
  - [x] Make velocity adjustable through UI (groups of notes, single notes)
  - Make sure AI extend isn't broken from adding velocity
- [x] Handle MIDI export
- [x] Handle MIDI import
- Add wav tracks
  - Add recording to a wav track
  - Add importing existing wav file to a wave track

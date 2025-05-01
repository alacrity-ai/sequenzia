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
  - [ ] Be able to resize groups of notes
  - [ ] Be able to hold CTRL and then left click on notes to select them (multiple unconnected)
  - [ ] Remove select mode entirely, and put velocity mode within it
  - [ ] Holding down V should show note velocities regardless of the note render mode
  - [ ] Add "humanize" to the velocity modal that looks at beats/measure/timesignature to articulate velocity on strong vs weak beats

## Future Todos
- Note Editing:
  - [ ] Add Quantize Modal for Quantizing groups of selected notes
  - [ ] Add Recording for keyboard
    - [ ] Support live quantization

## Bugs
- Critical Bugs:
  - [x] webaudiofont instrument wav export is silent. OfflineAudioContext issue. (related to currentTime?)
- Small Bugs:
  - [x] Drum tracks on Wav export throw: Sample not found: '50', Sample not found: '53', etc
  - [x] Double check that we aren't loading instruments/updating state when every note is played. The playhead looks a bit stuttery on playback
  - [ ] When pasting a cluster of notes, it's possible for some of those notes to be pasted out of bounds (into the piano roll label on the left)

## Phase 0: Refactor to TS
- [x] Complete all js -> ts refactoring

## Phase 1: Core Functionality

- Handle resizing of groups of selected notes
- Add velocity
  - Give notes a velocity property
  - Make sure it is saved properly, and loaded properly
  - Make velocity adjustable through UI (groups of notes, single notes)
  - Make sure AI extend isn't broken from adding velocity
- Handle MIDI export
- Handle MIDI import
- Add wav tracks
  - Add recording to a wav track
  - Add importing existing wav file to a wave track

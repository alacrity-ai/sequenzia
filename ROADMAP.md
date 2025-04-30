# Roadmap


## Immediate Todos
- Volume:
  - [ ] Add volume to json (project file) configuration
  - [ ] Handle volume in json import / export
  - [ ] Handle volume in midi import/export
  - [ ] Handle volume in wav export
- Panning:
  - [ ] Add pan to json (project file) configuration
  - [ ] Handle panning in json import / export
  - [ ] Handle panning in sf2 engine
  - [ ] Handle panning in midi import/export
  - [ ] Handle panning in wav export
- Velocity:
  - [ ] Add velocity to json (project file) notes
  - [ ] Support velocity in loadAndPlayNote for sf2
  - [ ] Support velocity in loadAndPlayNote for webaudiofont
  - [ ] Add UI Elements for adjusting velocity
  - [ ] Verify velocity works for:
    - [ ] Midi export
    - [ ] Midi import
    - [ ] Wav export
    - [ ] Project file import/export

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

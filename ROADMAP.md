# Roadmap


## Phase 0: Refactor to TS
- Complete all js -> ts refactoring
- Fix bugs:
  - Drum tracks on Wav export throw: Sample not found: '50', Sample not found: '53', etc
  - Double check that we aren't loading instruments/updating state when every note is played. The playhead looks a bit stuttery on playback

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

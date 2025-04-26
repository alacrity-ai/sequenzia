# Roadmap

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
- Continue working on AI features

## Phase 2: WAMs
Step	Goal
1. Research Spike	Understand WAM2.0, instantiate basic plugin
2. Source Free WAMs	Build a starter pack of plugins
3. Build Basic WAM Host	Load, create, destroy plugins in Sequenzia
4. Add WAM Track Support	New track type, integrated into song
5. UX for WAM Management	Dropdowns, replacement, removal
6. Send MIDI to WAMs	Enable WAM instruments to play notes
7. Bonus Polish	Automation lanes, state saving, embedded UI


WAM detail:
1. 🔍 Research SPike: Understand Web Audio Modules (WAMs)
Read WAM 2.0 Specification: https://github.com/webaudiomodules/webau

Understand core concepts:

WAM Descriptor: JSON describing plugin metadata

WAM Instance: Audio node + UI elements

AudioWorklet-based DSP engine

Parameter automation

Review wam2-prototype-host examples: https://github.com/webaudiomodules/wam2-prototype-host

Spike: load a simple test WAM into a blank HTML page outside of Sequenzia

✅ Goal: Confirm you can instantiate a WAM manually.

2. 📦 Sourcing WAM Plugins
Search GitHub and WAM community for freely usable/testable WAM plugins.

Focus on a few categories to start:

Simple Synth (oscillator, simple subtractive synth)

Simple FX (Delay, Reverb, Chorus)

Good starting places:

wam-extra-plugins

wam-synths

Spike: Download 2–3 working WAMs and manually load them into browser page.

✅ Goal: Collect a “starter pack” of WAMs for internal testing.

3. 🏗️ Implement Basic WAM Host into Sequenzia
Create a simple WAMManager class:

Load a WAM plugin via URL

Instantiate it into your Web Audio graph

Handle basic parameter setting (volume, effects, etc.)

Provide minimal UI to:

List available WAM plugins

Instantiate and destroy WAM instances

Connect WAM outputs to Sequenzia’s master output (after gain, optionally after Soundfont playback)

✅ Goal: User can dynamically load/play a WAM inside Sequenzia alongside Soundfont tracks.

4. 🎛️ Add WAM Track Type
Add new track type alongside MIDI and WAV:
→ WAM Track

WAM Track properties:

Associated WAM Plugin ID

Per-instance parameter states (if you want recall later)

Active audio graph node reference

Allow adding/removing WAM tracks dynamically in project.

✅ Goal: User can compose across MIDI notes, WAV audio, and WAM plugins seamlessly.

5. 📜 WAM Plugin Management UX
Allow user to:

Choose WAM plugin from dropdown

Replace a plugin on an existing WAM track

Remove a WAM from a track

(Optional later) allow multiple instances of same WAM on different tracks.

✅ Goal: Make plugin workflow feel like lightweight VST management.

6. 🧪 Research Spike: MIDI → WAM Instruments
Some WAMs are instruments (they need MIDI notes), not just FX.

Research how to:

Send noteOn / noteOff MIDI-style messages to WAM instrument plugins

If needed, extend your sequencer note playback system to dispatch to either Soundfont or WAM instrument tracks.

✅ Goal: Enable playable/recordable WAM-based synthesizers.

7. 🚀 Production Polish (Optional)
Parameter Automation: Allow automating WAM parameters over time (similar to envelopes in pro DAWs)

UI Embedding: Cleanly embed WAM UI into your layout (or popout modals)

WAM Saving/Loading: Save plugin instance state inside your .json song files
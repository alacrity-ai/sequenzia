// src/sounds/loaders/constants/drums.ts

export const DRUM_MIDI_RANGE = Array.from({ length: 47 }, (_, i) => 35 + i); // MIDI 35–81

export const DRUM_MIDI_TO_NAME: Record<number, string> = {
    35: 'kick2',
    36: 'kick1',
    37: 'rim',
    38: 'snare1',
    39: 'clap',
    40: 'snare2',
    41: 'lowtom2',
    42: 'hh_closed',
    43: 'lowtom1',
    44: 'hh_pedal',
    45: 'midtom2',
    46: 'hh_open',
    47: 'midtom1',
    48: 'hitom2',
    49: 'crash1',
    50: 'hitom1',
    51: 'ride1',
    52: 'china',
    53: 'ride_bell',
    54: 'tamb',
    55: 'splash',
    56: 'cowbell',
    57: 'crash2',
    58: 'vibraslap',
    59: 'ride2',
    60: 'bongo_hi',
    61: 'bongo_lo',
    62: 'conga_hi_mute',
    63: 'conga_hi_open',
    64: 'conga_lo',
    65: 'timbale_hi',
    66: 'timbale_lo',
    67: 'agogo_hi',
    68: 'agogo_lo',
    69: 'cabasa',
    70: 'maracas',
    71: 'whistle_short',
    72: 'whistle_long',
    73: 'guiro_short',
    74: 'guiro_long',
    75: 'claves',
    76: 'woodblock_hi',
    77: 'woodblock_lo',
    78: 'cuica_mute',
    79: 'cuica_open',
    80: 'triangle_mute',
    81: 'triangle_open',
  };

  export const DRUM_PITCH_TO_NAME: Record<string, string> = {
    'B1':  'kick2',          // 35
    'C2':  'kick1',          // 36
    'C#2': 'rim',            // 37
    'D2':  'snare1',         // 38
    'D#2': 'clap',           // 39
    'E2':  'snare2',         // 40
    'F2':  'lowtom2',        // 41
    'F#2': 'hh_closed',      // 42
    'G2':  'lowtom1',        // 43
    'G#2': 'hh_pedal',       // 44
    'A2':  'midtom2',        // 45
    'A#2': 'hh_open',        // 46
    'B2':  'midtom1',        // 47
    'C3':  'hitom2',         // 48
    'C#3': 'crash1',         // 49
    'D3':  'hitom1',         // 50
    'D#3': 'ride1',          // 51
    'E3':  'china',          // 52
    'F3':  'ride_bell',      // 53
    'F#3': 'tamb',           // 54
    'G3':  'splash',         // 55
    'G#3': 'cowbell',        // 56
    'A3':  'crash2',         // 57
    'A#3': 'vibraslap',      // 58
    'B3':  'ride2',          // 59
    'C4':  'bongo_hi',       // 60
    'C#4': 'bongo_lo',       // 61
    'D4':  'conga_hi_mute',  // 62
    'D#4': 'conga_hi_open',  // 63
    'E4':  'conga_lo',       // 64
    'F4':  'timbale_hi',     // 65
    'F#4': 'timbale_lo',     // 66
    'G4':  'agogo_hi',       // 67
    'G#4': 'agogo_lo',       // 68
    'A4':  'cabasa',         // 69
    'A#4': 'maracas',        // 70
    'B4':  'whistle_short',  // 71
    'C5':  'whistle_long',   // 72
    'C#5': 'guiro_short',    // 73
    'D5':  'guiro_long',     // 74
    'D#5': 'claves',         // 75
    'E5':  'woodblock_hi',   // 76
    'F5':  'woodblock_lo',   // 77
    'F#5': 'cuica_mute',     // 78
    'G5':  'cuica_open',     // 79
    'G#5': 'triangle_mute',  // 80
    'A5':  'triangle_open',  // 81
  };
  
  
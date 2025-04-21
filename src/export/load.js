// load.js — responsible for importing a note sequence or full session from a JSON file

export async function importFromJSON(file) {
  // single-track loader (backwards compat)
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON format.");
  }
  if (!data || !Array.isArray(data.notes)) {
    throw new Error("JSON file missing required `notes` array.");
  }
  const notes = data.notes.map(n => ({
    pitch: n.pitch,
    start: n.start,
    duration: n.duration
  }));
  const config = {
    bpm: data.config?.bpm ?? 120,
    snapResolution: data.config?.snapResolution ?? 0.125,
    currentDuration: data.config?.currentDuration ?? 0.25,
    noteRange: data.config?.noteRange ?? ['C3', 'B5'],
    totalBeats: data.config?.totalBeats ?? 100,
    beatsPerMeasure: data.config?.beatsPerMeasure ?? 4,
    totalMeasures: data.config?.totalMeasures ?? 8
  };
  return [{ notes, config }];
}

export async function importSessionFromJSON(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON format.");
  }

  if (!Array.isArray(data.tr)) {
    throw new Error("Missing or invalid `tr` (tracks) array.");
  }

  const bpm = data.c?.b ?? 120;
  const beatsPerMeasure = data.c?.bpm ?? 4;
  const totalMeasures = data.c?.tm ?? 8;
  const instrumentNames = Array.isArray(data.i) ? data.i : [];

  return data.tr.map((track, idx) => {
    if (!Array.isArray(track.n)) {
      throw new Error("Track missing `n` (notes) array.");
    }

    const notes = track.n.map(([p, s, d]) => ({
      pitch: p,
      start: s,
      duration: d
    }));

    const config = {
      bpm,
      beatsPerMeasure,
      totalMeasures
    };

    const instrument = instrumentNames[idx] || 'fluidr3-gm/acoustic_grand_piano';
    return { notes, config, instrument };    
  });
}




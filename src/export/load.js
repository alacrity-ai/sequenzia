// src/export/load.js

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

  const globalConfig = {
    bpm: data.c?.b ?? 120,
    beatsPerMeasure: data.c?.bpm ?? 4,
    totalMeasures: data.c?.tm ?? 8
  };

  const instrumentNames = Array.isArray(data.i) ? data.i : [];

  const tracks = data.tr.map((track, idx) => {
    if (!Array.isArray(track.n)) {
      throw new Error(`Track ${idx} missing \`n\` (notes) array.`);
    }

    const notes = track.n.map(([pitch, start, duration]) => ({
      pitch,
      start,
      duration
    }));

    const instrument = instrumentNames[idx] || 'fluidr3-gm/acoustic_grand_piano';

    return { notes, instrument };
  });

  return { tracks, globalConfig };
}

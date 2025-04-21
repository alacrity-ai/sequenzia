export function getKeyMap(startOctave = 3) {
  const keyWidth = 60;
  const blackWidth = 40;
  const keyHeight = 200;
  const blackHeight = 120;

  const whiteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackOrder = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];

  const octaves = [startOctave, startOctave + 1, startOctave + 2];
  const keyMap = {};
  let x = 0;

  for (const octave of octaves) {
    whiteOrder.forEach(noteName => {
      const note = `${noteName}${octave}`;
      keyMap[note] = { note, x, width: keyWidth, height: keyHeight, isBlack: false };
      x += keyWidth;
    });
  }

  x = 0;
  for (const octave of octaves) {
    blackOrder.forEach((noteName, i) => {
      if (noteName === '') {
        x += keyWidth;
        return;
      }

      const note = `${noteName}${octave}`;
      keyMap[note] = {
        note,
        x: x + keyWidth - blackWidth / 2,
        width: blackWidth,
        height: blackHeight,
        isBlack: true
      };

      x += keyWidth;
    });
  }

  return keyMap;
}


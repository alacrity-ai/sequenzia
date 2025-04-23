// grid/drawing/grid-background.js
import { isBlackKey } from '../geometry.js';
import { labelWidth } from '../constants.js';
import { getTotalBeats } from '../../../helpers.js';

/**
 * Renders the piano roll grid with:
 * - pitch rows
 * - thick vertical lines per measure
 * - thin subdivisions per beat
 */
export function drawGridBackground(ctx, config, visibleNotes, cellWidth, cellHeight, getPitchFromRow) {
  const { totalMeasures, beatsPerMeasure } = config;

  // === ROW BACKGROUND ===
  const gridWidth = getTotalBeats(config) * cellWidth;

  for (let row = 0; row < visibleNotes; row++) {
    const y = row * cellHeight;
    const pitch = getPitchFromRow(row);
  
    ctx.fillStyle = isBlackKey(pitch) ? 'rgb(174,173,175)' : '#fefefe';
    ctx.fillRect(0, y, gridWidth, cellHeight); // ✅ only draw up to content area
  
    ctx.fillStyle = isBlackKey(pitch) ? '#a088b0' : '#dddddd';
    ctx.fillRect(-labelWidth, y, labelWidth, cellHeight);
  }
  

  // === PITCH LABELS ===
  ctx.font = `${Math.floor(cellHeight * 0.6)}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let row = 0; row < visibleNotes; row++) {
    const y = row * cellHeight;
    const pitch = getPitchFromRow(row);
    ctx.fillStyle = isBlackKey(pitch) ? '#800080' : '#444';
    ctx.fillText(pitch, -8, y + cellHeight / 2);
  }

  // === HORIZONTAL PITCH LINES ===
ctx.strokeStyle = '#ddd';
ctx.lineWidth = 1;
for (let row = 0; row < visibleNotes; row++) {
  const y = row * cellHeight;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(gridWidth, y); // ✅ use gridWidth instead of canvasWidth
  ctx.stroke();
}

// ✅ Draw final bottom boundary line
const finalY = visibleNotes * cellHeight;
ctx.beginPath();
ctx.moveTo(0, finalY);
ctx.lineTo(gridWidth, finalY);
ctx.stroke();


  const maxY = visibleNotes * cellHeight;

// === MEASURE + BEAT LINES ===
const totalBeats = totalMeasures * beatsPerMeasure;

for (let beat = 0; beat <= totalBeats; beat++) {
  const x = beat * cellWidth;
  const isMeasureStart = (beat % beatsPerMeasure === 0);

  ctx.strokeStyle = isMeasureStart ? '#bbb' : '#eee';
  ctx.lineWidth = isMeasureStart ? 2 : 1;

  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, maxY);
  ctx.stroke();
}


// Draw the final boundary line at the end
const finalX = totalMeasures * beatsPerMeasure * cellWidth;
ctx.strokeStyle = '#bbb';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(finalX, 0);
ctx.lineTo(finalX, maxY);
ctx.stroke();
}

// src/sequencer/grid/drawing/grid-background.js
import { isBlackKey } from '../helpers/geometry.js';
import { labelWidth } from '../helpers/constants.js';
import { getTotalBeats, getTimeSignature } from '../../transport.js';
import { getUserConfig } from '../../../userconfig/settings/userConfig.js';
import { GRID_COLOR_SCHEMES } from './color-schemes/grid-colors.js';

/**
 * Renders the piano roll grid using the user-selected color scheme.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config
 * @param {number} visibleNotes
 * @param {number} cellWidth
 * @param {number} cellHeight
 * @param {Function} getPitchFromRow
 */
export function drawGridBackground(ctx, config, visibleNotes, cellWidth, cellHeight, getPitchFromRow) {
  const { gridColorScheme } = getUserConfig();
  const gridColors = GRID_COLOR_SCHEMES[gridColorScheme] || GRID_COLOR_SCHEMES['Darkroom'];

  const beatsPerMeasure = getTimeSignature();
  const totalBeats = getTotalBeats();
  const gridWidth = totalBeats * cellWidth;
  const maxY = visibleNotes * cellHeight;

  ctx.font = `${Math.floor(cellHeight * 0.6)}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let row = 0; row < visibleNotes; row++) {
    const y = row * cellHeight;
    const pitch = getPitchFromRow(row);
    const isBlack = isBlackKey(pitch);

    ctx.fillStyle = isBlack ? gridColors.blackKey : gridColors.whiteKey;
    ctx.fillRect(0, y, gridWidth, cellHeight);

    ctx.fillStyle = isBlack ? gridColors.labelBlack : gridColors.labelWhite;
    ctx.fillRect(-labelWidth, y, labelWidth, cellHeight);

    ctx.fillStyle = isBlack ? gridColors.textBlack : gridColors.textWhite;
    ctx.fillText(pitch, -8, y + cellHeight / 2);
  }

  ctx.strokeStyle = gridColors.gridLine;
  ctx.lineWidth = 1;
  for (let row = 0; row < visibleNotes; row++) {
    const y = row * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gridWidth, y);
    ctx.stroke();
  }

  for (let beat = 0; beat <= totalBeats; beat++) {
    const x = beat * cellWidth;
    const isMeasureStart = (beat % beatsPerMeasure === 0);

    ctx.strokeStyle = isMeasureStart ? gridColors.measureLine : gridColors.beatLine;
    ctx.lineWidth = isMeasureStart ? 2 : 1;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, maxY);
    ctx.stroke();
  }
}

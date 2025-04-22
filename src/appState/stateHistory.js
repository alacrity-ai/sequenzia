const history = [];
let pointer = -1;

export function pushDiff(diff) {
  history.splice(pointer + 1);
  history.push(diff);
  pointer = history.length - 1;
}

export function undo() {
  if (pointer <= 0) return null;
  pointer--;
  return history[pointer];
}

export function redo() {
  if (pointer >= history.length - 1) return null;
  pointer++;
  return history[pointer];
}

export function clearHistory() {
  history.length = 0;
  pointer = -1;
}

// src/sequencer/matrix/interfaces/GridSnappingContext.ts

export interface GridSnappingContext {
  getSnapResolution(): number;
  getNoteDuration(): number;
  isTripletMode(): boolean;
}

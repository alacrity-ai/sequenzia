// src/test/interfaces/Grid.ts

export interface GridTestElements {
    canvas: HTMLCanvasElement;
    playheadCanvas: HTMLCanvasElement;
    animationCanvas: HTMLCanvasElement;
    scrollContainer: HTMLElement;
    sequencerMock: any; // refine further if possible
  }
  
  export interface GridTestData {
    dummyNotes: Array<any>; // or refine with your Note type
    dummyConfig: any; // again, refine if you have a GridConfig type
  }
  
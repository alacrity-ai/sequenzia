import type { SequencerController } from '@/components/sequencer/sequencerController.js';

const controllers = new Map<number, SequencerController>();

let nextId = 0;

export function createId(): number {
  return nextId++;
}

export function registerSequencerController(id: number, controller: SequencerController): void {
  controllers.set(id, controller);
}

export function unregisterSequencerController(id: number): void {
  controllers.delete(id);
}

export function getSequencerControllerById(id: number): SequencerController | undefined {
  return controllers.get(id);
}

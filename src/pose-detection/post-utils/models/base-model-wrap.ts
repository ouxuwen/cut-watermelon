import { VRMHumanBoneName } from '@pixiv/three-vrm';
import { Object3D, Event, Euler } from 'three';

export interface BaseModelWrap {
  getBoneNode(name: keyof typeof VRMHumanBoneName): Object3D<Event> | null;
  lookAt(euler: Euler): void;

  setPresetValue(name: string, weight: number): void;
  getPresetValue(name: string): number;

  update(num: number): void;

  getOriginData(): void;

  reset(): void;
}

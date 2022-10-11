import { VRMHumanBoneName, VRM } from '@pixiv/three-vrm';
import { Euler, MathUtils } from 'three';
import { BaseModel } from './base-model';

export default class VrmModelWrap implements BaseModel {
  private model!: VRM;

  setModel(vrm: VRM) {
    this.model = vrm;
  }

  getBoneNode(name: keyof typeof VRMHumanBoneName) {
    return this?.model?.humanoid.getNormalizedBoneNode(VRMHumanBoneName[name]);
  }

  lookAt(euler: Euler) {
    const yaw = MathUtils.RAD2DEG * euler.y;
    const pitch = MathUtils.RAD2DEG * euler.x;
    this?.model?.lookAt?.applier?.applyYawPitch(yaw, pitch);
  }

  setPresetValue(name: string, weight: number): void {
    this?.model?.expressionManager?.setValue(name, weight);
  }

  getPresetValue(name: string) {
    return this?.model.expressionManager?.getValue(name) as number;
  }

  update(num: number): void {
    this.model.update(num);
  }
}

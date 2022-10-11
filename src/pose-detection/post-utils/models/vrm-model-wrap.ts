import { VRMHumanBoneName, VRM } from '@pixiv/three-vrm';
import { Euler, MathUtils, Quaternion } from 'three';
import { BaseModelWrap } from './base-model-wrap';

export default class VrmModelWrap implements BaseModelWrap {
  public model!: VRM;

  private originData: any;

  setModel(vrm: VRM) {
    this.model = vrm;
  }

  getOriginData() {
    console.log(this.getBoneNode('Neck'));
  }

  reset() {
    const euler = new Euler(0, 0, 0);
    const quaternion = new Quaternion().setFromEuler(euler);
    this.getBoneNode('Neck')?.quaternion.slerp(quaternion, 1);
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

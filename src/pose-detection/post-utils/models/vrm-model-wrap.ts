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
    this.getBoneNode('LeftHand')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftRingProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftRingIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftRingDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftIndexProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftIndexIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftIndexDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftMiddleProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftMiddleIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftMiddleDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftThumbProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftThumbDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftLittleProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftLittleIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('LeftLittleDistal')?.quaternion.slerp(quaternion, 1);

    this.getBoneNode('RightHand')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightRingProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightRingIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightRingDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightIndexProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightIndexIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightIndexDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightMiddleProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightMiddleIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightMiddleDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightThumbProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightThumbDistal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightLittleProximal')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightLittleIntermediate')?.quaternion.slerp(quaternion, 1);
    this.getBoneNode('RightLittleDistal')?.quaternion.slerp(quaternion, 1);

    // const vector = new Vector3(0, -0.5, 0);
    // this.getBoneNode('Hips')?.position.lerp(vector, 1);
    // this.getBoneNode('Hips')?.quaternion.slerp(quaternion, 1);
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

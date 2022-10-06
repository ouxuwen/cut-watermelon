import { VRMHumanBoneName, VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Euler, MathUtils, Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseModel } from './base-model';

export default class VrmModel implements BaseModel {
  private model!: VRM;

  loadModel(scene: Scene, callback:() => void) {
    const loader = new GLTFLoader();
    // Install GLTFLoader plugin
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.crossOrigin = 'anonymous';
    // Import model from URL, add your own model here
    loader.load(
      '/models/Aether.vrm',
      (gltf) => {
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        const { vrm } = gltf.userData;
        this.model = vrm;
        // add the loaded vrm to the scene
        scene.add(vrm.scene);
        console.log(vrm);
        vrm.scene.rotation.y = Math.PI * 0.5;
        vrm.scene.position.y = -1;

        callback();
      },

      (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

      (error) => console.error(error),
    );
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

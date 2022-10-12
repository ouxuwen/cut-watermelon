/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { VRMHumanBoneName } from '@pixiv/three-vrm';
import { Euler, Group, HemisphereLight, Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import mixamo from '../helpers/mixamo';
import { BaseModelWrap } from './base-model-wrap';

export default class GlbModel implements BaseModelWrap {
  private model!: Group;

  loadModel(scene: Scene, callback:() => void) {
    const loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';
    // Import model from URL, add your own model here
    loader.load(
      '/models/Soldier.glb',
      (gltf) => {
        console.log(gltf);
        this.model = gltf.scene;
        // add the loaded vrm to the scene
        scene.add(gltf.scene);
        const light = new HemisphereLight(0xbbbbff, 0x444422);
        light.position.set(0, 1, 0);
        scene.add(light);

        this.model.traverse((obj) => {
          console.log(obj);
        });

        this.model.rotation.y = Math.PI;
        callback();
      },

      (progress) => console.log('Loading model...', progress.loaded, '%'),

      (error) => console.error(error),
    );
  }

  getBoneNode(name: keyof typeof VRMHumanBoneName) {
    const boneName = mixamo[name];
    return this?.model?.getObjectByName(boneName) || null;
  }

  lookAt(euler: Euler) {
    // this?.model?.lookAt(new Vector3(euler.x, euler.y, euler.z));
  }

  setPresetValue(name: string, weight: number): void {
    // this?.model?.expressionManager?.setValue(name, weight);
  }

  getPresetValue(name: string) {
    return 0;
    // return this?.model.expressionManager?.getValue(name) as number;
  }

  update(num: number): void {
    // this.model.update(num);
  }

  getOriginData(): void {
    // this.model.update(num);
  }

  reset(): void {
    // this.model.update(num);
  }
}

/* eslint-disable no-await-in-loop */
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export interface VModel {
  name: string;
  model?: VRM;
}
// const PeopleList = ['Aether.vrm', 'Kazuha.vrm'];
const PeopleList = ['Aether.vrm', 'Kazuha.vrm', 'Keqing.vrm', 'Kokomi.vrm', 'Bennett.vrm', 'Xiao.vrm', 'Albedo.vrm'];

export function loadModel(name: string): Promise<VRM> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    // Install GLTFLoader plugin
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.crossOrigin = 'anonymous';
    // Import model from URL, add your own model here
    loader.load(
      `/models/${name}`,
      (gltf) => {
        console.log(`load ${name} end`);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        const { vrm } = gltf.userData;
        vrm.scene.rotation.y = Math.PI * 0.5;
        vrm.scene.position.y = -1;

        resolve(vrm);
      },

      (progress) => console.log(`Loading ${name} model...`, 100.0 * (progress.loaded / progress.total), '%'),

      (error) => { reject(error); },
    );
  });
}

export class VrmList {
  currentIndex: number;

  modelList: VModel[];

  constructor() {
    this.currentIndex = 0;
    this.modelList = PeopleList.map((el) => ({
      name: el,
    }));
  }

  getCurrentModel() {
    return this.modelList[this.currentIndex];
  }

  changeModel(next: boolean) {
    if (next) {
      this.currentIndex++;
    } else {
      this.currentIndex--;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = this.modelList.length - 1;
    }

    if (this.currentIndex >= this.modelList.length) {
      this.currentIndex = 0;
    }
    console.log('currentModel:', this.modelList[this.currentIndex].name);
    return this.modelList[this.currentIndex];
  }

  async loadAllModel() {
    for (let i = 0; i < this.modelList.length; i++) {
      try {
        const model = await loadModel(this.modelList[i].name);
        this.modelList[i].model = model;
      } catch (error) {
        console.error(error);
      }
    }
    this.modelList = this.modelList.filter((el) => el.model);
  }
}

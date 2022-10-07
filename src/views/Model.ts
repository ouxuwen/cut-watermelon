import * as THREE from 'three';
import { Scene } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import Position from './type';

const modelName = [
  'tefadiqla',
  'tegqfetla',
  'tesrabopa',
  'tgmkaehpa',
  'tguocjppa',
  'tjciddjqx',
  'tkiibfwiw',
  'tklkaixiw',
  'uiuidc2jw',
];

function createMesh(fbxPath: string, texturePath: string, position: Position) {
  const fbxLoader = new FBXLoader();
  const textureAlbedo = new THREE.TextureLoader().load(texturePath);

  return new Promise((resolve: (value: unknown) => void) => {
    fbxLoader.load(
      fbxPath,
      (loadedModel: THREE.Group) => {
        const mesh: any = loadedModel.children[0].clone();
        mesh.scale.set(0.015, 0.015, 0.015);
        mesh.material.map = textureAlbedo;
        const vector = new THREE.Vector3(position.x, position.y, position.z);
        mesh.position.set(vector.x, vector.y, vector.z);

        resolve(mesh);
      },
      (xhr: ProgressEvent<EventTarget>) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error: ErrorEvent) => {
        console.log('加载模型出现异常：', error);
        resolve(null);
      },
    );
  });
}
class FruitModel {
  meshes: any[];

  scene!: Scene;

  constructor() {
    this.meshes = [];
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  getFruitModel() {
    const fruit = this.meshes[Math.round(Math.random() * 8)];
    const cloneFruit = fruit.clone();
    this.scene.add(cloneFruit);
    return cloneFruit;
  }

  async initFruitModels() {
    const meshPromises = [];
    for (let i = 0; i < modelName.length; i++) {
      const fbxName = `/scene-resource/fbx/${modelName[i]}_LOD4.fbx`;
      const imgName = `/scene-resource/image/${modelName[i]}_2K_Albedo.jpg`;
      const position = {
        x: -0.3,
        y: -1,
        z: (Math.random() - 0.5) * 2,
      };
      meshPromises.push(createMesh(fbxName, imgName, position));
    }
    const meshes: any[] = await Promise.all(meshPromises);
    this.meshes = meshes;
  }
}

export default new FruitModel();

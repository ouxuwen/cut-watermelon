import * as THREE from 'three';
import { Scene } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import Position from './type';

const modelName = [
  'te0uchfra',
  'tefadiqla',
  'tegqfetla',
  'tgmkaehpa',
  'tguocjppa',
  'th5jddwva',
  'tklkaixiw',
  'uiuidc2jw',
  'ujcxeblva',
  'veuhfhsjw',
];

function createMesh(
  fbxPath: string,
  texturePath: string,
  position: Position,
  scale: number = 0.015,
) {
  const fbxLoader = new FBXLoader();
  const textureAlbedo = new THREE.TextureLoader().load(texturePath);

  return new Promise((resolve: (value: unknown) => void) => {
    fbxLoader.load(
      fbxPath,
      (loadedModel: THREE.Group) => {
        const mesh: any = loadedModel.children[0].clone();
        mesh.scale.set(scale, scale, scale);
        mesh.material.map = textureAlbedo;
        // mesh.material.clippingPlanes = [];
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

function createText(position: Position, text: string = '+10') {
  const loader = new FontLoader();
  return new Promise((resolve: (value: unknown) => void) => {
    loader.load('/scene-resource/fonts/gentilis_bold.typeface.json', (font) => {
      const geometry = new TextGeometry(text, {
        font /* 字体 */,
        size: 0.5 /* 字体大小 */,
        height: 0.2 /* 文本厚度 */,
        curveSegments: 4 /* 曲线点数 (5降低优化性能) */,
        bevelEnabled: true /* 是否开启斜角 */,
        bevelThickness: 0.001 /* 斜角深度 */,
        bevelSize: 0.02 /* 斜角与原始文本轮廓之间的延伸距离 */,
        bevelSegments: 1 /* 斜角的分段数 (3降低优化性能) */,
        bevelOffset: 0 /* 斜角偏移 */,
      });
      const textTexture = new THREE.TextureLoader().load('/scene-resource/metal.jpeg');
      const txtMater = new THREE.MeshBasicMaterial({ map: textTexture });
      const txtMesh = new THREE.Mesh(geometry, txtMater);
      txtMesh.position.set(position.x, position.y, position.z);
      txtMesh.scale.set(0.08, 0.08, 0.08);
      resolve(txtMesh);
    });
  });
}

export async function getCoinModel(position: Position) {
  const coinMesh: any = await createMesh(
    '/scene-resource/fbx/ueilcjiva_LOD4.fbx',
    '/scene-resource/metal.jpeg',
    position,
    0.02,
  );
  coinMesh.rotation.z = -Math.PI * 0.5;
  const textMesh: any = await createText(position);
  textMesh.rotation.y = -Math.PI * 0.5;
  return { coinMesh, textMesh };
}

export async function createBomb() {
  const fbxLoader = new FBXLoader();
  const textureAlbedo = new THREE.TextureLoader().load(
    '/scene-resource/image/bombbody_BaseColor.png',
  );

  return new Promise((resolve: (value: unknown) => void) => {
    fbxLoader.load(
      '/scene-resource/fbx/bomb.fbx',
      (loadedModel: any) => {
        // eslint-disable-next-line no-param-reassign
        loadedModel.children[1].material.map = textureAlbedo;
        loadedModel.scale.set(0.1, 0.1, 0.1);
        // mesh.material.clippingPlanes = [];
        loadedModel.position.set(-0.3, -1, 0);
        resolve(loadedModel);
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
    const fruit = this.meshes[Math.round(Math.random() * (modelName.length - 1))];
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

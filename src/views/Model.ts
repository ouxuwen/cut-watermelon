import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const modelName = [
  'tefadiqla',
  'tegqfetla',
  'tgmkaehpa',
  'tguocjppa',
  'ti2jdifva',
  'tjciddjqx',
  'tkhlejhhw',
  'tklkaixiw',
  'uiuidc2jw',
];

interface Position {
  x: number;
  y: number;
  z: number;
}

function createMesh(fbxPath: string, texturePath: string, position: Position) {
  const fbxLoader = new FBXLoader();
  const textureAlbedo = new THREE.TextureLoader().load(texturePath);

  return new Promise((resolve: (value: unknown) => void) => {
    fbxLoader.load(
      fbxPath,
      (loadedModel: THREE.Group) => {
        console.log('-----loadedModel', loadedModel);
        const mesh: any = loadedModel.children[0].clone();
        mesh.scale.set(0.1, 0.1, 0.1);
        mesh.geometry.setAttribute(
          'uv2',
          new THREE.BufferAttribute(mesh.geometry.attributes.uv.array, 2),
        );
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

function createPhysicsBox(position: Position) {
  // Sphere参数为球体的半径
  const sphereShape = new CANNON.Sphere(1);
  const defaultMaterial = new CANNON.Material('default');
  const sphereBody = new CANNON.Body({
    // 刚体的质量mass，质量为0的物体为静止的物体
    mass: 1,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    shape: sphereShape,
    material: defaultMaterial,
  });
  return sphereBody;
}

export default async function getPhysicsModels() {
  const meshPromises = [];
  const physicsBoxes: CANNON.Body[] = [];
  for (let i = 0; i < modelName.length; i++) {
    const fbxName = `/scene-resource/fbx/${modelName[i]}_LOD4.fbx`;
    const imgName = `/scene-resource/image/${modelName[i]}_2K_Albedo.jpg`;
    const position = {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
    };
    meshPromises.push(createMesh(fbxName, imgName, position));
    physicsBoxes.push(createPhysicsBox(position));
  }
  const meshes: any[] = await Promise.all(meshPromises);
  return { meshes, physicsBoxes };
}

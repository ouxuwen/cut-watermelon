/* eslint-disable no-param-reassign */
import * as CANNON from 'cannon-es';
import { Scene, SpotLight } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import Position from './type';

export default class StartPhysicsModel {
  private world: CANNON.World;

  private scene: Scene;

  constructor(world: CANNON.World, scene: Scene) {
    this.world = world;
    this.scene = scene;
    const mtlLoader = new MTLLoader();
    const position = {
      x: 0,
      y: -0.5,
      z: -0.5,
    };
    // 加载mtl文件
    mtlLoader.load('/scene-resource/startModel/psyduck.mtl', (material) => {
      const loader = new OBJLoader();
      // 设置当前加载的纹理
      loader.setMaterials(material);
      // load a resource
      loader.load(
        // resource URL
        '/scene-resource/startModel/psyduck.obj',
        // called when resource is loaded
        (object: any) => {
          object.scale.set(0.001, 0.001, 0.001);
          object.rotation.x = -Math.PI * 0.5;
          object.rotation.z = -Math.PI * 0.5;
          object.position.set(position.x, position.y, position.z);
          const spotLight = new SpotLight(0xffffff);
          spotLight.position.set(0, 0, 0);
          spotLight.visible = true;
          spotLight.target = object;
          scene.add(spotLight);
          scene.add(object);
        },
        // called when loading is in progresses
        (xhr) => {
          console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        // called when loading has errors
        (error) => {
          console.log('An error happened', error);
        },
      );
    });
    this.createPhysicsBox(position);
  }

  createPhysicsBox(position: Position) {
    // Sphere参数为球体的半径
    const sphereShape = new CANNON.Box(new CANNON.Vec3(0.15, 0.15, 0.15));
    const defaultMaterial = new CANNON.Material('default');
    const sphereBody = new CANNON.Body({
      // 刚体的质量mass，质量为0的物体为静止的物体
      // mass: Math.random() * 5,
      mass: 0,
      position: new CANNON.Vec3(position.x - 0.1, position.y + 0.2, position.z),
      shape: sphereShape,
      material: defaultMaterial,
    });
    this.world.addBody(sphereBody);
    return sphereBody;
  }
}

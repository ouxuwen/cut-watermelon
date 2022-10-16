/* eslint-disable no-param-reassign */
import * as CANNON from 'cannon-es';
import { Scene, SpotLight } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import Position from './type';

const PsyduckId = 20000;

export default class StartPhysicsModel {
  private world: CANNON.World;

  private scene: Scene;

  private floorBody!: CANNON.Body;

  private sphereBody!: CANNON.Body;

  private psyduckModel!: any;

  private spotLight!: SpotLight;

  constructor(world: CANNON.World, scene: Scene) {
    this.world = world;
    this.scene = scene;
    const mtlLoader = new MTLLoader();
    const position = {
      x: -0.17,
      y: 0,
      z: -0.8,
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
          this.psyduckModel = object;
          scene.add(object);

          this.spotLight = new SpotLight(0xeeeeee);
          this.spotLight.position.set(-0.2, 0, 0);
          this.spotLight.visible = true;
          this.spotLight.target = object;
          scene.add(this.spotLight);
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
    const defaultMaterial = new CANNON.Material('default');

    const floorShape = new CANNON.Plane();
    this.floorBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      material: defaultMaterial,
    });
    this.floorBody.addShape(floorShape);
    this.world.addBody(this.floorBody);
    // setFromAxisAngle方法第一个参数是旋转轴，第二个参数是角度，为了能够让地面平过来
    this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    // Sphere参数为球体的半径
    const sphereShape = new CANNON.Box(new CANNON.Vec3(0.15, 0.15, 0.15));

    this.sphereBody = new CANNON.Body({
      // 刚体的质量mass，质量为0的物体为静止的物体
      mass: 1,
      position: new CANNON.Vec3(position.x - 0.1, position.y + 0.2, position.z),
      shape: sphereShape,
      material: defaultMaterial,
    });
    this.sphereBody.id = PsyduckId;
    this.world.addBody(this.sphereBody);
    return this.sphereBody;
  }

  removeBody() {
    this.world.removeBody(this.floorBody);
    this.world.removeBody(this.sphereBody);
    this.scene.remove(this.psyduckModel);
    this.scene.remove(this.spotLight);
  }
}

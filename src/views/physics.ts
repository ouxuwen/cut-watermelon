import * as CANNON from 'cannon-es';
import { Clock, Scene } from 'three';
import CannonDebugger from 'cannon-es-debugger';
import Position from './type';

export interface Box extends CANNON.Body {
  isUsing: boolean;
  isCollided: boolean;
}

const LeftHandBoxId = 10011;
const RightHandBoxId = 10012;
const HandBoxIdLimit = 10010;
const BombBoxId = 10000;

export class Physics {
  private world: CANNON.World;

  private clock: Clock;

  private oldElapsedTime: any;

  private cannonDebugger: any;

  private scene!: Scene;

  private physicsBoxs: Box[];

  public leftHandBox: CANNON.Body;

  public rightHandBox: CANNON.Body;

  public bombBox: any;

  private bomSound = new Audio('/scene-resource/bomb.mp3');

  constructor() {
    this.clock = new Clock();
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);

    this.world.allowSleep = false;
    this.world.gravity.set(0, -9.82, 0);
    const defaultMaterial = new CANNON.Material('default');
    // friction 表示摩擦力，restitution 为弹性，1 为回弹到原始位置
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 1,
      restitution: 0,
    });
    this.world.addContactMaterial(defaultContactMaterial);

    // 为了防止物体一直下降影响性能，设置底部，以便物体停止运动后处于sleep状态
    // const floorShape = new CANNON.Plane();
    // const floorBody = new CANNON.Body({
    //   mass: 0,
    //   position: new CANNON.Vec3(0, -1, 0),
    //   material: defaultMaterial,
    // });
    // floorBody.addShape(floorShape);
    // this.world.addBody(floorBody);
    // // setFromAxisAngle方法第一个参数是旋转轴，第二个参数是角度，为了能够让地面平过来
    // floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    const hitSound = new Audio('/scene-resource/coin.mp3');
    this.physicsBoxs = [];
    for (let i = 0; i < 10; i++) {
      const box = this.createPhysicsBox({ x: -0.3, y: -1, z: (i - 5) * 0.2 }) as unknown as Box;
      box.isUsing = false;
      box.isCollided = false;
      box.id = i + 1;
      box.addEventListener('collide', (e: any) => {
        if (e.body.id > HandBoxIdLimit) {
          e.target.isCollided = true;
          const impactStrength = e.contact.getImpactVelocityAlongNormal();
          if (impactStrength > 1.5) {
            hitSound.volume = Math.random();
            hitSound.currentTime = 0;
            hitSound.play();
          }
        }
      });
      this.physicsBoxs.push(box);
    }
    this.leftHandBox = this.createPhysicsBox({ x: -0.3, y: -1, z: 1 }, 0.08, 0);
    this.leftHandBox.id = LeftHandBoxId;
    this.leftHandBox.addEventListener('collide', this.handCollided);

    this.rightHandBox = this.createPhysicsBox({ x: -0.3, y: -1, z: 1 }, 0.08, 0);
    this.rightHandBox.id = RightHandBoxId;
    this.rightHandBox.addEventListener('collide', this.handCollided);

    this.bombBox = this.createPhysicsBox({ x: -0.3, y: -1, z: 3 }, 0.08, 2);
    this.bombBox.isUsing = false;
    this.bombBox.isCollided = false;
    this.bombBox.id = BombBoxId;
  }

  handCollided = (e: any) => {
    if (Math.abs(e.body.id - BombBoxId) < Number.EPSILON) {
      this.bomSound.volume = Math.random();
      this.bomSound.currentTime = 0;
      this.bomSound.play();
      this.bombBox.isCollided = true;
    }
  };

  setScene(scene: Scene) {
    this.scene = scene;
    this.cannonDebugger = CannonDebugger(this.scene, this.world, {});
  }

  update({ rightHand, leftHand }: any) {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.oldElapsedTime;
    this.oldElapsedTime = elapsedTime;
    this.world.fixedStep(1 / 60, deltaTime);
    this.physicsBoxs.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.position.x = -0.3;
    });
    // Debug调试物理世界刚体
    this.cannonDebugger.update(); // Update the CannonDebugger meshes
    // 更新手部物理模型
    if (rightHand) {
      this.rightHandBox.position = new CANNON.Vec3(rightHand.x, rightHand.y, rightHand.z);
    }
    if (leftHand) {
      this.leftHandBox.position = new CANNON.Vec3(leftHand.x, leftHand.y, leftHand.z);
    }
  }

  getOnePhysicsBox() {
    const availableList = this.physicsBoxs.filter((el) => !el.isUsing);
    const randomIndex = Math.round(Math.random() * availableList.length);
    const physicsObj = availableList[randomIndex];
    if (physicsObj) {
      physicsObj.isUsing = true;
    }
    return physicsObj;
  }

  // createHandModel() {
  //   if (modelAmi.model) {
  //     const hand = modelAmi.model.getBoneNode('LeftHand');
  //     // console.log(hand?.getWorldPosition(new THREE.Vector3(0, 0, 0)));
  //     return hand?.getWorldPosition(new THREE.Vector3(0, 0, 0));
  //   }
  //   return null;
  // }

  createPhysicsBox(position: Position, r = 0.08, mass = 1) {
    // Sphere参数为球体的半径
    const sphereShape = new CANNON.Box(new CANNON.Vec3(r, r, r));
    const defaultMaterial = new CANNON.Material('default');
    const sphereBody = new CANNON.Body({
      // 刚体的质量mass，质量为0的物体为静止的物体
      // mass: Math.random() * 5,
      mass,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: sphereShape,
      material: defaultMaterial,
    });
    this.world.addBody(sphereBody);

    return sphereBody;
  }
}

export default new Physics();

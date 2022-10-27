/* eslint-disable no-param-reassign */
import * as CANNON from 'cannon-es';
import { Clock, Scene } from 'three';
import CannonDebugger from 'cannon-es-debugger';
import Position from './type';
import StartPhysicsModel from './startPhysicsModel';

export interface Box extends CANNON.Body {
  isUsing: boolean;
  isCollided: boolean;
}

const LeftHandBoxId = 10011;
const RightHandBoxId = 10012;
const HandBoxIdLimit = 10010;
const BombBoxId = 10000;
const PsyduckId = 20000;

const DefaultY = -1; // 物理模型起始y 坐标
const DefaultX = -0.3; // 默认x 轴坐标
const DefaultR = 0.08; // 默认物理半径

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

  public startPhysicsModel!: StartPhysicsModel;

  public isStarting: boolean;

  constructor() {
    this.isStarting = false;
    this.clock = new Clock();
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);

    this.world.allowSleep = false;
    this.world.gravity.set(0, -5, 0);
    const defaultMaterial = new CANNON.Material('default');
    // friction 表示摩擦力，restitution 为弹性，1 为回弹到原始位置
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 1,
      restitution: 0,
    });
    this.world.addContactMaterial(defaultContactMaterial);
    this.physicsBoxs = [];
    this.leftHandBox = this.createPhysicsBox({ x: DefaultX, y: DefaultY, z: 1 }, DefaultR, 0);
    this.leftHandBox.id = LeftHandBoxId;
    this.leftHandBox.addEventListener('collide', this.handCollided);

    this.rightHandBox = this.createPhysicsBox({ x: DefaultX, y: DefaultY, z: 1 }, DefaultR, 0);
    this.rightHandBox.id = RightHandBoxId;
    this.rightHandBox.addEventListener('collide', this.handCollided);

    this.bombBox = this.createPhysicsBox({ x: DefaultX, y: DefaultY, z: 3 }, DefaultR, 2);
    this.bombBox.isUsing = false;
    this.bombBox.isCollided = false;
    this.bombBox.id = BombBoxId;

    this.createDefaultBoxs();
  }

  startGame() {
    this.isStarting = true;
    this.startPhysicsModel.removeBody();
    this.resetDefaultBoxs();
  }

  endGame() {
    this.isStarting = false;
    this.startPhysicsModel.reset();
    this.resetDefaultBoxs(1);
  }

  handCollided = async (e: any) => {
    if (Math.abs(e.body.id - BombBoxId) < Number.EPSILON) {
      this.bomSound.volume = Math.random();
      this.bomSound.currentTime = 0;
      this.bomSound.play();
      this.bombBox.isCollided = true;
    }
    if (Math.abs(e.body.id - PsyduckId) < Number.EPSILON) {
      (window as any).startGame();
    }
  };

  resetDefaultBoxs(x = DefaultX) {
    this.physicsBoxs.forEach((el: Box) => {
      el.position = new CANNON.Vec3(x, -1, (el.id - 5) * 0.2);
      el.velocity.y = 0;
      el.velocity.z = 0;
      el.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), 0);
      el.isUsing = false;
    });
  }

  createDefaultBoxs() {
    const hitSound = new Audio('/scene-resource/coin.mp3');
    for (let i = 0; i < 10; i++) {
      const box = this.createPhysicsBox({ x: 1, y: 0, z: (i - 5) * 0.2 }) as unknown as Box;
      box.isUsing = false;
      box.isCollided = false;
      box.id = i + 1;
      box.addEventListener('collide', (arg: any) => {
        if (arg.body.id > HandBoxIdLimit) {
          // eslint-disable-next-line no-param-reassign
          arg.target.isCollided = true;
          const impactStrength = arg.contact.getImpactVelocityAlongNormal();
          if (impactStrength > 1.5) {
            hitSound.volume = Math.random();
            hitSound.currentTime = 0;
            hitSound.play();
          }
        }
      });
      this.physicsBoxs.push(box);
    }
  }

  setScene(scene: Scene) {
    this.scene = scene;
    if (process.env.DEBUG_MODE) {
      this.cannonDebugger = CannonDebugger(this.scene, this.world, {});
    }
    this.startPhysicsModel = new StartPhysicsModel(this.world, this.scene);
  }

  update({ rightHand, leftHand }: any) {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.oldElapsedTime;
    this.oldElapsedTime = elapsedTime;
    this.world.fixedStep(1 / 60, deltaTime);
    if (this.isStarting) {
      this.physicsBoxs.forEach((el) => {
        // eslint-disable-next-line no-param-reassign
        el.position.x = -0.3;
      });
    }
    if (process.env.DEBUG_MODE) {
      // Debug调试物理世界刚体
      this.cannonDebugger.update(); // Update the CannonDebugger meshes
    }

    // 更新手部物理模型
    if (rightHand) {
      this.rightHandBox.position = new CANNON.Vec3(this.isStarting ? rightHand.x : -0.3, rightHand.y, rightHand.z);
    }
    if (leftHand) {
      this.leftHandBox.position = new CANNON.Vec3(this.isStarting ? leftHand.x : -0.3, leftHand.y, leftHand.z);
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

  createPhysicsBox(position: Position, r = DefaultR, mass = 1) {
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

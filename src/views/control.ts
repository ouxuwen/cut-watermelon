import { Scene } from 'three';
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import * as CANNON from 'cannon-es';
import physics from './physics';
import fruitModel, { getCoinModel } from './Model';

export function fruitBindPhysics(fruit: any, physicsObj: any) {
  if (physics && fruit) {
    fruit.position.copy(physicsObj.position);
    fruit.quaternion.copy(physicsObj.quaternion);
  }
}

export function range(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

export class Control {
  fruitList: any[];

  scene!: Scene;

  isRunning: boolean;

  coinModel!: { coin: any; text: any };

  coinList: { coin: any; text: any }[];

  constructor() {
    this.fruitList = [];
    this.coinList = [];
    this.isRunning = false;
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    for (let i = 0; i < range(2, 5); i++) {
      this.createRandomFruit();
    }
    const position = { x: 0, y: 0, z: 0 };
    const { coinMesh, textMesh } = await getCoinModel(position);
    this.coinModel = { coin: coinMesh, text: textMesh };
  }

  createRandomFruit() {
    const physicsObj = physics.getOnePhysicsBox();

    if (physicsObj) {
      const fruit = fruitModel.getFruitModel();
      const absZ = Math.abs(physicsObj.id - 5);
      let z = 0;
      if (physicsObj.id - 5 > 0) {
        z = -range(2 - absZ * 0.2, 2.2 - absZ * 0.2);
      } else {
        z = range(2 - absZ * 0.2, 2.2 - absZ * 0.2);
      }

      physicsObj.velocity.y = range(5, 5.5);
      physicsObj.velocity.z = z;

      this.fruitList.push({
        fruit,
        physicsObj,
      });
    }
  }

  restart() {
    this.fruitList.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.physicsObj.position = new CANNON.Vec3(-0.3, -1, (el.physicsObj.id - 5) * 0.2);
      el.physicsObj.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), 0);
    });
    this.fruitList.forEach((el) => {
      const absZ = Math.abs(el.physicsObj.id - 5);
      let z = 0;
      if (el.physicsObj.id - 5 > 0) {
        z = -range(2 - absZ * 0.2, 2.2 - absZ * 0.2);
      } else {
        z = range(2 - absZ * 0.2, 2.2 - absZ * 0.2);
      }

      el.physicsObj.velocity.y = range(5, 5.5);
      el.physicsObj.velocity.z = z;
    });
  }

  update() {
    if (!this.isRunning) return;
    this.fruitList = this.fruitList.filter((el) => {
      fruitBindPhysics(el.fruit, el.physicsObj);
      if (el.physicsObj.isCollided) {
        this.reset(el);
        const tempCoinMesh = {
          coin: this.coinModel.coin.clone(),
          text: this.coinModel.text.clone(),
        };

        tempCoinMesh.coin.position.set(
          el.fruit.position.x,
          el.fruit.position.y,
          el.fruit.position.z,
        );
        this.scene.add(tempCoinMesh.coin);

        tempCoinMesh.text.position.set(
          el.fruit.position.x,
          el.fruit.position.y + 0.035,
          el.fruit.position.z - 0.035,
        );
        this.scene.add(tempCoinMesh.text);
        this.coinList.push(tempCoinMesh);
        el.physicsObj.isCollided = false;
      }
      if (el.fruit.position.y <= -1) {
        this.reset(el);
        return false;
      }
      return true;
    });

    if (this.fruitList.length < 4) {
      for (let i = 0; i < range(1, 4); i++) {
        this.createRandomFruit();
      }
    }

    if (this.coinList.length > 0) {
      this.coinList.forEach((coinMesh) => {
        coinMesh.coin.position.y += 0.01;
        coinMesh.text.position.y += 0.01;
        if (coinMesh.coin.position.y > 5) {
          this.scene.remove(coinMesh.coin);
          this.scene.remove(coinMesh.text);
        }
      });
    }
  }

  reset(el: { fruit: any; physicsObj: any }) {
    this.scene.remove(el.fruit);
    el.physicsObj.position = new CANNON.Vec3(-0.3, -1, (el.physicsObj.id - 5) * 0.2);
    el.physicsObj.velocity.y = 0;
    el.physicsObj.velocity.z = 0;
    el.physicsObj.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), 0);
    el.physicsObj.isUsing = false;
  }
}

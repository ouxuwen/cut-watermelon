import { Scene } from 'three';
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import * as CANNON from 'cannon-es';
import physics from './physics';
import fruitModel, { getCoinModel, createBomb } from './Model';

export function meshBindPhysics(fruit: any, physicsObj: any) {
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

  coinSum: number = 0;

  bomb: any;

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
    for (let i = 0; i < range(1, 3); i++) {
      this.createRandomFruit();
    }
    const position = { x: 0, y: 0, z: 0 };
    const { coinMesh, textMesh } = await getCoinModel(position);
    this.coinModel = { coin: coinMesh, text: textMesh };
    this.bomb = await createBomb();
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

  updateBomb() {
    if (physics.bombBox.position.y < -1) {
      this.reset({ fruit: this.bomb, physicsObj: physics.bombBox });
    }

    if (this.coinSum > 0 && !physics.bombBox.isUsing) {
      physics.bombBox.isUsing = true;
      this.scene.add(this.bomb);
      const positionZ = range(-0.5, 0.5);
      physics.bombBox.position.z = positionZ;
      const z = range(2 - positionZ, 2.2 - positionZ);

      physics.bombBox.velocity.y = range(5, 5.5);
      physics.bombBox.velocity.z = positionZ > 0 ? -z : z;
    }
    if (physics.bombBox.isCollided) {
      this.coinSum -= 50;
      physics.bombBox.isCollided = false;
      this.reset({ fruit: this.bomb, physicsObj: physics.bombBox });
    }
  }

  createCoin = (el: any) => {
    if (!this.coinModel) return;
    const tempCoinMesh = {
      coin: this.coinModel.coin.clone(),
      text: this.coinModel.text.clone(),
    };

    tempCoinMesh.coin.position.set(el.fruit.position.x, el.fruit.position.y, el.fruit.position.z);
    this.scene.add(tempCoinMesh.coin);

    tempCoinMesh.text.position.set(
      el.fruit.position.x,
      el.fruit.position.y + 0.035,
      el.fruit.position.z - 0.035,
    );
    this.scene.add(tempCoinMesh.text);
    this.coinList.push(tempCoinMesh);
  };

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
      meshBindPhysics(el.fruit, el.physicsObj);
      if (el.physicsObj.isCollided) {
        this.reset(el);
        el.physicsObj.isCollided = false;
        this.createCoin(el);
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
    // 金币处理
    if (this.coinList.length > 0) {
      this.coinList.forEach((coinMesh) => {
        coinMesh.coin.position.y += 0.01;
        coinMesh.text.position.y += 0.01;
        if (coinMesh.coin.position.y > 2) {
          this.coinSum += 10;
          this.scene.remove(coinMesh.coin);
          this.scene.remove(coinMesh.text);
        }
      });
    }
    // 炸弹
    this.updateBomb();
    physics.bombBox.position.x = -0.3;
    meshBindPhysics(this.bomb, physics.bombBox);
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

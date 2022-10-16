import { Scene } from 'three';
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import * as CANNON from 'cannon-es';
import physics from './physics';
import fruitModel, { getCoinModel, createBomb } from './Model';
import renderText from './text';

export function meshBindPhysics(fruit: any, physicsObj: any) {
  if (physics && fruit) {
    fruit.position.copy(physicsObj.position);
    fruit.quaternion.copy(physicsObj.quaternion);
  }
}

export function range(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

const DEFAULT_COUNT = 30;
const bgmSound = new Audio('/scene-resource/bgm.mp3');

export class Control {
  fruitList: any[];

  scene!: Scene;

  isRunning: boolean;

  coinModel!: { coin: any; text: any };

  coinList: { coin: any; text: any }[];

  coinSum: number = 0;

  bomb: any;

  countDown: number;

  countDownTimer: NodeJS.Timer | null;

  countDownChangeCb!: (num: number) => void;

  scoreChangCb!: (num: number) => void;

  gameStatusCbList: any[];

  constructor() {
    this.countDown = DEFAULT_COUNT;
    this.countDownTimer = null;
    this.fruitList = [];
    this.coinList = [];
    this.gameStatusCbList = [];
    this.isRunning = false;
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  startCountDown() {
    this.countDownTimer = setInterval(() => {
      this.countDown--;

      if (this.countDownChangeCb) {
        this.countDownChangeCb(this.countDown);
      }
      if (this.countDown <= 0) {
        clearInterval(this.countDownTimer as NodeJS.Timer);
        this.countDownTimer = null;
        this.endGame();
      }
    }, 1000);
  }

  onCountDownChange(cb: (num: number) => void) {
    this.countDownChangeCb = cb;
  }

  onScoreChange(cb: (num: number) => void) {
    this.scoreChangCb = cb;
  }

  endGame() {
    this.isRunning = false;
    bgmSound.pause();
    this.fruitList.forEach((el) => {
      this.reset(el);
    });
    this.fruitList = [];
    this.coinList.forEach((coinMesh) => {
      this.scene.remove(coinMesh.coin);
      this.scene.remove(coinMesh.text);
    });
    this.scene.remove(this.bomb);
    this.coinList = [];

    this.gameStatusCbList.forEach((el) => {
      el(false);
    });
    this.countDown = DEFAULT_COUNT;
  }

  onGameStatusChange(cb: (bool: boolean) => void) {
    this.gameStatusCbList.push(cb);
  }

  async startGame() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.coinSum = 0;
    bgmSound.volume = 0.3;
    bgmSound.currentTime = 0.15;
    bgmSound.play();
    this.startCountDown();
    for (let i = 0; i < range(1, 3); i++) {
      this.createRandomFruit();
    }
    const position = { x: 0, y: 0, z: 0 };
    const { coinMesh, textMesh } = await getCoinModel(position);
    this.coinModel = { coin: coinMesh, text: textMesh };
    this.bomb = await createBomb();

    this.gameStatusCbList.forEach((el) => {
      el(true);
    });
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

      physicsObj.velocity.y = 4;
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

    if (!physics.bombBox.isUsing) {
      physics.bombBox.isUsing = true;
      this.scene.add(this.bomb);
      const positionZ = range(-0.5, 0.5);
      physics.bombBox.position.z = positionZ;
      const z = range(2 - positionZ, 2.2 - positionZ);

      physics.bombBox.velocity.y = 4;
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

      el.physicsObj.velocity.y = 4;
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
        this.coinSum += 10;
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
      this.coinList = this.coinList.filter((coinMesh) => {
        coinMesh.coin.position.y += 0.01;
        coinMesh.text.position.y += 0.01;
        if (coinMesh.coin.position.y > 1) {
          this.scene.remove(coinMesh.coin);
          this.scene.remove(coinMesh.text);
          return false;
        }
        return true;
      });
    }
    // 炸弹
    this.updateBomb();

    renderText(this.scene, `Score: ${this.coinSum}`);
    if (this.scoreChangCb) {
      this.scoreChangCb(this.coinSum);
    }
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

export default new Control();

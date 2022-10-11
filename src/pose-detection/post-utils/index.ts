import {
  Pose,
  POSE_CONNECTIONS,
} from '@mediapipe/pose';

import {
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
  Holistic,
} from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import * as THREE from 'three';

import modelAnimate from './model-animate';
import VrmModelWrap from './models/vrm-model-wrap';
import { VrmList } from './models/vrm-list';

export interface HolisticUtilsOptions {
  canvasEle: HTMLCanvasElement;
  videoEle: HTMLVideoElement;
}
const vrmList = new VrmList();
const vrmModelWrap = new VrmModelWrap();
export class HolisticUtils {
  private holistic!: Holistic;

  private pose!: Pose;

  private detector: Pose | Holistic;

  private videoEle!: HTMLVideoElement;

  private canvasEle!: HTMLCanvasElement;

  private scene!: THREE.Scene;

  private clock!: THREE.Clock;

  private isStart: boolean;

  public currentModelWrap: any;

  public isPlaying: boolean;

  constructor() {
    this.isStart = false;
    this.isPlaying = false;
    // 初始化肢体检测模型
    this.initPoseDetetor();
    // 初始化全身检测模型
    this.initHolisticDetetor();

    this.detector = this.holistic;

    // Main Render Loop
    this.clock = new THREE.Clock();
  }

  init({ canvasEle, videoEle }: HolisticUtilsOptions) {
    this.videoEle = videoEle;
    this.canvasEle = canvasEle;

    // 初始化三维动画元素；
    modelAnimate.setVideoEle(this.videoEle);

    // 创建Three
    // this.createThreeSence();
  }

  async setScene(scene: THREE.Scene) {
    this.scene = scene;
    // 加载三维人物

    await vrmList.loadAllModel();
    const currenModel = vrmList.getCurrentModel();
    if (currenModel.model) {
      this.currentModelWrap = vrmModelWrap;
      vrmModelWrap.setModel(currenModel.model);
      // 加载三维人物到场景
      this.scene.add(currenModel.model.scene);
      modelAnimate.setModel(vrmModelWrap);
    }
  }

  initPoseDetetor() {
    this.pose = new Pose({
      locateFile: (file: string) => `/pose/${file}`,
      // return  `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/${file}`;
    });
    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
    // 通过整体回调函数
    this.pose.onResults(this.onResults.bind(this));
  }

  initHolisticDetetor() {
    this.holistic = new Holistic({
      locateFile: (file: string) => `/holistic/${file}`,
      //  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
    });
    this.holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      refineFaceLandmarks: true,
    });
    // 通过整体回调函数
    this.holistic.onResults(this.onResults.bind(this));
  }

  async changeToPoseDetetor() {
    this.detector = null as any;
    await this.pose.initialize();
    this.detector = this.pose;
  }

  async changeToHolisticDetetor() {
    this.detector = null as any;
    await this.pose.initialize();
    this.detector = this.holistic;
  }

  // 切换人物
  changeModel(next = true) {
    const currenModel = vrmList.changeModel(next);
    this.scene.remove(this.currentModelWrap.model.scene);
    if (currenModel.model) {
      vrmModelWrap.setModel(currenModel.model);

      // 加载三维人物到场景
      this.scene.add(currenModel.model.scene);
    }
  }

  async start() {
    if (this.isStart) return;
    this.isStart = true;
    //  使用 `Mediapipe` 工具来获取相机 -较低的分辨率 = 较高的 fps
    const camera = new Camera(this.videoEle, {
      onFrame: async () => {
        await this.pose.send({ image: this.videoEle });
      },
      width: 640,
      height: 480,
    });
    await camera.start();
  }

  startCamera() {
    if (this.isStart) return;
    this.isStart = true;
    const constraints = {
      audio: false,
      video: { width: 320, height: 240 },
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream) => {
        this.videoEle.srcObject = mediaStream;
        this.videoEle.onloadedmetadata = async () => {
          await this.detector.initialize();
          this.isPlaying = true;
          this.videoEle.play();
        };
      })
      .catch((err) => {
        // always check for errors at the end.
        console.error(`${err.name}: ${err.message}`);
      });
  }

  sendData() {
    if (this.isPlaying && this.detector) {
      this.detector.send({ image: this.videoEle });
    }
  }

  // createThreeSence() {
  //   // renderer
  //   const renderer = new THREE.WebGLRenderer({ alpha: true });
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  //   renderer.setPixelRatio(window.devicePixelRatio);
  //   document.body.appendChild(renderer.domElement);

  //   // camera
  //   const orbitCamera = new THREE.PerspectiveCamera(
  //     35,
  //     window.innerWidth / window.innerHeight,
  //     0.1,
  //     1000,
  //   );
  //   orbitCamera.position.set(0.0, 1.4, 5);

  //   // controls
  //   const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
  //   orbitControls.screenSpacePanning = true;
  //   orbitControls.target.set(0.0, 1.4, 0.0);
  //   orbitControls.update();

  //   // scene
  //   this.scene = new THREE.Scene();

  //   // light
  //   const light = new THREE.DirectionalLight(0xffffff);
  //   light.position.set(1.0, 1.0, 1.0).normalize();
  //   this.scene.add(light);

  //   const animate = () => {
  //     requestAnimationFrame(animate);

  //     if (modelAnimate.model) {
  //       // 更新模型
  //       modelAnimate.model.update(this.clock.getDelta());
  //     }
  //     renderer.render(this.scene, orbitCamera);
  //   };
  //   animate();
  // }

  renderModel() {
    if (modelAnimate.model) {
      // 更新模型
      modelAnimate.model.update(this.clock.getDelta());
    }
  }

  onResults(results: any) {
    // console.log(this.isPlaying);
    // 绘制识别结果
    this.drawResults(results);

    // 开始动画
    modelAnimate.run(results);
  }

  drawResults(results: any) {
    this.canvasEle.width = this.videoEle.clientWidth;
    this.canvasEle.height = this.videoEle.clientHeight;
    const canvasCtx = this.canvasEle.getContext('2d') as CanvasRenderingContext2D;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, this.canvasEle.width, this.canvasEle.height);
    // 使用 `Mediapipe` 绘图功能
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00cff7',
      lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: '#ff0364',
      lineWidth: 2,
    });
    if (results.faceLandmarks && results.faceLandmarks.length === 478) {
      //  画地标
      drawLandmarks(canvasCtx, [results.faceLandmarks[468], results.faceLandmarks[468 + 5]], {
        color: '#ffe603',
        lineWidth: 2,
      });
    }

    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      color: '#00cff7',
      lineWidth: 2,
    });

    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      color: '#ff0364',
      lineWidth: 2,
    });

    /* * 以下是全量检测才会有 * */
    if (this.detector instanceof Holistic) {
      drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
        color: '#C0C0C070',
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: '#eb1064',
        lineWidth: 5,
      });
      drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: '#22c3e3',
        lineWidth: 5,
      });
    }
  }
}

export default new HolisticUtils();

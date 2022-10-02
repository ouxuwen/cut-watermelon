import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import modelAnimate from './model-animate';
import VrmModel from './models/vrm-model';

export interface HolisticUtilsOptions {
  canvasEle: HTMLCanvasElement;
  videoEle: HTMLVideoElement
}

export class HolisticUtils {
  private holistic;

  private videoEle!: HTMLVideoElement;

  private canvasEle!: HTMLCanvasElement;

  private scene!: THREE.Scene;

  constructor() {
    this.holistic = new Holistic({
      locateFile: (file: string) => `/holistic/${file}`
      //  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
      ,
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

  init({ canvasEle, videoEle }: HolisticUtilsOptions) {
    this.videoEle = videoEle;
    this.canvasEle = canvasEle;

    // 初始化三维动画元素；
    modelAnimate.setVideoEle(this.videoEle);

    // 创建Three
    this.createThreeSence();

    // 加载三维人物
    const vrmModel = new VrmModel();
    vrmModel.loadModel(this.scene, () => {
      modelAnimate.setModel(vrmModel);
    });
  }

  start() {
    //  使用 `Mediapipe` 工具来获取相机 -较低的分辨率 = 较高的 fps
    const camera = new Camera(this.videoEle, {
      onFrame: async () => {
        await this.holistic.send({ image: this.videoEle });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }

  createThreeSence() {
    // renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // camera
    const orbitCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    orbitCamera.position.set(0.0, 1.4, 0.7);

    // controls
    const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.screenSpacePanning = true;
    orbitControls.target.set(0.0, 1.4, 0.0);
    orbitControls.update();

    // scene
    this.scene = new THREE.Scene();

    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(light);

    // Main Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      if (modelAnimate.model) {
        // 更新模型
        modelAnimate.model.update(clock.getDelta());
      }
      renderer.render(this.scene, orbitCamera);
    };
    animate();
  }

  onResults(results: any) {
    // 绘制识别结果
    this.drawResults(results);

    // 开始动画
    modelAnimate.run(results);
  }

  drawResults(results: any) {
    this.canvasEle.width = this.videoEle.videoWidth;
    this.canvasEle.height = this.videoEle.videoHeight;
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
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
      color: '#C0C0C070',
      lineWidth: 1,
    });
    if (results.faceLandmarks && results.faceLandmarks.length === 478) {
      //  画地标
      drawLandmarks(canvasCtx, [results.faceLandmarks[468], results.faceLandmarks[468 + 5]], {
        color: '#ffe603',
        lineWidth: 2,
      });
    }
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: '#eb1064',
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      color: '#00cff7',
      lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: '#22c3e3',
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      color: '#ff0364',
      lineWidth: 2,
    });
  }
}

export default new HolisticUtils();

import * as THREE from 'three';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import * as dat from 'dat.gui';
// import fontsStyle from 'three/examples/fonts/gentilis_bold.typeface.json';
import holisticUtils from '../pose-detection/post-utils';
import control from './control';
import physics from './physics';
import fruitModel from './Model';

let isCreate = false;

// const rightHand = createPhysicsBox({ x: 0, y: 0, z: 0 });
export default async function createScene() {
  if (isCreate) return;
  isCreate = true;
  console.log('createScene');
  // ----------------1.创建场景----------------
  const scene = new THREE.Scene();
  holisticUtils.setScene(scene);
  physics.setScene(scene);
  fruitModel.setScene(scene);
  control.setScene(scene);

  // 加载hdr环境贴图
  // const rgbeLoader = new RGBELoader();
  // rgbeLoader.loadAsync('/scene-resource/050.hdr').then((texture: THREE.DataTexture) => {
  //   // eslint-disable-next-line no-param-reassign
  //   texture.mapping = THREE.EquirectangularReflectionMapping;
  //   scene.background = texture;
  // });

  // 图片纹理
  const sceneTexture = new THREE.TextureLoader().load('/scene-resource/scene.jpeg');
  scene.background = sceneTexture;

  // 视频纹理
  // const video = document.createElement('video');
  // video.src = '/scene-resource/back-movie.mp4';
  // video.loop = true;

  // ----------------2.初始化物品----------------
  await fruitModel.initFruitModels();

  (window as any).changeModel = holisticUtils.changeModel.bind(holisticUtils);
  (window as any).changeToHolisticDetetor = holisticUtils.changeToHolisticDetetor.bind(holisticUtils);
  (window as any).changeToPoseDetetor = holisticUtils.changeToPoseDetetor.bind(holisticUtils);

  (window as any).startGame = async () => {
    console.log('游戏开始');
    await holisticUtils.startGame();
    physics.startGame();
    control.startGame();
  };

  control.onEndGame(async () => {
    await holisticUtils.endGame();
    physics.endGame();
  });

  // ----------------3.设置相机----------------
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(-3, 0, 0);
  scene.add(camera);

  // ----------------4.设置灯光----------------
  // 环境光
  const light = new THREE.AmbientLight(0xeeeeee);
  scene.add(light);

  // ----------------5.初始化渲染器----------------
  const renderer = new THREE.WebGLRenderer({
    // 抗锯齿
    antialias: true,
  });
  // 设置渲染的尺寸大小
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.localClippingEnabled = true;
  // 创建轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  // 为控制器设置阻尼，让控制器有真实的效果
  controls.enableDamping = true;

  // ----------------7.渲染----------------

  const render = () => {
    // 更新控制器
    controls.update();
    // 更新物体运动

    // 渲染场景及摄像机
    renderer.render(scene, camera);
    // 定时更新
    requestAnimationFrame(render);

    // 更新人物
    holisticUtils.sendData();
    holisticUtils.renderModel();

    const { currentModelWrap } = holisticUtils;
    let leftHandPosition;
    let rightHandPosition;
    if (currentModelWrap) {
      leftHandPosition = currentModelWrap
        .getBoneNode('LeftHand')
        ?.getWorldPosition(new THREE.Vector3(0, 0, 0));
      rightHandPosition = currentModelWrap
        .getBoneNode('RightHand')
        ?.getWorldPosition(new THREE.Vector3(0, 0, 0));
    }

    // 更新物理引擎
    physics.update({ leftHand: leftHandPosition, rightHand: rightHandPosition });

    // 更新水果
    control.update();
  };

  render();

  // ----------------8.添加dom元素处理页面变化----------------
  // 将webgl渲染的canvas内容添加到页面上
  const app = document.getElementById('three_canvas');
  app?.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    // 更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新摄像机的投影矩阵
    camera.updateProjectionMatrix();
    // 更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 设置渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  // ----------------调试专用----------------
  // 添加坐标轴辅助器
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

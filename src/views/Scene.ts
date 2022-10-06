import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import holisticUtils from '../pose-detection/post-utils';

import getPhysicsModels from './Model';

const N = 128; // 控制音频分析器返回频率数据数量
let analyser: THREE.AudioAnalyser; // 声明一个分析器变量
let audio: THREE.Audio;

// const video = document.createElement('video');

function initMusic(musicPath: string) {
  const listener = new THREE.AudioListener(); // 监听者
  audio = new THREE.Audio(listener); // 非位置音频对象
  const audioLoader = new THREE.AudioLoader(); // 音频加载器
  // 加载音频文件
  audioLoader.load(
    musicPath,
    (AudioBuffer) => {
      audio.setBuffer(AudioBuffer); // 音频缓冲区对象关联到音频对象audio
      audio.setLoop(true); // 是否循环
      audio.setVolume(0.5); // 音量
      // audio.play(); //播放
      // 音频分析器和音频绑定，可以实时采集音频时域数据进行快速傅里叶变换
      analyser = new THREE.AudioAnalyser(audio, 2 * N);
    },
    () => {},
    (e) => {
      console.log('加载音频出现异常:', e);
    },
  );
}

export function startGame() {
  console.log('游戏开始');
  // 播放音乐
  if (audio) {
    if (!audio.isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}

export default async function createScene() {
  // ----------------1.创建场景----------------
  const scene = new THREE.Scene();
  holisticUtils.setSence(scene);

  // 加载hdr环境贴图
  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync('/scene-resource/050.hdr').then((texture: THREE.DataTexture) => {
    // eslint-disable-next-line no-param-reassign
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
  });
  // ----------------2.初始化背景音乐----------------
  initMusic('/scene-resource/calorie.mp3');

  // ----------------2.初始化物品----------------
  const { meshes, physicsBoxes } = await getPhysicsModels();
  meshes.forEach((mesh) => {
    if (mesh) scene.add(mesh);
  });

  // ----------------3.设置相机----------------
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(-10, 15, 3);
  scene.add(camera);

  // ----------------4.设置灯光----------------
  // 环境光
  const light = new THREE.AmbientLight(0xa0a0a0);
  scene.add(light);
  // 直线光
  const lineLight = new THREE.DirectionalLight(0xffffff);
  lineLight.position.set(-100, 10, 5);
  scene.add(lineLight);

  // ----------------5.初始化渲染器----------------
  const renderer = new THREE.WebGLRenderer({
    // 抗锯齿
    antialias: true,
  });
  // 设置渲染的尺寸大小
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  // 创建轨道控制器
  // OrbitControls( object : Camera, domElement : HTMLDOMElement )
  // object: （必须）将要被控制的相机。该相机不允许是其他任何对象的子级，除非该对象是场景自身。
  // domElement: 用于事件监听的HTML元素。
  const controls = new OrbitControls(camera, renderer.domElement);
  // 为控制器设置阻尼，让控制器有真实的效果
  controls.enableDamping = true;

  // ----------------6.创建物理世界----------------
  const world = new CANNON.World();
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  world.gravity.set(0, -9.82, 0);
  const defaultMaterial = new CANNON.Material('default');
  // friction 表示摩擦力，restitution 为弹性，1 为回弹到原始位置
  const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 1,
    restitution: 0,
  });
  world.addContactMaterial(defaultContactMaterial);
  physicsBoxes.forEach((element: CANNON.Body) => {
    world.addBody(element);
  });

  // 为了防止物体一直下降影响性能，设置底部，以便物体停止运动后处于sleep状态
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: defaultMaterial,
  });
  floorBody.addShape(floorShape);
  world.addBody(floorBody);
  // setFromAxisAngle方法第一个参数是旋转轴，第二个参数是角度，为了能够让地面平过来
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

  // ----------------7.渲染----------------
  const clock = new THREE.Clock();
  let oldElapsedTime = 0;
  const updateMotion = () => {
    if (analyser) {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;
      world.fixedStep(1 / 60, deltaTime);
      const arr = analyser.getFrequencyData();
      // console.log('arr[1]', arr[1]);
      for (let i = 0; i < meshes.length; i++) {
        if (meshes[i]) {
          if (meshes[i].position.y <= 2 && arr[i] > 0) {
            physicsBoxes[i].applyForce(
              new CANNON.Vec3(0, arr[i] / 50, 0),
              physicsBoxes[i].position,
            );
          }
          meshes[i].position.copy(physicsBoxes[i].position);
          meshes[i].quaternion.copy(physicsBoxes[i].quaternion);
        }
      }
    }
  };

  const render = () => {
    // 更新控制器
    controls.update();
    // 更新物体运动
    updateMotion();
    // 渲染场景及摄像机
    renderer.render(scene, camera);
    // 定时更新
    requestAnimationFrame(render);

    // 更新人物
    holisticUtils.renderModel();
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

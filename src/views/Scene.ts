import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import getPhysicsModels from './Model';

export default async function createScene() {
  // ----------------1.创建场景----------------
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 600, 3000); // 雾化场景
  // scene.background = new THREE.Color(0xf65144);
  // 加载hdr环境贴图
  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync('/scene-resource/rgbe3.hdr').then((texture: THREE.DataTexture) => {
    // eslint-disable-next-line no-param-reassign
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
  });
  // ----------------2.初始化物品----------------
  const { meshes, physicsBoxes } = await getPhysicsModels();
  meshes.forEach((mesh) => {
    if (mesh) scene.add(mesh);
  });

  // ----------------3.设置相机----------------
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 50);
  scene.add(camera);

  // ----------------4.设置灯光----------------
  // 环境光
  const light = new THREE.AmbientLight(0xa0a0a0);
  scene.add(light);
  // 直线光
  const lineLight = new THREE.DirectionalLight(0xffffff);
  lineLight.position.set(10, 10, 10);
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
    friction: 0.1,
    restitution: 0.7,
  });
  world.addContactMaterial(defaultContactMaterial);
  physicsBoxes.forEach((element: CANNON.Body) => {
    world.addBody(element);
  });

  // 为了防止物体一直下降影响性能，设置底部，以便物体停止运动后处于sleep状态
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -10, 0),
    material: defaultMaterial,
  });
  floorBody.addShape(floorShape);
  world.addBody(floorBody);
  // setFromAxisAngle方法第一个参数是旋转轴，第二个参数是角度，为了能够让地面平过来
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  const clock = new THREE.Clock();
  let oldElapsedTime = 0;

  const updateMotion = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;
    world.fixedStep(1 / 60, deltaTime);
    for (let i = 0; i < meshes.length; i++) {
      if (meshes[i]) {
        // meshes[i].position.copy(physicsBoxes[i].position);
      }
    }
  };

  // ----------------7.渲染----------------
  const render = () => {
    // 更新控制器
    controls.update();
    // 更新物体运动
    updateMotion();
    // 渲染场景及摄像机
    renderer.render(scene, camera);
    // 定时更新
    requestAnimationFrame(render);
  };

  render();

  // ----------------8.添加dom元素处理页面变化----------------
  // 将webgl渲染的canvas内容添加到页面上
  const app = document.getElementById('App');
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

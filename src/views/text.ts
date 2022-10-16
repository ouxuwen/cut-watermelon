import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

const loader = new FontLoader();
let currentText: any;
let currentFont: any;
loader.load('/scene-resource/fonts/gentilis_bold.typeface.json', (font: any) => {
  currentFont = font;
});
const textTexture = new THREE.TextureLoader().load('/scene-resource/metal.jpeg');
const txtMater = new THREE.MeshBasicMaterial({ map: textTexture });
export default function renderText(scene: THREE.Scene, message: string) {
  if (currentText) {
    scene.remove(currentText);
  }

  if (currentFont) {
    const geometry = new TextGeometry(message, {
      font: currentFont /* 字体 */,
      size: 0.8 /* 字体大小 */,
      height: 0.1 /* 文本厚度 */,
      curveSegments: 4 /* 曲线点数 (5降低优化性能) */,
      bevelEnabled: true /* 是否开启斜角 */,
      bevelThickness: -0.001 /* 斜角深度 */,
      bevelSize: 0.02 /* 斜角与原始文本轮廓之间的延伸距离 */,
      bevelSegments: 1 /* 斜角的分段数 (3降低优化性能) */,
      bevelOffset: 0 /* 斜角偏移 */,
    });

    currentText = new THREE.Mesh(geometry, txtMater);
    currentText.position.set(0, 1.1, -0.23);
    currentText.scale.set(0.15, 0.15, 0.15);
    currentText.rotation.y = -Math.PI * 0.5;

    scene.add(currentText);
  }
}

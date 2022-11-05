import * as THREE from 'three';

const N = 128; // 控制音频分析器返回频率数据数量

export default function init(musicPath: string) {
  const listener = new THREE.AudioListener(); // 监听者
  const audio = new THREE.Audio(listener); // 非位置音频对象
  const audioLoader = new THREE.AudioLoader(); // 音频加载器
  let analyser: THREE.AudioAnalyser | undefined; // 声明一个分析器变量
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
  return { audio, analyser };
}

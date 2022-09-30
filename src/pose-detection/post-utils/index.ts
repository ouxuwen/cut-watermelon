import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';

export interface HolisticUtilsOptions {
  canvasEle: HTMLCanvasElement;
  videoEle: HTMLVideoElement
}

export class HolisticUtils {
  private holistic;

  private videoEle;

  private canvasEle;

  constructor({ canvasEle, videoEle }: HolisticUtilsOptions) {
    this.videoEle = videoEle;
    this.canvasEle = canvasEle;
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
    this.holistic.onResults(this.onResults);

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

  onResults(results: any) {
    // 绘制识别结果
    this.drawResults(results);
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

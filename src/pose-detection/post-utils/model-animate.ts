/* eslint-disable no-param-reassign */
import * as Kalidokit from 'kalidokit';
import * as THREE from 'three';
import { VRMExpressionPresetName, VRMHumanBoneName } from '@pixiv/three-vrm';
import { BaseModel } from './models/base-model';

// const { remap } = Kalidokit.Utils;
const { clamp } = Kalidokit.Utils;
const { lerp } = Kalidokit.Vector;

class ModelAnimate {
  private videoElement!: HTMLVideoElement;

  public model!: BaseModel;

  setModel(model: BaseModel) {
    this.model = model;
  }

  setVideoEle(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  // 位置动作
  rigPosition(name: keyof typeof VRMHumanBoneName, position = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) {
    if (!this.model) {
      return;
    }
    const Part = this.model.getBoneNode(name);
    if (!Part) {
      return;
    }

    const vector = new THREE.Vector3(position.x * dampener, position.y * dampener, position.z * dampener);
    Part.position.lerp(vector, lerpAmount); // interpolate
  }

  // 肢体旋转
  rigRotation(name: keyof typeof VRMHumanBoneName, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) {
    if (!this.model) {
      return;
    }

    const Part = this.model.getBoneNode(name);

    if (!Part) {
      return;
    }
    const euler = new THREE.Euler(rotation.x * dampener, rotation.y * dampener, rotation.z * dampener);
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
  }

  rigFace(riggedFace: Kalidokit.TFace) {
    if (!this.model) {
      return;
    }
    const oldLookTarget = new THREE.Euler();
    const rigRotation = this.rigRotation.bind(this);
    rigRotation('Neck', riggedFace.head, 0.7);

    // 混合动作 预设名
    const setValue = this.model.setPresetValue;
    const getValue = this.model.getPresetValue;
    const PresetName = VRMExpressionPresetName;

    // 没有眨眼的简单示例。根据旧的混合形状插值，然后使用“Kalidokit”辅助功能稳定闪烁。
    // 对于VRM，1关闭，0打开。
    riggedFace.eye.l = lerp(clamp(1 - riggedFace.eye.l, 0, 1), getValue(PresetName.Blink), 0.5);
    riggedFace.eye.r = lerp(clamp(1 - riggedFace.eye.r, 0, 1), getValue(PresetName.Blink), 0.5);
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(riggedFace.eye, riggedFace.head.y);
    setValue(PresetName.Blink, riggedFace.eye.l);

    // 嘴巴的开合
    setValue(PresetName.Ih, lerp(riggedFace.mouth.shape.I, getValue(PresetName.Ih), 0.5));
    setValue(PresetName.Aa, lerp(riggedFace.mouth.shape.A, getValue(PresetName.Aa), 0.5));
    setValue(PresetName.Ee, lerp(riggedFace.mouth.shape.E, getValue(PresetName.Ee), 0.5));
    setValue(PresetName.Oh, lerp(riggedFace.mouth.shape.O, getValue(PresetName.Oh), 0.5));
    setValue(PresetName.Ou, lerp(riggedFace.mouth.shape.U, getValue(PresetName.Ou), 0.5));

    // PUPILS
    // 瞳孔视觉追随
    const lookTarget = new THREE.Euler(
      lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
      lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
      0,
      'XYZ',
    );
    oldLookTarget.copy(lookTarget);
    this.model.lookAt(lookTarget);
  }

  run(results: any) {
    if (!this.model) {
      return;
    }
    // 从“整体”中获取结果，并基于角色的“面”、“姿势”和“手关键点”设置角色动画。
    let riggedPose!: Kalidokit.TPose;
    let riggedLeftHand!: Kalidokit.THand<Kalidokit.Side>;
    let riggedRightHand!: Kalidokit.THand<Kalidokit.Side>;
    let riggedFace!: Kalidokit.TFace;
    const rigRotation = this.rigRotation.bind(this);
    const rigPosition = this.rigPosition.bind(this);
    const { faceLandmarks } = results;
    // Pose 3D Landmarks are with respect to Hip distance in meters
    const pose3DLandmarks = results.ea;
    // Pose 2D landmarks are with respect to videoWidth and videoHeight
    const pose2DLandmarks = results.poseLandmarks;
    // Be careful, hand landmarks may be reversed
    const leftHandLandmarks = results.rightHandLandmarks;
    const rightHandLandmarks = results.leftHandLandmarks;

    // Animate Face
    if (faceLandmarks) {
      riggedFace = Kalidokit.Face.solve(faceLandmarks, {
        runtime: 'mediapipe',
        video: this.videoElement,
      }) as Kalidokit.TFace;
      this.rigFace(riggedFace);
    }

    // Animate Pose
    if (pose2DLandmarks && pose3DLandmarks) {
      riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
        runtime: 'mediapipe',
        video: this.videoElement,
      }) as Kalidokit.TPose;
      rigRotation('Hips', riggedPose.Hips.rotation, 0.7);
      rigPosition(
        'Hips',
        {
          x: -riggedPose.Hips.position.x, // Reverse direction
          y: riggedPose.Hips.position.y + 1, // Add a bit of height
          z: -riggedPose.Hips.position.z, // Reverse direction
        },
        1,
        1,
      );

      rigRotation('Chest', riggedPose.Spine, 0.25, 0.3);
      rigRotation('Spine', riggedPose.Spine, 0.45, 0.3);
      rigRotation('RightUpperArm', riggedPose.RightUpperArm, 1, 0.7);
      rigRotation('RightLowerArm', riggedPose.RightLowerArm, 1, 0.7);
      rigRotation('LeftUpperArm', riggedPose.LeftUpperArm, 1, 0.7);
      rigRotation('LeftLowerArm', riggedPose.LeftLowerArm, 1, 0.7);

      rigRotation('LeftUpperLeg', riggedPose.LeftUpperLeg, 1, 0.7);
      rigRotation('LeftLowerLeg', riggedPose.LeftLowerLeg, 1, 0.7);
      rigRotation('RightUpperLeg', riggedPose.RightUpperLeg, 1, 0.7);
      rigRotation('RightLowerLeg', riggedPose.RightLowerLeg, 1, 0.7);
    }

    // Animate Hands
    if (leftHandLandmarks) {
      riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, 'Left') as Kalidokit.THand<Kalidokit.Side>;
      rigRotation('LeftHand', {
        // Combine pose rotation Z and hand rotation X Y
        z: riggedPose.LeftHand.z,
        y: riggedLeftHand.LeftWrist.y,
        x: riggedLeftHand.LeftWrist.x,
      });
      rigRotation('LeftRingProximal', riggedLeftHand.LeftRingProximal);
      rigRotation('LeftRingIntermediate', riggedLeftHand.LeftRingIntermediate);
      rigRotation('LeftRingDistal', riggedLeftHand.LeftRingDistal);
      rigRotation('LeftIndexProximal', riggedLeftHand.LeftIndexProximal);
      rigRotation('LeftIndexIntermediate', riggedLeftHand.LeftIndexIntermediate);
      rigRotation('LeftIndexDistal', riggedLeftHand.LeftIndexDistal);
      rigRotation('LeftMiddleProximal', riggedLeftHand.LeftMiddleProximal);
      rigRotation('LeftMiddleIntermediate', riggedLeftHand.LeftMiddleIntermediate);
      rigRotation('LeftMiddleDistal', riggedLeftHand.LeftMiddleDistal);
      rigRotation('LeftThumbProximal', riggedLeftHand.LeftThumbProximal);
      rigRotation('LeftThumbIntermediate', riggedLeftHand.LeftThumbIntermediate);
      rigRotation('LeftThumbDistal', riggedLeftHand.LeftThumbDistal);
      rigRotation('LeftLittleProximal', riggedLeftHand.LeftLittleProximal);
      rigRotation('LeftLittleIntermediate', riggedLeftHand.LeftLittleIntermediate);
      rigRotation('LeftLittleDistal', riggedLeftHand.LeftLittleDistal);
    }
    if (rightHandLandmarks) {
      riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, 'Right') as Kalidokit.THand<Kalidokit.Side>;
      rigRotation('RightHand', {
        // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
        z: riggedPose.RightHand.z,
        y: riggedRightHand.RightWrist.y,
        x: riggedRightHand.RightWrist.x,
      });
      rigRotation('RightRingProximal', riggedRightHand.RightRingProximal);
      rigRotation('RightRingIntermediate', riggedRightHand.RightRingIntermediate);
      rigRotation('RightRingDistal', riggedRightHand.RightRingDistal);
      rigRotation('RightIndexProximal', riggedRightHand.RightIndexProximal);
      rigRotation('RightIndexIntermediate', riggedRightHand.RightIndexIntermediate);
      rigRotation('RightIndexDistal', riggedRightHand.RightIndexDistal);
      rigRotation('RightMiddleProximal', riggedRightHand.RightMiddleProximal);
      rigRotation('RightMiddleIntermediate', riggedRightHand.RightMiddleIntermediate);
      rigRotation('RightMiddleDistal', riggedRightHand.RightMiddleDistal);
      rigRotation('RightThumbProximal', riggedRightHand.RightThumbProximal);
      rigRotation('RightThumbIntermediate', riggedRightHand.RightThumbIntermediate);
      rigRotation('RightThumbDistal', riggedRightHand.RightThumbDistal);
      rigRotation('RightLittleProximal', riggedRightHand.RightLittleProximal);
      rigRotation('RightLittleIntermediate', riggedRightHand.RightLittleIntermediate);
      rigRotation('RightLittleDistal', riggedRightHand.RightLittleDistal);
    }
  }
}

export default new ModelAnimate();

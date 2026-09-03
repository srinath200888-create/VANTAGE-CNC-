import * as THREE from 'three';
import anime from 'animejs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraPreset } from '../types';

export interface CameraViewConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
}

export const CAMERA_PRESETS: Record<CameraPreset, CameraViewConfig> = {
  iso: {
    position: new THREE.Vector3(4.8, 3.8, 5.2),
    target: new THREE.Vector3(0, 1.35, 0),
    fov: 42
  },
  front: {
    position: new THREE.Vector3(0, 1.45, 5.2),
    target: new THREE.Vector3(0, 1.35, 0),
    fov: 40
  },
  side: {
    position: new THREE.Vector3(5.5, 1.45, 0),
    target: new THREE.Vector3(0, 1.35, 0),
    fov: 40
  },
  top: {
    position: new THREE.Vector3(0, 6.5, 0.01),
    target: new THREE.Vector3(0, 1.35, 0),
    fov: 38
  },
  chamber: {
    position: new THREE.Vector3(0, 1.42, 2.2),
    target: new THREE.Vector3(0, 1.25, 0),
    fov: 48
  },
  spindle: {
    position: new THREE.Vector3(0.55, 1.25, 1.35),
    target: new THREE.Vector3(0, 1.15, -0.05),
    fov: 36
  },
  internal: {
    position: new THREE.Vector3(1.6, 2.1, 1.8),
    target: new THREE.Vector3(0, 1.45, -0.2),
    fov: 42
  },
  atc: {
    position: new THREE.Vector3(-2.4, 2.1, 1.6),
    target: new THREE.Vector3(-1.08, 1.75, 0),
    fov: 40
  },
  exploded: {
    position: new THREE.Vector3(6.5, 5.2, 7.5),
    target: new THREE.Vector3(0, 1.5, 0),
    fov: 48
  }
};

export class CameraManager {
  private camera: THREE.PerspectiveCamera;
  private currentTarget = new THREE.Vector3(0, 1.35, 0);
  private isTransitioning = false;
  private activePreset: CameraPreset = 'iso';
  private controls: OrbitControls | null = null;

  constructor(camera: THREE.PerspectiveCamera, controls?: OrbitControls) {
    this.camera = camera;
    this.controls = controls || null;
    const defaultView = CAMERA_PRESETS.iso;
    this.camera.position.copy(defaultView.position);
    this.currentTarget.copy(defaultView.target);
    this.camera.lookAt(this.currentTarget);
    if (this.controls) {
      this.controls.target.copy(this.currentTarget);
      this.controls.update();
    }
  }

  public setControls(controls: OrbitControls): void {
    this.controls = controls;
    this.controls.target.copy(this.currentTarget);
    this.controls.update();
  }

  public getTarget(): THREE.Vector3 {
    if (this.controls && !this.isTransitioning) {
      this.currentTarget.copy(this.controls.target);
    }
    return this.currentTarget;
  }

  public getActivePreset(): CameraPreset {
    return this.activePreset;
  }

  public setView(preset: CameraPreset, duration = 1000): Promise<void> {
    const config = CAMERA_PRESETS[preset];
    if (!config) return Promise.resolve();

    this.activePreset = preset;
    return this.transitionTo(config.position, config.target, config.fov, duration);
  }

  public focusComponent(position: THREE.Vector3, duration = 1000): Promise<void> {
    const camPos = new THREE.Vector3(position.x + 1.2, position.y + 0.6, position.z + 1.6);
    return this.transitionTo(camPos, position, 38, duration);
  }

  public transitionTo(
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    targetFov?: number,
    duration = 1000
  ): Promise<void> {
    this.isTransitioning = true;
    if (this.controls) {
      this.controls.enabled = false;
    }

    return new Promise((resolve) => {
      const startPos = this.camera.position.clone();
      const startLookAt = this.getTarget().clone();
      const startFov = this.camera.fov;
      const finalFov = targetFov ?? startFov;

      const proxy = {
        progress: 0
      };

      anime({
        targets: proxy,
        progress: 1,
        duration: duration,
        easing: 'cubicBezier(0.25, 1, 0.5, 1)',
        update: () => {
          const t = proxy.progress;
          this.camera.position.lerpVectors(startPos, targetPosition, t);
          this.currentTarget.lerpVectors(startLookAt, targetLookAt, t);
          this.camera.lookAt(this.currentTarget);

          if (this.controls) {
            this.controls.target.copy(this.currentTarget);
          }

          if (finalFov !== startFov) {
            this.camera.fov = THREE.MathUtils.lerp(startFov, finalFov, t);
            this.camera.updateProjectionMatrix();
          }
        },
        complete: () => {
          this.camera.position.copy(targetPosition);
          this.currentTarget.copy(targetLookAt);
          this.camera.lookAt(this.currentTarget);
          if (this.controls) {
            this.controls.target.copy(this.currentTarget);
            this.controls.update();
            this.controls.enabled = true;
          }
          if (finalFov !== startFov) {
            this.camera.fov = finalFov;
            this.camera.updateProjectionMatrix();
          }
          this.isTransitioning = false;
          resolve();
        }
      });
    });
  }
}

import * as THREE from 'three';
import anime from 'animejs';
import { CNCComponentId } from '../types';
import { CNCMaterials } from './Materials';
import { AnimatedSubPart } from './CNCModelBuilder';

export interface AnimationControllerOptions {
  componentGroups: Map<CNCComponentId, THREE.Group>;
  enclosureMeshes: THREE.Mesh[];
  animatedSubParts?: AnimatedSubPart[];
  materials: CNCMaterials;
  spindlePivotGroup: THREE.Group;
  atcArmPivotGroup: THREE.Group;
  atcMagazinePivotGroup: THREE.Group;
  yBallscrewMesh: THREE.Mesh;
  xBallscrewMesh: THREE.Mesh;
  zBallscrewMesh: THREE.Mesh;
  chipAugerMesh: THREE.Mesh;
  leftDoorGroup: THREE.Group;
  rightDoorGroup: THREE.Group;
  hmiArmGroup: THREE.Group;
  onExplosionProgress?: (progress: number) => void;
  onRPMChange?: (rpm: number) => void;
}

export class AnimationController {
  public componentGroups: Map<CNCComponentId, THREE.Group>;
  private enclosureMeshes: THREE.Mesh[];
  private animatedSubParts: AnimatedSubPart[];
  private materials: CNCMaterials;

  private spindlePivotGroup: THREE.Group;
  private atcArmPivotGroup: THREE.Group;
  private atcMagazinePivotGroup: THREE.Group;

  private yBallscrewMesh: THREE.Mesh;
  private xBallscrewMesh: THREE.Mesh;
  private zBallscrewMesh: THREE.Mesh;
  private chipAugerMesh: THREE.Mesh;

  private leftDoorGroup: THREE.Group;
  private rightDoorGroup: THREE.Group;
  public hmiArmGroup: THREE.Group;

  public explosionProgress = 0.0;
  public doorsOpen = false;
  public spindleRunning = false;
  public spindleRPM = 0;
  public targetSpindleRPM = 0;
  public isInternalCutaway = false;
  public isRunningProgram = false;

  private activeTimeline: anime.AnimeInstance | anime.AnimeTimelineInstance | null = null;
  private doorAnimation: anime.AnimeInstance | null = null;
  private runTimeline: anime.AnimeTimelineInstance | null = null;
  private atcTimeline: anime.AnimeTimelineInstance | null = null;

  private lastXPos = 0;
  private lastYPos = 0;
  private lastZPos = 0;

  public onExplosionProgress?: (progress: number) => void;
  public onRPMChange?: (rpm: number) => void;

  constructor(options: AnimationControllerOptions) {
    this.componentGroups = options.componentGroups;
    this.enclosureMeshes = options.enclosureMeshes;
    this.animatedSubParts = options.animatedSubParts || [];
    this.materials = options.materials;
    this.spindlePivotGroup = options.spindlePivotGroup;
    this.atcArmPivotGroup = options.atcArmPivotGroup;
    this.atcMagazinePivotGroup = options.atcMagazinePivotGroup;
    this.yBallscrewMesh = options.yBallscrewMesh;
    this.xBallscrewMesh = options.xBallscrewMesh;
    this.zBallscrewMesh = options.zBallscrewMesh;
    this.chipAugerMesh = options.chipAugerMesh;
    this.leftDoorGroup = options.leftDoorGroup;
    this.rightDoorGroup = options.rightDoorGroup;
    this.hmiArmGroup = options.hmiArmGroup;
    this.onExplosionProgress = options.onExplosionProgress;
    this.onRPMChange = options.onRPMChange;
  }

  public update(delta: number): void {
    // 1. Spindle Dynamic Speed Ramp & Inertia
    if (this.spindleRPM !== this.targetSpindleRPM) {
      const diff = this.targetSpindleRPM - this.spindleRPM;
      const rampRate = diff > 0 ? 10000 : 8000;
      if (Math.abs(diff) < rampRate * delta) {
        this.spindleRPM = this.targetSpindleRPM;
      } else {
        this.spindleRPM += Math.sign(diff) * rampRate * delta;
      }
      if (this.onRPMChange) this.onRPMChange(this.spindleRPM);
    }

    if (this.spindleRPM > 0 && this.spindlePivotGroup) {
      const radPerSec = (this.spindleRPM * Math.PI * 2) / 60;
      this.spindlePivotGroup.rotation.y += radPerSec * delta;
    }

    // 2. Chip Conveyor Auger continuous rotation during RUN mode
    if (this.isRunningProgram && this.chipAugerMesh) {
      this.chipAugerMesh.rotation.z += delta * 5.0;
    }

    // 3. Cause-and-Effect Ballscrew Rotations linked to axis positions
    const xGroup = this.componentGroups.get('cnc.worktable');
    const yGroup = this.componentGroups.get('cnc.yAxis');
    const zGroup = this.componentGroups.get('cnc.zAxis');

    if (xGroup && this.xBallscrewMesh) {
      const dx = xGroup.position.x - this.lastXPos;
      this.xBallscrewMesh.rotation.z += (dx / 0.012) * Math.PI * 2;
      this.lastXPos = xGroup.position.x;
    }

    if (yGroup && this.yBallscrewMesh) {
      const dy = yGroup.position.z - this.lastYPos;
      this.yBallscrewMesh.rotation.x += (dy / 0.012) * Math.PI * 2;
      this.lastYPos = yGroup.position.z;
    }

    if (zGroup && this.zBallscrewMesh) {
      const dz = zGroup.position.y - this.lastZPos;
      this.zBallscrewMesh.rotation.y += (dz / 0.01) * Math.PI * 2;
      this.lastZPos = zGroup.position.y;
    }
  }

  public setSpindleSpeed(rpm: number): void {
    this.targetSpindleRPM = rpm;
    this.spindleRunning = rpm > 0;
  }

  public toggleCutaway(enabled?: boolean): void {
    this.isInternalCutaway = enabled !== undefined ? enabled : !this.isInternalCutaway;
    this.enclosureMeshes.forEach((mesh) => {
      if (this.isInternalCutaway) {
        mesh.material = this.materials.cutawayGhost;
      } else {
        mesh.material = this.materials.machineEnclosure;
      }
    });
  }

  public performToolChange(): Promise<void> {
    if (this.atcTimeline) this.atcTimeline.pause();

    const zAxis = this.componentGroups.get('cnc.zAxis');
    const spindleHead = this.componentGroups.get('cnc.spindleHead');
    const spindle = this.componentGroups.get('cnc.spindle');
    const toolHolder = this.componentGroups.get('cnc.toolHolder');
    const tool = this.componentGroups.get('cnc.cuttingTool');
    const coolant = this.componentGroups.get('cnc.coolantSystem');

    const zComponents = [zAxis, spindleHead, spindle, toolHolder, tool, coolant].filter(Boolean) as THREE.Group[];
    const toolAssemblies = [toolHolder, tool].filter(Boolean) as THREE.Group[];

    const previousRPM = this.targetSpindleRPM;
    this.targetSpindleRPM = 0;

    return new Promise((resolve) => {
      const zState = { zOffset: 0 };
      const armState = { swingAngle: 0, plungeY: 0, swapAngle: 0 };
      const toolPlungeState = { toolY: 0 };
      const magState = { magAngle: 0 };

      const zInitialY = zComponents.map((g) => g.position.y);
      const toolInitialY = toolAssemblies.map((g) => g.position.y);

      this.atcTimeline = anime.timeline({
        easing: 'easeInOutCubic',
        complete: () => {
          this.atcTimeline = null;
          this.targetSpindleRPM = previousRPM;
          resolve();
        }
      });

      // 1. Z-axis moves up to Tool Change Home
      this.atcTimeline.add({
        targets: zState,
        zOffset: 0.16,
        duration: 900,
        update: () => {
          zComponents.forEach((g, i) => {
            g.position.y = zInitialY[i] + zState.zOffset;
          });
        }
      });

      // 2. Magazine indexes
      this.atcTimeline.add({
        targets: magState,
        magAngle: Math.PI / 4,
        duration: 700,
        update: () => {
          this.atcMagazinePivotGroup.rotation.z = magState.magAngle;
        }
      });

      // 3. ATC Arm swings 90°
      this.atcTimeline.add({
        targets: armState,
        swingAngle: Math.PI / 2,
        duration: 800,
        update: () => {
          this.atcArmPivotGroup.rotation.y = armState.swingAngle;
        }
      });

      // 4. Plunge down
      this.atcTimeline.add({
        targets: toolPlungeState,
        toolY: -0.14,
        duration: 600,
        update: () => {
          toolAssemblies.forEach((g, i) => {
            g.position.y = toolInitialY[i] + zState.zOffset + toolPlungeState.toolY;
          });
          this.atcArmPivotGroup.position.y = 1.25 + toolPlungeState.toolY;
        }
      });

      // 5. Twin-Gripper Arm swaps 180°
      this.atcTimeline.add({
        targets: armState,
        swapAngle: Math.PI,
        duration: 750,
        update: () => {
          this.atcArmPivotGroup.rotation.z = armState.swapAngle;
        }
      });

      // 6. Tool seats into spindle taper
      this.atcTimeline.add({
        targets: toolPlungeState,
        toolY: 0,
        duration: 600,
        update: () => {
          toolAssemblies.forEach((g, i) => {
            g.position.y = toolInitialY[i] + zState.zOffset + toolPlungeState.toolY;
          });
          this.atcArmPivotGroup.position.y = 1.25 + toolPlungeState.toolY;
        }
      });

      // 7. ATC Arm parks
      this.atcTimeline.add({
        targets: armState,
        swingAngle: 0,
        swapAngle: 0,
        duration: 800,
        update: () => {
          this.atcArmPivotGroup.rotation.y = armState.swingAngle;
          this.atcArmPivotGroup.rotation.z = armState.swapAngle;
        }
      });

      // 8. Z-Axis returns
      this.atcTimeline.add({
        targets: zState,
        zOffset: 0,
        duration: 900,
        update: () => {
          zComponents.forEach((g, i) => {
            g.position.y = zInitialY[i] + zState.zOffset;
          });
        }
      });
    });
  }

  public toggleRunMode(): void {
    if (this.isRunningProgram) {
      this.stopRunMode();
    } else {
      this.startRunMode();
    }
  }

  public startRunMode(): void {
    this.isRunningProgram = true;
    this.targetSpindleRPM = 10500;
    this.spindleRunning = true;

    const table = this.componentGroups.get('cnc.worktable');
    const fixture = this.componentGroups.get('cnc.fixture');
    const zAxis = this.componentGroups.get('cnc.zAxis');
    const spindleHead = this.componentGroups.get('cnc.spindleHead');
    const spindle = this.componentGroups.get('cnc.spindle');
    const toolHolder = this.componentGroups.get('cnc.toolHolder');
    const tool = this.componentGroups.get('cnc.cuttingTool');
    const coolant = this.componentGroups.get('cnc.coolantSystem');

    if (!table || !zAxis || !spindleHead) return;

    const zComponents = [zAxis, spindleHead, spindle, toolHolder, tool, coolant].filter(Boolean) as THREE.Group[];
    const xyComponents = [table, fixture].filter(Boolean) as THREE.Group[];

    const zInitialY = zComponents.map((g) => g.position.y);
    const xyInitial = xyComponents.map((g) => ({ x: g.position.x, z: g.position.z }));

    const zState = { zOffset: 0 };
    const xyState = { xOffset: 0, yOffset: 0 };

    this.runTimeline = anime.timeline({
      easing: 'easeInOutQuad',
      loop: true
    });

    // 1. Spindle plunges into cutting depth
    this.runTimeline.add({
      targets: zState,
      zOffset: -0.16,
      duration: 1000,
      update: () => {
        zComponents.forEach((g, i) => {
          g.position.y = zInitialY[i] + zState.zOffset;
        });
      }
    });

    // 2. Helical pocketing toolpath
    this.runTimeline.add({
      targets: xyState,
      xOffset: 0.16,
      yOffset: -0.09,
      duration: 900,
      update: () => {
        xyComponents.forEach((g, i) => {
          g.position.x = xyInitial[i].x + xyState.xOffset;
          g.position.z = xyInitial[i].z + xyState.yOffset;
        });
      }
    });

    this.runTimeline.add({
      targets: xyState,
      xOffset: -0.16,
      yOffset: 0.09,
      duration: 900,
      update: () => {
        xyComponents.forEach((g, i) => {
          g.position.x = xyInitial[i].x + xyState.xOffset;
          g.position.z = xyInitial[i].z + xyState.yOffset;
        });
      }
    });

    this.runTimeline.add({
      targets: xyState,
      xOffset: 0,
      yOffset: 0,
      duration: 700,
      update: () => {
        xyComponents.forEach((g, i) => {
          g.position.x = xyInitial[i].x + xyState.xOffset;
          g.position.z = xyInitial[i].z + xyState.yOffset;
        });
      }
    });

    // 3. Spindle Retract
    this.runTimeline.add({
      targets: zState,
      zOffset: 0,
      duration: 900,
      update: () => {
        zComponents.forEach((g, i) => {
          g.position.y = zInitialY[i] + zState.zOffset;
        });
      }
    });
  }

  public stopRunMode(): void {
    this.isRunningProgram = false;
    if (this.runTimeline) {
      this.runTimeline.pause();
      this.runTimeline = null;
    }
    this.targetSpindleRPM = 0;

    const table = this.componentGroups.get('cnc.worktable');
    const fixture = this.componentGroups.get('cnc.fixture');
    const zAxis = this.componentGroups.get('cnc.zAxis');
    const spindleHead = this.componentGroups.get('cnc.spindleHead');
    const spindle = this.componentGroups.get('cnc.spindle');
    const toolHolder = this.componentGroups.get('cnc.toolHolder');
    const tool = this.componentGroups.get('cnc.cuttingTool');
    const coolant = this.componentGroups.get('cnc.coolantSystem');

    const zComponents = [zAxis, spindleHead, spindle, toolHolder, tool, coolant].filter(Boolean) as THREE.Group[];
    const xyComponents = [table, fixture].filter(Boolean) as THREE.Group[];

    zComponents.forEach((g) => {
      const home = g.userData.homePosition as THREE.Vector3;
      if (home) g.position.y = home.y;
    });

    xyComponents.forEach((g) => {
      const home = g.userData.homePosition as THREE.Vector3;
      if (home) {
        g.position.x = home.x;
        g.position.z = home.z;
      }
    });
  }

  public setExplosionAmount(amount: number, cancelTimeline = true): void {
    if (cancelTimeline && this.activeTimeline) {
      this.activeTimeline.pause();
      this.activeTimeline = null;
    }
    if (this.isRunningProgram) this.stopRunMode();

    const clamped = Math.max(0, Math.min(1, amount));
    this.explosionProgress = clamped;

    // 1. Position Major Assemblies
    this.componentGroups.forEach((group) => {
      const homePos = group.userData.homePosition as THREE.Vector3;
      const homeRot = group.userData.homeRotation as THREE.Euler;
      const explodeVector = group.userData.explodeVector as [number, number, number];
      const explodeRotation = group.userData.explodeRotation as [number, number, number] | undefined;

      if (!homePos || !explodeVector) return;

      group.position.x = homePos.x + explodeVector[0] * clamped;
      group.position.y = homePos.y + explodeVector[1] * clamped;
      group.position.z = homePos.z + explodeVector[2] * clamped;

      if (explodeRotation) {
        group.rotation.x = homeRot.x + explodeRotation[0] * clamped;
        group.rotation.y = homeRot.y + explodeRotation[1] * clamped;
        group.rotation.z = homeRot.z + explodeRotation[2] * clamped;
      }
    });

    // 2. Position Sub-Parts (Fasteners, Nuts, Screws, Gears, Springs, Bearings)
    this.updateSubPartsExplosion(clamped);

    if (this.onExplosionProgress) {
      this.onExplosionProgress(this.explosionProgress);
    }
  }

  public updateSubPartsExplosion(progress: number): void {
    this.animatedSubParts.forEach((part) => {
      let t = 0;
      if (part.stage === 0) {
        t = Math.min(1, Math.max(0, progress / 0.4));
      } else if (part.stage === 1) {
        t = Math.min(1, Math.max(0, (progress - 0.2) / 0.65));
      } else {
        t = progress;
      }

      const eased = t * t * (3 - 2 * t);

      part.mesh.position.x = part.initialLocalPos.x + part.displaceVector.x * eased;
      part.mesh.position.y = part.initialLocalPos.y + part.displaceVector.y * eased;
      part.mesh.position.z = part.initialLocalPos.z + part.displaceVector.z * eased;

      if (part.spinAmount !== 0) {
        if (part.spinAxis === 'x') {
          part.mesh.rotation.x = part.initialLocalRot.x + part.spinAmount * eased;
        } else if (part.spinAxis === 'y') {
          part.mesh.rotation.y = part.initialLocalRot.y + part.spinAmount * eased;
        } else if (part.spinAxis === 'z') {
          part.mesh.rotation.z = part.initialLocalRot.z + part.spinAmount * eased;
        }
      }
    });
  }

  public assemble(durationFactor = 1.0): Promise<void> {
    if (this.activeTimeline) {
      this.activeTimeline.pause();
      this.activeTimeline = null;
    }
    if (this.isRunningProgram) this.stopRunMode();

    if (this.explosionProgress < 0.1) {
      this.setExplosionAmount(1.0, false);
    }

    return new Promise((resolve) => {
      const animState = { progress: this.explosionProgress };
      const duration = Math.round(2600 * durationFactor);

      this.activeTimeline = anime({
        targets: animState,
        progress: 0.0,
        duration,
        easing: 'cubicBezier(0.25, 1, 0.5, 1)',
        update: () => {
          this.setExplosionAmount(animState.progress, false);
        },
        complete: () => {
          this.setExplosionAmount(0.0, false);
          this.activeTimeline = null;
          resolve();
        }
      });
    });
  }

  public disassemble(durationFactor = 1.0): Promise<void> {
    if (this.activeTimeline) {
      this.activeTimeline.pause();
      this.activeTimeline = null;
    }
    if (this.isRunningProgram) this.stopRunMode();

    if (this.explosionProgress > 0.9) {
      this.setExplosionAmount(0.0, false);
    }

    return new Promise((resolve) => {
      const animState = { progress: this.explosionProgress };
      const duration = Math.round(2600 * durationFactor);

      this.activeTimeline = anime({
        targets: animState,
        progress: 1.0,
        duration,
        easing: 'cubicBezier(0.25, 1, 0.5, 1)',
        update: () => {
          this.setExplosionAmount(animState.progress, false);
        },
        complete: () => {
          this.setExplosionAmount(1.0, false);
          this.activeTimeline = null;
          resolve();
        }
      });
    });
  }

  public reset(duration = 800): Promise<void> {
    if (this.activeTimeline) {
      this.activeTimeline.pause();
      this.activeTimeline = null;
    }
    if (this.isRunningProgram) this.stopRunMode();

    return new Promise((resolve) => {
      const state = { progress: this.explosionProgress };
      this.activeTimeline = anime({
        targets: state,
        progress: 0.0,
        duration,
        easing: 'cubicBezier(0.25, 1, 0.5, 1)',
        update: () => {
          this.setExplosionAmount(state.progress, false);
        },
        complete: () => {
          this.setExplosionAmount(0.0, false);
          this.activeTimeline = null;
          resolve();
        }
      });
    });
  }

  public toggleDoors(open?: boolean): void {
    if (this.doorAnimation) this.doorAnimation.pause();

    const targetOpen = open !== undefined ? open : !this.doorsOpen;
    this.doorsOpen = targetOpen;

    const leftTargetX = targetOpen ? -0.72 : 0;
    const rightTargetX = targetOpen ? 0.72 : 0;

    const state = {
      leftX: this.leftDoorGroup.position.x,
      rightX: this.rightDoorGroup.position.x
    };

    this.doorAnimation = anime({
      targets: state,
      leftX: leftTargetX,
      rightX: rightTargetX,
      duration: 1100,
      easing: 'cubicBezier(0.25, 1, 0.5, 1)',
      update: () => {
        this.leftDoorGroup.position.x = state.leftX;
        this.rightDoorGroup.position.x = state.rightX;
      }
    });
  }
}

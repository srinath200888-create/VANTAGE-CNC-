import * as THREE from 'three';
import { CNCComponentId } from '../types';
import { CNCMaterials } from './Materials';
import { COMPONENT_DEFINITIONS } from '../domain/componentHierarchy';

export interface AnimatedSubPart {
  mesh: THREE.Object3D;
  parentGroup: THREE.Group;
  initialLocalPos: THREE.Vector3;
  initialLocalRot: THREE.Euler;
  displaceVector: THREE.Vector3;
  spinAxis: 'x' | 'y' | 'z';
  spinAmount: number;
  type: 'bolt' | 'nut' | 'screw' | 'gear' | 'bearing' | 'spring' | 'collet' | 'coupling';
  stage: number;
}

export interface BuiltCNCModel {
  rootGroup: THREE.Group;
  componentGroups: Map<CNCComponentId, THREE.Group>;
  interactiveMeshes: THREE.Mesh[];
  enclosureMeshes: THREE.Mesh[];
  animatedSubParts: AnimatedSubPart[];
  spindlePivotGroup: THREE.Group;
  atcArmPivotGroup: THREE.Group;
  atcMagazinePivotGroup: THREE.Group;
  yBallscrewMesh: THREE.Mesh;
  xBallscrewMesh: THREE.Mesh;
  zBallscrewMesh: THREE.Mesh;
  chipAugerMesh: THREE.Mesh;
  leftDoorGroup: THREE.Group;
  rightDoorGroup: THREE.Group;
  workLightGroup: THREE.Group;
  hmiArmGroup: THREE.Group;
}

export class CNCModelBuilder {
  private materials: CNCMaterials;
  private componentGroups = new Map<CNCComponentId, THREE.Group>();
  private interactiveMeshes: THREE.Mesh[] = [];
  private enclosureMeshes: THREE.Mesh[] = [];
  private animatedSubParts: AnimatedSubPart[] = [];

  private yBallscrewMesh!: THREE.Mesh;
  private xBallscrewMesh!: THREE.Mesh;
  private zBallscrewMesh!: THREE.Mesh;
  private chipAugerMesh!: THREE.Mesh;
  private spindlePivotGroup!: THREE.Group;
  private atcArmPivotGroup!: THREE.Group;
  private atcMagazinePivotGroup!: THREE.Group;

  constructor(materials: CNCMaterials) {
    this.materials = materials;
  }

  public build(): BuiltCNCModel {
    const root = new THREE.Group();
    root.name = 'CNC_MACHINE_ROOT';

    // 01. BASE
    const baseGroup = this.buildBase();
    this.registerComponent('cnc.base', baseGroup, [0, 0, 0]);
    root.add(baseGroup);

    // 02. CHIP CONVEYOR
    const chipGroup = this.buildChipConveyor();
    this.registerComponent('cnc.chipConveyor', chipGroup, [-3.2, -0.4, 0.4]);
    root.add(chipGroup);

    // 03. COLUMN
    const columnGroup = this.buildColumn();
    this.registerComponent('cnc.column', columnGroup, [0, 0.6, -3.2]);
    root.add(columnGroup);

    // 04. Y-AXIS SADDLE & DRIVE
    const yAxisGroup = this.buildYAxis();
    this.registerComponent('cnc.yAxis', yAxisGroup, [0, -0.3, -1.8]);
    root.add(yAxisGroup);

    // 05. X-AXIS CARRIAGE & DRIVE
    const xAxisGroup = this.buildXAxis();
    this.registerComponent('cnc.xAxis', xAxisGroup, [2.6, 0.1, 0]);
    root.add(xAxisGroup);

    // 06. WORKTABLE
    const worktableGroup = this.buildWorktable();
    this.registerComponent('cnc.worktable', worktableGroup, [0, 1.4, 0.4]);
    root.add(worktableGroup);

    // 07. FIXTURE & WORKPIECE
    const fixtureGroup = this.buildFixture();
    this.registerComponent('cnc.fixture', fixtureGroup, [0, 2.4, 0.4]);
    root.add(fixtureGroup);

    // 08. Z-AXIS CARRIAGE
    const zAxisGroup = this.buildZAxis();
    this.registerComponent('cnc.zAxis', zAxisGroup, [0, 2.6, -1.2]);
    root.add(zAxisGroup);

    // 09. SPINDLE HEADSTOCK
    const spindleHeadGroup = this.buildSpindleHead();
    this.registerComponent('cnc.spindleHead', spindleHeadGroup, [0, 3.4, 0]);
    root.add(spindleHeadGroup);

    // 10. SPINDLE CARTRIDGE
    const { group: spindleGroup, spindlePivot } = this.buildSpindle();
    this.spindlePivotGroup = spindlePivot;
    this.registerComponent('cnc.spindle', spindleGroup, [0, 4.2, 0]);
    root.add(spindleGroup);

    // 11. TOOL HOLDER
    const toolHolderGroup = this.buildToolHolder();
    this.registerComponent('cnc.toolHolder', toolHolderGroup, [0, 2.6, 1.2]);
    root.add(toolHolderGroup);

    // 12. CUTTING TOOL
    const cuttingToolGroup = this.buildCuttingTool();
    this.registerComponent('cnc.cuttingTool', cuttingToolGroup, [0, 1.9, 1.6]);
    root.add(cuttingToolGroup);

    // 13. ATC MAGAZINE
    const { group: atcMagGroup, magPivot } = this.buildATCMagazine();
    this.atcMagazinePivotGroup = magPivot;
    this.registerComponent('cnc.atcMagazine', atcMagGroup, [-2.8, 2.2, 0.4]);
    root.add(atcMagGroup);

    // 14. ATC TOOL CHANGE ARM
    const { group: atcArmGroup, armPivot } = this.buildATCArm();
    this.atcArmPivotGroup = armPivot;
    this.registerComponent('cnc.atcArm', atcArmGroup, [-2.0, 1.6, 0.6]);
    root.add(atcArmGroup);

    // 15. COOLANT SYSTEM
    const coolantGroup = this.buildCoolantSystem();
    this.registerComponent('cnc.coolantSystem', coolantGroup, [-1.2, 3.0, 0.8]);
    root.add(coolantGroup);

    // 16. MAIN ENCLOSURE
    const frameGroup = this.buildFrame();
    this.registerComponent('cnc.frame', frameGroup, [0, 1.8, 3.2]);
    root.add(frameGroup);

    // 17. LEFT SLIDING DOOR
    const leftDoorGroup = this.buildLeftDoor();
    this.registerComponent('cnc.leftDoor', leftDoorGroup, [-2.2, 1.2, 3.8]);
    root.add(leftDoorGroup);

    // 18. RIGHT SLIDING DOOR
    const rightDoorGroup = this.buildRightDoor();
    this.registerComponent('cnc.rightDoor', rightDoorGroup, [2.2, 1.2, 3.8]);
    root.add(rightDoorGroup);

    // 19. CONTROL PANEL HMI
    const { group: controlPanelGroup, armGroup: hmiArmGroup } = this.buildControlPanel();
    this.registerComponent('cnc.controlPanel', controlPanelGroup, [3.4, 1.8, 2.2], [0, 0.45, 0]);
    root.add(controlPanelGroup);

    // 20. ELECTRICAL CABINET
    const cabinetGroup = this.buildCabinet();
    this.registerComponent('cnc.cabinet', cabinetGroup, [3.2, 0.6, -1.0]);
    root.add(cabinetGroup);

    return {
      rootGroup: root,
      componentGroups: this.componentGroups,
      interactiveMeshes: this.interactiveMeshes,
      enclosureMeshes: this.enclosureMeshes,
      animatedSubParts: this.animatedSubParts,
      spindlePivotGroup: this.spindlePivotGroup,
      atcArmPivotGroup: this.atcArmPivotGroup,
      atcMagazinePivotGroup: this.atcMagazinePivotGroup,
      yBallscrewMesh: this.yBallscrewMesh,
      xBallscrewMesh: this.xBallscrewMesh,
      zBallscrewMesh: this.zBallscrewMesh,
      chipAugerMesh: this.chipAugerMesh,
      leftDoorGroup,
      rightDoorGroup,
      workLightGroup: frameGroup,
      hmiArmGroup
    };
  }

  private registerComponent(
    id: CNCComponentId,
    group: THREE.Group,
    explodeVector: [number, number, number],
    explodeRotation?: [number, number, number]
  ): void {
    group.name = id;
    group.userData.componentId = id;
    group.userData.meta = COMPONENT_DEFINITIONS[id];
    group.userData.homePosition = group.position.clone();
    group.userData.homeRotation = group.rotation.clone();
    group.userData.explodeVector = explodeVector;
    group.userData.explodeRotation = explodeRotation;

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.componentId = id;
        child.castShadow = true;
        child.receiveShadow = true;
        this.interactiveMeshes.push(child);

        if (id === 'cnc.frame' || id === 'cnc.leftDoor' || id === 'cnc.rightDoor') {
          this.enclosureMeshes.push(child);
        }
      }
    });

    this.componentGroups.set(id, group);
  }

  private registerSubPart(
    mesh: THREE.Object3D,
    parentGroup: THREE.Group,
    displaceVector: THREE.Vector3,
    spinAxis: 'x' | 'y' | 'z',
    spinAmount: number,
    type: 'bolt' | 'nut' | 'screw' | 'gear' | 'bearing' | 'spring' | 'collet' | 'coupling',
    stage = 0
  ): void {
    this.animatedSubParts.push({
      mesh,
      parentGroup,
      initialLocalPos: mesh.position.clone(),
      initialLocalRot: mesh.rotation.clone(),
      displaceVector,
      spinAxis,
      spinAmount,
      type,
      stage
    });
  }

  private createSocketHeadCapScrew(
    headRadius: number,
    headHeight: number,
    shankRadius: number,
    shankLength: number,
    material: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    const head = new THREE.Mesh(new THREE.CylinderGeometry(headRadius, headRadius, headHeight, 16), material);
    head.position.y = headHeight / 2;

    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(headRadius * 0.55, headRadius * 0.55, headHeight * 0.45, 6),
      this.materials.castIronDark
    );
    socket.position.y = headHeight * 0.8;

    const shank = new THREE.Mesh(
      new THREE.CylinderGeometry(shankRadius, shankRadius, shankLength, 12),
      this.materials.zincBolt
    );
    shank.position.y = -shankLength / 2;

    group.add(head, socket, shank);
    return group;
  }

  private createHexNut(outerR: number, height: number, material: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(outerR, outerR, height, 6), material);
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(outerR * 0.5, outerR * 0.5, height * 1.05, 12),
      this.materials.castIronDark
    );
    group.add(nut, hole);
    return group;
  }

  private createSpurGear(radius: number, thickness: number, teeth: number, material: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 32), material);
    const bore = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, thickness * 1.05, 16),
      this.materials.castIronDark
    );
    group.add(rim, bore);

    const toothGeo = new THREE.BoxGeometry(radius * 0.12, thickness, radius * 0.15);
    for (let i = 0; i < teeth; i++) {
      const angle = (i * Math.PI * 2) / teeth;
      const tooth = new THREE.Mesh(toothGeo, material);
      tooth.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      tooth.rotation.y = -angle;
      group.add(tooth);
    }
    return group;
  }

  private createSpiderCoupling(
    radius: number,
    length: number
  ): { group: THREE.Group; hubA: THREE.Mesh; spider: THREE.Mesh; hubB: THREE.Mesh } {
    const group = new THREE.Group();
    const halfL = length / 2;

    const hubA = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, halfL * 0.8, 16), this.materials.machinedSteel);
    hubA.position.y = halfL * 0.5;

    const spider = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, length * 0.25, 8),
      this.materials.couplingRed
    );
    spider.position.y = 0;

    const hubB = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, halfL * 0.8, 16), this.materials.machinedSteel);
    hubB.position.y = -halfL * 0.5;

    group.add(hubA, spider, hubB);
    return { group, hubA, spider, hubB };
  }

  // ----------------------------------------------------
  // 01. MACHINE BED & FOUNDATION CASTING
  // ----------------------------------------------------
  private buildBase(): THREE.Group {
    const group = new THREE.Group();
    const mCast = this.materials.castIronDark;
    const mSteel = this.materials.machinedSteel;
    const mDark = this.materials.enclosureDarkTrim;
    const mZinc = this.materials.zincBolt;

    const bedGeo = new THREE.BoxGeometry(2.45, 0.44, 2.2);
    const bedMesh = new THREE.Mesh(bedGeo, mCast);
    bedMesh.position.set(0, 0.22, -0.1);
    group.add(bedMesh);

    const slopeGeo = new THREE.BoxGeometry(2.15, 0.26, 0.65);
    const slopeMesh = new THREE.Mesh(slopeGeo, mCast);
    slopeMesh.position.set(0, 0.13, 0.92);
    group.add(slopeMesh);

    const screenGeo = new THREE.BoxGeometry(1.8, 0.02, 0.38);
    const screenMesh = new THREE.Mesh(screenGeo, mSteel);
    screenMesh.position.set(0, 0.265, 0.88);
    group.add(screenMesh);

    const padGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.06, 20);
    const boltGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.22, 16);

    const padCoords = [
      [-1.08, 0.03, 0.95],
      [1.08, 0.03, 0.95],
      [-1.08, 0.03, -0.1],
      [1.08, 0.03, -0.1],
      [-1.08, 0.03, -1.08],
      [1.08, 0.03, -1.08]
    ];

    padCoords.forEach(([x, y, z]) => {
      const pad = new THREE.Mesh(padGeo, mSteel);
      pad.position.set(x, y, z);
      group.add(pad);

      const bolt = new THREE.Mesh(boltGeo, mZinc);
      bolt.position.set(x, y + 0.11, z);
      group.add(bolt);
      this.registerSubPart(bolt, group, new THREE.Vector3(0, -0.45, 0), 'y', Math.PI * 4, 'bolt', 0);

      const nut = this.createHexNut(0.065, 0.05, mDark);
      nut.position.set(x, y + 0.07, z);
      group.add(nut);
      this.registerSubPart(nut, group, new THREE.Vector3(0, 0.35, 0), 'y', -Math.PI * 6, 'nut', 0);
    });

    const yDatumLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 1.65), mSteel);
    yDatumLeft.position.set(-0.46, 0.465, -0.2);
    const yDatumRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 1.65), mSteel);
    yDatumRight.position.set(0.46, 0.465, -0.2);
    group.add(yDatumLeft, yDatumRight);

    return group;
  }

  // ----------------------------------------------------
  // 02. CHIP CONVEYOR & DISCHARGE AUGER (Grounded)
  // ----------------------------------------------------
  private buildChipConveyor(): THREE.Group {
    const group = new THREE.Group();
    const mDark = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;
    const mMotor = this.materials.spindleHousing;
    const mEnc = this.materials.machineEnclosure;
    const mGear = this.materials.gearSteel;
    const mBronze = this.materials.bronzeGear;

    const augerGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.85, 20);
    this.chipAugerMesh = new THREE.Mesh(augerGeo, mSteel);
    this.chipAugerMesh.rotation.x = Math.PI / 2;
    this.chipAugerMesh.position.set(-1.05, 0.18, 0.15);
    group.add(this.chipAugerMesh);

    const troughGeo = new THREE.BoxGeometry(0.42, 0.28, 1.3);
    const troughMesh = new THREE.Mesh(troughGeo, mDark);
    troughMesh.position.set(-1.18, 0.2, 0.15);

    const flangeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38, 0.38), mSteel);
    flangeMesh.position.set(-1.23, 0.2, 0.15);
    group.add(troughMesh, flangeMesh);

    const flangeScrews = [
      [-1.25, 0.32, 0.28],
      [-1.25, 0.32, 0.02],
      [-1.25, 0.08, 0.28],
      [-1.25, 0.08, 0.02]
    ];
    flangeScrews.forEach(([x, y, z]) => {
      const screw = this.createSocketHeadCapScrew(0.014, 0.012, 0.008, 0.035, this.materials.blackOxideScrew);
      screw.rotation.z = Math.PI / 2;
      screw.position.set(x, y, z);
      group.add(screw);
      this.registerSubPart(screw, group, new THREE.Vector3(-0.35, 0, 0), 'x', Math.PI * 4, 'screw', 0);
    });

    const inclineGeo = new THREE.BoxGeometry(0.38, 0.26, 1.35);
    const inclineMesh = new THREE.Mesh(inclineGeo, mDark);
    inclineMesh.position.set(-1.52, 0.55, -0.32);
    inclineMesh.rotation.x = 0.56;
    inclineMesh.rotation.y = -0.28;
    group.add(inclineMesh);

    const headGeo = new THREE.BoxGeometry(0.44, 0.46, 0.42);
    const headMesh = new THREE.Mesh(headGeo, mDark);
    headMesh.position.set(-1.82, 0.95, -0.78);

    const funnelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.3), mSteel);
    funnelMesh.position.set(-1.82, 0.74, -0.78);
    group.add(headMesh, funnelMesh);

    const motorGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.28, 16);
    const motorMesh = new THREE.Mesh(motorGeo, mMotor);
    motorMesh.position.set(-2.08, 1.08, -0.78);
    motorMesh.rotation.z = Math.PI / 2;

    const fanCover = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.06, 16), mSteel);
    fanCover.position.set(-2.24, 1.08, -0.78);
    fanCover.rotation.z = Math.PI / 2;
    group.add(motorMesh, fanCover);

    const gear1 = this.createSpurGear(0.065, 0.025, 16, mGear);
    gear1.rotation.z = Math.PI / 2;
    gear1.position.set(-1.95, 1.08, -0.78);
    group.add(gear1);
    this.registerSubPart(gear1, group, new THREE.Vector3(-0.4, 0, 0), 'x', Math.PI * 3, 'gear', 1);

    const gear2 = this.createSpurGear(0.095, 0.025, 24, mBronze);
    gear2.rotation.z = Math.PI / 2;
    gear2.position.set(-1.95, 0.95, -0.78);
    group.add(gear2);
    this.registerSubPart(gear2, group, new THREE.Vector3(-0.45, 0, 0), 'x', -Math.PI * 3, 'gear', 1);

    const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 12), mSteel);
    legLeft.position.set(-1.68, 0.34, -0.55);
    const footLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.04, 16), mDark);
    footLeft.position.set(-1.68, 0.02, -0.55);

    const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 12), mSteel);
    legRight.position.set(-1.78, 0.34, -0.65);
    const footRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.04, 16), mDark);
    footRight.position.set(-1.78, 0.02, -0.65);
    group.add(legLeft, footLeft, legRight, footRight);

    const cartBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.38, 0.46), mEnc);
    cartBody.position.set(-1.82, 0.22, -0.78);
    const cartLip = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.48), mSteel);
    cartLip.position.set(-1.82, 0.42, -0.78);

    const wheelPositions = [
      [-1.64, 0.03, -0.62],
      [-2.0, 0.03, -0.62],
      [-1.64, 0.03, -0.94],
      [-2.0, 0.03, -0.94]
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 12), mDark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      group.add(wheel);
    });

    group.add(cartBody, cartLip);
    return group;
  }

  // ----------------------------------------------------
  // 03. RIGID COLUMN CASTING & Z-DRIVE
  // ----------------------------------------------------
  private buildColumn(): THREE.Group {
    const group = new THREE.Group();
    const mCast = this.materials.castIronDark;
    const mRail = this.materials.linearRail;
    const mDark = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;
    const mBlackScrew = this.materials.blackOxideScrew;

    const colGeo = new THREE.BoxGeometry(1.45, 2.15, 1.05);
    const colMesh = new THREE.Mesh(colGeo, mCast);
    colMesh.position.set(0, 1.48, -0.92);
    group.add(colMesh);

    const ribGeo = new THREE.BoxGeometry(0.22, 1.7, 0.65);
    const ribLeft = new THREE.Mesh(ribGeo, mCast);
    ribLeft.position.set(-0.58, 1.25, -1.55);
    const ribRight = new THREE.Mesh(ribGeo, mCast);
    ribRight.position.set(0.58, 1.25, -1.55);
    group.add(ribLeft, ribRight);

    const zRailGeo = new THREE.BoxGeometry(0.065, 1.85, 0.045);
    const zRailLeft = new THREE.Mesh(zRailGeo, mRail);
    zRailLeft.position.set(-0.36, 1.52, -0.38);
    const zRailRight = new THREE.Mesh(zRailGeo, mRail);
    zRailRight.position.set(0.36, 1.52, -0.38);
    group.add(zRailLeft, zRailRight);

    for (let i = 0; i < 4; i++) {
      const y = 0.85 + i * 0.45;
      const screwL = this.createSocketHeadCapScrew(0.012, 0.01, 0.007, 0.03, mBlackScrew);
      screwL.rotation.x = Math.PI / 2;
      screwL.position.set(-0.36, y, -0.355);
      group.add(screwL);
      this.registerSubPart(screwL, group, new THREE.Vector3(0, 0, 0.35), 'z', Math.PI * 4, 'screw', 0);

      const screwR = this.createSocketHeadCapScrew(0.012, 0.01, 0.007, 0.03, mBlackScrew);
      screwR.rotation.x = Math.PI / 2;
      screwR.position.set(0.36, y, -0.355);
      group.add(screwR);
      this.registerSubPart(screwR, group, new THREE.Vector3(0, 0, 0.35), 'z', Math.PI * 4, 'screw', 0);
    }

    const zScrewGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.8, 16);
    this.zBallscrewMesh = new THREE.Mesh(zScrewGeo, mSteel);
    this.zBallscrewMesh.position.set(0, 1.52, -0.42);
    group.add(this.zBallscrewMesh);

    const crownPlate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.65), mDark);
    crownPlate.position.set(0, 2.6, -0.82);

    const zCouplingObj = this.createSpiderCoupling(0.048, 0.09);
    zCouplingObj.group.position.set(0, 2.52, -0.42);
    group.add(zCouplingObj.group);
    this.registerSubPart(zCouplingObj.spider, group, new THREE.Vector3(0, 0.25, 0.2), 'y', Math.PI * 2, 'coupling', 1);

    const servoBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.38, 20),
      this.materials.spindleHousing
    );
    servoBody.position.set(0, 2.87, -0.66);

    const encoderCap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16), mSteel);
    encoderCap.position.set(0, 3.1, -0.66);

    const servoBoltOffsets = [
      [-0.1, 2.7, -0.56],
      [0.1, 2.7, -0.56],
      [-0.1, 2.7, -0.76],
      [0.1, 2.7, -0.76]
    ];
    servoBoltOffsets.forEach(([x, y, z]) => {
      const bolt = this.createSocketHeadCapScrew(0.012, 0.01, 0.007, 0.03, mBlackScrew);
      bolt.position.set(x, y, z);
      group.add(bolt);
      this.registerSubPart(bolt, group, new THREE.Vector3(0, 0.35, 0), 'y', Math.PI * 4, 'bolt', 0);
    });

    group.add(crownPlate, servoBody, encoderCap);
    return group;
  }

  // ----------------------------------------------------
  // 04. Y-AXIS SADDLE, SERVO & BALLSCREW DRIVE
  // ----------------------------------------------------
  private buildYAxis(): THREE.Group {
    const group = new THREE.Group();
    const mCast = this.materials.castIronDark;
    const mRail = this.materials.linearRail;
    const mRubber = this.materials.blackRubber;
    const mSteel = this.materials.machinedSteel;
    const mChain = this.materials.dragChainMat;
    const mBlackScrew = this.materials.blackOxideScrew;

    const saddleGeo = new THREE.BoxGeometry(1.55, 0.19, 1.15);
    const saddleMesh = new THREE.Mesh(saddleGeo, mCast);
    saddleMesh.position.set(0, 0.58, -0.15);
    group.add(saddleMesh);

    const screwGeo = new THREE.CylinderGeometry(0.026, 0.026, 1.45, 16);
    this.yBallscrewMesh = new THREE.Mesh(screwGeo, mSteel);
    this.yBallscrewMesh.rotation.x = Math.PI / 2;
    this.yBallscrewMesh.position.set(0, 0.52, -0.2);
    group.add(this.yBallscrewMesh);

    const yServo = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 16), this.materials.spindleHousing);
    yServo.rotation.x = Math.PI / 2;
    yServo.position.set(0, 0.52, -1.05);

    const yCouplingObj = this.createSpiderCoupling(0.045, 0.08);
    yCouplingObj.group.rotation.x = Math.PI / 2;
    yCouplingObj.group.position.set(0, 0.52, -0.88);
    group.add(yCouplingObj.group);
    this.registerSubPart(yCouplingObj.spider, group, new THREE.Vector3(0, 0.25, -0.25), 'z', Math.PI * 2, 'coupling', 1);

    group.add(yServo);

    const xRailGeo = new THREE.BoxGeometry(1.48, 0.045, 0.065);
    const xRailFront = new THREE.Mesh(xRailGeo, mRail);
    xRailFront.position.set(0, 0.69, 0.22);
    const xRailRear = new THREE.Mesh(xRailGeo, mRail);
    xRailRear.position.set(0, 0.69, -0.38);
    group.add(xRailFront, xRailRear);

    for (let i = 0; i < 4; i++) {
      const x = -0.55 + i * 0.36;
      const sFront = this.createSocketHeadCapScrew(0.012, 0.01, 0.007, 0.03, mBlackScrew);
      sFront.position.set(x, 0.715, 0.22);
      group.add(sFront);
      this.registerSubPart(sFront, group, new THREE.Vector3(0, 0.35, 0), 'y', Math.PI * 4, 'screw', 0);

      const sRear = this.createSocketHeadCapScrew(0.012, 0.01, 0.007, 0.03, mBlackScrew);
      sRear.position.set(x, 0.715, -0.38);
      group.add(sRear);
      this.registerSubPart(sRear, group, new THREE.Vector3(0, 0.35, 0), 'y', Math.PI * 4, 'screw', 0);
    }

    const bellowsFront = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.13, 0.48), mRubber);
    bellowsFront.position.set(0, 0.54, 0.58);
    const bellowsRear = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.13, 0.48), mRubber);
    bellowsRear.position.set(0, 0.54, -0.88);
    group.add(bellowsFront, bellowsRear);

    const eChain = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.8), mChain);
    eChain.position.set(-0.68, 0.54, -0.2);
    group.add(eChain);

    return group;
  }

  // ----------------------------------------------------
  // 05. X-AXIS CARRIAGE, SERVO & BALLSCREW DRIVE
  // ----------------------------------------------------
  private buildXAxis(): THREE.Group {
    const group = new THREE.Group();
    const mSteel = this.materials.machinedSteel;
    const mCast = this.materials.castIronDark;

    const carGeo = new THREE.BoxGeometry(1.3, 0.13, 0.72);
    const carMesh = new THREE.Mesh(carGeo, mCast);
    carMesh.position.set(0, 0.75, -0.05);
    group.add(carMesh);

    const xScrewGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.4, 16);
    this.xBallscrewMesh = new THREE.Mesh(xScrewGeo, mSteel);
    this.xBallscrewMesh.rotation.z = Math.PI / 2;
    this.xBallscrewMesh.position.set(0, 0.73, -0.05);
    group.add(this.xBallscrewMesh);

    const coverLeft = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.085, 0.68), mSteel);
    coverLeft.position.set(-0.74, 0.74, -0.05);
    const coverRight = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.085, 0.68), mSteel);
    coverRight.position.set(0.74, 0.74, -0.05);
    group.add(coverLeft, coverRight);

    const servoMount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.24, 16),
      this.materials.spindleHousing
    );
    servoMount.rotation.z = Math.PI / 2;
    servoMount.position.set(1.08, 0.73, -0.05);

    const xCouplingObj = this.createSpiderCoupling(0.045, 0.07);
    xCouplingObj.group.rotation.z = Math.PI / 2;
    xCouplingObj.group.position.set(0.88, 0.73, -0.05);
    group.add(xCouplingObj.group);
    this.registerSubPart(xCouplingObj.spider, group, new THREE.Vector3(0.25, 0.25, 0), 'x', Math.PI * 2, 'coupling', 1);

    group.add(servoMount);
    return group;
  }

  // ----------------------------------------------------
  // 06. PRECISION GROUND 5-SLOT T-SLOT TABLE
  // ----------------------------------------------------
  private buildWorktable(): THREE.Group {
    const group = new THREE.Group();
    const mSteel = this.materials.machinedSteel;
    const mCast = this.materials.castIronDark;

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.11, 0.58), mSteel);
    tableTop.position.set(0, 0.865, -0.05);
    group.add(tableTop);

    const slotZOffsets = [-0.19, -0.095, 0, 0.095, 0.19];
    slotZOffsets.forEach((z) => {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(1.11, 0.022, 0.02), mCast);
      slot.position.set(0, 0.92, -0.05 + z);
      group.add(slot);
    });

    const lipFront = new THREE.Mesh(new THREE.BoxGeometry(1.17, 0.035, 0.035), mCast);
    lipFront.position.set(0, 0.91, 0.25);
    const lipRear = new THREE.Mesh(new THREE.BoxGeometry(1.17, 0.035, 0.035), mCast);
    lipRear.position.set(0, 0.91, -0.35);
    group.add(lipFront, lipRear);

    return group;
  }

  // ----------------------------------------------------
  // 07. HYDRAULIC MACHINE VISE, CLAMPS & WORKPIECE
  // ----------------------------------------------------
  private buildFixture(): THREE.Group {
    const group = new THREE.Group();
    const mSteel = this.materials.machinedSteel;
    const mAlu = this.materials.aluminumBillet;
    const mDark = this.materials.enclosureDarkTrim;
    const mBrass = this.materials.brassFitting;
    const mZinc = this.materials.zincBolt;

    const viseBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.085, 0.26), mDark);
    viseBase.position.set(0, 0.96, -0.05);
    group.add(viseBase);

    const fixedJaw = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.095, 0.045), mSteel);
    fixedJaw.position.set(0, 1.035, -0.145);
    const movableJaw = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.095, 0.045), mSteel);
    movableJaw.position.set(0, 1.035, 0.045);

    const leadScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 16), mSteel);
    leadScrew.rotation.x = Math.PI / 2;
    leadScrew.position.set(0, 0.99, 0.14);
    group.add(leadScrew);
    this.registerSubPart(leadScrew, group, new THREE.Vector3(0, 0, 0.35), 'z', Math.PI * 6, 'screw', 0);

    const hydroFitting = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 12), mBrass);
    hydroFitting.position.set(-0.18, 0.99, -0.05);
    group.add(fixedJaw, movableJaw, hydroFitting);

    const clampPositions = [
      [-0.26, 0.95, -0.05],
      [0.26, 0.95, -0.05]
    ];
    clampPositions.forEach(([x, y, z]) => {
      const clampBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.12), mDark);
      clampBar.position.set(x, y + 0.03, z);
      group.add(clampBar);
      this.registerSubPart(clampBar, group, new THREE.Vector3(x > 0 ? 0.25 : -0.25, 0.25, 0), 'y', 0, 'bolt', 1);

      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 12), mSteel);
      stud.position.set(x, y + 0.05, z);
      const nut = this.createHexNut(0.022, 0.018, mZinc);
      nut.position.set(x, y + 0.09, z);
      group.add(stud, nut);
      this.registerSubPart(nut, group, new THREE.Vector3(0, 0.35, 0), 'y', Math.PI * 6, 'nut', 0);
    });

    const billetGeo = new THREE.BoxGeometry(0.25, 0.095, 0.145);
    const billet = new THREE.Mesh(billetGeo, mAlu);
    billet.position.set(0, 1.075, -0.05);

    const pocketGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.022, 24);
    const pocketMesh = new THREE.Mesh(pocketGeo, mSteel);
    pocketMesh.position.set(0, 1.124, -0.05);

    group.add(billet, pocketMesh);
    return group;
  }

  // ----------------------------------------------------
  // 08. Z-AXIS VERTICAL CARRIAGE & COUNTERBALANCE
  // ----------------------------------------------------
  private buildZAxis(): THREE.Group {
    const group = new THREE.Group();
    const mCast = this.materials.castIronDark;
    const mSteel = this.materials.machinedSteel;

    const zCarGeo = new THREE.BoxGeometry(0.84, 0.94, 0.38);
    const zCarMesh = new THREE.Mesh(zCarGeo, mCast);
    zCarMesh.position.set(0, 1.52, -0.42);
    group.add(zCarMesh);

    const cylGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.88, 16);
    const cylLeft = new THREE.Mesh(cylGeo, mSteel);
    cylLeft.position.set(-0.48, 1.62, -0.56);
    const cylRight = new THREE.Mesh(cylGeo, mSteel);
    cylRight.position.set(0.48, 1.62, -0.56);
    group.add(cylLeft, cylRight);

    const nutGeo = new THREE.BoxGeometry(0.2, 0.22, 0.2);
    const nutMesh = new THREE.Mesh(nutGeo, mSteel);
    nutMesh.position.set(0, 1.52, -0.63);
    group.add(nutMesh);

    return group;
  }

  // ----------------------------------------------------
  // 09. SPINDLE HEADSTOCK HOUSING & GEAR TRANSMISSION
  // ----------------------------------------------------
  private buildSpindleHead(): THREE.Group {
    const group = new THREE.Group();
    const mSpindle = this.materials.spindleHousing;
    const mDark = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;
    const mBrass = this.materials.brassFitting;
    const mCopper = this.materials.copperWinding;
    const mGear = this.materials.gearSteel;
    const mBronze = this.materials.bronzeGear;
    const mBlackScrew = this.materials.blackOxideScrew;

    const headGeo = new THREE.BoxGeometry(0.68, 0.88, 0.68);
    const headMesh = new THREE.Mesh(headGeo, mSpindle);
    headMesh.position.set(0, 1.62, -0.05);
    group.add(headMesh);

    const headScrewCoords = [
      [-0.32, 1.95, -0.38],
      [0.32, 1.95, -0.38],
      [-0.32, 1.62, -0.38],
      [0.32, 1.62, -0.38],
      [-0.32, 1.28, -0.38],
      [0.32, 1.28, -0.38]
    ];
    headScrewCoords.forEach(([x, y, z]) => {
      const screw = this.createSocketHeadCapScrew(0.014, 0.012, 0.008, 0.04, mBlackScrew);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(x, y, z);
      group.add(screw);
      this.registerSubPart(screw, group, new THREE.Vector3(0, 0, 0.4), 'z', Math.PI * 4, 'screw', 0);
    });

    const drivePinion = this.createSpurGear(0.085, 0.035, 16, mGear);
    drivePinion.position.set(0, 1.95, -0.05);
    group.add(drivePinion);
    this.registerSubPart(drivePinion, group, new THREE.Vector3(0, 0.35, 0), 'y', Math.PI * 3, 'gear', 1);

    const drivenSpur = this.createSpurGear(0.14, 0.035, 28, mBronze);
    drivenSpur.position.set(0, 1.78, -0.05);
    group.add(drivenSpur);
    this.registerSubPart(drivenSpur, group, new THREE.Vector3(0, 0.45, 0), 'y', -Math.PI * 3, 'gear', 1);

    const statorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.38, 24);
    const statorMesh = new THREE.Mesh(statorGeo, mCopper);
    statorMesh.position.set(0, 1.82, -0.05);
    group.add(statorMesh);

    const cowlGeo = new THREE.CylinderGeometry(0.26, 0.3, 0.48, 24);
    const cowlMesh = new THREE.Mesh(cowlGeo, mDark);
    cowlMesh.position.set(0, 2.26, -0.05);

    const capGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.07, 24);
    const capMesh = new THREE.Mesh(capGeo, mSteel);
    capMesh.position.set(0, 2.52, -0.05);
    group.add(cowlMesh, capMesh);

    const pipeIn = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 12), mBrass);
    pipeIn.position.set(-0.36, 1.88, -0.15);
    pipeIn.rotation.z = Math.PI / 2;
    const pipeOut = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 12), mBrass);
    pipeOut.position.set(-0.36, 1.66, -0.15);
    pipeOut.rotation.z = Math.PI / 2;
    group.add(pipeIn, pipeOut);

    return group;
  }

  // ----------------------------------------------------
  // 10. CARTRIDGE SPINDLE, CERAMIC BEARINGS & SPRINGS
  // ----------------------------------------------------
  private buildSpindle(): { group: THREE.Group; spindlePivot: THREE.Group } {
    const group = new THREE.Group();
    const spindlePivot = new THREE.Group();
    spindlePivot.name = 'SPINDLE_ROTATION_PIVOT';

    const mSteel = this.materials.machinedSteel;
    const mDark = this.materials.toolHolderBlack;
    const mCeramic = this.materials.ceramicBearing;
    const mSpring = this.materials.springSteel;

    const sleeveGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.48, 32);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, mSteel);
    sleeveMesh.position.set(0, 1.26, -0.05);
    group.add(sleeveMesh);

    for (let i = 0; i < 4; i++) {
      const bearingRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 16, 32), mCeramic);
      bearingRing.rotation.x = Math.PI / 2;
      bearingRing.position.set(0, 1.12 + i * 0.09, -0.05);
      group.add(bearingRing);
      this.registerSubPart(
        bearingRing,
        group,
        new THREE.Vector3(0, -0.25 - i * 0.12, 0),
        'y',
        Math.PI * 2,
        'bearing',
        1
      );
    }

    for (let j = 0; j < 6; j++) {
      const springWasher = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.012, 24, 1, true), mSpring);
      springWasher.rotation.x = j % 2 === 0 ? Math.PI : 0;
      springWasher.position.set(0, 1.38 + j * 0.016, -0.05);
      group.add(springWasher);
      this.registerSubPart(
        springWasher,
        group,
        new THREE.Vector3(0, 0.15 + j * 0.08, 0),
        'y',
        0,
        'spring',
        1
      );
    }

    const noseGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.15, 32);
    const noseMesh = new THREE.Mesh(noseGeo, mSteel);
    noseMesh.position.set(0, 0, 0);

    const dogLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), mDark);
    dogLeft.position.set(-0.11, -0.07, 0);
    const dogRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), mDark);
    dogRight.position.set(0.11, -0.07, 0);

    const ringGeo = new THREE.TorusGeometry(0.085, 0.016, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, mDark);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, -0.075, 0);

    spindlePivot.add(noseMesh, dogLeft, dogRight, ringMesh);
    spindlePivot.position.set(0, 0.98, -0.05);
    group.add(spindlePivot);

    return { group, spindlePivot };
  }

  // ----------------------------------------------------
  // 11. BT40 TOOL HOLDER, PULL STUD & ER32 COLLET NUT
  // ----------------------------------------------------
  private buildToolHolder(): THREE.Group {
    const group = new THREE.Group();
    const mHolder = this.materials.toolHolderBlack;
    const mSteel = this.materials.machinedSteel;
    const mSpring = this.materials.springSteel;

    const taperGeo = new THREE.ConeGeometry(0.068, 0.17, 24);
    const taperMesh = new THREE.Mesh(taperGeo, mSteel);
    taperMesh.position.set(0, 0.95, -0.05);
    group.add(taperMesh);

    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.019, 0.045, 16), mSteel);
    knob.position.set(0, 1.05, -0.05);
    group.add(knob);
    this.registerSubPart(knob, group, new THREE.Vector3(0, 0.4, 0), 'y', Math.PI * 6, 'screw', 0);

    const flangeGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.055, 32);
    const flangeMesh = new THREE.Mesh(flangeGeo, mHolder);
    flangeMesh.position.set(0, 0.85, -0.05);

    const bodyGeo = new THREE.CylinderGeometry(0.064, 0.074, 0.085, 24);
    const bodyMesh = new THREE.Mesh(bodyGeo, mHolder);
    bodyMesh.position.set(0, 0.79, -0.05);

    const colletGeo = new THREE.ConeGeometry(0.048, 0.072, 16, 1, true);
    const colletMesh = new THREE.Mesh(colletGeo, mSpring);
    colletMesh.position.set(0, 0.75, -0.05);
    group.add(colletMesh);
    this.registerSubPart(colletMesh, group, new THREE.Vector3(0, -0.3, 0), 'y', 0, 'collet', 1);

    const nut = this.createHexNut(0.058, 0.042, mSteel);
    nut.position.set(0, 0.725, -0.05);
    group.add(nut);
    this.registerSubPart(nut, group, new THREE.Vector3(0, -0.45, 0), 'y', Math.PI * 6, 'nut', 0);

    group.add(flangeMesh, bodyMesh);
    return group;
  }

  // ----------------------------------------------------
  // 12. 4-FLUTE SOLID CARBIDE CUTTING TOOL
  // ----------------------------------------------------
  private buildCuttingTool(): THREE.Group {
    const group = new THREE.Group();
    const mCarbide = this.materials.carbideCoated;
    const mSteel = this.materials.machinedSteel;

    const shankGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.065, 24);
    const shankMesh = new THREE.Mesh(shankGeo, mSteel);
    shankMesh.position.set(0, 0.695, -0.05);
    group.add(shankMesh);

    const fluteGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.085, 24);
    const fluteMesh = new THREE.Mesh(fluteGeo, mCarbide);
    fluteMesh.position.set(0, 0.625, -0.05);

    const tipGeo = new THREE.ConeGeometry(0.019, 0.016, 24);
    const tipMesh = new THREE.Mesh(tipGeo, mCarbide);
    tipMesh.rotation.x = Math.PI;
    tipMesh.position.set(0, 0.575, -0.05);

    group.add(fluteMesh, tipMesh);
    return group;
  }

  // ----------------------------------------------------
  // 13. AUTOMATIC TOOL CHANGER & GENEVA GEAR DRIVE
  // ----------------------------------------------------
  private buildATCMagazine(): { group: THREE.Group; magPivot: THREE.Group } {
    const group = new THREE.Group();
    const magPivot = new THREE.Group();
    magPivot.name = 'ATC_MAGAZINE_ROTATION_PIVOT';

    const mDark = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;
    const mHolder = this.materials.toolHolderBlack;
    const mEnc = this.materials.machineEnclosure;
    const mBronze = this.materials.bronzeGear;
    const mGear = this.materials.gearSteel;

    const supportArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.65), mDark);
    supportArm.position.set(-0.85, 1.85, -0.45);
    group.add(supportArm);

    const atcCowl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.12, 1.12), mEnc);
    atcCowl.position.set(-1.18, 1.85, 0);

    const atcTrim = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.04, 1.14), mDark);
    atcTrim.position.set(-1.18, 2.41, 0);

    const atcWindow = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24), this.materials.safetyGlass);
    atcWindow.rotation.z = Math.PI / 2;
    atcWindow.position.set(-1.32, 1.85, 0);
    group.add(atcCowl, atcTrim, atcWindow);

    const genevaStar = this.createSpurGear(0.18, 0.025, 6, mGear);
    genevaStar.rotation.x = Math.PI / 2;
    genevaStar.position.set(-1.08, 1.85, -0.22);
    group.add(genevaStar);
    this.registerSubPart(genevaStar, group, new THREE.Vector3(-0.4, 0, -0.25), 'z', Math.PI * 3, 'gear', 1);

    const genevaPinion = this.createSpurGear(0.08, 0.025, 12, mBronze);
    genevaPinion.rotation.x = Math.PI / 2;
    genevaPinion.position.set(-1.08, 2.05, -0.22);
    group.add(genevaPinion);
    this.registerSubPart(genevaPinion, group, new THREE.Vector3(-0.4, 0.2, -0.25), 'z', -Math.PI * 3, 'gear', 1);

    const drumDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.07, 32), mSteel);
    drumDisc.rotation.x = Math.PI / 2;
    magPivot.add(drumDisc);

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x = Math.cos(angle) * 0.35;
      const y = Math.sin(angle) * 0.35;

      const pocket = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.11, 16), mDark);
      pocket.position.set(x, y, 0);
      pocket.rotation.x = Math.PI / 2;

      const spareHolder = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.085, 16), mHolder);
      spareHolder.position.set(x, y, 0.075);
      spareHolder.rotation.x = Math.PI / 2;

      magPivot.add(pocket, spareHolder);
    }

    magPivot.position.set(-1.08, 1.85, 0);
    group.add(magPivot);

    return { group, magPivot };
  }

  // ----------------------------------------------------
  // 14. AUTOMATIC TOOL CHANGER (TWIN-GRIPPER CHANGE ARM)
  // ----------------------------------------------------
  private buildATCArm(): { group: THREE.Group; armPivot: THREE.Group } {
    const group = new THREE.Group();
    const armPivot = new THREE.Group();
    armPivot.name = 'ATC_ARM_SWIVEL_PIVOT';

    const mDark = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;

    const shaftGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.45, 16);
    const shaftMesh = new THREE.Mesh(shaftGeo, mSteel);
    shaftMesh.position.set(-0.55, 1.45, -0.05);
    group.add(shaftMesh);

    const armBeam = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.09), mDark);
    armPivot.add(armBeam);

    const clawLeft = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 12, 24, Math.PI * 1.3), mSteel);
    clawLeft.position.set(-0.32, 0, 0);
    clawLeft.rotation.x = Math.PI / 2;

    const clawRight = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 12, 24, Math.PI * 1.3), mSteel);
    clawRight.position.set(0.32, 0, 0);
    clawRight.rotation.x = Math.PI / 2;
    clawRight.rotation.z = Math.PI;

    armPivot.add(clawLeft, clawRight);
    armPivot.position.set(-0.55, 1.25, -0.05);
    group.add(armPivot);

    return { group, armPivot };
  }

  // ----------------------------------------------------
  // 15. DUAL ARTICULATED COOLANT DELIVERY SYSTEM
  // ----------------------------------------------------
  private buildCoolantSystem(): THREE.Group {
    const group = new THREE.Group();
    const mBlue = this.materials.locLineBlue;
    const mOrange = this.materials.locLineOrange;
    const mSteel = this.materials.machinedSteel;
    const mBrass = this.materials.brassFitting;

    const collarGeo = new THREE.TorusGeometry(0.22, 0.022, 16, 32);
    const collarMesh = new THREE.Mesh(collarGeo, mSteel);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.15, -0.05);
    group.add(collarMesh);

    const valveLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.04), mBrass);
    valveLeft.position.set(-0.2, 1.15, 0.02);
    group.add(valveLeft);

    const segGeo = new THREE.SphereGeometry(0.024, 12, 12);
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(segGeo, mBlue);
      seg.position.set(-0.18 + i * 0.022, 1.12 - i * 0.072, 0.02 - i * 0.01);
      group.add(seg);
    }
    const tipLeft = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.045, 16), mOrange);
    tipLeft.position.set(-0.07, 0.76, -0.02);
    tipLeft.rotation.z = -0.65;
    group.add(tipLeft);

    const valveRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.04), mBrass);
    valveRight.position.set(0.2, 1.15, 0.02);
    group.add(valveRight);

    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(segGeo, mBlue);
      seg.position.set(0.18 - i * 0.022, 1.12 - i * 0.072, 0.02 - i * 0.01);
      group.add(seg);
    }
    const tipRight = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.045, 16), mOrange);
    tipRight.position.set(0.07, 0.76, -0.02);
    tipRight.rotation.z = 0.65;
    group.add(tipRight);

    return group;
  }

  // ----------------------------------------------------
  // 16. MAIN ENCLOSURE
  // ----------------------------------------------------
  private buildFrame(): THREE.Group {
    const group = new THREE.Group();
    const mEnc = this.materials.machineEnclosure;
    const mTrim = this.materials.enclosureDarkTrim;
    const mHazard = this.materials.hazardStripe;
    const mLight = this.materials.workLightGlass;
    const mSteel = this.materials.machinedSteel;
    const mZinc = this.materials.zincBolt;

    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.15, 0.08), mEnc);
    rearWall.position.set(0, 1.5, -1.18);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 2.15), mEnc);
    leftWall.position.set(-1.18, 1.5, -0.1);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 2.15), mEnc);
    rightWall.position.set(1.18, 1.5, -0.1);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.14, 2.25), mTrim);
    roof.position.set(0, 2.6, -0.1);

    const mistPort = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 24), mTrim);
    mistPort.position.set(-0.62, 2.76, -0.6);
    const mistFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24), mSteel);
    mistFlange.position.set(-0.62, 2.9, -0.6);
    group.add(mistPort, mistFlange);

    const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.36, 0.16), mTrim);
    frontHeader.position.set(0, 2.38, 0.96);

    for (let i = 0; i < 6; i++) {
      const x = -1.0 + i * 0.4;
      const sHeader = this.createSocketHeadCapScrew(0.012, 0.008, 0.006, 0.025, mZinc);
      sHeader.rotation.x = Math.PI / 2;
      sHeader.position.set(x, 2.45, 1.05);
      group.add(sHeader);
      this.registerSubPart(sHeader, group, new THREE.Vector3(0, 0, 0.35), 'z', Math.PI * 4, 'screw', 0);
    }

    const frontLower = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.4, 0.16), mTrim);
    frontLower.position.set(0, 0.58, 0.96);

    const hazardStripeMesh = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.09, 0.01), mHazard);
    hazardStripeMesh.position.set(0, 0.62, 1.045);

    const lightGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.65, 16);
    const workLightFront = new THREE.Mesh(lightGeo, mLight);
    workLightFront.rotation.z = Math.PI / 2;
    workLightFront.position.set(0, 2.36, 0.62);

    const reflector = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 0.06), mSteel);
    reflector.position.set(0, 2.39, 0.62);
    group.add(workLightFront, reflector);

    const towerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.36, 12), mTrim);
    towerPole.position.set(1.05, 2.82, 0.7);
    const ledRed = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.065, 16), this.materials.ledRed);
    ledRed.position.set(1.05, 3.08, 0.7);
    const ledYellow = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.065, 16), this.materials.ledYellow);
    ledYellow.position.set(1.05, 3.01, 0.7);
    const ledGreen = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.065, 16), this.materials.ledGreen);
    ledGreen.position.set(1.05, 2.94, 0.7);

    group.add(
      rearWall,
      leftWall,
      rightWall,
      roof,
      frontHeader,
      frontLower,
      hazardStripeMesh,
      towerPole,
      ledRed,
      ledYellow,
      ledGreen
    );

    return group;
  }

  // ----------------------------------------------------
  // 17. LEFT SLIDING DOOR
  // ----------------------------------------------------
  private buildLeftDoor(): THREE.Group {
    const group = new THREE.Group();
    const mEnc = this.materials.machineEnclosure;
    const mTrim = this.materials.enclosureDarkTrim;
    const mGlass = this.materials.safetyGlass;
    const mSteel = this.materials.machinedSteel;

    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.48, 0.055), mEnc);
    doorFrame.position.set(-0.49, 1.48, 1.02);

    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.12, 0.02), mGlass);
    windowMesh.position.set(-0.49, 1.48, 1.03);

    const bezelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.16, 0.03), mTrim);
    bezelMesh.position.set(-0.49, 1.48, 1.025);

    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.48, 16), mSteel);
    handleBar.position.set(-0.08, 1.45, 1.09);

    const wheelL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 16), mSteel);
    wheelL1.rotation.z = Math.PI / 2;
    wheelL1.position.set(-0.82, 2.24, 1.02);

    const wheelL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 16), mSteel);
    wheelL2.rotation.z = Math.PI / 2;
    wheelL2.position.set(-0.16, 2.24, 1.02);

    group.add(doorFrame, windowMesh, bezelMesh, handleBar, wheelL1, wheelL2);
    this.registerSubPart(wheelL1, group, new THREE.Vector3(0, 0.3, 0), 'x', Math.PI * 4, 'bearing', 1);
    this.registerSubPart(wheelL2, group, new THREE.Vector3(0, 0.3, 0), 'x', Math.PI * 4, 'bearing', 1);

    return group;
  }

  // ----------------------------------------------------
  // 18. RIGHT SLIDING DOOR
  // ----------------------------------------------------
  private buildRightDoor(): THREE.Group {
    const group = new THREE.Group();
    const mEnc = this.materials.machineEnclosure;
    const mTrim = this.materials.enclosureDarkTrim;
    const mGlass = this.materials.safetyGlass;
    const mSteel = this.materials.machinedSteel;

    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.48, 0.055), mEnc);
    doorFrame.position.set(0.49, 1.48, 0.98);

    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.12, 0.02), mGlass);
    windowMesh.position.set(0.49, 1.48, 0.99);

    const bezelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.16, 0.03), mTrim);
    bezelMesh.position.set(0.49, 1.48, 0.985);

    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.48, 16), mSteel);
    handleBar.position.set(0.08, 1.45, 1.05);

    const wheelR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 16), mSteel);
    wheelR1.rotation.z = Math.PI / 2;
    wheelR1.position.set(0.16, 2.24, 0.98);

    const wheelR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 16), mSteel);
    wheelR2.rotation.z = Math.PI / 2;
    wheelR2.position.set(0.82, 2.24, 0.98);

    group.add(doorFrame, windowMesh, bezelMesh, handleBar, wheelR1, wheelR2);
    this.registerSubPart(wheelR1, group, new THREE.Vector3(0, 0.3, 0), 'x', Math.PI * 4, 'bearing', 1);
    this.registerSubPart(wheelR2, group, new THREE.Vector3(0, 0.3, 0), 'x', Math.PI * 4, 'bearing', 1);

    return group;
  }

  // ----------------------------------------------------
  // 19. 19" CNC OPERATOR STATION (HMI PENDANT)
  // ----------------------------------------------------
  private buildControlPanel(): { group: THREE.Group; armGroup: THREE.Group } {
    const group = new THREE.Group();
    const armGroup = new THREE.Group();
    armGroup.name = 'HMI_SWING_ARM';

    const mBody = this.materials.hmiBody;
    const mScreen = this.materials.hmiScreen;
    const mTrim = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;
    const mRed = this.materials.ledRed;
    const mGreen = this.materials.ledGreen;
    const mYellow = this.materials.ledYellow;

    const basePivot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.28, 16), mTrim);
    basePivot.position.set(1.24, 1.8, 0.86);
    group.add(basePivot);

    const boomGeo = new THREE.BoxGeometry(0.55, 0.075, 0.075);
    const boomMesh = new THREE.Mesh(boomGeo, mSteel);
    boomMesh.position.set(0.28, 0, 0);
    armGroup.add(boomMesh);

    const consoleGeo = new THREE.BoxGeometry(0.58, 0.78, 0.17);
    const consoleMesh = new THREE.Mesh(consoleGeo, mBody);
    consoleMesh.position.set(0.58, -0.1, 0.13);
    consoleMesh.rotation.y = -0.36;

    const screenGeo = new THREE.PlaneGeometry(0.48, 0.36);
    const screenMesh = new THREE.Mesh(screenGeo, mScreen);
    screenMesh.position.set(0.55, 0.09, 0.225);
    screenMesh.rotation.y = -0.36;

    const keypadGeo = new THREE.BoxGeometry(0.48, 0.25, 0.025);
    const keypadMesh = new THREE.Mesh(keypadGeo, mTrim);
    keypadMesh.position.set(0.6, -0.25, 0.21);
    keypadMesh.rotation.y = -0.36;

    const estopBase = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.022, 16), mYellow);
    estopBase.position.set(0.44, -0.43, 0.26);
    estopBase.rotation.x = Math.PI / 2;
    const estopButton = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 16), mRed);
    estopButton.position.set(0.44, -0.43, 0.28);
    estopButton.rotation.x = Math.PI / 2;

    const cycleStart = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.025, 16), mGreen);
    cycleStart.position.set(0.72, -0.43, 0.17);
    cycleStart.rotation.x = Math.PI / 2;

    const mpgWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 24), mSteel);
    mpgWheel.position.set(0.58, -0.43, 0.22);
    mpgWheel.rotation.x = Math.PI / 2;

    armGroup.add(consoleMesh, screenMesh, keypadMesh, estopBase, estopButton, cycleStart, mpgWheel);
    armGroup.position.set(1.24, 1.8, 0.86);
    group.add(armGroup);

    return { group, armGroup };
  }

  // ----------------------------------------------------
  // 20. ELECTRICAL & SERVO DRIVES CABINET
  // ----------------------------------------------------
  private buildCabinet(): THREE.Group {
    const group = new THREE.Group();
    const mCabinet = this.materials.cabinetMetal;
    const mTrim = this.materials.enclosureDarkTrim;
    const mSteel = this.materials.machinedSteel;
    const mRed = this.materials.ledRed;
    const mYellow = this.materials.ledYellow;

    const cabGeo = new THREE.BoxGeometry(0.68, 1.95, 1.55);
    const cabMesh = new THREE.Mesh(cabGeo, mCabinet);
    cabMesh.position.set(1.52, 1.42, -0.3);
    group.add(cabMesh);

    const cabDoor = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1.86, 1.46), mTrim);
    cabDoor.position.set(1.86, 1.42, -0.3);
    group.add(cabDoor);

    const acGeo = new THREE.BoxGeometry(0.22, 0.85, 0.65);
    const acMesh = new THREE.Mesh(acGeo, mTrim);
    acMesh.position.set(1.92, 1.62, -0.3);

    for (let i = 0; i < 7; i++) {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.5), mSteel);
      slit.position.set(2.04, 1.9 - i * 0.075, -0.3);
      group.add(slit);
    }
    group.add(acMesh);

    const discPlate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.15), mYellow);
    discPlate.position.set(1.89, 1.1, 0.25);
    const discHandle = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.13), mRed);
    discHandle.position.set(1.91, 1.1, 0.25);
    group.add(discPlate, discHandle);

    const conduitGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.44, 16);
    const conduit = new THREE.Mesh(conduitGeo, mSteel);
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set(1.3, 2.32, -0.4);
    group.add(conduit);

    return group;
  }
}

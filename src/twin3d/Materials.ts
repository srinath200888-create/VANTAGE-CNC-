import * as THREE from 'three';

export interface CNCMaterials {
  castIronDark: THREE.MeshStandardMaterial;
  machineEnclosure: THREE.MeshPhysicalMaterial;
  cutawayGhost: THREE.MeshPhysicalMaterial;
  enclosureDarkTrim: THREE.MeshStandardMaterial;
  machinedSteel: THREE.MeshStandardMaterial;
  linearRail: THREE.MeshStandardMaterial;
  spindleHousing: THREE.MeshStandardMaterial;
  toolHolderBlack: THREE.MeshStandardMaterial;
  carbideCoated: THREE.MeshStandardMaterial;
  aluminumBillet: THREE.MeshStandardMaterial;
  safetyGlass: THREE.MeshPhysicalMaterial;
  locLineBlue: THREE.MeshStandardMaterial;
  locLineOrange: THREE.MeshStandardMaterial;
  cabinetMetal: THREE.MeshStandardMaterial;
  hmiBody: THREE.MeshStandardMaterial;
  hmiScreen: THREE.MeshBasicMaterial;
  blackRubber: THREE.MeshStandardMaterial;
  hazardStripe: THREE.MeshStandardMaterial;
  ledGreen: THREE.MeshStandardMaterial;
  ledRed: THREE.MeshStandardMaterial;
  ledYellow: THREE.MeshStandardMaterial;
  workLightGlass: THREE.MeshBasicMaterial;
  dragChainMat: THREE.MeshStandardMaterial;
  brassFitting: THREE.MeshStandardMaterial;
  ceramicBearing: THREE.MeshStandardMaterial;
  copperWinding: THREE.MeshStandardMaterial;
  couplingRed: THREE.MeshStandardMaterial;
  coolantFlow: THREE.MeshPhysicalMaterial;
  zincBolt: THREE.MeshStandardMaterial;
  blackOxideScrew: THREE.MeshStandardMaterial;
  bronzeGear: THREE.MeshStandardMaterial;
  gearSteel: THREE.MeshStandardMaterial;
  springSteel: THREE.MeshStandardMaterial;
  highlightWarning: THREE.MeshStandardMaterial;
  highlightCritical: THREE.MeshStandardMaterial;
}

export function createCNCMaterials(): CNCMaterials {
  // HMI Screen Canvas
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 768;
  const ctx = screenCanvas.getContext('2d')!;

  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, 1024, 768);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 1024, 64);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText('CNC-VMC 1050 // PRECISION 3-AXIS [AUTO MODE]', 28, 42);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText('● SYSTEM READY', 820, 42);

  const drawRoundedRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number = 8) => {
    c.beginPath();
    if (typeof (c as any).roundRect === 'function') {
      (c as any).roundRect(x, y, w, h, r);
    } else {
      c.rect(x, y, w, h);
    }
    c.fill();
  };

  // G54 Box
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, 28, 90, 470, 240, 8);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px "JetBrains Mono", monospace';
  ctx.fillText('WORK COORDINATES (G54)', 48, 128);

  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillStyle = '#34d399';
  ctx.fillText('X  +142.500 mm', 48, 180);
  ctx.fillText('Y   -85.240 mm', 48, 230);
  ctx.fillText('Z  +050.000 mm', 48, 280);

  // Spindle & Feed
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, 526, 90, 470, 240, 8);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px "JetBrains Mono", monospace';
  ctx.fillText('SPINDLE & FEED OVERRIDES', 546, 128);

  ctx.font = 'bold 32px "JetBrains Mono", monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('S  10,450 RPM (100%)', 546, 180);
  ctx.fillText('F   2,400 mm/min', 546, 230);
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('T   04 [Ø16 CARBIDE EM]', 546, 280);

  // G-Code Program Window
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, 28, 350, 968, 320, 8);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText('ACTIVE PROGRAM: O1004_CYLINDER_HEAD_ROUGH.NC', 48, 390);

  ctx.font = '20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('N038 G90 G54 G17 G40 G80', 48, 435);
  ctx.fillText('N040 M03 S10450 M08', 48, 470);
  ctx.fillText('N042 G00 X142.500 Y-85.240', 48, 505);
  ctx.fillText('N044 G43 H04 Z50.000', 48, 540);
  ctx.fillText('N046 G01 Z-15.000 F650', 48, 575);
  ctx.fillText('N048 G02 X180.000 Y-50.000 R45.000 F2400', 48, 610);

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.minFilter = THREE.LinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;

  // Hazard Texture
  const hazardCanvas = document.createElement('canvas');
  hazardCanvas.width = 256;
  hazardCanvas.height = 256;
  const hCtx = hazardCanvas.getContext('2d')!;
  hCtx.fillStyle = '#facc15';
  hCtx.fillRect(0, 0, 256, 256);
  hCtx.fillStyle = '#111827';
  hCtx.beginPath();
  for (let i = -256; i < 512; i += 64) {
    hCtx.moveTo(i, 0);
    hCtx.lineTo(i + 32, 0);
    hCtx.lineTo(i + 32 + 256, 256);
    hCtx.lineTo(i + 256, 256);
    hCtx.closePath();
  }
  hCtx.fill();

  const hazardTexture = new THREE.CanvasTexture(hazardCanvas);
  hazardTexture.wrapS = THREE.RepeatWrapping;
  hazardTexture.wrapT = THREE.RepeatWrapping;
  hazardTexture.repeat.set(8, 1);

  return {
    castIronDark: new THREE.MeshStandardMaterial({
      color: 0x22262d,
      roughness: 0.82,
      metalness: 0.28
    }),

    machineEnclosure: new THREE.MeshPhysicalMaterial({
      color: 0xf5f2eb, // Industrial warm cream / RAL 9002
      roughness: 0.32,
      metalness: 0.15,
      clearcoat: 0.18,
      clearcoatRoughness: 0.2
    }),

    cutawayGhost: new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.14,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.52,
      reflectivity: 0.8
    }),

    enclosureDarkTrim: new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.52,
      metalness: 0.48
    }),

    machinedSteel: new THREE.MeshStandardMaterial({
      color: 0xe8edf4,
      roughness: 0.16,
      metalness: 0.95
    }),

    linearRail: new THREE.MeshStandardMaterial({
      color: 0xf2f6fa,
      roughness: 0.1,
      metalness: 0.98
    }),

    spindleHousing: new THREE.MeshStandardMaterial({
      color: 0x282e38,
      roughness: 0.42,
      metalness: 0.65
    }),

    toolHolderBlack: new THREE.MeshStandardMaterial({
      color: 0x1c1e22,
      roughness: 0.22,
      metalness: 0.92
    }),

    carbideCoated: new THREE.MeshStandardMaterial({
      color: 0xd9822b,
      roughness: 0.18,
      metalness: 0.96
    }),

    aluminumBillet: new THREE.MeshStandardMaterial({
      color: 0xc4ceda,
      roughness: 0.26,
      metalness: 0.9
    }),

    safetyGlass: new THREE.MeshPhysicalMaterial({
      color: 0xa4c6d6,
      transparent: true,
      opacity: 0.28,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.92,
      ior: 1.54,
      reflectivity: 0.96
    }),

    locLineBlue: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.1
    }),

    locLineOrange: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.35,
      metalness: 0.1
    }),

    cabinetMetal: new THREE.MeshStandardMaterial({
      color: 0x313742,
      roughness: 0.45,
      metalness: 0.45
    }),

    hmiBody: new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.35,
      metalness: 0.55
    }),

    hmiScreen: new THREE.MeshBasicMaterial({
      map: screenTexture
    }),

    blackRubber: new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.92,
      metalness: 0.05
    }),

    hazardStripe: new THREE.MeshStandardMaterial({
      map: hazardTexture,
      roughness: 0.45,
      metalness: 0.15
    }),

    ledGreen: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.2
    }),

    ledRed: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.2
    }),

    ledYellow: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.2
    }),

    workLightGlass: new THREE.MeshBasicMaterial({
      color: 0xffffff
    }),

    dragChainMat: new THREE.MeshStandardMaterial({
      color: 0x1c2028,
      roughness: 0.65,
      metalness: 0.25
    }),

    brassFitting: new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.92
    }),

    ceramicBearing: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.06,
      metalness: 0.15
    }),

    copperWinding: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.3,
      metalness: 0.92
    }),

    couplingRed: new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.38,
      metalness: 0.4
    }),

    coolantFlow: new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      transmission: 0.8
    }),

    zincBolt: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.95
    }),

    blackOxideScrew: new THREE.MeshStandardMaterial({
      color: 0x1e2229,
      roughness: 0.32,
      metalness: 0.88
    }),

    bronzeGear: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.28,
      metalness: 0.82
    }),

    gearSteel: new THREE.MeshStandardMaterial({
      color: 0xcfd8e3,
      roughness: 0.14,
      metalness: 0.98
    }),

    springSteel: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.9
    }),

    highlightWarning: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.6
    }),

    highlightCritical: new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0xe11d48,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.6
    })
  };
}

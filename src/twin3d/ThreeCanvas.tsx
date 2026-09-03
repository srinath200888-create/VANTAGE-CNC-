import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CNCComponentId, CameraPreset, Machine } from '../types';
import { SceneManager } from './SceneManager';
import { createCNCMaterials, CNCMaterials } from './Materials';
import { CNCModelBuilder, BuiltCNCModel } from './CNCModelBuilder';
import { AnimationController } from './AnimationController';
import { CameraManager } from './CameraManager';
import { COMPONENT_DEFINITIONS } from '../domain/componentHierarchy';
import { useTheme } from '../theme/ThemeContext';
import { EventBus } from '../state/EventBus';
import { ThemeDefinition } from '../theme/types';
import {
  Play,
  Square,
  Layers,
  Eye,
  RotateCcw,
  Sliders,
  Sparkles,
  Maximize2,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface ThreeCanvasProps {
  machine: Machine;
  selectedComponentId: CNCComponentId | null;
  onSelectComponent: (id: CNCComponentId | null) => void;
  className?: string;
  showControlsBar?: boolean;
  expandedView?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  machine,
  selectedComponentId,
  onSelectComponent,
  className = '',
  showControlsBar = true,
  expandedView = false
}) => {
  const { themeDef } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneMgrRef = useRef<SceneManager | null>(null);
  const camMgrRef = useRef<CameraManager | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animCtrlRef = useRef<AnimationController | null>(null);
  const modelRef = useRef<BuiltCNCModel | null>(null);
  const materialsRef = useRef<CNCMaterials | null>(null);
  const prevSelectedCompIdRef = useRef<CNCComponentId | null>(null);

  const [activePreset, setActivePreset] = useState<CameraPreset>('iso');
  const [explosionProgress, setExplosionProgress] = useState(0);
  const [isCutaway, setIsCutaway] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<CNCComponentId | null>(null);

  const pointerDownPosRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Manager
    const sceneMgr = new SceneManager(containerRef.current, themeDef);
    sceneMgrRef.current = sceneMgr;

    // 2. OrbitControls with smooth inertia
    const controls = new OrbitControls(sceneMgr.camera, sceneMgr.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.0;
    controls.maxDistance = 24.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controls.target.set(0, 1.35, 0);
    controls.update();
    controlsRef.current = controls;

    // 3. Camera Manager
    const camMgr = new CameraManager(sceneMgr.camera, controls);
    camMgrRef.current = camMgr;

    // 4. Materials & Model Builder
    const materials = createCNCMaterials();
    materialsRef.current = materials;

    const builder = new CNCModelBuilder(materials);
    const builtModel = builder.build();
    modelRef.current = builtModel;
    sceneMgr.scene.add(builtModel.rootGroup);

    // 5. Animation Controller
    const animCtrl = new AnimationController({
      componentGroups: builtModel.componentGroups,
      enclosureMeshes: builtModel.enclosureMeshes,
      animatedSubParts: builtModel.animatedSubParts,
      materials,
      spindlePivotGroup: builtModel.spindlePivotGroup,
      atcArmPivotGroup: builtModel.atcArmPivotGroup,
      atcMagazinePivotGroup: builtModel.atcMagazinePivotGroup,
      yBallscrewMesh: builtModel.yBallscrewMesh,
      xBallscrewMesh: builtModel.xBallscrewMesh,
      zBallscrewMesh: builtModel.zBallscrewMesh,
      chipAugerMesh: builtModel.chipAugerMesh,
      leftDoorGroup: builtModel.leftDoorGroup,
      rightDoorGroup: builtModel.rightDoorGroup,
      hmiArmGroup: builtModel.hmiArmGroup,
      onExplosionProgress: (p) => setExplosionProgress(p)
    });
    animCtrlRef.current = animCtrl;

    // 6. Animation Loop
    let lastTime = performance.now();
    let animFrameId: number;

    const animate = (currentTime: number) => {
      animFrameId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      controls.update();
      animCtrl.update(delta);
      sceneMgr.render();
    };
    animFrameId = requestAnimationFrame(animate);

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          sceneMgr.resize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // 8. Theme change listener
    const unsubTheme = EventBus.on('THEME_CHANGED', (newThemeDef: ThemeDefinition) => {
      if (sceneMgrRef.current) {
        sceneMgrRef.current.updateTheme(newThemeDef);
      }
    });

    return () => {
      cancelAnimationFrame(animFrameId);
      unsubTheme();
      resizeObserver.disconnect();
      controls.dispose();
      sceneMgr.dispose();
    };
  }, []);

  // Update Scene Manager on themeDef change
  useEffect(() => {
    if (sceneMgrRef.current) {
      sceneMgrRef.current.updateTheme(themeDef);
    }
  }, [themeDef]);

  // Update Live Machine State / Spindle RPM
  useEffect(() => {
    if (animCtrlRef.current && machine) {
      animCtrlRef.current.setSpindleSpeed(machine.telemetry.rpm);
    }
  }, [machine.telemetry.rpm]);

  // Handle Component Selection & Visual Highlights (ONLY focus camera when selectedComponentId explicitly changes)
  useEffect(() => {
    if (!modelRef.current || !materialsRef.current) return;
    const materials = materialsRef.current;

    modelRef.current.componentGroups.forEach((group, id) => {
      const compHealth = machine.components[id];
      const isSelected = id === selectedComponentId;

      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (isSelected) {
            if (!child.userData.origMaterial) child.userData.origMaterial = child.material;
            child.material = materials.highlightWarning;
          } else if (compHealth && compHealth.severity === 'CRITICAL') {
            if (!child.userData.origMaterial) child.userData.origMaterial = child.material;
            child.material = materials.highlightCritical;
          } else if (compHealth && compHealth.severity === 'WARNING') {
            if (!child.userData.origMaterial) child.userData.origMaterial = child.material;
            child.material = materials.highlightWarning;
          } else if (child.userData.origMaterial) {
            child.material = child.userData.origMaterial;
            delete child.userData.origMaterial;
          }
        }
      });
    });

    // Only focus camera when selectedComponentId actually changes from previous value
    if (selectedComponentId !== prevSelectedCompIdRef.current) {
      prevSelectedCompIdRef.current = selectedComponentId;
      if (selectedComponentId && camMgrRef.current && modelRef.current) {
        const group = modelRef.current.componentGroups.get(selectedComponentId);
        if (group) {
          const worldPos = new THREE.Vector3();
          group.getWorldPosition(worldPos);
          camMgrRef.current.focusComponent(worldPos, 1000);
        }
      }
    }
  }, [selectedComponentId, machine]);

  // Pointer & Raycasting Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !sceneMgrRef.current || !modelRef.current) return;

    // Raycast for hover tooltip only
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, sceneMgrRef.current.camera);
    const intersects = raycaster.intersectObjects(modelRef.current.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const compId = hit.userData.componentId as CNCComponentId;
      if (compId) setHoveredComponent(compId);
    } else {
      setHoveredComponent(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dist = Math.hypot(e.clientX - pointerDownPosRef.current.x, e.clientY - pointerDownPosRef.current.y);
    const timeDiff = Date.now() - pointerDownPosRef.current.time;

    // Only perform selection if it was a quick click, not a drag/orbit
    if (dist < 6 && timeDiff < 400) {
      if (!containerRef.current || !sceneMgrRef.current || !modelRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, sceneMgrRef.current.camera);
      const intersects = raycaster.intersectObjects(modelRef.current.interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const compId = hit.userData.componentId as CNCComponentId;
        if (compId) {
          onSelectComponent(compId === selectedComponentId ? null : compId);
        }
      }
    }
  };

  const handlePresetChange = (preset: CameraPreset) => {
    setActivePreset(preset);
    if (camMgrRef.current) {
      camMgrRef.current.setView(preset);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setExplosionProgress(val);
    if (animCtrlRef.current) {
      animCtrlRef.current.setExplosionAmount(val);
    }
  };

  const toggleRun = () => {
    if (animCtrlRef.current) {
      animCtrlRef.current.toggleRunMode();
      setIsRunning(animCtrlRef.current.isRunningProgram);
    }
  };

  const toggleCutaway = () => {
    if (animCtrlRef.current) {
      animCtrlRef.current.toggleCutaway();
      setIsCutaway(animCtrlRef.current.isInternalCutaway);
    }
  };

  const triggerToolChange = () => {
    if (animCtrlRef.current) {
      animCtrlRef.current.performToolChange();
    }
  };

  const triggerAssemble = () => {
    if (animCtrlRef.current) {
      animCtrlRef.current.assemble();
    }
  };

  const triggerDisassemble = () => {
    if (animCtrlRef.current) {
      animCtrlRef.current.disassemble();
    }
  };

  const triggerDoorToggle = () => {
    if (animCtrlRef.current) {
      animCtrlRef.current.toggleDoors();
    }
  };

  const hoveredMeta = hoveredComponent ? COMPONENT_DEFINITIONS[hoveredComponent] : null;

  return (
    <div
      className={`relative w-full h-full bg-industrial-bg overflow-hidden rounded-lg border border-industrial-border ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Top Left Live Status Overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-industrial-surface/90 backdrop-blur-md rounded border border-industrial-border text-xs font-mono shadow-industrial-sm pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            machine.status === 'RUNNING' ? 'bg-industrial-success' : machine.status === 'FAULT' ? 'bg-industrial-critical' : 'bg-industrial-warning'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            machine.status === 'RUNNING' ? 'bg-industrial-success' : machine.status === 'FAULT' ? 'bg-industrial-critical' : 'bg-industrial-warning'
          }`} />
        </span>
        <span className="font-semibold text-industrial-primary">{machine.id}</span>
        <span className="text-industrial-muted">|</span>
        <span className="text-industrial-secondary">{machine.model}</span>
        <span className="text-industrial-muted">|</span>
        <span className="text-industrial-accent font-semibold">{machine.telemetry.rpm.toLocaleString()} RPM</span>
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredMeta && (
        <div className="absolute bottom-20 left-4 pointer-events-none px-3 py-2 bg-industrial-surface/95 backdrop-blur-md border border-industrial-active/40 rounded shadow-industrial-md max-w-xs font-mono text-xs">
          <div className="flex items-center gap-1.5 text-industrial-accent font-semibold text-[11px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            {hoveredMeta.code}
          </div>
          <div className="text-industrial-primary font-semibold mt-0.5">{hoveredMeta.name}</div>
          <div className="text-industrial-muted text-[10px] mt-0.5">{hoveredMeta.category}</div>
        </div>
      )}

      {/* Camera Presets Selector */}
      <div className="absolute top-3 right-3 flex items-center gap-1 p-1 bg-industrial-surface/90 backdrop-blur-md rounded border border-industrial-border text-[11px] font-mono shadow-industrial-sm z-20">
        {(['iso', 'front', 'side', 'top', 'chamber', 'spindle', 'internal', 'atc', 'exploded'] as CameraPreset[]).map(
          (preset) => (
            <button
              key={preset}
              onClick={() => handlePresetChange(preset)}
              className={`px-2 py-1 rounded uppercase tracking-wider transition-all ${
                activePreset === preset
                  ? 'bg-industrial-accent-soft text-industrial-accent border border-industrial-accent/40 font-semibold'
                  : 'text-industrial-secondary hover:text-industrial-primary hover:bg-industrial-raised'
              }`}
            >
              {preset}
            </button>
          )
        )}
      </div>

      {/* Main Digital Twin Action & Kinematics Control Bar */}
      {showControlsBar && (
        <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-industrial-surface/95 backdrop-blur-md rounded-lg border border-industrial-border shadow-industrial-lg z-20">
          {/* Kinematic Action Buttons */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={toggleRun}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-all ${
                isRunning
                  ? 'bg-industrial-critical-soft text-industrial-critical border border-industrial-critical/50'
                  : 'bg-industrial-success-soft text-industrial-success border border-industrial-success/50 hover:bg-industrial-success/20'
              }`}
            >
              {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'STOP CYCLE' : 'RUN CYCLE'}
            </button>

            <button
              onClick={triggerToolChange}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary border border-industrial-border rounded transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-industrial-accent" />
              TOOL CHANGE (ATC)
            </button>

            <button
              onClick={triggerDoorToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary border border-industrial-border rounded transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-industrial-warning" />
              DOORS
            </button>

            <button
              onClick={toggleCutaway}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                isCutaway
                  ? 'bg-industrial-accent-soft text-industrial-accent border border-industrial-accent/50'
                  : 'bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary border border-industrial-border'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-industrial-accent" />
              {isCutaway ? 'ENCLOSURE (SOLID)' : 'INTERNAL (CUTAWAY)'}
            </button>
          </div>

          {/* Mechanical Assembly / Disassembly & Explosion Slider */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={triggerDisassemble}
              className="px-2.5 py-1.5 bg-industrial-raised hover:bg-industrial-elevated text-industrial-secondary hover:text-industrial-primary border border-industrial-border rounded transition-all"
            >
              [ DISASSEMBLE ]
            </button>

            <button
              onClick={triggerAssemble}
              className="px-2.5 py-1.5 bg-industrial-raised hover:bg-industrial-elevated text-industrial-secondary hover:text-industrial-primary border border-industrial-border rounded transition-all"
            >
              [ ASSEMBLE ]
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-industrial-border">
              <Sliders className="w-3.5 h-3.5 text-industrial-muted" />
              <span className="text-[11px] text-industrial-secondary">EXPLODED</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explosionProgress}
                onChange={handleSliderChange}
                className="w-24 accent-[var(--accent)] cursor-pointer h-1.5 bg-industrial-raised rounded-lg"
              />
              <span className="w-9 text-right text-[11px] text-industrial-accent font-semibold">
                {Math.round(explosionProgress * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

# 🏭 Industrial CNC Intelligence & 3D Digital Twin Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r168-black.svg)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

An industrial-grade **Machine Intelligence & Predictive Maintenance Platform** built for high-precision automotive manufacturing. The platform integrates a photorealistic **3D CNC Digital Twin** with **real-time deterministic physics simulation**, **ISO 10816 vibration analytics**, **explainable health diagnostics**, **OEE loss breakdown**, and an **aerospace-inspired multi-theme design system**.

---

## 🌟 Key Features

### 1. Interactive 3D CNC Digital Twin Centerpiece
- **20 Discrete Mechanical Assemblies**: Base casting, column, guideways, saddle, table, spindle cartridge, BBT40 tool holder, 4-flute TiAlN end mill, 24-pocket ATC carousel, twin-gripper changer arm, chip conveyor, and 19" HMI console.
- **Animated Mechanical Fasteners & Internals**: Socket-head cap screws, leveling bolts, Belleville disc springs, elastomer spider couplings, and helical transmission gears.
- **Kinematics & Tooling Sequences**:
  - `[ RUN CYCLE ]`: Spindle ramp-up to 10,450 RPM with animated Z-axis helical milling.
  - `[ TOOL CHANGE (ATC) ]`: 11-step twin-gripper mechanical tool swap sequence.
  - `[ ASSEMBLE ] / [ DISASSEMBLE ]`: Progressive exploded disassembly animation with unscrewing fasteners.
  - Continuous 0%–100% `EXPLODED` slider.
  - `[ INTERNAL (CUTAWAY) ]`: Physical semi-transparent glass ghosting.
  - Smooth camera presets (`ISO`, `FRONT`, `SIDE`, `TOP`, `CHAMBER`, `SPINDLE`, `INTERNAL`, `ATC`, `EXPLODED`).

### 2. Real-Time Telemetry & Predictive Maintenance Engine
- **Correlated Physics Simulation**:
  - Motor load current directly drives headstock thermal growth ($32^\circ\text{C} \rightarrow 64^\circ\text{C}$).
  - Cutting tool flank wear accelerates vibration harmonics and spindle power draw.
  - ISO 10816 Class II vibration limit trips trigger explainable automated incidents.
- **Multi-Sensor Correlation Matrix**: Correlates load, vibration, and bearing temperature to detect bearing race spalling vs. cutting chatter.
- **Explainable Incident Dossiers**: 4-step root-cause diagnostics (*What happened? / What changed? / Possible contributors / Recommended actions*) with 1-click maintenance work order generation.

### 3. Factory Command Center & Operations
- **Interactive Factory Floor Map**: Machining cells (**Cell A Engine Block**, **Cell B Transmission**, **Cell C Chassis**) with live node health.
- **Machine Fleet Table**: Sortable fleet matrix with live RPM, load %, temp, vibration, OEE, and health ratings.
- **Production & OEE Loss Analytics**: Availability, Performance, and Quality loss factor breakdown with lost parts analysis.
- **Maintenance Operations Board**: Work order backlog, technician assignment, priority tags, and status tracking.
- **Edge Gateway Architecture**: Simulated MQTT/OPC-UA node metrics with latency and reliability indicators.

### 4. Aerospace & Automotive Multi-Theme System
Six runtime themes with instant switching, `localStorage` persistence, and 3D WebGL scene lighting synchronization:
1. **OBSIDIAN** *(Default)* — Black Titanium, Graphite, Dark Metal, Champagne Brass (`#C7A86B`)
2. **TITANIUM** — Monochromatic Metal, Precision Engineering (`#AEB7C0`, `#E2E7EB`)
3. **CARBON** — Motorsport Machining, Carbon Fiber Surface, Golden Amber (`#E5A83B`)
4. **MIDNIGHT** — Deep Space AI Diagnostics & Digital Twin Intelligence (`#8C82FF`)
5. **COPPER** — Heavy Mechanical Factory, Forged Bronze (`#B87333`)
6. **ARCTIC** — Precision Cleanroom Light Mode (`#3D556B`, `#FFFFFF`)

---

## 🛠️ Technology Stack

- **Framework**: React 18 (TypeScript)
- **Bundler / Dev Server**: Vite 5
- **3D Graphics Engine**: Three.js (WebGL, PBR MeshStandard/MeshPhysical materials, OrbitControls, dynamic shadow maps)
- **Animation Engine**: Anime.js
- **Styling & Tokens**: Tailwind CSS with CSS Custom Properties
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/industrial-cnc-platform.git

# Navigate to project directory
cd industrial-cnc-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Architecture

```
industrial-cnc-platform/
├── src/
│   ├── components/            # UI components (MetricCard, StatusBadge, TopBar, AppShell, Modal...)
│   ├── domain/                # 20 mechanical assemblies, machine registry, health engine
│   ├── simulation/            # Correlated physics telemetry simulator & 8 demo scenarios
│   ├── state/                 # Single source of truth store, EventBus, hooks
│   ├── theme/                 # 6-theme definition dictionary, CSS variable manager, context
│   ├── twin3d/                # Three.js scene, materials, 20-assembly model builder, kinematics
│   ├── types/                 # TypeScript domain interfaces & types
│   ├── views/                 # Platform views (Overview, Factory, Workspace, Spindle, Alerts...)
│   ├── App.tsx                # App root & view router
│   ├── index.css              # Design tokens, micro-grid texture, scrollbars
│   └── main.tsx               # React DOM entrypoint & ErrorBoundary
├── index.html                 # HTML shell
├── package.json
├── tailwind.config.js         # Semantic color tokens
├── tsconfig.json
└── vite.config.ts             # Dev server & bundler config
```

---

## 📄 License

MIT License © 2026 Srinath Ramesh.

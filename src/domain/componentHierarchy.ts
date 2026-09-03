import { CNCComponentId, ComponentHealth } from '../types';

export const COMPONENT_DEFINITIONS: Record<
  CNCComponentId,
  {
    name: string;
    code: string;
    category: ComponentHealth['category'];
    specifications: Record<string, string>;
  }
> = {
  'cnc.base': {
    name: 'Meehanite Bed & Foundation',
    code: 'ASM-01-BAS',
    category: 'Structural',
    specifications: {
      'Material': 'Meehanite Cast Iron FC-300',
      'Mass': '3,850 kg',
      'Vibration Damping': '4.8x steel equivalent',
      'Mounts': '6x M36 Leveling Jacks'
    }
  },
  'cnc.chipConveyor': {
    name: 'Motorized Chip Conveyor',
    code: 'ASM-02-CHP',
    category: 'Auxiliary',
    specifications: {
      'Drive': '0.37 kW Cycloidal Gearmotor',
      'Type': 'Screw Auger + Steel Belt',
      'Capacity': '180 kg/hr cuttings',
      'Discharge Height': '1,050 mm'
    }
  },
  'cnc.column': {
    name: 'Vertical Column Casting',
    code: 'ASM-03-COL',
    category: 'Structural',
    specifications: {
      'Material': 'Ribbed FC-300 Cast Iron',
      'Z-Stroke': '650 mm',
      'Guideway Span': '440 mm',
      'Mass': '2,250 kg'
    }
  },
  'cnc.yAxis': {
    name: 'Y-Axis Servo & Ballscrew Drive',
    code: 'ASM-04-YAX',
    category: 'Motion & Drives',
    specifications: {
      'Stroke': '550 mm',
      'Ballscrew': 'Ø40 mm / 12 mm Pitch C3',
      'Servo Power': '3.5 kW AC Brushless',
      'Rapid Rate': '36 m/min'
    }
  },
  'cnc.xAxis': {
    name: 'X-Axis Carriage & Way Covers',
    code: 'ASM-05-XAX',
    category: 'Motion & Drives',
    specifications: {
      'Stroke': '850 mm',
      'Ballscrew': 'Ø40 mm / 12 mm Pitch C3',
      'Motor': '3.5 kW Direct-Coupled',
      'Covers': 'SUS304 Telescopic Steel'
    }
  },
  'cnc.worktable': {
    name: '5-Slot Precision T-Slot Table',
    code: 'ASM-06-TBL',
    category: 'Structural',
    specifications: {
      'Dimensions': '1,150 x 580 mm',
      'T-Slots': '5 x 18H8 (100 mm pitch)',
      'Max Load': '850 kg',
      'Flatness': '< 0.006 mm'
    }
  },
  'cnc.fixture': {
    name: 'Hydraulic Vise & Aluminum Billet',
    code: 'ASM-07-FIX',
    category: 'Auxiliary',
    specifications: {
      'Jaw Width': '160 mm Hardened Steel',
      'Clamping Force': '45 kN Hydraulic',
      'Workpiece': 'Alloy 6061-T6 Aircraft Aluminum',
      'Billet Size': '250 x 145 x 75 mm'
    }
  },
  'cnc.zAxis': {
    name: 'Z-Axis Slide & Counterbalance',
    code: 'ASM-08-ZAX',
    category: 'Motion & Drives',
    specifications: {
      'Stroke': '580 mm',
      'Motor': '4.5 kW AC Servo with Brake',
      'Ballscrew': 'Ø40 mm / 10 mm Pitch Preloaded',
      'Counterbalance': 'Dual Nitrogen Pneumatic'
    }
  },
  'cnc.spindleHead': {
    name: 'Spindle Headstock Housing',
    code: 'ASM-09-SHD',
    category: 'Tooling & Spindle',
    specifications: {
      'Motor': 'Direct-Drive Synchronous (18.5 kW)',
      'Cooling': 'Closed-loop Oil Chiller (2.5 kW)',
      'Max Torque': '118 Nm @ 1,500 RPM',
      'Gears': 'Precision Ground Helical Drive'
    }
  },
  'cnc.spindle': {
    name: 'Cartridge Spindle & Bearings',
    code: 'ASM-10-SPD',
    category: 'Tooling & Spindle',
    specifications: {
      'Max Speed': '15,000 RPM Continuous',
      'Taper': 'MAS 403 BT40 Dual Contact',
      'Bearings': 'Class P4 Hybrid Ceramic Angular Contact',
      'Retention Force': '12 kN Belleville Stack'
    }
  },
  'cnc.toolHolder': {
    name: 'BT40 Tool Holder & ER32 Collet',
    code: 'ASM-11-THL',
    category: 'Tooling & Spindle',
    specifications: {
      'Standard': 'BBT40 Face & Taper Contact',
      'Balance': 'G2.5 @ 25,000 RPM',
      'Collet': 'ER32 Precision (< 3 µm runout)',
      'Clamping': 'Ø2 mm - Ø20 mm'
    }
  },
  'cnc.cuttingTool': {
    name: '4-Flute Carbide End Mill',
    code: 'ASM-12-CUT',
    category: 'Tooling & Spindle',
    specifications: {
      'Diameter': 'Ø16.0 mm 4-Flute Center Cut',
      'Helix': '38° / 41° Variable Helix',
      'Coating': 'AlTiN PVD Hard Coating (3,200 HV)',
      'Flute Length': '32 mm'
    }
  },
  'cnc.atcMagazine': {
    name: '24-Pocket ATC Carousel',
    code: 'ASM-13-ATC1',
    category: 'Tool Changer (ATC)',
    specifications: {
      'Capacity': '24 Tools (BT40)',
      'Max Tool Weight': '8.0 kg per pocket',
      'Indexing Time': '0.8 sec adjacent pocket',
      'Drive': 'Digital Servo with Geneva Indexer'
    }
  },
  'cnc.atcArm': {
    name: 'Twin-Gripper Tool Change Arm',
    code: 'ASM-14-ATC2',
    category: 'Tool Changer (ATC)',
    specifications: {
      'Mechanism': 'Mechanical Roller Cam & Twin Grippers',
      'Tool-to-Tool': '1.5 seconds',
      'Chip-to-Chip': '3.2 seconds',
      'Gripper Locking': 'Spring-Loaded Positive Detent'
    }
  },
  'cnc.coolantSystem': {
    name: 'Dual Coolant Delivery Manifold',
    code: 'ASM-15-CLN',
    category: 'Auxiliary',
    specifications: {
      'Nozzles': 'Dual 1/2" Articulated Loc-Line',
      'Pressure': '20 Bar Flood Coolant',
      'Flow Rate': '65 L/min',
      'Filtration': 'Paper Band + Magnetic Separator'
    }
  },
  'cnc.frame': {
    name: 'Protective Safety Enclosure',
    code: 'ASM-16-FRM',
    category: 'Enclosure & Safety',
    specifications: {
      'Steel': '2.0 mm Powder-Coated (RAL 9002/7016)',
      'Safety': 'ISO 23125 CE Compliant',
      'Lighting': 'IP67 Sealed LED Tubes (6,000K)',
      'Status Tower': '3-Color LED Signal Tower'
    }
  },
  'cnc.leftDoor': {
    name: 'Left Sliding Access Door',
    code: 'ASM-17-DORL',
    category: 'Enclosure & Safety',
    specifications: {
      'Window': '8 mm Polycarbonate + 4 mm Glass',
      'Suspension': 'Linear Ball Rail Suspension',
      'Interlock': 'RFID Safety Switch (PL e / Cat 4)',
      'Mass': '34 kg'
    }
  },
  'cnc.rightDoor': {
    name: 'Right Sliding Access Door',
    code: 'ASM-18-DORR',
    category: 'Enclosure & Safety',
    specifications: {
      'Window': '8 mm Polycarbonate + 4 mm Glass',
      'Suspension': 'Linear Ball Rail Suspension',
      'Interlock': 'Safety Gate Sensor Guard Lock',
      'Mass': '34 kg'
    }
  },
  'cnc.controlPanel': {
    name: '19" CNC Operator Station (HMI)',
    code: 'ASM-19-HMI',
    category: 'Control System',
    specifications: {
      'Display': '19" Industrial Color LCD (1920x1080)',
      'Swing Arm': '320° Twin-Pivot Aluminum Arm',
      'Controls': 'IP65 Keypad, MPG Handwheel, E-Stop',
      'Protocol': 'Ethernet MTConnect / OPC-UA / MQTT'
    }
  },
  'cnc.cabinet': {
    name: 'Electrical & Servo Drives Enclosure',
    code: 'ASM-20-CAB',
    category: 'Control System',
    specifications: {
      'Protection': 'IP54 Dust & Splash Protected',
      'Cooling': 'Side-mount Closed-Loop AC Unit',
      'Power': '3-Phase 400V AC / 35 kVA',
      'Breaker': 'Safety Lockout Disconnect'
    }
  }
};

export function createDefaultComponents(operatingHours = 1200): Record<CNCComponentId, ComponentHealth> {
  const result = {} as Record<CNCComponentId, ComponentHealth>;

  (Object.keys(COMPONENT_DEFINITIONS) as CNCComponentId[]).forEach((id) => {
    const def = COMPONENT_DEFINITIONS[id];
    result[id] = {
      id,
      name: def.name,
      code: def.code,
      category: def.category,
      healthScore: 94,
      severity: 'HEALTHY',
      temperature: 38.5,
      vibration: 1.4,
      loadPct: 42,
      operatingHours: operatingHours + Math.floor(Math.random() * 80),
      failureRiskPct: 6,
      detectedConditions: ['Nominal baseline operating parameters.'],
      recommendations: ['Maintain regular lubrication and scheduled interval inspection.'],
      lastInspectedDaysAgo: 8,
      specifications: def.specifications
    };
  });

  return result;
}

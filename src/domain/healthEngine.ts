import { Machine, TelemetryPacket, MachineHealthSummary, HealthSeverity, ComponentHealth, Alert } from '../types';

export class MachineHealthEngine {
  /**
   * Evaluates machine telemetry and updates component health, overall score, and returns newly generated alerts.
   */
  public static evaluateMachine(machine: Machine, telemetry: TelemetryPacket): {
    updatedMachine: Machine;
    newAlerts: Alert[];
  } {
    const newAlerts: Alert[] = [];
    const comps = { ...machine.components };

    // 1. Spindle Component Health Evaluation
    const spindle = comps['cnc.spindle'];
    const spindleHead = comps['cnc.spindleHead'];
    if (spindle && spindleHead) {
      let spindleHealth = 98;
      const conditions: string[] = [];
      const recommendations: string[] = [];

      // Vibration analysis (ISO 10816 baseline: < 2.5 mm/s = Good, 2.5-4.5 = Warning, > 4.5 = Critical)
      if (telemetry.vibrationMmS > 4.5) {
        spindleHealth -= 32;
        conditions.push(`Abnormal tri-axial vibration detected: ${telemetry.vibrationMmS.toFixed(2)} mm/s RMS (Baseline: 1.8 mm/s).`);
        recommendations.push('Inspect spindle front angular contact ceramic bearings and check tool balance grade.');
        if (machine.status === 'RUNNING' && !machine.components['cnc.spindle'].detectedConditions.some(c => c.includes('Abnormal tri-axial'))) {
          newAlerts.push({
            id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            machineId: machine.id,
            componentId: 'cnc.spindle',
            title: 'Critical Spindle Bearing Vibration',
            description: `Vibration signature exceeded ISO 10816 Category II trip threshold (${telemetry.vibrationMmS.toFixed(2)} mm/s).`,
            severity: 'CRITICAL',
            timestamp: new Date().toLocaleTimeString(),
            baselineValue: '1.80 mm/s',
            observedValue: `${telemetry.vibrationMmS.toFixed(2)} mm/s`,
            metricUnit: 'mm/s RMS',
            possibleContributors: ['Front ceramic bearing race micro-spalling', 'Tool holder centrifugal unbalance', 'High cutting chatter'],
            recommendedActions: ['Perform emergency spindle vibration FFT audit', 'Check tool clamp drawbar retention force', 'Reduce spindle feedrate'],
            status: 'ACTIVE'
          });
        }
      } else if (telemetry.vibrationMmS > 2.8) {
        spindleHealth -= 16;
        conditions.push(`Elevated vibration trend: ${telemetry.vibrationMmS.toFixed(2)} mm/s RMS.`);
        recommendations.push('Schedule bearing acoustic inspection during next shift window.');
      }

      // Thermal analysis (Baseline: < 45°C = Normal, 45-60°C = Warning, > 60°C = Critical)
      if (telemetry.tempC > 58) {
        spindleHealth -= 28;
        conditions.push(`Spindle headstock over-temperature: ${telemetry.tempC.toFixed(1)}°C (Limit: 55°C).`);
        recommendations.push('Check oil chiller circulating pressure and verify heat exchanger louvers.');
      } else if (telemetry.tempC > 48) {
        spindleHealth -= 12;
        conditions.push(`Thermal drift observed: ${telemetry.tempC.toFixed(1)}°C.`);
        recommendations.push('Monitor closed-loop chiller delta-T.');
      }

      // Load analysis (Sustained > 85% = Heavy load)
      if (telemetry.loadPct > 88) {
        spindleHealth -= 14;
        conditions.push(`Sustained high motor torque load: ${telemetry.loadPct.toFixed(0)}%.`);
        recommendations.push('Verify depth of cut and feed per tooth parameters.');
      }

      if (conditions.length === 0) {
        conditions.push('Nominal ceramic bearing pack baseline running.');
        recommendations.push('Routine interval inspection.');
      }

      spindle.healthScore = Math.max(10, Math.min(100, Math.round(spindleHealth)));
      spindle.severity = this.getSeverity(spindle.healthScore);
      spindle.temperature = telemetry.tempC;
      spindle.vibration = telemetry.vibrationMmS;
      spindle.loadPct = telemetry.loadPct;
      spindle.failureRiskPct = Math.round((100 - spindle.healthScore) * 0.95);
      spindle.detectedConditions = conditions;
      spindle.recommendations = recommendations;
    }

    // 2. Cutting Tool Health Evaluation
    const tool = comps['cnc.cuttingTool'];
    if (tool) {
      let toolHealth = 100 - telemetry.toolWearPct * 0.85;
      const conditions: string[] = [];
      const recommendations: string[] = [];

      if (telemetry.toolWearPct > 70) {
        toolHealth -= 25;
        conditions.push(`Elevated VB flank wear estimated: ${telemetry.toolWearPct.toFixed(0)}% cumulative life.`);
        recommendations.push('Prepare replacement Ø16 TiAlN end mill in ATC carousel pocket.');
        if (telemetry.toolWearPct > 85 && !tool.detectedConditions.some(c => c.includes('Critical tool wear'))) {
          newAlerts.push({
            id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            machineId: machine.id,
            componentId: 'cnc.cuttingTool',
            title: 'Critical Tool Flank Wear (VB > 0.3mm)',
            description: `Cutting tool life exhausted (${telemetry.toolWearPct.toFixed(0)}% wear). Surface roughness out of tolerance risk.`,
            severity: 'WARNING',
            timestamp: new Date().toLocaleTimeString(),
            baselineValue: '< 50% wear',
            observedValue: `${telemetry.toolWearPct.toFixed(0)}% wear`,
            metricUnit: '% Life',
            possibleContributors: ['Abrasive silicon content in 6061 billet', 'Insufficient flood coolant lubrication', 'Extended cycle time'],
            recommendedActions: ['Index to sister tool in magazine', 'Replace carbide insert/end mill', 'Inspect machined part Ra surface'],
            status: 'ACTIVE'
          });
        }
      } else if (telemetry.toolWearPct > 40) {
        conditions.push(`Normal flank wear progression (${telemetry.toolWearPct.toFixed(0)}%).`);
        recommendations.push('Continue monitoring cutting forces.');
      } else {
        conditions.push('Sharp micro-grain cutting edges with intact TiAlN coating.');
        recommendations.push('Ready for full depth roughing and finishing.');
      }

      tool.healthScore = Math.max(15, Math.min(100, Math.round(toolHealth)));
      tool.severity = this.getSeverity(tool.healthScore);
      tool.failureRiskPct = Math.round(telemetry.toolWearPct * 0.9);
      tool.detectedConditions = conditions;
      tool.recommendations = recommendations;
    }

    // 3. Overall Subsystem Scores
    const spindleScore = comps['cnc.spindle']?.healthScore ?? 90;
    const toolingScore = comps['cnc.cuttingTool']?.healthScore ?? 88;
    const axesScore = Math.round(
      ((comps['cnc.xAxis']?.healthScore ?? 92) +
        (comps['cnc.yAxis']?.healthScore ?? 90) +
        (comps['cnc.zAxis']?.healthScore ?? 94)) /
        3
    );
    const thermalScore = telemetry.tempC > 55 ? 68 : telemetry.tempC > 46 ? 82 : 95;
    const electricalScore = telemetry.loadPct > 90 ? 74 : 94;
    const workholdingScore = telemetry.workpieceClamped ? 96 : 40;

    const overallScore = Math.round(
      spindleScore * 0.32 +
        toolingScore * 0.22 +
        axesScore * 0.2 +
        thermalScore * 0.12 +
        electricalScore * 0.08 +
        workholdingScore * 0.06
    );

    const reasons: string[] = [];
    if (spindleScore < 80) reasons.push(`Spindle health degradation (${spindleScore}/100) due to elevated vibration/temp.`);
    if (toolingScore < 80) reasons.push(`Cutting tool wear elevated (${toolingScore}/100).`);
    if (thermalScore < 80) reasons.push(`Thermal balance drift in machine casting.`);
    if (reasons.length === 0) reasons.push('All subsystems operating within nominal industrial tolerances.');

    const healthSummary: MachineHealthSummary = {
      overallScore,
      spindle: spindleScore,
      tooling: toolingScore,
      axes: axesScore,
      thermal: thermalScore,
      electrical: electricalScore,
      workholding: workholdingScore,
      reasons
    };

    const healthSeverity = this.getSeverity(overallScore);

    return {
      updatedMachine: {
        ...machine,
        healthScore: overallScore,
        healthSeverity,
        healthSummary,
        components: comps,
        telemetry
      },
      newAlerts
    };
  }

  public static getSeverity(score: number): HealthSeverity {
    if (score >= 85) return 'HEALTHY';
    if (score >= 70) return 'MONITOR';
    if (score >= 50) return 'WARNING';
    return 'CRITICAL';
  }
}

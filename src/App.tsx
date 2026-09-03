import React, { useState } from 'react';
import { useMachineStore } from './state/useMachineStore';
import { ThemeProvider } from './theme/ThemeContext';
import { TopBar } from './components/TopBar';
import { AppShell } from './components/AppShell';
import { DemoControlPanel } from './components/DemoControlPanel';

// Views
import { OverviewView } from './views/OverviewView';
import { FactoryMapView } from './views/FactoryMapView';
import { MachinesListView } from './views/MachinesListView';
import { MachineWorkspaceView } from './views/MachineWorkspaceView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { SpindleIntelligenceView } from './views/SpindleIntelligenceView';
import { ToolIntelligenceView } from './views/ToolIntelligenceView';
import { AxisHealthView } from './views/AxisHealthView';
import { AlertsView } from './views/AlertsView';
import { MaintenanceView } from './views/MaintenanceView';
import { ProductionOEEView } from './views/ProductionOEEView';
import { AnalyticsView } from './views/AnalyticsView';
import { EdgeNodesView } from './views/EdgeNodesView';
import { SettingsView } from './views/SettingsView';

const AppContent: React.FC = () => {
  const { activeView } = useMachineStore();
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'factory':
        return <FactoryMapView />;
      case 'machines':
        return <MachinesListView />;
      case 'machine-workspace':
        return <MachineWorkspaceView />;
      case 'digital-twin':
        return <DigitalTwinView />;
      case 'spindle':
        return <SpindleIntelligenceView />;
      case 'tooling':
        return <ToolIntelligenceView />;
      case 'axes':
        return <AxisHealthView />;
      case 'alerts':
      case 'incident-detail':
        return <AlertsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'production':
        return <ProductionOEEView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'edge':
        return <EdgeNodesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-industrial-bg text-industrial-primary antialiased select-none">
      <TopBar onToggleDemoPanel={() => setIsDemoPanelOpen(true)} />
      <AppShell>{renderActiveView()}</AppShell>
      <DemoControlPanel isOpen={isDemoPanelOpen} onClose={() => setIsDemoPanelOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

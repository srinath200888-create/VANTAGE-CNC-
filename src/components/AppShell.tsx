import React from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { ActiveView } from '../types';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  Box,
  TrendingUp,
  Gauge,
  Wrench,
  AlertTriangle,
  Flame,
  Scissors,
  Move3d,
  BarChart3,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { activeView, isSidebarCollapsed, alerts } = useMachineStore();
  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const navGroups: Array<{
    title: string;
    items: Array<{
      id: ActiveView;
      label: string;
      icon: any;
      badge?: number;
    }>;
  }> = [
    {
      title: 'INDUSTRIAL INTELLIGENCE',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'factory', label: 'Factory Floor', icon: MapPin },
        { id: 'machines', label: 'Machine Fleet', icon: Cpu },
        { id: 'digital-twin', label: 'Digital Twins', icon: Box }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'production', label: 'Production / OEE', icon: TrendingUp },
        { id: 'maintenance', label: 'Maintenance & PM', icon: Wrench },
        { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: activeAlertsCount }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'spindle', label: 'Spindle Diagnostics', icon: Flame },
        { id: 'tooling', label: 'Tool Intelligence', icon: Scissors },
        { id: 'axes', label: 'Axis Health (X/Y/Z)', icon: Move3d },
        { id: 'analytics', label: 'Plant Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'edge', label: 'Edge Gateways', icon: Radio },
        { id: 'settings', label: 'Settings & Themes', icon: Settings }
      ]
    }
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-industrial-bg text-industrial-primary font-sans relative">
      {/* Subtle Micro-grid Texture */}
      <div className="absolute inset-0 industrial-grid pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } bg-industrial-surface border-r border-industrial-border flex flex-col justify-between transition-all duration-300 z-10 select-none flex-shrink-0 shadow-industrial-sm relative`}
      >
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
          {navGroups.map((grp) => (
            <div key={grp.title}>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-mono font-semibold tracking-wider text-industrial-muted uppercase">
                  {grp.title}
                </div>
              )}
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeView === item.id ||
                    (item.id === 'machines' && activeView === 'machine-workspace');

                  return (
                    <button
                      key={item.id}
                      onClick={() => machineStore.setActiveView(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded font-mono text-xs transition-all relative ${
                        isActive
                          ? 'bg-industrial-accent-soft text-industrial-accent font-semibold border-l-2 border-industrial-active'
                          : 'text-industrial-secondary hover:text-industrial-primary hover:bg-industrial-raised'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-industrial-accent' : 'text-industrial-muted'}`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate tracking-wide">{item.label}</span>
                      )}
                      {item.badge !== undefined && item.badge > 0 && !isSidebarCollapsed && (
                        <span className="ml-auto px-1.5 py-0.2 bg-industrial-critical text-white text-[10px] font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-industrial-border bg-industrial-raised font-mono text-xs">
          {!isSidebarCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-industrial-muted">EDGE GATEWAY</span>
                <div className="flex items-center gap-1.5 text-industrial-success font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-industrial-success animate-pulse" />
                  CONNECTED
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-industrial-secondary">
                <Building2 className="w-3.5 h-3.5 text-industrial-accent" />
                <span className="truncate">Automotive Plant Cell A</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-industrial-success animate-pulse" />
            </div>
          )}

          <button
            onClick={() => machineStore.toggleSidebar()}
            className="w-full mt-2 py-1 flex items-center justify-center text-industrial-muted hover:text-industrial-primary hover:bg-industrial-elevated rounded transition-colors text-[11px]"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 h-full overflow-y-auto bg-industrial-bg p-4 lg:p-6 scrollbar-thin relative z-10">
        {children}
      </main>
    </div>
  );
};

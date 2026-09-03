import React, { useState, useEffect, useRef } from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { useTheme } from '../theme/ThemeContext';
import { ThemeId } from '../theme/types';
import {
  Building2,
  Search,
  Bell,
  SlidersHorizontal,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  Palette,
  Check,
  ChevronDown
} from 'lucide-react';

interface TopBarProps {
  onToggleDemoPanel: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleDemoPanel }) => {
  const { machines, alerts } = useMachineStore();
  const { theme, themeDef, setTheme, availableThemes } = useTheme();

  const [timeStr, setTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ' ' +
          now.toLocaleTimeString('en-GB', { hour12: false }) +
          ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close theme dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const machineList = Object.values(machines);
  const onlineCount = machineList.filter((m) => m.status === 'RUNNING').length;
  const warningCount = machineList.filter((m) => m.healthSeverity === 'WARNING').length;
  const criticalCount = machineList.filter((m) => m.healthSeverity === 'CRITICAL').length;
  const maintCount = machineList.filter((m) => m.status === 'MAINTENANCE').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toUpperCase();
    const match = machineList.find((m) => m.id.includes(q) || m.name.toUpperCase().includes(q));
    if (match) {
      machineStore.selectMachine(match.id);
      machineStore.setActiveView('machine-workspace');
    }
  };

  return (
    <header className="h-14 bg-industrial-surface border-b border-industrial-border px-4 flex items-center justify-between gap-4 font-mono z-30 select-none shadow-industrial-sm">
      {/* Plant Selector & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-industrial-raised border border-industrial-border rounded text-xs">
          <Building2 className="w-3.5 h-3.5 text-industrial-accent" />
          <span className="font-semibold text-industrial-primary">CHENNAI AUTO-PLANT // CELL A-C</span>
        </div>

        {/* Machine Fleet Live Status Counts */}
        <div className="hidden lg:flex items-center gap-3 text-xs pl-2 border-l border-industrial-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-industrial-success animate-pulse" />
            <span className="font-semibold text-industrial-primary">{onlineCount}</span>
            <span className="text-industrial-muted text-[11px]">Running</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-industrial-warning" />
            <span className="font-semibold text-industrial-warning">{warningCount}</span>
            <span className="text-industrial-muted text-[11px]">Warning</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-industrial-critical" />
            <span className="font-semibold text-industrial-critical">{criticalCount}</span>
            <span className="text-industrial-muted text-[11px]">Critical</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-industrial-muted" />
            <span className="font-semibold text-industrial-secondary">{maintCount}</span>
            <span className="text-industrial-muted text-[11px]">Maint</span>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-industrial-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CNC machine (e.g. CNC-03), component, alert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-industrial-bg border border-industrial-border rounded pl-9 pr-3 py-1.5 text-xs text-industrial-primary placeholder-industrial-muted focus:outline-none focus:border-industrial-active transition-colors"
          />
        </div>
      </form>

      {/* Right Action Items */}
      <div className="flex items-center gap-2.5">
        {/* Quick Theme Switcher Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-industrial-raised hover:bg-industrial-elevated border border-industrial-border rounded text-xs transition-colors shadow-industrial-sm"
          >
            <div
              className="w-3 h-3 rounded-full border border-industrial-border"
              style={{ backgroundColor: themeDef.colors.accent }}
            />
            <span className="font-semibold text-industrial-primary text-[11px] uppercase tracking-wider hidden sm:inline">
              {themeDef.name}
            </span>
            <ChevronDown className="w-3 h-3 text-industrial-muted" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-lg py-1.5 z-50 animate-fadeIn font-mono">
              <div className="px-3 py-1 text-[10px] text-industrial-muted font-bold uppercase tracking-wider border-b border-industrial-border mb-1">
                SELECT VISUAL THEME
              </div>
              {availableThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                    theme === t.id
                      ? 'bg-industrial-accent-soft text-industrial-accent font-semibold'
                      : 'text-industrial-secondary hover:text-industrial-primary hover:bg-industrial-raised'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-0.5">
                      {t.previewColors.slice(0, 3).map((c, i) => (
                        <span key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold leading-tight">{t.name}</div>
                      <div className="text-[9px] text-industrial-muted font-sans">{t.subtitle}</div>
                    </div>
                  </div>
                  {theme === t.id && <Check className="w-3.5 h-3.5 text-industrial-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={onToggleDemoPanel}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-industrial-accent-soft hover:bg-industrial-accent/25 text-industrial-accent border border-industrial-accent/40 rounded text-xs font-semibold shadow-industrial-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-industrial-accent" />
          <span className="hidden sm:inline">DEMO SCENARIOS</span>
        </button>

        {/* Alerts Bell Badge */}
        <button
          onClick={() => machineStore.setActiveView('alerts')}
          className="relative p-2 bg-industrial-raised hover:bg-industrial-elevated text-industrial-secondary hover:text-industrial-primary border border-industrial-border rounded transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-industrial-critical text-white text-[9px] font-bold rounded-full animate-bounce">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-industrial-bg border border-industrial-border rounded text-xs text-industrial-muted">
          <Clock className="w-3 h-3 text-industrial-muted" />
          <span className="text-[11px]">{timeStr}</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-industrial-border text-xs">
          <div
            className="w-7 h-7 rounded border border-industrial-border flex items-center justify-center font-bold text-[11px]"
            style={{ backgroundColor: themeDef.colors.accentSoft, color: themeDef.colors.accent }}
          >
            OP
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-industrial-primary leading-none text-[11px]">P. Raman</div>
            <div className="text-[9px] text-industrial-muted leading-none mt-1">Lead Reliability Eng</div>
          </div>
        </div>
      </div>
    </header>
  );
};

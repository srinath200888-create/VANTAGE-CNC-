import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ThemeId } from '../theme/types';
import {
  Settings,
  Palette,
  Sliders,
  Database,
  Shield,
  Bell,
  HardDrive,
  RefreshCw,
  Check,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="space-y-6 font-mono max-w-5xl">
      {/* Header */}
      <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
          <Settings className="w-4 h-4" />
          <span>PLANT CONFIGURATION & PLATFORM PARAMETERS</span>
        </div>
        <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
          System Settings & Visual Design Studio
        </h1>
      </div>

      {/* SECTION 1: APPEARANCE & THEME STUDIO */}
      <div className="p-5 bg-industrial-surface border border-industrial-border rounded-lg space-y-4 shadow-industrial-sm">
        <div className="flex items-center justify-between border-b border-industrial-border pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-industrial-accent" />
            <div>
              <h2 className="text-sm font-bold text-industrial-primary uppercase tracking-wider">
                APPEARANCE & RUNTIME DESIGN SYSTEM
              </h2>
              <p className="text-xs text-industrial-secondary font-sans mt-0.5">
                Switch runtime themes across black titanium, motorsport carbon, AI diagnostics, and precision light mode.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-industrial-muted uppercase font-semibold">
            ACTIVE: <strong className="text-industrial-accent">{theme.toUpperCase()}</strong>
          </span>
        </div>

        {/* 6 Theme Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {availableThemes.map((t) => {
            const isSelected = theme === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-industrial-accent-soft border-industrial-active ring-2 ring-industrial-active/50 shadow-industrial-md'
                    : 'bg-industrial-raised border-industrial-border hover:bg-industrial-elevated hover:border-industrial-border/80'
                }`}
              >
                <div>
                  {/* Theme Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-industrial-primary">{t.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-industrial-accent text-industrial-bg font-bold rounded text-[9px]">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {t.previewColors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full border border-industrial-border shadow-xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-industrial-accent mb-1">{t.subtitle}</div>
                  <p className="text-[11px] text-industrial-secondary font-sans leading-relaxed">
                    {t.tagline}
                  </p>
                </div>

                {/* Theme Palette Swatch Bar */}
                <div className="mt-4 pt-3 border-t border-industrial-border flex items-center justify-between text-[11px]">
                  <span className="text-industrial-muted font-sans">{t.isDark ? 'Dark Environment' : 'Light Cleanroom'}</span>
                  <div className="flex items-center gap-1 font-bold text-industrial-accent">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Check className="w-3 h-3" /> APPLIED
                      </span>
                    ) : (
                      <span className="text-[10px] text-industrial-muted hover:text-industrial-primary">SELECT</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ISO VIBRATION & ANOMALY TRIP SETTINGS */}
      <div className="p-5 bg-industrial-surface border border-industrial-border rounded-lg space-y-4 text-xs shadow-industrial-sm">
        <div className="flex items-center gap-2 text-industrial-primary font-bold border-b border-industrial-border pb-2">
          <Sliders className="w-4 h-4 text-industrial-accent" />
          <span>ISO 10816 VIBRATION TRIP LIMITS & ALARM THRESHOLDS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-industrial-secondary">Class II Spindle Warning Trip (mm/s RMS)</label>
            <input
              type="number"
              defaultValue={2.8}
              step={0.1}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
            />
          </div>

          <div className="space-y-1">
            <label className="text-industrial-secondary">Class II Spindle Critical Trip (mm/s RMS)</label>
            <input
              type="number"
              defaultValue={4.5}
              step={0.1}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
            />
          </div>

          <div className="space-y-1">
            <label className="text-industrial-secondary">Spindle Headstock Thermal Limit (°C)</label>
            <input
              type="number"
              defaultValue={58.0}
              step={0.5}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
            />
          </div>

          <div className="space-y-1">
            <label className="text-industrial-secondary">Cutting Tool Life VB Limit (%)</label>
            <input
              type="number"
              defaultValue={80}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: EDGE MQTT BROKER SETTINGS */}
      <div className="p-5 bg-industrial-surface border border-industrial-border rounded-lg space-y-4 text-xs shadow-industrial-sm">
        <div className="flex items-center gap-2 text-industrial-primary font-bold border-b border-industrial-border pb-2">
          <Database className="w-4 h-4 text-industrial-accent" />
          <span>MQTT & OPC-UA INGESTION BROKER</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-industrial-secondary">Broker Host URL</label>
            <input
              type="text"
              defaultValue="mqtt://edge-broker.plant-chennai.internal:1883"
              className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
            />
          </div>

          <div className="space-y-1">
            <label className="text-industrial-secondary">Telemetry Ingestion Frequency</label>
            <select
              defaultValue="1000"
              className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
            >
              <option value="100">10 Hz (100 ms) - High Frequency</option>
              <option value="500">2 Hz (500 ms) - Standard</option>
              <option value="1000">1 Hz (1,000 ms) - Nominal</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

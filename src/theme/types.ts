export type ThemeId = 'obsidian' | 'titanium' | 'carbon' | 'midnight' | 'copper' | 'arctic';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceRaised: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  borderActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  critical: string;
  criticalSoft: string;
  info: string;
  infoSoft: string;
  chartPrimary: string;
  chartSecondary: string;
  chartGrid: string;
  twinBg: number;
  twinGround: number;
  twinGridPrimary: number;
  twinGridSecondary: number;
  twinHighlight: number;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  tagline: string;
  isDark: boolean;
  previewColors: string[];
  colors: ThemeColors;
}

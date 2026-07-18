export type Appearance = "dark" | "light" | "black"

export interface ThemeColors {
  primary: string
  "primary-foreground": string
  background: string
  foreground: string
  card: string
  "card-foreground": string
  popover: string
  "popover-foreground": string
  secondary: string
  "secondary-foreground": string
  muted: string
  "muted-foreground": string
  accent: string
  "accent-foreground": string
  destructive: string
  border: string
  input: string
  ring: string
  "chart-1": string
  "chart-2": string
  "chart-3": string
  "chart-4": string
  "chart-5": string
  sidebar: string
  "sidebar-foreground": string
  "sidebar-primary": string
  "sidebar-primary-foreground": string
  "sidebar-accent": string
  "sidebar-accent-foreground": string
  "sidebar-border": string
  "sidebar-ring": string
}

export interface ColorTheme {
  id: string
  name: string
  preview: [string, string]
  colors: {
    dark: Partial<ThemeColors>
    light: Partial<ThemeColors>
    black: Partial<ThemeColors>
  }
}

export interface CustomThemeFile {
  name: string
  author: string
  appearance: Appearance
  colors: Partial<ThemeColors>
}

const BASE_DARK: ThemeColors = {
  primary: "oklch(0.86 0.23 142)",
  "primary-foreground": "oklch(0.18 0.04 150)",
  background: "oklch(0.17 0.012 160)",
  foreground: "oklch(0.96 0.005 160)",
  card: "oklch(0.21 0.013 160)",
  "card-foreground": "oklch(0.96 0.005 160)",
  popover: "oklch(0.2 0.013 160)",
  "popover-foreground": "oklch(0.96 0.005 160)",
  secondary: "oklch(0.26 0.014 160)",
  "secondary-foreground": "oklch(0.96 0.005 160)",
  muted: "oklch(0.24 0.012 160)",
  "muted-foreground": "oklch(0.66 0.01 160)",
  accent: "oklch(0.28 0.05 150)",
  "accent-foreground": "oklch(0.92 0.1 145)",
  destructive: "oklch(0.62 0.21 25)",
  border: "oklch(1 0 0 / 9%)",
  input: "oklch(1 0 0 / 12%)",
  ring: "oklch(0.86 0.23 142)",
  "chart-1": "oklch(0.86 0.23 142)",
  "chart-2": "oklch(0.7 0.15 195)",
  "chart-3": "oklch(0.75 0.16 85)",
  "chart-4": "oklch(0.65 0.18 30)",
  "chart-5": "oklch(0.6 0.12 260)",
  sidebar: "oklch(0.19 0.013 160)",
  "sidebar-foreground": "oklch(0.92 0.005 160)",
  "sidebar-primary": "oklch(0.86 0.23 142)",
  "sidebar-primary-foreground": "oklch(0.18 0.04 150)",
  "sidebar-accent": "oklch(0.26 0.02 150)",
  "sidebar-accent-foreground": "oklch(0.92 0.1 145)",
  "sidebar-border": "oklch(1 0 0 / 8%)",
  "sidebar-ring": "oklch(0.86 0.23 142)",
}

function makePrimaryVariant(hue: number, chroma: number = 0.23, lightness: number = 0.86): Partial<ThemeColors> {
  const p = `oklch(${lightness} ${chroma} ${hue})`
  const pFg = `oklch(0.18 0.04 ${hue})`
  return {
    primary: p,
    "primary-foreground": pFg,
    ring: p,
    "chart-1": p,
    "sidebar-primary": p,
    "sidebar-primary-foreground": pFg,
    "sidebar-ring": p,
    accent: `oklch(0.28 0.05 ${hue})`,
    "accent-foreground": `oklch(0.92 0.1 ${hue})`,
    "sidebar-accent": `oklch(0.26 0.02 ${hue})`,
    "sidebar-accent-foreground": `oklch(0.92 0.1 ${hue})`,
  }
}

export const BUILTIN_THEMES: ColorTheme[] = [
  {
    id: "default",
    name: "Default",
    preview: ["#22c55e", "#0a1a0f"],
    colors: {
      dark: {},
      light: {},
      black: {},
    },
  },
  {
    id: "purple",
    name: "Purple Galaxy",
    preview: ["#a855f7", "#1a0a2e"],
    colors: {
      dark: makePrimaryVariant(290, 0.22, 0.72),
      light: makePrimaryVariant(290, 0.22, 0.55),
      black: makePrimaryVariant(290, 0.22, 0.72),
    },
  },
  {
    id: "rose",
    name: "Rose",
    preview: ["#f43f5e", "#2a0a14"],
    colors: {
      dark: makePrimaryVariant(10, 0.22, 0.70),
      light: makePrimaryVariant(10, 0.22, 0.55),
      black: makePrimaryVariant(10, 0.22, 0.70),
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    preview: ["#10b981", "#0a2a1a"],
    colors: {
      dark: makePrimaryVariant(165, 0.19, 0.75),
      light: makePrimaryVariant(165, 0.19, 0.50),
      black: makePrimaryVariant(165, 0.19, 0.75),
    },
  },
  {
    id: "cyan",
    name: "Cyan",
    preview: ["#06b6d4", "#0a1a2a"],
    colors: {
      dark: makePrimaryVariant(200, 0.17, 0.78),
      light: makePrimaryVariant(200, 0.17, 0.50),
      black: makePrimaryVariant(200, 0.17, 0.78),
    },
  },
  {
    id: "amber",
    name: "Amber",
    preview: ["#f59e0b", "#2a1a0a"],
    colors: {
      dark: makePrimaryVariant(75, 0.20, 0.82),
      light: makePrimaryVariant(75, 0.20, 0.55),
      black: makePrimaryVariant(75, 0.20, 0.82),
    },
  },
]

export const BASE_LIGHT: ThemeColors = {
  primary: "oklch(0.55 0.20 142)",
  "primary-foreground": "oklch(0.98 0.005 160)",
  background: "oklch(0.98 0.002 160)",
  foreground: "oklch(0.15 0.01 160)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.15 0.01 160)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.15 0.01 160)",
  secondary: "oklch(0.94 0.006 160)",
  "secondary-foreground": "oklch(0.20 0.01 160)",
  muted: "oklch(0.93 0.005 160)",
  "muted-foreground": "oklch(0.50 0.01 160)",
  accent: "oklch(0.94 0.03 150)",
  "accent-foreground": "oklch(0.30 0.08 145)",
  destructive: "oklch(0.55 0.22 25)",
  border: "oklch(0 0 0 / 10%)",
  input: "oklch(0 0 0 / 12%)",
  ring: "oklch(0.55 0.20 142)",
  "chart-1": "oklch(0.55 0.20 142)",
  "chart-2": "oklch(0.55 0.15 195)",
  "chart-3": "oklch(0.60 0.16 85)",
  "chart-4": "oklch(0.55 0.18 30)",
  "chart-5": "oklch(0.50 0.12 260)",
  sidebar: "oklch(0.96 0.004 160)",
  "sidebar-foreground": "oklch(0.20 0.01 160)",
  "sidebar-primary": "oklch(0.55 0.20 142)",
  "sidebar-primary-foreground": "oklch(0.98 0.005 160)",
  "sidebar-accent": "oklch(0.94 0.02 150)",
  "sidebar-accent-foreground": "oklch(0.30 0.08 145)",
  "sidebar-border": "oklch(0 0 0 / 8%)",
  "sidebar-ring": "oklch(0.55 0.20 142)",
}

export const BASE_BLACK: ThemeColors = {
  ...BASE_DARK,
  background: "oklch(0 0 0)",
  card: "oklch(0.12 0.008 160)",
  popover: "oklch(0.10 0.008 160)",
  secondary: "oklch(0.18 0.010 160)",
  muted: "oklch(0.16 0.008 160)",
  sidebar: "oklch(0.08 0.006 160)",
  border: "oklch(1 0 0 / 6%)",
  input: "oklch(1 0 0 / 10%)",
  "sidebar-border": "oklch(1 0 0 / 5%)",
}

export function getBaseColors(appearance: Appearance): ThemeColors {
  switch (appearance) {
    case "light": return BASE_LIGHT
    case "black": return BASE_BLACK
    default: return BASE_DARK
  }
}

export function resolveTheme(themeId: string, appearance: Appearance, customThemes?: CustomThemeFile[]): ThemeColors {
  const base = getBaseColors(appearance)
  const builtin = BUILTIN_THEMES.find(t => t.id === themeId)
  if (builtin) {
    const overrides = builtin.colors[appearance] || {}
    return { ...base, ...overrides }
  }
  if (customThemes) {
    const custom = customThemes.find(t => t.name === themeId)
    if (custom) {
      return { ...base, ...custom.colors }
    }
  }
  return base
}

export function applyTheme(colors: ThemeColors) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--${key}`, value)
  }
}

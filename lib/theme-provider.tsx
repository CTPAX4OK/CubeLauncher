"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  type Appearance,
  type CustomThemeFile,
  BUILTIN_THEMES,
  resolveTheme,
  applyTheme,
} from "./themes"

interface ThemeContextValue {
  colorTheme: string
  appearance: Appearance
  customThemes: CustomThemeFile[]
  setColorTheme: (id: string) => void
  setAppearance: (mode: Appearance) => void
  addCustomTheme: (theme: CustomThemeFile) => void
  removeCustomTheme: (name: string) => void
  exportCurrentTheme: () => CustomThemeFile
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

function getAPI() {
  if (typeof window !== "undefined" && window.electronAPI) return window.electronAPI
  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState("default")
  const [appearance, setAppearanceState] = useState<Appearance>("dark")
  const [customThemes, setCustomThemes] = useState<CustomThemeFile[]>([])

  useEffect(() => {
    const api = getAPI()
    if (!api) return
    Promise.all([
      api.getColorTheme?.(),
      api.getAppearance?.(),
      api.getCustomThemes?.(),
    ]).then(([theme, app, customs]) => {
      if (theme) setColorThemeState(theme)
      if (app) setAppearanceState(app)
      if (customs) setCustomThemes(customs)
      const resolved = resolveTheme(theme || "default", app || "dark", customs || [])
      applyTheme(resolved)
      updateHtmlClass(app || "dark")
    })
  }, [])

  const updateHtmlClass = (mode: Appearance) => {
    const html = document.documentElement
    html.classList.remove("dark", "light", "black")
    html.classList.add(mode === "light" ? "light" : "dark")
    if (mode === "black") html.classList.add("black")
    html.style.colorScheme = mode === "light" ? "light" : "dark"
  }

  const setColorTheme = useCallback((id: string) => {
    setColorThemeState(id)
    const resolved = resolveTheme(id, appearance, customThemes)
    applyTheme(resolved)
    const api = getAPI()
    api?.setColorTheme?.(id)
  }, [appearance, customThemes])

  const setAppearance = useCallback((mode: Appearance) => {
    setAppearanceState(mode)
    updateHtmlClass(mode)
    const resolved = resolveTheme(colorTheme, mode, customThemes)
    applyTheme(resolved)
    const api = getAPI()
    api?.setAppearance?.(mode)
  }, [colorTheme, customThemes])

  const addCustomTheme = useCallback((theme: CustomThemeFile) => {
    setCustomThemes(prev => {
      const next = [...prev.filter(t => t.name !== theme.name), theme]
      const api = getAPI()
      api?.setCustomThemes?.(next)
      return next
    })
  }, [])

  const removeCustomTheme = useCallback((name: string) => {
    setCustomThemes(prev => {
      const next = prev.filter(t => t.name !== name)
      const api = getAPI()
      api?.setCustomThemes?.(next)
      return next
    })
  }, [])

  const exportCurrentTheme = useCallback((): CustomThemeFile => {
    const resolved = resolveTheme(colorTheme, appearance, customThemes)
    return {
      name: `Custom ${Date.now()}`,
      author: "User",
      appearance,
      colors: resolved,
    }
  }, [colorTheme, appearance, customThemes])

  return (
    <ThemeContext.Provider value={{
      colorTheme,
      appearance,
      customThemes,
      setColorTheme,
      setAppearance,
      addCustomTheme,
      removeCustomTheme,
      exportCurrentTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

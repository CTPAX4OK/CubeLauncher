import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronLeft, ChevronRight, Palette, Languages, Sun, FolderOpen, Monitor, Moon, Loader2 } from "lucide-react"
import { BUILTIN_THEMES, type Appearance, resolveTheme, applyTheme } from "@/lib/themes"
import { useTheme } from "@/lib/theme-provider"
import { useElectron } from "@/lib/use-electron"
import { cn } from "@/lib/utils"

const STEPS = ["theme", "language", "appearance", "folder"] as const
type Step = typeof STEPS[number]

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { t, i18n } = useTranslation()
  const { colorTheme, setColorTheme, appearance, setAppearance } = useTheme()
  const { selectFolder, setLanguage: setLanguageIPC } = useElectron()
  const [step, setStep] = useState(0)
  const [isSelecting, setIsSelecting] = useState(false)

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleFinish = async () => {
    setIsSelecting(true)
    const result = await selectFolder()
    setIsSelecting(false)
    if (result) {
      const api = (window as any).electronAPI
      await api?.setOnboardingComplete?.(true)
      onComplete()
    }
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    setLanguageIPC(lang)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/60 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <p className="mb-8 text-sm text-muted-foreground">
            {t('onboarding.customize', { defaultValue: 'Customize your experience' })}
          </p>

          {current === "theme" && (
            <div className="animate-card-enter rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {t('onboarding.color_theme', { defaultValue: 'Color Theme' })}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('onboarding.color_theme_desc', { defaultValue: 'Choose a color scheme for the application' })}
                  </p>
                </div>
                <Palette className="size-10 text-primary/60" />
              </div>
              <div className="mt-8 flex gap-4">
                {BUILTIN_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id)}
                    className={cn(
                      "group relative flex size-16 items-center justify-center rounded-xl border-2 transition-all duration-200",
                      colorTheme === theme.id
                        ? "border-primary shadow-lg shadow-primary/20 scale-110"
                        : "border-transparent hover:border-muted-foreground/30 hover:scale-105"
                    )}
                    style={{ background: theme.preview[1] }}
                    title={theme.name}
                  >
                    <div className="flex gap-1">
                      <div className="h-6 w-5 rounded-sm" style={{ background: theme.preview[0], opacity: 0.9 }} />
                      <div className="h-6 w-5 rounded-sm" style={{ background: theme.preview[0], opacity: 0.5 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {current === "language" && (
            <div className="animate-card-enter rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {t('onboarding.language', { defaultValue: 'Language' })}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('onboarding.language_desc', { defaultValue: 'Select your preferred language' })}
                  </p>
                </div>
                <Languages className="size-10 text-primary/60" />
              </div>
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { code: "en", label: "English", flag: "🇺🇸" },
                  { code: "ru", label: "Русский", flag: "🇷🇺" },
                  { code: "uk", label: "Українська", flag: "🇺🇦" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200",
                      i18n.language === lang.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-muted-foreground/30"
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-semibold">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {current === "appearance" && (
            <div className="animate-card-enter rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {t('onboarding.appearance', { defaultValue: 'Appearance' })}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('onboarding.appearance_desc', { defaultValue: 'Choose your preferred theme mode' })}
                  </p>
                </div>
                <Sun className="size-10 text-primary/60" />
              </div>
              <div className="mt-8 flex gap-4">
                {([
                  { mode: "dark" as Appearance, icon: Moon, label: t('onboarding.dark', { defaultValue: 'Dark' }) },
                  { mode: "light" as Appearance, icon: Sun, label: t('onboarding.light', { defaultValue: 'Light' }) },
                  { mode: "black" as Appearance, icon: Monitor, label: t('onboarding.black', { defaultValue: 'Black' }) },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setAppearance(mode)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-3 rounded-xl border-2 py-6 transition-all duration-200",
                      appearance === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-6" />
                    <span className="text-sm font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {current === "folder" && (
            <div className="animate-card-enter rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {t('onboarding.workspace', { defaultValue: 'Workspace' })}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('onboarding.workspace_desc', { defaultValue: 'Select the folder for your Minecraft server' })}
                  </p>
                </div>
                <FolderOpen className="size-10 text-primary/60" />
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleFinish}
                  disabled={isSelecting}
                  className="flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isSelecting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <FolderOpen className="size-5" />
                  )}
                  {t('onboarding.choose_folder', { defaultValue: 'Choose Folder' })}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
                step === 0
                  ? "text-transparent cursor-default"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <ChevronLeft className="size-4" />
              {t('onboarding.back', { defaultValue: 'Back' })}
            </button>

            {current !== "folder" && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t('onboarding.next', { defaultValue: 'Next' })}
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

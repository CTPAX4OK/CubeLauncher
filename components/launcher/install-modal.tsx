import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Folder, HardDrive, Check, X, Loader2 } from "lucide-react"
import { useElectron } from "@/lib/use-electron"
import { cn } from "@/lib/utils"

export function InstallModal({ 
  open, 
  onClose, 
  onConfirm, 
  itemName 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: (path: string, remember: boolean) => void;
  itemName: string;
}) {
  const { t } = useTranslation()
  const { recentServers, serverPath, selectFolder, rememberInstallPath } = useElectron()
  const [selectedPath, setSelectedPath] = useState<string>(serverPath || "")
  const [remember, setRemember] = useState(rememberInstallPath)
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    if (open) {
      if (rememberInstallPath && serverPath) {
        onConfirm(serverPath, true)
      } else {
        setSelectedPath(serverPath || (recentServers.length > 0 ? recentServers[0] : ""))
        setRemember(rememberInstallPath)
      }
    }
  }, [open, serverPath, recentServers, rememberInstallPath, onConfirm])

  if (!open || (rememberInstallPath && serverPath)) return null

  const handleSelectFolder = async () => {
    setIsSelecting(true)
    try {
      const path = await selectFolder()
      if (path) setSelectedPath(path)
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <h2 className="font-heading text-lg font-bold text-foreground">
          {t('store.install_title', { defaultValue: 'Install ' })}{itemName}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('store.install_desc', { defaultValue: 'Select the server folder where you want to install this.' })}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('store.target_folder', { defaultValue: 'Target Folder' })}
          </label>
          
          {recentServers.length > 0 && (
            <div className="flex flex-col gap-2">
              {recentServers.slice(0, 3).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPath(p)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    selectedPath === p
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <HardDrive className="size-4 shrink-0" />
                  <span className="truncate flex-1">{p}</span>
                  {selectedPath === p && <Check className="size-4 shrink-0 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSelectFolder}
            disabled={isSelecting}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary",
              recentServers.length === 0 ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-muted-foreground"
            )}
          >
            {isSelecting ? <Loader2 className="size-4 animate-spin" /> : <Folder className="size-4" />}
            {t('store.browse_other', { defaultValue: 'Browse other folder...' })}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 px-1">
          <input 
            type="checkbox" 
            id="remember-choice" 
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-4 rounded border-input bg-background text-primary focus:ring-primary"
          />
          <label htmlFor="remember-choice" className="text-sm text-foreground cursor-pointer select-none">
            {t('store.remember_choice', { defaultValue: 'Remember this choice and do not ask again' })}
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            {t('files.revert', { defaultValue: 'Cancel' })}
          </button>
          <button
            onClick={() => onConfirm(selectedPath, remember)}
            disabled={!selectedPath}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {t('store.install', { defaultValue: 'Install' })}
          </button>
        </div>
      </div>
    </div>
  )
}

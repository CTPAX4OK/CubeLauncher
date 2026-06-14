"use client"
import { useState, useEffect } from "react"
import { useElectron } from "@/lib/use-electron"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MemoryStick, Coffee, Network, SlidersHorizontal, Save } from "lucide-react"
function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof MemoryStick
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <h3 className="font-heading text-sm font-semibold text-card-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
export function SettingsPanel() {
  const { getRam, getSavedRam, setSavedRam, getJavaPath, setJavaPath, selectFile, saveConfig, readConfig } = useElectron()
  const [maxRam, setMaxRam] = useState(32)
  const [ram, setRam] = useState(4)
  const [javaExec, setJavaExec] = useState("")
  useEffect(() => {
    Promise.all([getRam(), getSavedRam(), getJavaPath?.()]).then(([mem, saved, path]) => {
      if (mem) {
        const gb = Math.floor(mem / (1024 * 1024 * 1024))
        setMaxRam(gb)
        setRam(saved || Math.min(4, gb))
      }
      if (path !== undefined && path !== null) setJavaExec(path)
    })
    if (readConfig) {
      readConfig().then((data) => {
        if (data) {
          if (data.serverPort !== undefined) setServerPort(data.serverPort)
          if (data.queryPort !== undefined) setQueryPort(data.queryPort)
          if (data.difficulty !== undefined) setDifficulty(data.difficulty)
          if (data.onlineMode !== undefined) setOnlineMode(data.onlineMode)
          if (data.pvp !== undefined) setPvp(data.pvp)
          if (data.whitelist !== undefined) setWhitelist(data.whitelist)
          if (data.commandBlocks !== undefined) setCommandBlocks(data.commandBlocks)
        }
      })
    }
  }, [getRam, getSavedRam, getJavaPath, readConfig])
  const handleBrowseJava = async () => {
    if (!selectFile) return
    const path = await selectFile()
    if (path) {
      setJavaExec(path)
      setJavaPath?.(path)
    }
  }
  const [java, setJava] = useState("21")
  const [serverPort, setServerPort] = useState("25565")
  const [queryPort, setQueryPort] = useState("25565")
  const [difficulty, setDifficulty] = useState("normal")
  const [onlineMode, setOnlineMode] = useState(true)
  const [pvp, setPvp] = useState(true)
  const [whitelist, setWhitelist] = useState(false)
  const [commandBlocks, setCommandBlocks] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const handleSave = async () => {
    setIsSaving(true)
    const configData = {
      serverPort,
      queryPort,
      difficulty,
      onlineMode,
      pvp,
      whitelist,
      commandBlocks
    }
    const success = await saveConfig(configData)
    setIsSaving(false)
    if (success) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {}
        <SectionCard icon={MemoryStick} title="RAM Allocation" desc="Memory reserved for the JVM heap">
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-3xl font-semibold tracking-tight text-primary">{ram} GB</span>
            <span className="text-xs text-muted-foreground">of {maxRam} GB available</span>
          </div>
          <Slider
            className="mt-4"
            value={[ram]}
            min={1}
            max={maxRam}
            step={1}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v
              setRam(val)
              setSavedRam(val)
            }}
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>1 GB</span>
            <span>{maxRam} GB</span>
          </div>
        </SectionCard>
        {}
        <SectionCard icon={Coffee} title="Java Runtime" desc="Select the Java executable used to launch the server">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={javaExec || "System Default (java)"}
              className="h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none cursor-default"
            />
            <button
              onClick={handleBrowseJava}
              className="whitespace-nowrap rounded-md bg-secondary px-4 h-10 text-sm font-medium transition-colors hover:bg-secondary/80 text-foreground"
            >
              Browse
            </button>
          </div>
          {javaExec && (
            <button 
              onClick={() => {
                setJavaExec("")
                setJavaPath?.("")
              }}
              className="mt-2 text-xs text-destructive hover:underline"
            >
              Reset to system default
            </button>
          )}
        </SectionCard>
      </div>
      {}
      <SectionCard icon={Network} title="Network" desc="Ports the server binds to for connections">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Server Port</label>
            <input
              value={serverPort}
              onChange={(e) => setServerPort(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Query Port</label>
            <input
              value={queryPort}
              onChange={(e) => setQueryPort(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </div>
      </SectionCard>
      {}
      <SectionCard icon={SlidersHorizontal} title="Server Rules" desc="Basic gameplay and security settings">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <div className="divide-y divide-border">
            <ToggleRow label="Online Mode" desc="Verify players against Mojang auth" checked={onlineMode} onChange={setOnlineMode} />
            <ToggleRow label="PvP" desc="Allow players to damage each other" checked={pvp} onChange={setPvp} />
          </div>
          <div className="divide-y divide-border">
            <ToggleRow label="Whitelist" desc="Only allow listed players to join" checked={whitelist} onChange={setWhitelist} />
            <ToggleRow label="Command Blocks" desc="Enable command block execution" checked={commandBlocks} onChange={setCommandBlocks} />
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {["peaceful", "easy", "normal", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  difficulty === d
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
      <div className="flex items-center justify-end gap-4">
        {showToast && (
          <span className="text-sm font-medium text-emerald-500 animate-in fade-in duration-300">
            Saved successfully!
          </span>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? <Coffee className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  )
}

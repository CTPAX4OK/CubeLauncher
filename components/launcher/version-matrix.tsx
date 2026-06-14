"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useElectron } from "@/lib/use-electron"
import { CORES, VERSIONS, type CoreId } from "@/lib/launcher-data"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Server, Cpu, HardDrive, Activity, Plus, Search, Check, Minus, Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
const CORE_ACCENT: Record<CoreId, string> = {
  vanilla: "text-muted-foreground",
  paper: "text-chart-3",
  forge: "text-chart-4",
  fabric: "text-chart-2",
}
const DOWNLOADABLE_CORES = new Set<CoreId>(["paper", "fabric"])
export function VersionMatrix() {
  const [query, setQuery] = useState("")
  const rows = VERSIONS.filter((v) => v.version.includes(query.trim()))
  const { downloadCore, downloads, isElectron, serverPath, onServerStats } = useElectron()
  const [stats, setStats] = useState({
    activeServers: 0,
    ramUsed: 0,
    tps: "0.0",
    cpu: "0.0"
  })
  useEffect(() => {
    if (!onServerStats) return
    const unsubscribe = onServerStats((data: any) => {
      setStats(data)
    })
    return () => unsubscribe()
  }, [onServerStats])
  const handleCreate = async (coreId: CoreId, mcVersion: string) => {
    if (!DOWNLOADABLE_CORES.has(coreId)) {
      return
    }
    if (!isElectron) {
      console.warn("Not running in Electron — download skipped")
      return
    }
    if (!serverPath) {
      console.warn("No server directory configured")
      return
    }
    await downloadCore(coreId as "paper" | "fabric", mcVersion)
  }
  const dynamicStats = [
    { label: "CPU Usage", value: stats.activeServers > 0 ? `${stats.cpu}%` : "—", sub: stats.activeServers > 0 ? "Process load" : "Server off", icon: Activity },
    { label: "Total RAM Used", value: stats.ramUsed > 0 ? `${stats.ramUsed} GB` : "—", sub: stats.ramUsed > 0 ? "Allocated to JVM" : "Not allocated", icon: HardDrive },
    { label: "Avg. Tick Rate", value: stats.activeServers > 0 ? stats.tps : "—", sub: stats.activeServers > 0 ? "TPS (20.0 max)" : "No servers", icon: Server },
    { label: "Java Runtime", value: "21", sub: "Temurin LTS", icon: Cpu },
  ]
  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dynamicStats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <Icon className={cn("size-4", s.value !== "—" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <p className={cn("mt-2 font-heading text-2xl font-semibold tracking-tight", s.value !== "—" ? "text-primary" : "text-card-foreground")}>
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          )
        })}
      </div>
      {}
      <div id="quick-create">
        <h2 className="mb-3 font-heading text-sm font-semibold text-foreground">Quick Create</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CORES.map((core) => {
            const canDownload = DOWNLOADABLE_CORES.has(core.id)
            const dlKey = Object.keys(downloads).find(
              (k) => k.startsWith(`core-${core.id}-`) && downloads[k].status === "downloading"
            )
            const isDownloading = !!dlKey
            return (
              <button
                key={core.id}
                disabled={!canDownload || isDownloading}
                onClick={() => {
                  const latest = VERSIONS.find((v) => v.latest && v.cores[core.id].available)
                  if (latest) handleCreate(core.id, latest.version)
                }}
                className={cn(
                  "group flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80",
                  (!canDownload || isDownloading) && "opacity-60 cursor-not-allowed hover:border-border hover:bg-card"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={cn("flex size-9 items-center justify-center rounded-lg bg-secondary", CORE_ACCENT[core.id])}>
                    <Zap className="size-4" />
                  </span>
                  {isDownloading ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <Plus className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  )}
                </div>
                <p className="mt-3 font-heading text-sm font-semibold text-card-foreground">{core.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isDownloading ? "Downloading…" : !canDownload ? "Coming soon" : core.tagline}
                </p>
              </button>
            )
          })}
        </div>
      </div>
      {}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-sm font-semibold text-card-foreground">Version Matrix</h2>
            <p className="text-xs text-muted-foreground">All Minecraft versions mapped to server cores</p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search version…"
              className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </div>
        {}
        <div className="grid grid-cols-[1.2fr_repeat(4,1fr)] gap-2 border-b border-border px-4 py-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Version</span>
          {CORES.map((c) => (
            <span key={c.id} className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {c.name}
            </span>
          ))}
        </div>
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div id={`version-${row.version}`} key={row.version} className="grid grid-cols-[1.2fr_repeat(4,1fr)] items-center gap-2 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-foreground">{row.version}</span>
                {row.latest && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Latest
                  </span>
                )}
              </div>
              {CORES.map((core) => {
                const cell = row.cores[core.id]
                if (!cell.available) {
                  return (
                    <div key={core.id} className="flex justify-center">
                      <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground/40">
                        <Minus className="size-4" />
                      </span>
                    </div>
                  )
                }
                const dlId = `core-${core.id}-${row.version}`
                const dl = downloads[dlId]
                const isActive = dl?.status === "downloading"
                const isDone = dl?.status === "done"
                const isError = dl?.status === "error"
                const canDl = DOWNLOADABLE_CORES.has(core.id)
                return (
                  <div key={core.id} className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            disabled={!canDl || isActive}
                            onClick={() => handleCreate(core.id, row.version)}
                            className={cn(
                              "group flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 transition-colors",
                              canDl && !isActive && "hover:border-primary/60 hover:bg-primary/10",
                              isActive && "border-primary/40 bg-primary/5",
                              isDone && "border-green-500/40 bg-green-500/5",
                              isError && "border-red-500/40 bg-red-500/5",
                              !canDl && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isActive ? (
                              <Loader2 className="size-3.5 animate-spin text-primary" />
                            ) : isDone ? (
                              <CheckCircle2 className="size-3.5 text-green-500" />
                            ) : isError ? (
                              <AlertCircle className="size-3.5 text-red-500" />
                            ) : (
                              <Check className={cn("size-3.5", CORE_ACCENT[core.id])} />
                            )}
                            <span className="text-[11px] font-medium text-foreground">
                              {isActive
                                ? `${dl.percent}%`
                                : isDone
                                  ? "Done"
                                  : isError
                                    ? "Error"
                                    : cell.build ?? "Ready"}
                            </span>
                          </button>
                        }
                      />
                      <TooltipContent>
                        {isActive
                          ? `Downloading ${core.name} ${row.version}…`
                          : isDone
                            ? `${core.name} ${row.version} installed!`
                            : isError
                              ? `Failed: ${dl?.error}`
                              : canDl
                                ? `Create ${core.name} ${row.version}`
                                : `${core.name} download not supported yet`}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              })}
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No versions match "{query}".</p>
          )}
        </div>
      </div>
    </div>
  )
}

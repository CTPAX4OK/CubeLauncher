"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useElectron } from "@/lib/use-electron"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Boxes, LayoutGrid, Store, FolderTree, Settings, Cpu, Loader2, FolderOpen, Play, Server, Terminal, Square, Check } from "lucide-react"
export type View = "dashboard" | "store" | "files" | "settings" | "console"
const NAV: { id: View; label: string; icon: any; hint: string }[] = [
  { id: "dashboard", label: "Version Matrix", icon: LayoutGrid, hint: "Create servers" },
  { id: "store", label: "Store", icon: Store, hint: "Plugins & mods" },
  { id: "files", label: "File Explorer", icon: FolderTree, hint: "Browse & edit" },
  { id: "settings", label: "Settings", icon: Settings, hint: "Configure" },
  { id: "console", label: "Console", icon: Terminal, hint: "View logs" },
]
export function Sidebar({
  view,
  onViewChange,
}: {
  view: View
  onViewChange: (v: View) => void
}) {
  const { serverPath, downloads, selectFolder, startServer, stopServer } = useElectron()
  const activeDownload = Object.values(downloads).find((d) => d.status === "downloading" || d.status === "finishing")
  const activeServers = Object.values(downloads).filter((d) => d.status === "done" && d.id.startsWith("core-"))
  const [selectedJar, setSelectedJar] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  useEffect(() => {
    if (activeServers.length > 0 && !selectedJar) {
      setSelectedJar(activeServers[0].fileName)
    }
  }, [activeServers, selectedJar])
  const handleStart = async () => {
    if (!selectedJar || !startServer) return
    setIsRunning(true)
    const success = await startServer(selectedJar)
    if (success) {
      onViewChange("console")
    } else {
      setIsRunning(false)
    }
  }
  const handleStop = async () => {
    if (!stopServer) return
    await stopServer()
    setIsRunning(false)
  }
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-heading text-sm font-semibold text-sidebar-foreground">CubeForge</p>
          <p className="text-xs text-muted-foreground">Server Launcher</p>
        </div>
      </div>
      {}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="px-2 pt-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Manage
        </p>
        {NAV.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("size-[18px]", active && "text-primary")} />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {active && <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />}
            </button>
          )
        })}
      </nav>
      {}
      {activeDownload ? (
        <div className="m-3 rounded-xl border border-sidebar-border bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {activeDownload.status === "finishing" ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Done!</span>
                </>
              ) : (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Downloading…
                </>
              )}
            </span>
            <span className="text-xs font-semibold tabular-nums text-primary">
              {activeDownload.percent}%
            </span>
          </div>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">{activeDownload.fileName}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${activeDownload.percent}%` }}
            />
          </div>
        </div>
      ) : activeServers.length > 0 ? (
        <div className="m-3 rounded-xl border border-sidebar-border bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Server className="size-3.5" /> Active Server
            </span>
          </div>
          {activeServers.length > 1 ? (
            <Select value={selectedJar} onValueChange={setSelectedJar}>
              <SelectTrigger className="mt-2 h-7 w-full text-xs">
                <SelectValue placeholder="Select jar..." />
              </SelectTrigger>
              <SelectContent>
                {activeServers.map((s) => (
                  <SelectItem key={s.fileName} value={s.fileName} className="text-xs">
                    {s.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="mt-1.5 truncate text-xs font-semibold text-foreground" title={activeServers[0].fileName}>
              {activeServers[0].fileName}
            </p>
          )}
          {isRunning ? (
            <button
              onClick={handleStop}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              <Square className="size-3.5" fill="currentColor" />
              Stop Server
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Play className="size-3.5" fill="currentColor" />
              Start Server
            </button>
          )}
        </div>
      ) : serverPath ? (
        <div className="m-3 rounded-xl border border-sidebar-border bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Cpu className="size-3.5" /> Workspace
            </span>
          </div>
          <p className="mt-1.5 truncate text-xs text-muted-foreground" title={serverPath}>
            {serverPath}
          </p>
          <button
            onClick={selectFolder}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FolderOpen className="size-3.5" />
            Change Folder
          </button>
        </div>
      ) : null}
    </aside>
  )
}

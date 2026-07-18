"use client"
import { useState, useEffect, useRef } from "react"
import { useTranslation } from 'react-i18next'
import { useElectron } from "@/lib/use-electron"
import { Terminal, Send } from "lucide-react"
export function Console() {
  const { getLogs, onServerLog, sendCommand, onServerStats, getSavedRam } = useElectron()
  const { t } = useTranslation()
  const [logsByServer, setLogsByServer] = useState<Record<string, string[]>>({})
  const [cmd, setCmd] = useState("")
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [serverIds, setServerIds] = useState<string[]>([])
  const [serverDetails, setServerDetails] = useState<Record<string, { cpu: number, ramUsed: number }>>({})
  const [allocatedRam, setAllocatedRam] = useState(4)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (getSavedRam) getSavedRam().then(r => r && setAllocatedRam(r))
  }, [getSavedRam])

  useEffect(() => {
    if (!onServerStats) return
    const unsub = onServerStats((data) => {
      setServerIds(data.activeServers)
      if (data.details) setServerDetails(data.details)
      setLogsByServer(prev => {
        const next = { ...prev }
        let changed = false
        data.activeServers.forEach(id => {
          if (!next[id]) { next[id] = []; changed = true }
        })
        return changed ? next : prev
      })
    })
    return () => unsub()
  }, [onServerStats])

  useEffect(() => {
    if (serverIds.length > 0 && (!activeTab || !serverIds.includes(activeTab))) {
      setActiveTab(serverIds[0])
    } else if (serverIds.length === 0) {
      setActiveTab(null)
    }
  }, [serverIds, activeTab])

  useEffect(() => {
    if (!activeTab || !getLogs) return
    getLogs(activeTab).then((buffer) => {
      if (buffer) {
        setLogsByServer(prev => ({ ...prev, [activeTab]: buffer }))
      }
    })
  }, [activeTab, getLogs])

  useEffect(() => {
    if (!onServerLog) return
    const unsubscribe = onServerLog(({ serverId, log }) => {
      setLogsByServer((prev) => {
        const next = prev[serverId] ? [...prev[serverId], log] : [log]
        if (next.length > 500) return { ...prev, [serverId]: next.slice(-500) }
        return { ...prev, [serverId]: next }
      })
    })
    return () => unsubscribe()
  }, [onServerLog])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logsByServer, activeTab])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cmd.trim() || !sendCommand || !activeTab) return
    await sendCommand(activeTab, cmd.trim())
    setCmd("")
  }
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">{t('console.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('console.subtitle')}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-[#0C0C0C] p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground overflow-x-auto">
          <Terminal className="size-4 shrink-0" />
          {serverIds.length === 0 ? (
            <span>{t('console.terminal')}</span>
          ) : (
            <div className="flex gap-2">
              {serverIds.map(id => {
                const details = serverDetails[id]
                const isOverloaded = details && (details.cpu > 85 || details.ramUsed > (allocatedRam * 1024 * 1024 * 1024 * 0.9))
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-3 py-1 rounded-md transition-colors ${activeTab === id ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'} ${isOverloaded ? '!text-red-500 font-bold bg-red-500/10 hover:bg-red-500/20 animate-pulse' : ''}`}
                  >
                    {id}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap pt-4 font-mono text-[13px] leading-relaxed text-zinc-300">
          {!activeTab ? (
            <span className="italic text-zinc-600">{t('console.waiting')}</span>
          ) : (
            (logsByServer[activeTab] || []).map((log, i) => (
              <span key={i}>{log}</span>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder={t('console.send_command')}
          className="h-10 w-full rounded-lg border border-input bg-card pl-4 pr-12 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          disabled={!cmd.trim()}
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}

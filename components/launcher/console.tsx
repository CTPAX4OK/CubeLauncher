"use client"
import { useState, useEffect, useRef } from "react"
import { useElectron } from "@/lib/use-electron"
import { Terminal, Send } from "lucide-react"
export function Console() {
  const { getLogs, onServerLog, sendCommand } = useElectron()
  const [logs, setLogs] = useState<string[]>([])
  const [cmd, setCmd] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (getLogs) {
      getLogs().then((buffer) => {
        if (buffer && buffer.length > 0) {
          setLogs(buffer)
        }
      })
    }
  }, [getLogs])
  useEffect(() => {
    if (!onServerLog) return
    const unsubscribe = onServerLog((data) => {
      setLogs((prev) => {
        const next = [...prev, data]
        if (next.length > 500) return next.slice(-500)
        return next
      })
    })
    return () => unsubscribe()
  }, [onServerLog])
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cmd.trim() || !sendCommand) return
    await sendCommand(cmd.trim())
    setCmd("")
  }
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">Server Console</h2>
        <p className="text-sm text-muted-foreground">Live output and command input</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-[#0C0C0C] p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Terminal className="size-4" />
          Terminal
        </div>
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap pt-4 font-mono text-[13px] leading-relaxed text-zinc-300">
          {logs.length === 0 ? (
            <span className="italic text-zinc-600">Waiting for server to start...</span>
          ) : (
            logs.map((log, i) => (
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
          placeholder="Enter a command (e.g. op player)..."
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

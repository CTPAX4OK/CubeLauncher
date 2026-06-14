"use client"
import { useState, useEffect } from "react"
import { useElectron } from "@/lib/use-electron"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AlertTriangle, Download } from "lucide-react"
export function SystemAlert() {
  const { onJavaError, onJavaFallback } = useElectron()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"version" | "fallback">("version")
  const [detected, setDetected] = useState("Unknown")
  const [required, setRequired] = useState(21)
  const [fallbackPath, setFallbackPath] = useState("")
  useEffect(() => {
    if (!onJavaError) return
    const unsubscribe = onJavaError((data) => {
      setDetected(data.detected)
      setRequired(data.required)
      setMode("version")
      setOpen(true)
    })
    return () => unsubscribe()
  }, [onJavaError])
  useEffect(() => {
    if (!onJavaFallback) return
    const unsubscribe = onJavaFallback((path) => {
      setFallbackPath(path)
      setMode("fallback")
      setOpen(true)
    })
    return () => unsubscribe()
  }, [onJavaFallback])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            {mode === "version" ? "Java Version Incompatible" : "Invalid Java Path"}
          </DialogTitle>
          <DialogDescription className="pt-3 text-sm leading-relaxed text-muted-foreground">
            {mode === "version" ? (
              <>
                Your system's Java version is too old to run this Minecraft core, which will cause an <span className="font-mono text-[11px] text-foreground">UnsupportedClassVersionError</span>.
                <br />
                <br />
                <span className="block rounded-md border border-border bg-muted/50 p-3">
                  Detected: <strong className="text-foreground">{detected}</strong>
                  <br />
                  Required: <strong className="text-foreground">Java {required}</strong> or newer
                </span>
              </>
            ) : (
              <>
                The custom Java executable you selected could not be found or is invalid. 
                <br />
                <br />
                <span className="block rounded-md border border-border bg-muted/50 p-3 italic break-all">
                  Path: <strong className="text-foreground font-mono text-[11px]">{fallbackPath}</strong>
                </span>
                <br />
                The server launcher has automatically fallen back to the system default <span className="font-mono text-[11px] text-foreground">java</span> command. Please update your configuration in Settings.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2">
          <button
            onClick={() => setOpen(false)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {mode === "version" ? "Cancel" : "Acknowledge"}
          </button>
          {mode === "version" && (
            <button
              onClick={() => {
                window.open(`https://adoptium.net/temurin/releases/?version=${required}`, "_blank")
                setOpen(false)
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="size-4" />
              Download JDK {required}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

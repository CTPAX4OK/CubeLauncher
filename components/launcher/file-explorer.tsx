"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useElectron } from "@/lib/use-electron"
import { type FileNode } from "@/lib/launcher-data"
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  Archive,
  ChevronRight,
  Save,
  RotateCcw,
} from "lucide-react"
function fileIcon(node: FileNode) {
  if (node.type === "folder") return Folder
  switch (node.ext) {
    case "yml":
    case "json":
    case "properties":
      return FileCode
    case "jar":
    case "gz":
      return Archive
    case "txt":
    case "log":
    case "dat":
      return FileText
    default:
      return File
  }
}
function TreeItem({
  node,
  depth,
  selected,
  onSelect,
  path = "",
}: {
  node: FileNode
  depth: number
  selected: string
  onSelect: (name: string) => void
  path?: string
}) {
  const [open, setOpen] = useState(depth === 0 && node.name === "plugins")
  const isFolder = node.type === "folder"
  const Icon = isFolder ? (open ? FolderOpen : Folder) : fileIcon(node)
  const fullPath = path ? `${path}/${node.name}` : node.name
  const active = selected === fullPath && !isFolder
  return (
    <div>
      <button
        onClick={() => (isFolder ? setOpen((v) => !v) : onSelect(fullPath))}
        style={{ paddingLeft: depth * 14 + 8 }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-sm transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        )}
      >
        {isFolder ? (
          <ChevronRight className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-90")} />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Icon className={cn("size-4 shrink-0", isFolder ? "text-chart-3" : active ? "text-primary" : "")} />
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && open && node.children && (
        <div>
          {node.children.length === 0 ? (
            <p style={{ paddingLeft: (depth + 1) * 14 + 22 }} className="py-1 text-xs text-muted-foreground/60">
              empty
            </p>
          ) : (
            node.children.map((child) => (
              <TreeItem key={child.name} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} path={fullPath} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
export function FileExplorer() {
  const { readWorkspace, readFile, saveFile, serverPath } = useElectron()
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [dirty, setDirty] = useState(false)
  const [tree, setTree] = useState<FileNode[]>([])
  useEffect(() => {
    readWorkspace().then(setTree)
  }, [readWorkspace, serverPath])
  useEffect(() => {
    if (selected) {
      readFile(selected).then(c => {
        setContent(c ?? "")
        setDirty(false)
      })
    } else {
      setContent("")
    }
  }, [selected, readFile])
  const handleSave = async () => {
    if (!selected) return
    await saveFile(selected, content)
    setDirty(false)
  }
  const handleRevert = async () => {
    if (!selected) return
    const c = await readFile(selected)
    setContent(c ?? "")
    setDirty(false)
  }
  const lines = content.split("\n")
  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {}
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-heading text-sm font-semibold text-card-foreground">Files</p>
          <span className="truncate rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground max-w-[140px]" title={serverPath || ""}>
            {serverPath ? serverPath.split(/[\\/]/).pop() : "No Workspace"}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {tree.map((node) => (
            <TreeItem key={node.name} node={node} depth={0} selected={selected || ""} onSelect={(n) => { setSelected(n); setDirty(false) }} />
          ))}
          {tree.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">Workspace is empty or not selected.</p>
          )}
        </div>
      </div>
      {}
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FileCode className="size-4 text-primary" />
            <span className="font-mono text-sm text-foreground">{selected || "No file selected"}</span>
            {dirty && <span className="size-1.5 rounded-full bg-primary" aria-label="Unsaved changes" />}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevert}
              disabled={!selected}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" /> Revert
            </button>
            <button
              onClick={handleSave}
              disabled={!selected}
              className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="size-3.5" /> Save
            </button>
          </div>
        </div>
        {}
        <div className="relative flex flex-1 overflow-hidden font-mono text-sm">
          <div
            aria-hidden
            className="select-none border-r border-border bg-secondary/30 px-3 py-3 text-right text-muted-foreground/60"
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setDirty(true) }}
            spellCheck={false}
            disabled={!selected}
            className="flex-1 resize-none bg-transparent px-4 py-3 leading-6 text-foreground outline-none disabled:opacity-50"
          />
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>{selected ? `${lines.length} lines` : ""}</span>
          <span className="font-mono">UTF-8</span>
        </div>
      </div>
    </div>
  )
}

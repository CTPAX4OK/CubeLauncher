export interface DownloadProgress {
  id: string;
  percent: number;
  fileName: string;
}
export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}
export interface StoreSearchOpts {
  query: string;
  coreType: 'paper' | 'fabric' | 'forge';
  mcVersion?: string;
  limit?: number;
  offset?: number;
}
export interface StoreHit {
  id: string;
  slug: string;
  name: string;
  author: string;
  description: string;
  downloads: number;
  iconUrl: string | null;
  categories: string[];
  projectType: string;
}
export interface StoreSearchResult {
  hits: StoreHit[];
  totalHits: number;
  error?: string;
}
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  ext?: string;
  children?: FileNode[];
}
export interface ElectronAPI {
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  selectFolder: () => Promise<string | null>;
  selectFile: () => Promise<string | null>;
  getServerPath: () => Promise<string | null>;
  setServerPath: (dirPath: string) => Promise<void>;
  saveConfig: (data: any) => Promise<boolean>;
  readConfig: () => Promise<any>;
  checkLocalFiles: () => Promise<string[]>;
  getRam: () => Promise<number>;
  getSavedRam: () => Promise<number>;
  setSavedRam: (ramGb: number) => Promise<void>;
  getJavaPath: () => Promise<string>;
  setJavaPath: (execPath: string) => Promise<void>;
  startServer: (jarName: string) => Promise<boolean>;
  stopServer: () => Promise<boolean>;
  sendCommand: (cmd: string) => Promise<boolean>;
  onServerLog: (callback: (data: string) => void) => () => void;
  getLogs: () => Promise<string[]>;
  onJavaError: (callback: (data: { detected: string, required: number }) => void) => () => void;
  onJavaFallback: (callback: (data: string) => void) => () => void;
  onServerStats: (callback: (data: { activeServers: number, ramUsed: number, tps: string }) => void) => () => void;
  readWorkspace: () => Promise<FileNode[]>;
  readFile: (filePath: string) => Promise<string>;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
  downloadCore: (coreType: 'paper' | 'fabric', mcVersion: string) => Promise<DownloadResult>;
  searchModrinth: (opts: SearchOptions) => Promise<SearchResult>;
  downloadPlugin: (projectId: string, coreType: string, mcVersion: string) => Promise<DownloadResult>;
  checkInstalled: (fileName: string, coreType: string) => Promise<boolean>;
  onDownloadProgress: (callback: (data: { id: string; percent: number; fileName: string }) => void) => () => void;
  onDownloadComplete: (callback: (id: string) => void) => () => void;
}
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

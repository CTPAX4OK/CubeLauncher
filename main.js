const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, exec } = require('child_process');
const util = require('util');
const pidusage = require('pidusage');
const isDev = require('electron-is-dev');
const execPromise = util.promisify(exec);
let serverProcess = null;
const logBuffer = [];
function sendLog(data) {
  const text = data.toString();
  logBuffer.push(text);
  if (logBuffer.length > 500) {
    logBuffer.shift();
  }
  const window = BrowserWindow.getAllWindows()[0];
  if (window && !window.isDestroyed()) {
    window.webContents.send('server-log', text);
  }
}
setInterval(async () => {
  const window = BrowserWindow.getAllWindows()[0];
  if (window && !window.isDestroyed()) {
    let cpuPct = 0;
    let ramBytes = 0;
    if (serverProcess && serverProcess.pid) {
      try {
        const stats = await pidusage(serverProcess.pid);
        cpuPct = stats.cpu;
        ramBytes = stats.memory;
      } catch (err) {
      }
    }
    const stats = {
      activeServers: serverProcess ? 1 : 0,
      cpu: serverProcess ? cpuPct.toFixed(1) : "0.0",
      ramUsed: serverProcess ? (ramBytes / 1024 / 1024 / 1024).toFixed(2) : 0,
      tps: serverProcess ? (19.8 + Math.random() * 0.2).toFixed(1) : "0.0",
    };
    window.webContents.send('server-stats', stats);
  }
}, 2000);
const {
  getPaperDownload,
  getFabricDownload,
  downloadFile,
  searchModrinth,
  getModrinthDownload,
} = require('./electron/api');
let store;
async function getStore() {
  if (store) return store;
  const Store = (await import('electron-store')).default;
  store = new Store({
    name: 'cubelauncher-config',
    defaults: {
      serverPath: null,   
    },
  });
  return store;
}
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron', 'preload.js'),
    },
  });
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  }
}
function sendProgress(id, percent, fileName) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('download:progress', { id, percent, fileName });
  }
}
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select your Minecraft server directory',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const selectedPath = result.filePaths[0];
  const s = await getStore();
  s.set('serverPath', selectedPath);
  return selectedPath;
});
ipcMain.handle('dialog:selectFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Java Executable',
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe'] }]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});
ipcMain.handle('config:getServerPath', async () => {
  const s = await getStore();
  return s.get('serverPath') ?? null;
});
ipcMain.handle('config:setServerPath', async (_event, dirPath) => {
  const s = await getStore();
  s.set('serverPath', dirPath);
});
ipcMain.handle('config:setRam', async (_event, ramGb) => {
  const s = await getStore();
  s.set('allocatedRam', ramGb);
});
ipcMain.handle('config:getRam', async () => {
  const s = await getStore();
  return s.get('allocatedRam') || 4;
});
ipcMain.handle('config:getJavaPath', async () => {
  const s = await getStore();
  return s.get('javaPath') || '';
});
ipcMain.handle('config:setJavaPath', async (_event, execPath) => {
  const s = await getStore();
  s.set('javaPath', execPath);
});
ipcMain.handle('config:saveFile', async (_event, configData) => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) throw new Error('No server path set');
    const configPath = path.join(serverDir, 'cubelauncher.json');
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[config:saveFile]', err);
    return false;
  }
});
ipcMain.handle('config:readFile', async () => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) return null;
    const configPath = path.join(serverDir, 'cubelauncher.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.error('[config:readFile]', err);
    return null;
  }
});
ipcMain.handle('get-logs', () => {
  return logBuffer;
});
async function getJavaExecutable() {
  const s = await getStore();
  let javaPath = s.get('javaPath');
  if (javaPath) {
    javaPath = javaPath.replace(/^["']|["']$/g, '');
    if (fs.existsSync(javaPath)) {
      return javaPath;
    } else {
      const window = BrowserWindow.getAllWindows()[0];
      if (window && !window.isDestroyed()) {
        window.webContents.send('java-fallback', javaPath);
      }
    }
  }
  return 'java';
}
async function checkJavaVersion() {
  try {
    const javaExec = await getJavaExecutable();
    const cmd = javaExec.includes(' ') ? `"${javaExec}" -version` : `${javaExec} -version`;
    const { stderr } = await execPromise(cmd);
    const match = stderr.match(/version "([^"]+)"/);
    if (!match) return { detected: "Unknown", isValid: true };
    const versionStr = match[1];
    let major = 0;
    if (versionStr.startsWith('1.')) {
      major = parseInt(versionStr.split('.')[1], 10);
    } else {
      major = parseInt(versionStr.split('.')[0], 10);
    }
    return { detected: versionStr, isValid: major >= 21, javaExec };
  } catch (err) {
    return { detected: "Not Found", isValid: false, javaExec: 'java' };
  }
}
ipcMain.handle('server:start', async (event, jarName) => {
  try {
    const javaCheck = await checkJavaVersion();
    if (!javaCheck.isValid) {
      const window = BrowserWindow.getAllWindows()[0];
      if (window && !window.isDestroyed()) {
        window.webContents.send('java-error', { detected: javaCheck.detected, required: 21 });
      }
      return false;
    }
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) throw new Error('No server path set');
    const allocatedRam = s.get('allocatedRam') || 4;
    const eulaPath = path.join(serverDir, 'eula.txt');
    fs.writeFileSync(eulaPath, 'eula=true\n', 'utf-8');
    if (serverProcess) {
      throw new Error('Server is already running.');
    }
    const jarPath = path.join(serverDir, jarName);
    if (!fs.existsSync(jarPath)) {
      throw new Error(`Jar file not found: ${jarPath}`);
    }
    const javaExec = javaCheck.javaExec;
    serverProcess = spawn(javaExec, ['-Xmx' + allocatedRam + 'G', '-jar', jarName, 'nogui'], {
      cwd: serverDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    serverProcess.stdout.on('data', sendLog);
    serverProcess.stderr.on('data', sendLog);
    serverProcess.on('close', (code) => {
      sendLog(`\n[System] Server process exited with code ${code}\n`);
      serverProcess = null;
    });
    serverProcess.on('error', (err) => {
      sendLog(`\n[System Error] Failed to start server: ${err.message}\n`);
      serverProcess = null;
    });
    return true;
  } catch (err) {
    console.error('[server:start]', err);
    sendLog(`\n[System Error] Failed to start server: ${err.message}\n`);
    throw err;
  }
});
ipcMain.handle('server:stop', async () => {
  if (serverProcess) {
    serverProcess.kill();
    return true;
  }
  return false;
});
ipcMain.handle('server:command', async (_event, cmd) => {
  if (serverProcess && serverProcess.stdin) {
    serverProcess.stdin.write(cmd + '\n');
    return true;
  }
  return false;
});
ipcMain.handle('fs:checkLocalFiles', async () => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir || !fs.existsSync(serverDir)) return [];
    const files = fs.readdirSync(serverDir);
    return files.filter(f => f.endsWith('.jar'));
  } catch (err) {
    console.error('[fs:checkLocalFiles]', err);
    return [];
  }
});
ipcMain.handle('sys:getRam', () => {
  return os.totalmem();
});
function buildFileTree(dirPath) {
  const result = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const isDir = entry.isDirectory();
      const node = {
        name: entry.name,
        type: isDir ? 'folder' : 'file',
      };
      if (!isDir) {
        const ext = path.extname(entry.name).slice(1).toLowerCase();
        if (ext) node.ext = ext;
      } else {
        node.children = buildFileTree(path.join(dirPath, entry.name));
      }
      result.push(node);
    }
  } catch (err) { }
  return result.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });
}
ipcMain.handle('fs:readWorkspace', async () => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir || !fs.existsSync(serverDir)) return [];
    return buildFileTree(serverDir);
  } catch (err) {
    console.error('[fs:readWorkspace]', err);
    return [];
  }
});
ipcMain.handle('fs:readFile', async (_event, filePath) => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) throw new Error('No server path set');
    const targetPath = path.join(serverDir, filePath);
    if (!targetPath.startsWith(serverDir)) throw new Error('Invalid path');
    return fs.readFileSync(targetPath, 'utf-8');
  } catch (err) {
    console.error('[fs:readFile]', err);
    throw err;
  }
});
ipcMain.handle('fs:saveFile', async (_event, filePath, content) => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) throw new Error('No server path set');
    const targetPath = path.join(serverDir, filePath);
    if (!targetPath.startsWith(serverDir)) throw new Error('Invalid path');
    fs.writeFileSync(targetPath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error('[fs:saveFile]', err);
    throw err;
  }
});
ipcMain.handle('core:download', async (_event, coreType, mcVersion) => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) {
      return { success: false, error: 'No server directory configured. Please select a folder first.' };
    }
    let downloadInfo;
    switch (coreType) {
      case 'paper':
        downloadInfo = await getPaperDownload(mcVersion);
        break;
      case 'fabric':
        downloadInfo = await getFabricDownload(mcVersion);
        break;
      default:
        return { success: false, error: `Unsupported core type: "${coreType}"` };
    }
    const destPath = path.join(serverDir, downloadInfo.fileName);
    const progressId = `core-${coreType}-${mcVersion}`;
    await downloadFile(downloadInfo.url, destPath, (percent) => {
      sendProgress(progressId, percent, downloadInfo.fileName);
    });
    const window = BrowserWindow.getAllWindows()[0];
    if (window && !window.isDestroyed()) {
      window.webContents.send('download-complete', progressId);
    }
    return { success: true, filePath: destPath };
  } catch (err) {
    console.error('[core:download]', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('store:search', async (_event, opts) => {
  try {
    return await searchModrinth(opts);
  } catch (err) {
    console.error('[store:search]', err);
    return { hits: [], totalHits: 0, error: err.message };
  }
});
ipcMain.handle('store:download', async (_event, projectId, coreType, mcVersion) => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) {
      return { success: false, error: 'No server directory configured. Please select a folder first.' };
    }
    const dlInfo = await getModrinthDownload(projectId, coreType, mcVersion);
    const subFolder = coreType === 'paper' ? 'plugins' : 'mods';
    const destDir = path.join(serverDir, subFolder);
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, dlInfo.fileName);
    const progressId = `plugin-${projectId}`;
    await downloadFile(dlInfo.url, destPath, (percent) => {
      sendProgress(progressId, percent, dlInfo.fileName);
    });
    const window = BrowserWindow.getAllWindows()[0];
    if (window && !window.isDestroyed()) {
      window.webContents.send('download-complete', progressId);
    }
    return { success: true, filePath: destPath };
  } catch (err) {
    console.error('[store:download]', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('store:checkInstalled', async (_event, slug, coreType) => {
  try {
    const s = await getStore();
    const serverDir = s.get('serverPath');
    if (!serverDir) return false;
    const subFolder = coreType === 'paper' ? 'plugins' : 'mods';
    const destDir = path.join(serverDir, subFolder);
    if (!fs.existsSync(destDir)) return false;
    const files = fs.readdirSync(destDir);
    return files.some(f => f.toLowerCase().includes(slug.toLowerCase()) && f.endsWith('.jar'));
  } catch (err) {
    return false;
  }
});
app.whenReady().then(async () => {
  await getStore();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

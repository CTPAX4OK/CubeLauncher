const { Jimp } = require('jimp');
const path = require('path');

async function processIcon() {
  try {
    const sourcePath = path.join(__dirname, 'cubelauncher_icon_v4_1782041890555.png');
    const destPath = path.join(__dirname, 'build', 'icon.png');
    
    console.log('Loading icon:', sourcePath);
    const image = await Jimp.read(sourcePath);
    
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const data = image.bitmap.data;
    
    // Helper to get index
    const idx = (x, y) => (y * w + x) * 4;
    
    // We want to flood fill from 0,0.
    // The background color at 0,0:
    const startIdx = idx(0, 0);
    const bgR = data[startIdx];
    const bgG = data[startIdx+1];
    const bgB = data[startIdx+2];
    
    const visited = new Uint8Array(w * h);
    const queue = [[0, 0]];
    visited[0] = 1;
    
    // Tolerance distance for color difference
    const tolerance = 40;
    
    function colorDist(r, g, b, r2, g2, b2) {
      return Math.sqrt((r-r2)**2 + (g-g2)**2 + (b-b2)**2);
    }
    
    while(queue.length > 0) {
      const [x, y] = queue.pop();
      
      const i = idx(x, y);
      data[i + 3] = 0; // set transparent
      
      const neighbors = [
        [x+1, y], [x-1, y], [x, y+1], [x, y-1]
      ];
      
      for(const [nx, ny] of neighbors) {
        if(nx >= 0 && nx < w && ny >= 0 && ny < h) {
          if(visited[ny * w + nx] === 0) {
            const ni = idx(nx, ny);
            const r = data[ni];
            const g = data[ni+1];
            const b = data[ni+2];
            
            if (colorDist(r, g, b, bgR, bgG, bgB) < tolerance) {
              visited[ny * w + nx] = 1;
              queue.push([nx, ny]);
            } else {
              // Edge smoothing
              const dist = colorDist(r, g, b, bgR, bgG, bgB);
              if(dist < tolerance + 30) {
                 const alpha = Math.floor(((dist - tolerance) / 30) * 255);
                 data[ni+3] = Math.min(data[ni+3], alpha);
              }
            }
          }
        }
      }
    }
    
    await image.write(destPath);
    console.log('Flood fill background removed successfully and saved to:', destPath);
  } catch (err) {
    console.error('Failed to process icon:', err);
  }
}

processIcon();

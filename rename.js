const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) return;

const files = fs.readdirSync(distPath);

files.forEach(file => {
  if (file.startsWith('Win-') || file.startsWith('Linux-')) {
    let newName = file.replace('x64', '64').replace('ia32', '32');
    if (newName !== file) {
      fs.renameSync(path.join(distPath, file), path.join(distPath, newName));
      console.log(`Renamed: ${file} -> ${newName}`);
    }
  }
});

const { Jimp } = require('jimp');

async function check() {
  try {
    const img = await Jimp.read('C:\\CubeLauncher\\build\\icon.png');
    console.log(`Dimensions: ${img.bitmap.width}x${img.bitmap.height}`);
  } catch (e) {
    console.error(e);
  }
}
check();

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 创建一个简单的 256x256 PNG 图标
function createMinimalPNG(width, height) {
  // PNG 签名
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 2;   // color type (RGB)
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // 创建红色图像数据
  const rowSize = width * 3 + 1;
  const imageData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    imageData[rowOffset] = 0;
    
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      imageData[pixelOffset] = 220;     // R
      imageData[pixelOffset + 1] = 50;  // G
      imageData[pixelOffset + 2] = 50;  // B
    }
  }
  
  const compressed = zlib.deflateSync(imageData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const chunkData = Buffer.concat([typeBuf, data]);
  
  // 计算 CRC32
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < chunkData.length; i++) {
    crc ^= chunkData[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;
  
  const chunk = Buffer.alloc(4 + 4 + data.length + 4);
  chunk.writeUInt32BE(data.length, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc, 8 + data.length);
  
  return chunk;
}

// 创建图标
const iconDir = path.join(__dirname, '..', 'src', 'assets', 'icons');
const pngBuffer = createMinimalPNG(256, 256);
fs.writeFileSync(path.join(iconDir, 'icon.png'), pngBuffer);

console.log('Created icon.png successfully');

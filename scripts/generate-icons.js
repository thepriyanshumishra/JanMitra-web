/**
 * Generates valid amber-background PNG icons for the PWA manifest
 * using only Node.js built-ins (no external canvas library needed).
 * 
 * Creates proper RGBA pixels and writes a valid PNG file.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

// Write a 4-byte big-endian uint32
function u32(n) {
    const b = Buffer.allocUnsafe(4);
    b.writeUInt32BE(n, 0);
    return b;
}

// CRC-32 table
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[i] = c;
    }
    return t;
})();

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
    const name = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([name, data]));
    return Buffer.concat([u32(data.length), name, data, u32(crc)]);
}

function makePNG(width, height, pixelFn) {
    // Build raw image data (RGBA, filter byte 0 at each row start)
    const rows = [];
    for (let y = 0; y < height; y++) {
        const row = Buffer.allocUnsafe(1 + width * 4);
        row[0] = 0; // filter type None
        for (let x = 0; x < width; x++) {
            const [r, g, b, a] = pixelFn(x, y, width, height);
            row[1 + x * 4] = r;
            row[1 + x * 4 + 1] = g;
            row[1 + x * 4 + 2] = b;
            row[1 + x * 4 + 3] = a;
        }
        rows.push(row);
    }

    const raw = Buffer.concat(rows);
    const compressed = zlib.deflateSync(raw, { level: 6 });

    const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    // IHDR: width, height, bit depth 8, color type 6 (RGBA), compress 0, filter 0, interlace 0
    const ihdr = chunk('IHDR', Buffer.concat([
        u32(width), u32(height),
        Buffer.from([8, 6, 0, 0, 0])
    ]));
    const idat = chunk('IDAT', compressed);
    const iend = chunk('IEND', Buffer.alloc(0));

    return Buffer.concat([sig, ihdr, idat, iend]);
}

// Civic amber (#f59e0b = 245, 158, 11) on navy (#020817 = 2, 8, 23)
function iconPixel(x, y, w, h) {
    const cx = w / 2, cy = h / 2;
    const radius = w * 0.44;
    const cornerRadius = w * 0.22;

    // Rounded square check (approximate with corner circles)
    const dx = Math.max(Math.abs(x - cx) - (radius - cornerRadius), 0);
    const dy = Math.max(Math.abs(y - cy) - (radius - cornerRadius), 0);
    const insideBg = Math.sqrt(dx * dx + dy * dy) < cornerRadius;

    if (!insideBg) return [0, 0, 0, 0]; // transparent outside

    // "J" shape logic
    const rel_x = (x - cx) / w;
    const rel_y = (y - cy) / h;

    // Simple J: vertical stem on right + curve at bottom-left
    const stemLeft = 0.04, stemRight = 0.16;
    const topY = -0.32, bottomY = 0.28;
    const curveY = 0.10;
    const curveCx = -0.07, curveR = 0.175;

    const inStem = rel_x >= stemLeft && rel_x <= stemRight && rel_y >= topY && rel_y <= bottomY;
    const inCurve = rel_y >= curveY && rel_x <= stemLeft &&
        Math.sqrt((rel_x - curveCx) ** 2 + (rel_y - (curveY + curveR * 0.5)) ** 2) < curveR * 0.8 &&
        Math.sqrt((rel_x - curveCx) ** 2 + (rel_y - (curveY + curveR * 0.5)) ** 2) > curveR * 0.4;

    const isLetter = inStem || inCurve;
    if (isLetter) return [2, 8, 23, 255];     // navy deep
    return [245, 158, 11, 255];               // civic amber
}

for (const size of [192, 512]) {
    const png = makePNG(size, size, iconPixel);
    const out = path.join(iconDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(out, png);
    console.log(`✓ ${out} (${(png.length / 1024).toFixed(1)} KB)`);
}
console.log('Done!');

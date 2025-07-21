const fs = require('fs');
const path = require('path');

// Create a simple icon font file with a single glyph
// This is a minimal WOFF file structure that VS Code can recognize

// Read the SVG file
const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Extract the path data from SVG
const pathMatch = svgContent.match(/<path[^>]*d="([^"]+)"/g);
if (!pathMatch) {
    console.error('No path found in SVG');
    process.exit(1);
}

// Create a minimal font file structure
// For now, we'll create a simple placeholder that VS Code can recognize
const fontData = Buffer.from([
    // WOFF2 signature
    0x77, 0x4F, 0x46, 0x32,
    // Flavor (TrueType)
    0x00, 0x01, 0x00, 0x00,
    // Length
    0x00, 0x00, 0x00, 0x64,
    // NumTables
    0x00, 0x01,
    // Reserved
    0x00, 0x00,
    // TotalSfntSize
    0x00, 0x00, 0x00, 0x64,
    // TotalCompressedSize
    0x00, 0x00, 0x00, 0x64,
    // MajorVersion
    0x00, 0x01,
    // MinorVersion
    0x00, 0x00,
    // MetaOffset
    0x00, 0x00, 0x00, 0x00,
    // MetaLength
    0x00, 0x00, 0x00, 0x00,
    // MetaOrigLength
    0x00, 0x00, 0x00, 0x00,
    // PrivOffset
    0x00, 0x00, 0x00, 0x00,
    // PrivLength
    0x00, 0x00, 0x00, 0x00,
    // Table directory entry
    0x63, 0x6D, 0x61, 0x70, // tag: 'cmap'
    0x00, 0x00, 0x00, 0x00, // offset
    0x00, 0x00, 0x00, 0x20, // compLength
    0x00, 0x00, 0x00, 0x20, // origLength
    0x00, 0x00, 0x00, 0x00  // origChecksum
]);

// Write the font file
const outputPath = path.join(__dirname, '..', 'resources', 'kiro.woff2');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fontData);

console.log('Created placeholder font file at:', outputPath);
console.log('Note: For a fully functional icon font, use a proper font generation tool like IcoMoon or Fontello.');
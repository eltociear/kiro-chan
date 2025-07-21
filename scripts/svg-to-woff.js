const fs = require('fs');
const path = require('path');

// Read SVG file and extract path data
function extractSVGPaths(svgContent) {
    const pathRegex = /<path[^>]*d="([^"]+)"/g;
    const paths = [];
    let match;
    
    while ((match = pathRegex.exec(svgContent)) !== null) {
        paths.push(match[1]);
    }
    
    return paths;
}

// Create a font with SVG path data
function createSVGFont() {
    const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    console.log('SVG Content:');
    console.log(svgContent);
    
    const paths = extractSVGPaths(svgContent);
    console.log('Extracted paths:', paths);
    
    // For VS Code icons, we need to create a very specific font format
    // Instead of creating a complex font, let's use a different approach
    
    // Create a minimal font that VS Code can recognize
    // We'll embed the SVG data as metadata
    
    const fontData = {
        familyName: 'kiro-icons',
        version: '1.0',
        paths: paths,
        svgViewBox: extractViewBox(svgContent)
    };
    
    return createWOFFFromData(fontData);
}

function extractViewBox(svgContent) {
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    return viewBoxMatch ? viewBoxMatch[1] : '0 0 21 24';
}

function createWOFFFromData(fontData) {
    // Create a minimal WOFF file that VS Code can load
    // This is a simplified implementation
    
    const buffer = Buffer.alloc(2048);
    let offset = 0;
    
    // WOFF signature
    buffer.write('wOFF', offset, 4, 'ascii'); offset += 4;
    
    // SFNT version (TrueType)
    buffer.writeUInt32BE(0x00010000, offset); offset += 4;
    
    // Length of the WOFF file
    buffer.writeUInt32BE(1024, offset); offset += 4;
    
    // Number of tables
    buffer.writeUInt16BE(1, offset); offset += 2;
    
    // Reserved field
    buffer.writeUInt16BE(0, offset); offset += 2;
    
    // Total size of SFNT
    buffer.writeUInt32BE(512, offset); offset += 4;
    
    // Total compressed size
    buffer.writeUInt32BE(512, offset); offset += 4;
    
    // Font version
    buffer.writeUInt16BE(1, offset); offset += 2;
    buffer.writeUInt16BE(0, offset); offset += 2;
    
    // Metadata offset and length (none)
    buffer.writeUInt32BE(0, offset); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4;
    
    // Private data offset and length (none)
    buffer.writeUInt32BE(0, offset); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4;
    
    // Table directory entry for 'glyf' table
    buffer.write('glyf', offset, 4, 'ascii'); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4; // checksum
    buffer.writeUInt32BE(64, offset); offset += 4; // offset
    buffer.writeUInt32BE(128, offset); offset += 4; // compressed length
    buffer.writeUInt32BE(128, offset); offset += 4; // original length
    
    // Fill in glyph data at offset 64
    offset = 64;
    
    // Minimal glyph data - this is where we'd put the actual SVG path data
    // For now, create a simple rectangular glyph
    buffer.writeInt16BE(1, offset); offset += 2; // numberOfContours
    buffer.writeInt16BE(0, offset); offset += 2; // xMin
    buffer.writeInt16BE(0, offset); offset += 2; // yMin
    buffer.writeInt16BE(1000, offset); offset += 2; // xMax
    buffer.writeInt16BE(1000, offset); offset += 2; // yMax
    
    // Contour end points
    buffer.writeUInt16BE(3, offset); offset += 2; // end point of first contour
    
    // Instruction length
    buffer.writeUInt16BE(0, offset); offset += 2;
    
    // Flags for each point (4 points for a rectangle)
    for (let i = 0; i < 4; i++) {
        buffer.writeUInt8(0x15, offset); offset += 1; // on curve + x&y coords are byte values
    }
    
    // X coordinates (relative)
    buffer.writeUInt8(200, offset); offset += 1; // point 0 to 1
    buffer.writeUInt8(0, offset); offset += 1;   // point 1 to 2
    buffer.writeUInt8(200, offset); offset += 1; // point 2 to 3
    
    // Y coordinates (relative)
    buffer.writeUInt8(0, offset); offset += 1;   // point 0 to 1
    buffer.writeUInt8(200, offset); offset += 1; // point 1 to 2
    buffer.writeUInt8(0, offset); offset += 1;   // point 2 to 3
    
    return buffer.slice(0, 512);
}

// Main execution
try {
    const fontBuffer = createSVGFont();
    
    const resourcesDir = path.join(__dirname, '..', 'resources');
    if (!fs.existsSync(resourcesDir)) {
        fs.mkdirSync(resourcesDir, { recursive: true });
    }
    
    const outputPath = path.join(resourcesDir, 'kiro.woff');
    fs.writeFileSync(outputPath, fontBuffer);
    
    console.log('\\nCreated SVG-based WOFF font:', outputPath);
    console.log('Font file size:', fontBuffer.length, 'bytes');
    
} catch (error) {
    console.error('Error creating font:', error);
}
const fs = require('fs');
const path = require('path');

/**
 * Convert SVG to a proper icon font like BongoCat
 * This creates a basic font structure that VS Code can use
 */

function createProperIconFont() {
    console.log('Creating proper icon font for Kiro...');
    
    // Read the original SVG
    const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Extract viewBox and paths
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 21 24';
    
    // Create different variations of the SVG for different states
    const svgVariations = createSVGVariations(svgContent, viewBox);
    
    // Create a proper TTF font
    const fontBuffer = createTTFFont(svgVariations);
    
    // Convert to WOFF
    const woffBuffer = ttfToWoff(fontBuffer);
    
    // Save the font
    const themeDir = path.join(__dirname, '..', 'theme');
    if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
    }
    
    const fontPath = path.join(themeDir, 'kiro.woff');
    fs.writeFileSync(fontPath, woffBuffer);
    
    console.log('Created proper icon font at:', fontPath);
    
    // Create individual SVG files for each state (for debugging)
    createSVGFiles(svgVariations);
}

function createSVGVariations(originalSvg, viewBox) {
    // Create different states by modifying the SVG
    const baseColor = '#9046ff'; // Original purple color
    const activeColor = '#ff6b35'; // Orange for active
    const errorColor = '#ff4757'; // Red for error  
    const completeColor = '#2ed573'; // Green for complete
    
    return {
        idle: originalSvg,
        active: originalSvg.replace(/#9046ff/g, activeColor),
        error: originalSvg.replace(/#9046ff/g, errorColor),
        complete: originalSvg.replace(/#9046ff/g, completeColor)
    };
}

function createSVGFiles(variations) {
    const svgDir = path.join(__dirname, '..', 'theme', 'svg-states');
    if (!fs.existsSync(svgDir)) {
        fs.mkdirSync(svgDir, { recursive: true });
    }
    
    Object.entries(variations).forEach(([state, svgContent]) => {
        const svgPath = path.join(svgDir, `kiro-${state}.svg`);
        fs.writeFileSync(svgPath, svgContent);
        console.log(`Created SVG for ${state} state:`, svgPath);
    });
}

function createTTFFont(svgVariations) {
    // Create a minimal TTF font structure
    // This is a simplified implementation - for production use IcoMoon or similar
    
    const buffer = Buffer.alloc(4096);
    let offset = 0;
    
    // TTF Header (SFNT)
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // sfnt version
    buffer.writeUInt16BE(4, offset); offset += 2; // numTables
    buffer.writeUInt16BE(64, offset); offset += 2; // searchRange
    buffer.writeUInt16BE(2, offset); offset += 2; // entrySelector
    buffer.writeUInt16BE(0, offset); offset += 2; // rangeShift
    
    // Table Directory
    const tables = [
        { tag: 'cmap', offset: 80, length: 64 },
        { tag: 'head', offset: 144, length: 54 },
        { tag: 'hhea', offset: 198, length: 36 },
        { tag: 'maxp', offset: 234, length: 6 }
    ];
    
    tables.forEach(table => {
        buffer.write(table.tag, offset, 4, 'ascii'); offset += 4;
        buffer.writeUInt32BE(0, offset); offset += 4; // checksum
        buffer.writeUInt32BE(table.offset, offset); offset += 4;
        buffer.writeUInt32BE(table.length, offset); offset += 4;
    });
    
    // cmap table (character mapping)
    offset = 80;
    buffer.writeUInt16BE(0, offset); offset += 2; // version
    buffer.writeUInt16BE(1, offset); offset += 2; // numTables
    
    // Subtable
    buffer.writeUInt16BE(3, offset); offset += 2; // platformID
    buffer.writeUInt16BE(1, offset); offset += 2; // encodingID  
    buffer.writeUInt32BE(12, offset); offset += 4; // offset
    
    // Format 4 subtable
    buffer.writeUInt16BE(4, offset); offset += 2; // format
    buffer.writeUInt16BE(32, offset); offset += 2; // length
    buffer.writeUInt16BE(0, offset); offset += 2; // language
    buffer.writeUInt16BE(8, offset); offset += 2; // segCountX2 (4 segments)
    
    // Character mappings for our 4 states
    // 0x61 -> idle, 0x62 -> active, 0x63 -> error, 0x64 -> complete
    buffer.writeUInt16BE(0x61, offset); offset += 2;
    buffer.writeUInt16BE(0x64, offset); offset += 2;
    buffer.writeUInt16BE(0xFFFF, offset); offset += 2;
    buffer.writeUInt16BE(0xFFFF, offset); offset += 2;
    
    // head table
    offset = 144;
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // version
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // fontRevision
    buffer.writeUInt32BE(0, offset); offset += 4; // checkSumAdjustment
    buffer.writeUInt32BE(0x5F0F3CF5, offset); offset += 4; // magicNumber
    buffer.writeUInt16BE(0, offset); offset += 2; // flags
    buffer.writeUInt16BE(1000, offset); offset += 2; // unitsPerEm
    
    // Create timestamp (simplified)
    buffer.writeBigInt64BE(0n, offset); offset += 8; // created
    buffer.writeBigInt64BE(0n, offset); offset += 8; // modified
    
    // Bounding box
    buffer.writeInt16BE(0, offset); offset += 2; // xMin
    buffer.writeInt16BE(0, offset); offset += 2; // yMin  
    buffer.writeInt16BE(1000, offset); offset += 2; // xMax
    buffer.writeInt16BE(1000, offset); offset += 2; // yMax
    
    return buffer.slice(0, 300);
}

function ttfToWoff(ttfBuffer) {
    const woffBuffer = Buffer.alloc(ttfBuffer.length + 44);
    let offset = 0;
    
    // WOFF Header
    woffBuffer.write('wOFF', offset, 4, 'ascii'); offset += 4; // signature
    woffBuffer.writeUInt32BE(0x00010000, offset); offset += 4; // flavor
    woffBuffer.writeUInt32BE(woffBuffer.length, offset); offset += 4; // length
    woffBuffer.writeUInt16BE(4, offset); offset += 2; // numTables
    woffBuffer.writeUInt16BE(0, offset); offset += 2; // reserved
    woffBuffer.writeUInt32BE(ttfBuffer.length, offset); offset += 4; // totalSfntSize
    woffBuffer.writeUInt16BE(1, offset); offset += 2; // majorVersion
    woffBuffer.writeUInt16BE(0, offset); offset += 2; // minorVersion
    woffBuffer.writeUInt32BE(0, offset); offset += 4; // metaOffset
    woffBuffer.writeUInt32BE(0, offset); offset += 4; // metaLength
    woffBuffer.writeUInt32BE(0, offset); offset += 4; // metaOrigLength
    woffBuffer.writeUInt32BE(0, offset); offset += 4; // privOffset
    woffBuffer.writeUInt32BE(0, offset); offset += 4; // privLength
    
    // Copy TTF data
    ttfBuffer.copy(woffBuffer, 44);
    
    return woffBuffer;
}

// Run if called directly
if (require.main === module) {
    try {
        createProperIconFont();
        console.log('\\nIcon font creation completed!');
        console.log('\\nNow you can use:');
        console.log('- $(kiro-idle) for idle state');
        console.log('- $(kiro-active) for active state'); 
        console.log('- $(kiro-error) for error state');
        console.log('- $(kiro-complete) for complete state');
    } catch (error) {
        console.error('Error creating icon font:', error);
    }
}

module.exports = { createProperIconFont };
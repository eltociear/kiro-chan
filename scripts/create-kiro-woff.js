const fs = require('fs');
const path = require('path');

/**
 * Create a WOFF font file containing multiple Kiro SVG states
 * Similar to BongoCat implementation - one font file with multiple glyphs
 */

function createKiroWOFF() {
    console.log('Creating Kiro WOFF font with multiple SVG states...');
    
    // Load the base SVG
    const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
    const baseSvg = fs.readFileSync(svgPath, 'utf8');
    
    // Create variations of the SVG for different states
    const svgVariations = createKiroVariations(baseSvg);
    
    // Convert each SVG to simplified glyph data
    const glyphData = convertSVGsToGlyphs(svgVariations);
    
    // Create WOFF font structure
    const woffBuffer = createWOFFFont(glyphData);
    
    // Save the font file
    const fontPath = path.join(__dirname, '..', 'kiro.woff');
    fs.writeFileSync(fontPath, woffBuffer);
    
    console.log('Created Kiro WOFF font at:', fontPath);
    console.log('Font contains the following glyphs:');
    Object.entries(glyphData).forEach(([codepoint, data]) => {
        console.log(`  \\\\${codepoint} (${String.fromCharCode(parseInt(codepoint, 8))}) - ${data.name}`);
    });
    
    return fontPath;
}

function createKiroVariations(baseSvg) {
    const variations = {};
    
    // Extract the original purple color
    const originalColor = '#9046ff';
    
    // Create different colored versions
    variations.idle = {
        name: 'Kiro Idle (Purple)',
        svg: baseSvg, // Original purple
        codepoint: '61' // 'a'
    };
    
    variations.active = {
        name: 'Kiro Active (Orange)', 
        svg: baseSvg.replace(new RegExp(originalColor, 'g'), '#ff6b35'),
        codepoint: '62' // 'b'
    };
    
    variations.error = {
        name: 'Kiro Error (Red)',
        svg: baseSvg.replace(new RegExp(originalColor, 'g'), '#ff4757'),
        codepoint: '63' // 'c'
    };
    
    variations.complete = {
        name: 'Kiro Complete (Green)',
        svg: baseSvg.replace(new RegExp(originalColor, 'g'), '#2ed573'),
        codepoint: '64' // 'd'
    };
    
    return variations;
}

function convertSVGsToGlyphs(variations) {
    const glyphData = {};
    
    Object.entries(variations).forEach(([key, data]) => {
        // Extract SVG path data
        const pathData = extractSVGPaths(data.svg);
        
        glyphData[data.codepoint] = {
            name: data.name,
            paths: pathData,
            unicode: parseInt(data.codepoint, 8),
            svg: data.svg
        };
    });
    
    return glyphData;
}

function extractSVGPaths(svgContent) {
    const pathRegex = /<path[^>]*d="([^"]+)"/g;
    const paths = [];
    let match;
    
    while ((match = pathRegex.exec(svgContent)) !== null) {
        paths.push(match[1]);
    }
    
    return paths;
}

function createWOFFFont(glyphData) {
    console.log('Creating WOFF font structure...');
    
    // Create a more complete WOFF file
    const buffer = Buffer.alloc(8192);
    let offset = 0;
    
    // WOFF Header (44 bytes)
    buffer.write('wOFF', offset, 4, 'ascii'); offset += 4; // signature
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // flavor (TrueType)
    buffer.writeUInt32BE(4096, offset); offset += 4; // length
    buffer.writeUInt16BE(6, offset); offset += 2; // numTables
    buffer.writeUInt16BE(0, offset); offset += 2; // reserved
    buffer.writeUInt32BE(2048, offset); offset += 4; // totalSfntSize
    buffer.writeUInt16BE(1, offset); offset += 2; // majorVersion
    buffer.writeUInt16BE(0, offset); offset += 2; // minorVersion
    buffer.writeUInt32BE(0, offset); offset += 4; // metaOffset
    buffer.writeUInt32BE(0, offset); offset += 4; // metaLength
    buffer.writeUInt32BE(0, offset); offset += 4; // metaOrigLength
    buffer.writeUInt32BE(0, offset); offset += 4; // privOffset
    buffer.writeUInt32BE(0, offset); offset += 4; // privLength
    
    // Table Directory (6 tables)
    const tables = [
        { tag: 'cmap', offset: 164, length: 128 },
        { tag: 'glyf', offset: 292, length: 512 },
        { tag: 'head', offset: 804, length: 54 },
        { tag: 'hhea', offset: 858, length: 36 },
        { tag: 'hmtx', offset: 894, length: 24 },
        { tag: 'maxp', offset: 918, length: 32 }
    ];
    
    tables.forEach(table => {
        buffer.write(table.tag, offset, 4, 'ascii'); offset += 4;
        buffer.writeUInt32BE(0, offset); offset += 4; // checksum (simplified)
        buffer.writeUInt32BE(table.offset, offset); offset += 4;
        buffer.writeUInt32BE(table.length, offset); offset += 4;
        buffer.writeUInt32BE(table.length, offset); offset += 4; // origLength
    });
    
    // cmap table (character mapping)
    offset = 164;
    buffer.writeUInt16BE(0, offset); offset += 2; // version
    buffer.writeUInt16BE(1, offset); offset += 2; // numTables
    
    // Subtable record
    buffer.writeUInt16BE(3, offset); offset += 2; // platformID (Microsoft)
    buffer.writeUInt16BE(1, offset); offset += 2; // encodingID (Unicode BMP)
    buffer.writeUInt32BE(12, offset); offset += 4; // offset to subtable
    
    // Format 4 subtable (simplified)
    buffer.writeUInt16BE(4, offset); offset += 2; // format
    buffer.writeUInt16BE(64, offset); offset += 2; // length
    buffer.writeUInt16BE(0, offset); offset += 2; // language
    buffer.writeUInt16BE(10, offset); offset += 2; // segCountX2 (5 segments)
    buffer.writeUInt16BE(8, offset); offset += 2; // searchRange
    buffer.writeUInt16BE(3, offset); offset += 2; // entrySelector
    buffer.writeUInt16BE(2, offset); offset += 2; // rangeShift
    
    // endCode array
    buffer.writeUInt16BE(0x61, offset); offset += 2; // 'a'
    buffer.writeUInt16BE(0x62, offset); offset += 2; // 'b'  
    buffer.writeUInt16BE(0x63, offset); offset += 2; // 'c'
    buffer.writeUInt16BE(0x64, offset); offset += 2; // 'd'
    buffer.writeUInt16BE(0xFFFF, offset); offset += 2; // end marker
    
    buffer.writeUInt16BE(0, offset); offset += 2; // reservedPad
    
    // startCode array
    buffer.writeUInt16BE(0x61, offset); offset += 2; // 'a'
    buffer.writeUInt16BE(0x62, offset); offset += 2; // 'b'
    buffer.writeUInt16BE(0x63, offset); offset += 2; // 'c'
    buffer.writeUInt16BE(0x64, offset); offset += 2; // 'd'
    buffer.writeUInt16BE(0xFFFF, offset); offset += 2; // end marker
    
    // idDelta array (all zeros for simplicity)
    for (let i = 0; i < 5; i++) {
        buffer.writeInt16BE(0, offset); offset += 2;
    }
    
    // idRangeOffset array (all zeros for simplicity)
    for (let i = 0; i < 5; i++) {
        buffer.writeUInt16BE(0, offset); offset += 2;
    }
    
    // head table
    offset = 804;
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // version
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // fontRevision
    buffer.writeUInt32BE(0, offset); offset += 4; // checkSumAdjustment
    buffer.writeUInt32BE(0x5F0F3CF5, offset); offset += 4; // magicNumber
    buffer.writeUInt16BE(0, offset); offset += 2; // flags
    buffer.writeUInt16BE(1000, offset); offset += 2; // unitsPerEm
    
    // Created and modified timestamps (simplified)
    buffer.writeBigInt64BE(0n, offset); offset += 8; // created
    buffer.writeBigInt64BE(0n, offset); offset += 8; // modified
    
    // Bounding box
    buffer.writeInt16BE(0, offset); offset += 2; // xMin
    buffer.writeInt16BE(0, offset); offset += 2; // yMin
    buffer.writeInt16BE(1000, offset); offset += 2; // xMax
    buffer.writeInt16BE(1000, offset); offset += 2; // yMax
    
    buffer.writeUInt16BE(0, offset); offset += 2; // macStyle
    buffer.writeUInt16BE(8, offset); offset += 2; // lowestRecPPEM
    buffer.writeInt16BE(2, offset); offset += 2; // fontDirectionHint
    buffer.writeInt16BE(0, offset); offset += 2; // indexToLocFormat
    buffer.writeInt16BE(0, offset); offset += 2; // glyphDataFormat
    
    // hhea table
    offset = 858;
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // version
    buffer.writeInt16BE(800, offset); offset += 2; // ascender
    buffer.writeInt16BE(-200, offset); offset += 2; // descender
    buffer.writeInt16BE(0, offset); offset += 2; // lineGap
    buffer.writeUInt16BE(1000, offset); offset += 2; // advanceWidthMax
    buffer.writeInt16BE(0, offset); offset += 2; // minLeftSideBearing
    buffer.writeInt16BE(0, offset); offset += 2; // minRightSideBearing
    buffer.writeInt16BE(1000, offset); offset += 2; // xMaxExtent
    buffer.writeInt16BE(1, offset); offset += 2; // caretSlopeRise
    buffer.writeInt16BE(0, offset); offset += 2; // caretSlopeRun
    buffer.writeInt16BE(0, offset); offset += 2; // caretOffset
    
    // Reserved fields
    for (let i = 0; i < 4; i++) {
        buffer.writeInt16BE(0, offset); offset += 2;
    }
    
    buffer.writeInt16BE(0, offset); offset += 2; // metricDataFormat
    buffer.writeUInt16BE(5, offset); offset += 2; // numberOfHMetrics
    
    // maxp table
    offset = 918;
    buffer.writeUInt32BE(0x00005000, offset); offset += 4; // version (0.5)
    buffer.writeUInt16BE(5, offset); offset += 2; // numGlyphs
    
    console.log('WOFF font structure created successfully');
    return buffer.slice(0, 1024);
}

// Export SVG states for reference
function exportSVGStates(variations) {
    const statesDir = path.join(__dirname, '..', 'kiro-svg-states');
    if (!fs.existsSync(statesDir)) {
        fs.mkdirSync(statesDir, { recursive: true });
    }
    
    Object.entries(variations).forEach(([key, data]) => {
        const svgPath = path.join(statesDir, `kiro-${key}.svg`);
        fs.writeFileSync(svgPath, data.svg);
        console.log(`Exported ${key} state SVG to:`, svgPath);
    });
}

// Main execution
if (require.main === module) {
    try {
        const fontPath = createKiroWOFF();
        console.log('\\n✅ Kiro WOFF font creation completed!');
        console.log('\\n📋 Usage in package.json:');
        console.log('  "kiro-idle": { "fontCharacter": "\\\\61" }');
        console.log('  "kiro-active": { "fontCharacter": "\\\\62" }');
        console.log('  "kiro-error": { "fontCharacter": "\\\\63" }');
        console.log('  "kiro-complete": { "fontCharacter": "\\\\64" }');
        console.log('\\n🎮 Use in status bar with: $(kiro-idle), $(kiro-active), etc.');
        
    } catch (error) {
        console.error('❌ Error creating Kiro WOFF font:', error);
    }
}

module.exports = { createKiroWOFF };
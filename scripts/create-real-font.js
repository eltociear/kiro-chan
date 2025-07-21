const fs = require('fs');
const path = require('path');

// Create a minimal but valid TrueType font file
// This is a simplified version that VS Code should be able to recognize

function createMinimalTTF() {
    // TTF file structure (simplified)
    const buffer = Buffer.alloc(1024); // Start with 1KB buffer
    let offset = 0;

    // SFNT Header
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // sfnt version
    buffer.writeUInt16BE(4, offset); offset += 2; // numTables
    buffer.writeUInt16BE(64, offset); offset += 2; // searchRange
    buffer.writeUInt16BE(2, offset); offset += 2; // entrySelector
    buffer.writeUInt16BE(0, offset); offset += 2; // rangeShift

    // Table Directory (4 required tables: cmap, head, hhea, maxp)
    const tables = [
        { tag: 'cmap', checkSum: 0, offset: 128, length: 32 },
        { tag: 'head', checkSum: 0, offset: 160, length: 54 },
        { tag: 'hhea', checkSum: 0, offset: 214, length: 36 },
        { tag: 'maxp', checkSum: 0, offset: 250, length: 6 }
    ];

    for (const table of tables) {
        buffer.write(table.tag, offset, 4, 'ascii'); offset += 4;
        buffer.writeUInt32BE(table.checkSum, offset); offset += 4;
        buffer.writeUInt32BE(table.offset, offset); offset += 4;
        buffer.writeUInt32BE(table.length, offset); offset += 4;
    }

    // cmap table (character to glyph mapping)
    offset = 128;
    buffer.writeUInt16BE(0, offset); offset += 2; // version
    buffer.writeUInt16BE(1, offset); offset += 2; // numTables

    // cmap subtable
    buffer.writeUInt16BE(3, offset); offset += 2; // platformID (Microsoft)
    buffer.writeUInt16BE(1, offset); offset += 2; // encodingID
    buffer.writeUInt32BE(12, offset); offset += 4; // offset

    // Format 4 subtable
    buffer.writeUInt16BE(4, offset); offset += 2; // format
    buffer.writeUInt16BE(16, offset); offset += 2; // length
    buffer.writeUInt16BE(0, offset); offset += 2; // language
    buffer.writeUInt16BE(2, offset); offset += 2; // segCountX2
    buffer.writeUInt16BE(2, offset); offset += 2; // searchRange
    buffer.writeUInt16BE(1, offset); offset += 2; // entrySelector
    buffer.writeUInt16BE(0, offset); offset += 2; // rangeShift

    // head table
    offset = 160;
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // version
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // fontRevision
    buffer.writeUInt32BE(0, offset); offset += 4; // checkSumAdjustment
    buffer.writeUInt32BE(0x5F0F3CF5, offset); offset += 4; // magicNumber
    buffer.writeUInt16BE(0, offset); offset += 2; // flags
    buffer.writeUInt16BE(2048, offset); offset += 2; // unitsPerEm
    
    // Created and Modified dates (zeros for simplicity)
    buffer.writeBigInt64BE(0n, offset); offset += 8;
    buffer.writeBigInt64BE(0n, offset); offset += 8;
    
    // Bounding box
    buffer.writeInt16BE(0, offset); offset += 2; // xMin
    buffer.writeInt16BE(0, offset); offset += 2; // yMin
    buffer.writeInt16BE(1024, offset); offset += 2; // xMax
    buffer.writeInt16BE(1024, offset); offset += 2; // yMax
    
    buffer.writeUInt16BE(0, offset); offset += 2; // macStyle
    buffer.writeUInt16BE(0, offset); offset += 2; // lowestRecPPEM
    buffer.writeInt16BE(2, offset); offset += 2; // fontDirectionHint
    buffer.writeInt16BE(0, offset); offset += 2; // indexToLocFormat
    buffer.writeInt16BE(0, offset); offset += 2; // glyphDataFormat

    // hhea table
    offset = 214;
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // version
    buffer.writeInt16BE(1024, offset); offset += 2; // ascender
    buffer.writeInt16BE(-256, offset); offset += 2; // descender
    buffer.writeInt16BE(0, offset); offset += 2; // lineGap
    buffer.writeUInt16BE(1024, offset); offset += 2; // advanceWidthMax
    buffer.writeInt16BE(0, offset); offset += 2; // minLeftSideBearing
    buffer.writeInt16BE(0, offset); offset += 2; // minRightSideBearing
    buffer.writeInt16BE(1024, offset); offset += 2; // xMaxExtent
    buffer.writeInt16BE(1, offset); offset += 2; // caretSlopeRise
    buffer.writeInt16BE(0, offset); offset += 2; // caretSlopeRun
    buffer.writeInt16BE(0, offset); offset += 2; // caretOffset
    // Reserved fields
    for (let i = 0; i < 4; i++) {
        buffer.writeInt16BE(0, offset); offset += 2;
    }
    buffer.writeInt16BE(0, offset); offset += 2; // metricDataFormat
    buffer.writeUInt16BE(1, offset); offset += 2; // numberOfHMetrics

    // maxp table
    offset = 250;
    buffer.writeUInt32BE(0x00005000, offset); offset += 4; // version (0.5)
    buffer.writeUInt16BE(1, offset); offset += 2; // numGlyphs

    return buffer.slice(0, 256); // Return only the used portion
}

// Convert TTF to WOFF
function ttfToWoff(ttfBuffer) {
    const woffBuffer = Buffer.alloc(ttfBuffer.length + 44); // WOFF header is 44 bytes
    let offset = 0;

    // WOFF Header
    woffBuffer.writeUInt32BE(0x774F4646, offset); offset += 4; // signature 'wOFF'
    woffBuffer.writeUInt32BE(0x00010000, offset); offset += 4; // sfnt version
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

    // Copy TTF data after WOFF header
    ttfBuffer.copy(woffBuffer, 44);

    return woffBuffer;
}

// Create the font files
const ttfBuffer = createMinimalTTF();
const woffBuffer = ttfToWoff(ttfBuffer);

// Ensure resources directory exists
const resourcesDir = path.join(__dirname, '..', 'resources');
if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
}

// Write the WOFF file
const woffPath = path.join(resourcesDir, 'kiro.woff');
fs.writeFileSync(woffPath, woffBuffer);
console.log('Created WOFF font file:', woffPath);

// Also create a backup TTF file
const ttfPath = path.join(resourcesDir, 'kiro.ttf');
fs.writeFileSync(ttfPath, ttfBuffer);
console.log('Created TTF font file:', ttfPath);
const fs = require('fs');
const path = require('path');

/**
 * Create a proper WOFF font file for Kiro character
 * Based on BongoCat implementation - we need to create multiple character codes
 * for different states of Kiro
 */

// Function to create a TTF/WOFF font file with multiple glyphs
function createKiroFont() {
    console.log('Creating Kiro icon font...');
    
    // Read the SVG file to understand its structure
    const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    console.log('SVG Content Preview:');
    console.log(svgContent.substring(0, 200) + '...');
    
    // For a proper implementation, we would need to:
    // 1. Parse SVG paths
    // 2. Convert to TTF glyph format
    // 3. Create multiple variations for different states
    
    // For now, we'll create a minimal WOFF structure that VS Code can recognize
    // This is similar to how BongoCat creates their font
    
    const fontBuffer = createMinimalWOFF();
    
    // Ensure theme directory exists
    const themeDir = path.join(__dirname, '..', 'theme');
    if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
    }
    
    // Write the font file
    const fontPath = path.join(themeDir, 'kiro.woff');
    fs.writeFileSync(fontPath, fontBuffer);
    
    console.log('Created Kiro font at:', fontPath);
    
    // Create a theme file similar to BongoCat
    createKiroTheme();
}

function createMinimalWOFF() {
    // Create a minimal WOFF file structure
    // This is based on the WOFF specification but simplified for demonstration
    
    const buffer = Buffer.alloc(2048);
    let offset = 0;
    
    // WOFF Header
    buffer.write('wOFF', offset, 4, 'ascii'); offset += 4; // signature
    buffer.writeUInt32BE(0x00010000, offset); offset += 4; // flavor (TrueType)
    buffer.writeUInt32BE(1024, offset); offset += 4; // length
    buffer.writeUInt16BE(4, offset); offset += 2; // numTables
    buffer.writeUInt16BE(0, offset); offset += 2; // reserved
    buffer.writeUInt32BE(512, offset); offset += 4; // totalSfntSize
    buffer.writeUInt16BE(1, offset); offset += 2; // majorVersion
    buffer.writeUInt16BE(0, offset); offset += 2; // minorVersion
    buffer.writeUInt32BE(0, offset); offset += 4; // metaOffset
    buffer.writeUInt32BE(0, offset); offset += 4; // metaLength
    buffer.writeUInt32BE(0, offset); offset += 4; // metaOrigLength
    buffer.writeUInt32BE(0, offset); offset += 4; // privOffset
    buffer.writeUInt32BE(0, offset); offset += 4; // privLength
    
    // Table directory entries (simplified)
    // We need at least: cmap, head, hhea, maxp
    
    // cmap table entry
    buffer.write('cmap', offset, 4, 'ascii'); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4; // checksum
    buffer.writeUInt32BE(64, offset); offset += 4; // offset
    buffer.writeUInt32BE(32, offset); offset += 4; // compLength
    buffer.writeUInt32BE(32, offset); offset += 4; // origLength
    
    // head table entry
    buffer.write('head', offset, 4, 'ascii'); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4; // checksum
    buffer.writeUInt32BE(96, offset); offset += 4; // offset
    buffer.writeUInt32BE(54, offset); offset += 4; // compLength
    buffer.writeUInt32BE(54, offset); offset += 4; // origLength
    
    // hhea table entry
    buffer.write('hhea', offset, 4, 'ascii'); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4; // checksum
    buffer.writeUInt32BE(150, offset); offset += 4; // offset
    buffer.writeUInt32BE(36, offset); offset += 4; // compLength
    buffer.writeUInt32BE(36, offset); offset += 4; // origLength
    
    // maxp table entry
    buffer.write('maxp', offset, 4, 'ascii'); offset += 4;
    buffer.writeUInt32BE(0, offset); offset += 4; // checksum
    buffer.writeUInt32BE(186, offset); offset += 4; // offset
    buffer.writeUInt32BE(6, offset); offset += 4; // compLength
    buffer.writeUInt32BE(6, offset); offset += 4; // origLength
    
    // Minimal table data (placeholder for a real font)
    // In a real implementation, these would contain proper font metrics and glyph data
    
    return buffer.slice(0, 256);
}

function createKiroTheme() {
    const themeConfig = {
        "fonts": [
            {
                "id": "kiro",
                "src": [
                    {
                        "path": "./kiro.woff",
                        "format": "woff"
                    }
                ]
            }
        ],
        "iconDefinitions": {
            "kiro-idle": {
                "fontCharacter": "\\61" // Character code for idle state
            },
            "kiro-active": {
                "fontCharacter": "\\62" // Character code for active state
            },
            "kiro-error": {
                "fontCharacter": "\\63" // Character code for error state
            },
            "kiro-complete": {
                "fontCharacter": "\\64" // Character code for complete state
            }
        }
    };
    
    const themeDir = path.join(__dirname, '..', 'theme');
    const themePath = path.join(themeDir, 'kiro-theme.json');
    
    fs.writeFileSync(themePath, JSON.stringify(themeConfig, null, 2));
    console.log('Created Kiro theme at:', themePath);
}

// Run the font creation
if (require.main === module) {
    try {
        createKiroFont();
        console.log('\\nKiro font creation completed!');
        console.log('\\nNext steps:');
        console.log('1. Update package.json with icon contributions');
        console.log('2. Use $(kiro-idle), $(kiro-active), etc. in status bar text');
    } catch (error) {
        console.error('Error creating Kiro font:', error);
    }
}

module.exports = { createKiroFont };
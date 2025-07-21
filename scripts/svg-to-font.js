const fs = require('fs');
const path = require('path');

// Simple SVG to font converter for VS Code icons
// This creates a minimal font file that VS Code can recognize

// Create resources directory if it doesn't exist
const resourcesDir = path.join(__dirname, '..', 'resources');
if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
}

// Create a simple TTF font file structure
// This is a minimal implementation for demonstration
function createSimpleFont() {
    // For VS Code, we need to create a proper font file
    // Since creating a real font is complex, we'll use a workaround
    
    // Create a CSS file that embeds the SVG as a data URI
    const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Clean and minimize the SVG
    const cleanedSvg = svgContent
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    
    // Encode the SVG for data URI
    const encodedSvg = encodeURIComponent(cleanedSvg);
    
    // Create a CSS file with the embedded SVG
    const cssContent = `@font-face {
    font-family: 'kiro-icons';
    src: url(data:application/font-woff;charset=utf-8;base64,) format('woff');
}

/* Fallback using SVG data URI */
.kiro-icon::before {
    content: '';
    display: inline-block;
    width: 1em;
    height: 1em;
    background-image: url('data:image/svg+xml,${encodedSvg}');
    background-size: contain;
    background-repeat: no-repeat;
    vertical-align: middle;
}`;
    
    // Write the CSS file
    const cssPath = path.join(resourcesDir, 'kiro-icons.css');
    fs.writeFileSync(cssPath, cssContent);
    console.log('Created CSS file:', cssPath);
    
    // For VS Code, we need an actual font file
    // Create a minimal WOFF file (this is a placeholder)
    const woffData = Buffer.from([
        // WOFF signature
        0x77, 0x4F, 0x46, 0x46,
        // Flavor
        0x00, 0x01, 0x00, 0x00,
        // Length
        0x00, 0x00, 0x00, 0x00,
        // NumTables
        0x00, 0x00,
        // Reserved
        0x00, 0x00,
        // TotalSfntSize
        0x00, 0x00, 0x00, 0x00,
        // TotalCompressedSize
        0x00, 0x00, 0x00, 0x00,
        // MajorVersion
        0x00, 0x00,
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
        0x00, 0x00, 0x00, 0x00
    ]);
    
    const woffPath = path.join(resourcesDir, 'kiro.woff');
    fs.writeFileSync(woffPath, woffData);
    console.log('Created WOFF file:', woffPath);
}

createSimpleFont();
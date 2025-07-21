const fs = require('fs');
const path = require('path');

/**
 * Create unified SVG files for IcoMoon
 * Combine multiple paths into single paths and create color variations
 */

function createUnifiedSVGs() {
    console.log('Creating unified SVG files for IcoMoon...');
    
    // Read the original SVG
    const svgPath = path.join(__dirname, '..', 'images', 'kiro_1.svg');
    const originalSvg = fs.readFileSync(svgPath, 'utf8');
    
    console.log('Original SVG structure:');
    console.log(originalSvg);
    
    // Extract individual paths
    const paths = extractPaths(originalSvg);
    console.log('\\nExtracted paths:');
    paths.forEach((path, i) => {
        console.log(`${i + 1}. ${path.fill}: ${path.d.substring(0, 50)}...`);
    });
    
    // Create unified SVGs for each state
    const states = {
        idle: '#9046ff',    // Original purple
        active: '#ff6b35',  // Orange
        error: '#ff4757',   // Red
        complete: '#2ed573' // Green
    };
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'svg-for-icomoon');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create unified SVG for each state
    Object.entries(states).forEach(([stateName, color]) => {
        const unifiedSvg = createUnifiedSVG(paths, color, stateName);
        const outputPath = path.join(outputDir, `kiro-${stateName}.svg`);
        fs.writeFileSync(outputPath, unifiedSvg);
        console.log(`\\nCreated unified SVG: ${outputPath}`);
    });
    
    console.log('\\n✅ Unified SVG creation completed!');
    console.log('\\n📝 Next steps:');
    console.log('1. Upload these 4 SVG files to IcoMoon');
    console.log('2. Assign Unicode values: \\\\e900, \\\\e901, \\\\e902, \\\\e903');
    console.log('3. Download the new font file');
    console.log('4. Replace kiro.woff with the new file');
}

function extractPaths(svgContent) {
    const pathRegex = /<path[^>]*>/g;
    const paths = [];
    let match;
    
    while ((match = pathRegex.exec(svgContent)) !== null) {
        const pathElement = match[0];
        
        // Extract d attribute
        const dMatch = pathElement.match(/d="([^"]+)"/);
        const d = dMatch ? dMatch[1] : '';
        
        // Extract fill attribute
        const fillMatch = pathElement.match(/fill="([^"]+)"/);
        const fill = fillMatch ? fillMatch[1] : '#000000';
        
        // Extract other attributes
        const fillOpacityMatch = pathElement.match(/fill-opacity="([^"]+)"/);
        const fillOpacity = fillOpacityMatch ? fillOpacityMatch[1] : '1';
        
        paths.push({
            d: d,
            fill: fill,
            fillOpacity: fillOpacity,
            original: pathElement
        });
    }
    
    return paths;
}

function createUnifiedSVG(paths, bodyColor, stateName) {
    // Start with SVG header
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 24">\\n';
    svg += `  <title>Kiro ${stateName.charAt(0).toUpperCase() + stateName.slice(1)}</title>\\n`;
    
    // Combine all paths into a single group with the new color
    svg += '  <g fill-rule="evenodd">\\n';
    
    paths.forEach((path, index) => {
        let fill = path.fill;
        
        // Replace the purple body color with the new state color
        if (fill === '#9046ff') {
            fill = bodyColor;
        }
        
        // Add each path with proper styling
        svg += `    <path fill="${fill}" fill-opacity="${path.fillOpacity}" d="${path.d}" />\\n`;
    });
    
    svg += '  </g>\\n';
    svg += '</svg>';
    
    return svg;
}

// Alternative: Create single-path SVG (more compatible with some tools)
function createSinglePathSVG(paths, bodyColor, stateName) {
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 24">\\n';
    svg += `  <title>Kiro ${stateName.charAt(0).toUpperCase() + stateName.slice(1)}</title>\\n`;
    
    // Combine all path data into a single path
    const combinedPath = paths.map(path => path.d).join(' ');
    
    svg += `  <path fill="${bodyColor}" fill-rule="evenodd" d="${combinedPath}" />\\n`;
    svg += '</svg>';
    
    return svg;
}

// Also create simplified single-color versions
function createSimplifiedSVGs() {
    console.log('\\nCreating simplified single-color SVGs...');
    
    const simplifiedDir = path.join(__dirname, '..', 'svg-simplified');
    if (!fs.existsSync(simplifiedDir)) {
        fs.mkdirSync(simplifiedDir, { recursive: true });
    }
    
    const states = {
        idle: '#9046ff',
        active: '#ff6b35', 
        error: '#ff4757',
        complete: '#2ed573'
    };
    
    // Create simple filled rectangles as placeholders
    Object.entries(states).forEach(([stateName, color]) => {
        const simpleSvg = createSimpleKiroSVG(color, stateName);
        const outputPath = path.join(simplifiedDir, `kiro-${stateName}-simple.svg`);
        fs.writeFileSync(outputPath, simpleSvg);
        console.log(`Created simplified SVG: ${outputPath}`);
    });
}

function createSimpleKiroSVG(color, stateName) {
    // Create a simple recognizable shape that represents Kiro
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 24">
  <title>Kiro ${stateName.charAt(0).toUpperCase() + stateName.slice(1)} (Simplified)</title>
  <!-- Main body -->
  <rect x="4" y="3" width="13" height="15" rx="2" fill="${color}" />
  <!-- Eyes -->
  <rect x="7" y="8" width="2" height="3" fill="#000000" />
  <rect x="12" y="8" width="2" height="3" fill="#000000" />
  <!-- Highlight -->
  <rect x="6" y="5" width="9" height="2" fill="#ffffff" opacity="0.7" />
</svg>`;
}

// Main execution
if (require.main === module) {
    try {
        createUnifiedSVGs();
        createSimplifiedSVGs();
        
        console.log('\\n🎯 All SVG variants created!');
        console.log('\\n📂 Check these directories:');
        console.log('  - svg-for-icomoon/ (unified original paths)');
        console.log('  - svg-simplified/ (simple geometric shapes)');
        
    } catch (error) {
        console.error('❌ Error creating unified SVGs:', error);
    }
}

module.exports = { createUnifiedSVGs };
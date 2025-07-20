// Test script for icon changes and warning suppression
const fs = require('fs');

console.log('🎨 Icon Test: Kiro-Chan (No Emojis)\n');

// Check if extension was compiled
const extensionPath = 'dist/extension-simple.js';
if (fs.existsSync(extensionPath)) {
    const content = fs.readFileSync(extensionPath, 'utf8');
    
    console.log('📁 Extension compiled successfully');
    
    // Check for emoji removal
    const emojiPatterns = [
        { name: 'Ghost emoji (👻)', pattern: /👻/ },
        { name: 'Star emoji (⭐)', pattern: /⭐/ },
        { name: 'Sparkles emoji (✨)', pattern: /✨/ },
        { name: 'Circle emoji (⚫)', pattern: /⚫/ },
        { name: 'Other emojis', pattern: /[\u{1F300}-\u{1F9FF}]/u }
    ];
    
    console.log('\n🚫 Emoji Check (should be REMOVED):');
    let foundEmojis = false;
    emojiPatterns.forEach(pattern => {
        if (pattern.pattern.test(content)) {
            console.log(`❌ ${pattern.name} - Still present!`);
            foundEmojis = true;
        } else {
            console.log(`✅ ${pattern.name} - Removed`);
        }
    });
    
    // Check for Codicon usage
    const codiconPatterns = [
        { name: 'Ghost icon', pattern: /\$\(ghost\)/ },
        { name: 'Check icon', pattern: /\$\(check\)/ },
        { name: 'Warning icon', pattern: /\$\(warning\)/ },
        { name: 'Bell icon', pattern: /\$\(bell\)/ },
        { name: 'Star icon', pattern: /\$\(star\)/ },
        { name: 'Zap icon', pattern: /\$\(zap\)/ }
    ];
    
    console.log('\n✅ Codicon Check (should be PRESENT):');
    codiconPatterns.forEach(pattern => {
        if (pattern.pattern.test(content)) {
            console.log(`✅ ${pattern.name} - Found`);
        } else {
            console.log(`⚠️  ${pattern.name} - Not found`);
        }
    });
    
    if (!foundEmojis) {
        console.log('\n🎉 SUCCESS: All emojis removed from status bar!');
    } else {
        console.log('\n❌ WARNING: Some emojis still present in code');
    }
    
} else {
    console.log('❌ Extension not compiled! Run "npm run build" first.');
}

// Check images directory
console.log('\n🖼️  Image Files:');
if (fs.existsSync('images')) {
    const imageFiles = fs.readdirSync('images');
    imageFiles.forEach(file => {
        const stats = fs.statSync(`images/${file}`);
        console.log(`✅ images/${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
} else {
    console.log('❌ Images directory not found');
}

// Check package.json for icon configuration
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('\n⚙️ Package Configuration:');
if (pkg.contributes && pkg.contributes.icons) {
    console.log('✅ Custom icons configured in package.json');
    Object.keys(pkg.contributes.icons).forEach(iconName => {
        console.log(`   • ${iconName}: ${pkg.contributes.icons[iconName].description}`);
    });
} else {
    console.log('⚠️  No custom icons configured (using Codicons instead)');
}

// Check VSIX
const vsixPath = 'kiro-chan-1.0.0.vsix';
if (fs.existsSync(vsixPath)) {
    const stats = fs.statSync(vsixPath);
    console.log(`\n📦 VSIX Package: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} else {
    console.log('\n❌ VSIX package not found');
}

console.log('\n🎯 Expected Status Bar Display:');
console.log('• Normal: $(ghost) Kiro...');
console.log('• Idle: $(ghost) Kiro (Idle)');
console.log('• Active: $(zap) Kiro (Active)');
console.log('• Error: $(warning) Kiro (Error)');
console.log('• Completed: $(check) Kiro (Completed)');
console.log('• Sound feedback: $(bell) Kiro [INFO], $(star) Kiro [YAY], etc.');

console.log('\n🔇 Warning Suppression:');
console.log('• suppress-warnings.js created');
console.log('• Package scripts updated to suppress punycode warnings');
console.log('• Use "npm run package-quiet" for clean output');

console.log('\n🚀 Installation Instructions:');
console.log('1. Uninstall previous version');
console.log('2. Install new VSIX file');
console.log('3. Check status bar for $(ghost) Kiro instead of emoji');
console.log('4. Test commands to see different Codicons');

console.log('\n✨ Changes Made:');
console.log('• ❌ Removed all emoji characters (👻, ⭐, ✨, ⚫, etc.)');
console.log('• ✅ Added Codicon support ($(ghost), $(check), $(warning), etc.)');
console.log('• 🖼️  Created custom SVG icon (images/kiro.svg)');
console.log('• 🔇 Added punycode warning suppression');
console.log('• 📦 Updated package.json with icon configuration');

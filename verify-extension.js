// Verify the simplified extension
const fs = require('fs');

console.log('🔍 Verifying Simplified Kiro-Chan Extension...\n');

// Check if the simple extension was compiled
const simplePath = 'dist/extension-simple.js';
if (fs.existsSync(simplePath)) {
    const content = fs.readFileSync(simplePath, 'utf8');
    
    console.log('✅ Simplified extension compiled');
    console.log(`📦 Size: ${(content.length / 1024).toFixed(2)} KB`);
    
    // Check for essential parts
    const essentials = [
        { name: 'activate function', pattern: /function activate/ },
        { name: 'createStatusBarItem', pattern: /createStatusBarItem/ },
        { name: 'show() method', pattern: /\.show\(\)/ },
        { name: 'status bar text', pattern: /\.text\s*=/ },
        { name: 'console.log', pattern: /console\.log/ }
    ];
    
    console.log('\n🔍 Essential components:');
    essentials.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name} - MISSING!`);
        }
    });
    
    // Show first few lines of activate function
    const activateMatch = content.match(/function activate[\s\S]{0,500}/);
    if (activateMatch) {
        console.log('\n📋 Activate function preview:');
        console.log(activateMatch[0].substring(0, 200) + '...');
    }
    
} else {
    console.log('❌ Simplified extension not found!');
    process.exit(1);
}

// Check package.json configuration
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('\n⚙️ Configuration:');
console.log(`✅ Main entry: ${pkg.main}`);
console.log(`✅ Activation: ${pkg.activationEvents.join(', ')}`);
console.log(`✅ Publisher: ${pkg.publisher}`);

// Check VSIX file
const vsixPath = 'kiro-chan-1.0.0.vsix';
if (fs.existsSync(vsixPath)) {
    const stats = fs.statSync(vsixPath);
    console.log(`✅ VSIX package: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
    console.log('❌ VSIX package not found!');
}

console.log('\n🚀 Installation Instructions:');
console.log('1. 🗑️  Uninstall old version:');
console.log('   • Ctrl+Shift+X → Search "Kiro-Chan" → Uninstall');
console.log('   • Ctrl+Shift+P → "Developer: Reload Window"');
console.log('');
console.log('2. 📦 Install new version:');
console.log('   • Ctrl+Shift+P → "Extensions: Install from VSIX"');
console.log('   • Select: kiro-chan-1.0.0.vsix');
console.log('');
console.log('3. ✅ Verify installation:');
console.log('   • Look for 👻 in status bar (bottom-right)');
console.log('   • Should show: "👻 Kiro" with animation');
console.log('   • Click it to test settings command');
console.log('');
console.log('4. 🎮 Test commands:');
console.log('   • Ctrl+Shift+P → "Kiro Chan: Set Active State"');
console.log('   • Should change to: "⚡ Kiro (Active)"');
console.log('');
console.log('5. 🐛 If still not working:');
console.log('   • Help → Toggle Developer Tools');
console.log('   • Check Console tab for errors');
console.log('   • Look for "Kiro-Chan extension is activating..." message');

console.log('\n🎯 Expected Results:');
console.log('• Status bar shows: 👻 Kiro (animating every 1 second)');
console.log('• Animation cycles: 👻 → 🌟 → ✨ → 💫 → repeat');
console.log('• Click opens settings notification');
console.log('• Commands change the display text');

console.log('\n✨ This simplified version removes all complex features');
console.log('   and focuses only on basic status bar display.');
console.log('   If this works, we can gradually add features back.');

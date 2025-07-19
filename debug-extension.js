// Debug script to test the extension
const fs = require('fs');

console.log('🔍 Debugging Kiro Status Character Extension...\n');

// Check compiled extension.js
const extensionPath = 'dist/extension.js';
if (fs.existsSync(extensionPath)) {
    const content = fs.readFileSync(extensionPath, 'utf8');

    console.log('✅ Extension compiled successfully');
    console.log(`📦 File size: ${(content.length / 1024).toFixed(2)} KB`);

    // Check for key functions
    const checks = [
        { name: 'activate function', pattern: /function activate\(/ },
        { name: 'createStatusBarItem', pattern: /createStatusBarItem/ },
        { name: 'show() call', pattern: /\.show\(\)/ },
        { name: 'status bar text', pattern: /\.text\s*=/ },
        { name: 'animation logic', pattern: /animationFrame/ }
    ];

    console.log('\n🔍 Code analysis:');
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`✅ ${check.name} - Found`);
        } else {
            console.log(`❌ ${check.name} - Missing!`);
        }
    });

} else {
    console.log('❌ Extension not compiled! Run "npm run build" first.');
}

// Check package.json
console.log('\n📋 Package.json check:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log(`✅ Name: ${pkg.name}`);
console.log(`✅ Version: ${pkg.version}`);
console.log(`✅ Main: ${pkg.main}`);
console.log(`✅ Activation: ${pkg.activationEvents.join(', ')}`);

if (pkg.activationEvents.includes('*')) {
    console.log('⚡ Using "*" activation - will start immediately');
} else {
    console.log('⏰ Using conditional activation');
}

console.log('\n🎮 Available commands:');
if (pkg.contributes && pkg.contributes.commands) {
    pkg.contributes.commands.forEach(cmd => {
        console.log(`  • ${cmd.command}: ${cmd.title}`);
    });
}

console.log('\n⚙️ Configuration options:');
if (pkg.contributes && pkg.contributes.configuration) {
    const props = pkg.contributes.configuration.properties;
    Object.keys(props).forEach(prop => {
        console.log(`  • ${prop}: ${props[prop].description}`);
    });
}

console.log('\n🚀 Installation steps:');
console.log('1. Uninstall old version: Extensions panel → Kiro-Chan → Uninstall');
console.log('2. Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"');
console.log('3. Install new version: Ctrl+Shift+P → "Extensions: Install from VSIX"');
console.log('4. Select: kiro-chan-1.0.0.vsix');
console.log('5. Look for 👻 in status bar (bottom right)');

console.log('\n🐛 If still not working:');
console.log('1. Open Developer Tools: Help → Toggle Developer Tools');
console.log('2. Check Console tab for errors');
console.log('3. Try commands: Ctrl+Shift+P → "Kiro Chan: Set Active State"');
console.log('4. Check settings: Ctrl+, → search "kiro-chan"');

console.log('\n✨ Expected behavior:');
console.log('• Status bar shows: 👻 Kiro (with animation)');
console.log('• Click opens settings');
console.log('• Commands change animation state');
console.log('• Settings control enable/disable and speed');

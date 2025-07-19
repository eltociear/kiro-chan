// Simple test script to verify the extension structure
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Kiro Status Character Extension...\n');

// Check if main files exist
const filesToCheck = [
  'dist/extension.js',
  'dist/StatusBarCharacterVSCode.js',
  'dist/types/index.js',
  'dist/animation/AnimationController.js',
  'dist/settings/SettingsManager.js',
  'package.json',
  'LICENSE.md'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

// Check package.json structure
console.log('\n📦 Package.json validation:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredFields = ['name', 'version', 'main', 'engines', 'activationEvents', 'contributes'];
requiredFields.forEach(field => {
  if (packageJson[field]) {
    console.log(`✅ ${field}: ${typeof packageJson[field] === 'object' ? 'configured' : packageJson[field]}`);
  } else {
    console.log(`❌ ${field} - Missing!`);
    allFilesExist = false;
  }
});

// Check commands
console.log('\n🎮 Commands:');
if (packageJson.contributes && packageJson.contributes.commands) {
  packageJson.contributes.commands.forEach(cmd => {
    console.log(`✅ ${cmd.command}: ${cmd.title}`);
  });
} else {
  console.log('❌ No commands found');
}

// Check configuration
console.log('\n⚙️ Configuration:');
if (packageJson.contributes && packageJson.contributes.configuration) {
  const props = packageJson.contributes.configuration.properties;
  Object.keys(props).forEach(prop => {
    console.log(`✅ ${prop}: ${props[prop].description}`);
  });
} else {
  console.log('❌ No configuration found');
}

console.log('\n🎯 Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present!');
  console.log('🚀 Extension is ready for installation!');
  console.log('\n📋 Installation instructions:');
  console.log('1. Open VS Code');
  console.log('2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)');
  console.log('3. Type "Extensions: Install from VSIX"');
  console.log('4. Select the kiro-chan-1.0.0.vsix file');
  console.log('5. Reload VS Code');
  console.log('6. Look for the 👻 character in the status bar!');
} else {
  console.log('❌ Some files are missing. Please run "npm run build" first.');
}

console.log('\n🎮 Available commands after installation:');
console.log('- Ctrl+Shift+P → "Kiro Chan: Open Settings"');
console.log('- Ctrl+Shift+P → "Kiro Chan: Set Idle State"');
console.log('- Ctrl+Shift+P → "Kiro Chan: Set Active State"');
console.log('- Ctrl+Shift+P → "Kiro Chan: Set Error State"');

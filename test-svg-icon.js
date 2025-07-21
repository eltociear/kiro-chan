// Test script to verify the SVG icon in the status bar
const vscode = require('vscode');

/**
 * This script tests the SVG icon implementation in the status bar
 * It activates the extension and verifies that the icon appears correctly
 */
async function testSvgIcon() {
  try {
    console.log('Starting SVG icon test...');
    
    // Get the extension
    const extension = vscode.extensions.getExtension('eltociear.kiro-chan');
    
    if (!extension) {
      console.error('Extension not found. Make sure it is installed and the ID is correct.');
      return;
    }
    
    // Activate the extension if not already activated
    if (!extension.isActive) {
      console.log('Activating extension...');
      await extension.activate();
      console.log('Extension activated.');
    } else {
      console.log('Extension is already active.');
    }
    
    // Wait a moment for the status bar to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test different states
    console.log('Testing idle state...');
    await vscode.commands.executeCommand('kiro-chan.setIdle');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Testing active state...');
    await vscode.commands.executeCommand('kiro-chan.setActive');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Testing error state...');
    await vscode.commands.executeCommand('kiro-chan.setError');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset to idle state
    await vscode.commands.executeCommand('kiro-chan.setIdle');
    
    console.log('SVG icon test completed successfully.');
    console.log('Please verify visually that the SVG icon appears correctly in the status bar.');
    
    // Show a notification to the user
    vscode.window.showInformationMessage('SVG icon test completed. Please verify the icon in the status bar.');
    
  } catch (error) {
    console.error('Error during SVG icon test:', error);
    vscode.window.showErrorMessage(`SVG icon test failed: ${error.message}`);
  }
}

// Run the test
testSvgIcon();

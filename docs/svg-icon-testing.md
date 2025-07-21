# SVG Icon Testing Guide

This document provides instructions for testing the SVG icon implementation in the status bar.

## Automated Tests

The extension includes automated tests for the SVG icon implementation:

1. **Unit Tests**: Test the SVG icon utility functions
   ```bash
   npm test
   ```

2. **Manual Visual Test**: Test the SVG icon appearance in the status bar
   ```bash
   npm run test:svg-icon
   ```

## Manual Testing Steps

To manually verify the SVG icon implementation:

1. **Build and Install the Extension**
   ```bash
   npm run build
   npm run package
   ```
   Then install the generated VSIX file in VS Code.

2. **Verify Icon Appearance**
   - Check that the SVG icon appears in the status bar
   - Verify that the icon is properly sized and visible
   - Test with different VS Code themes (light, dark, high contrast)

3. **Test State Changes**
   - Use the commands to change the extension state:
     - `Kiro Chan: Set Idle State`
     - `Kiro Chan: Set Active State`
     - `Kiro Chan: Set Error State`
   - Verify that the icon updates appropriately for each state

4. **Test Configuration**
   - Open VS Code settings and find the "Kiro Chan" section
   - Toggle the "Use SVG Icon" setting off and verify that the extension falls back to emoji characters
   - Toggle the setting back on and verify that the SVG icon reappears

## Troubleshooting

If the SVG icon doesn't appear correctly:

1. Check the VS Code console for any error messages
2. Verify that the SVG file is properly included in the extension package
3. Check that the SVG file has the correct format and viewBox attribute
4. Try reloading the window or reinstalling the extension

## Expected Results

- The SVG icon should be visible in the status bar
- The icon should change appropriately based on the extension state
- The icon should be visible in all VS Code themes
- The extension should fall back to emoji characters if SVG icons are disabled or not supported

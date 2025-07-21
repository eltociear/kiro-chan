# Design Document: SVG Status Bar Icon

## Overview

This design document outlines the approach for implementing a custom SVG icon (`images/kiro_1.svg`) in the VS Code status bar for the Kiro extension. The implementation will replace the current emoji-based character display with a custom SVG icon that provides a more distinctive and branded visual element.

## Architecture

The implementation will leverage VS Code's API for status bar customization. There are two main approaches to consider:

1. **Direct SVG URI Path**: Using a URI path to the SVG file in the extension package
2. **Product Icon Integration**: Registering the SVG as a product icon through the VS Code API

Based on the current extension structure and VS Code's capabilities, we'll use the direct SVG URI path approach as it provides the most reliable way to display custom SVG icons in the status bar.

## Components and Interfaces

### Modified Components

1. **StatusBarCharacterVSCode Class**
   - Update the `updateStatusBarText` method to use SVG icon instead of emoji characters
   - Modify the animation logic to work with SVG icon if needed

2. **Extension Activation**
   - Update the initialization to ensure the SVG file is properly loaded and accessible

### New Components

1. **SVG Icon Utility**
   - Create a utility function to generate the proper URI for the SVG icon
   - Handle theme-aware SVG display if needed

## Data Models

No new data models are required for this implementation. We'll continue to use the existing state models:

```typescript
enum KiroState {
  IDLE,
  EXECUTING,
  ERROR
}
```

## Implementation Details

### SVG Icon Integration

The SVG icon will be integrated using VS Code's URI scheme for accessing extension resources. The implementation will:

1. Use the `vscode-resource:` URI scheme or the newer `vscode.Uri.joinPath` method to reference the SVG file
2. Ensure the SVG file is included in the extension package by verifying it's listed in the `files` section of `package.json`

### Status Bar Text Formatting

The current implementation uses text formatting like:
```typescript
this.statusBarItem.text = `${character} Kiro`;
```

This will be updated to use the SVG icon:
```typescript
this.statusBarItem.text = `$(kiro-icon) Kiro`;
```

Or using a direct URI approach if needed.

### Theme Compatibility

The SVG icon should be visible in both light and dark themes. The implementation will:

1. Use appropriate colors in the SVG that work well with both light and dark themes
2. Consider using VS Code's theming API to adjust the icon based on the current theme if needed

## Error Handling

The implementation will include proper error handling:

1. Fallback to emoji characters if the SVG icon fails to load
2. Log appropriate error messages for troubleshooting
3. Ensure the extension continues to function even if the SVG display fails

## Testing Strategy

The implementation will be tested using:

1. **Unit Tests**
   - Test the SVG URI generation function
   - Test fallback mechanisms

2. **Integration Tests**
   - Verify the SVG icon appears correctly in the status bar
   - Test theme switching to ensure the icon remains visible

3. **Manual Testing**
   - Visual verification in both light and dark themes
   - Verification across different VS Code versions

## Compatibility Considerations

The implementation will ensure compatibility with:

1. Different VS Code versions (minimum supported version: 1.94.0 as specified in package.json)
2. Various operating systems (Windows, macOS, Linux)
3. Different display densities and resolutions

## Design Decisions and Rationales

### Why Direct SVG URI Approach?

While VS Code supports product icons through the `contributes.icons` section in `package.json`, the direct URI approach provides more flexibility and control over how the SVG is displayed in the status bar. It also allows for easier animation and state-based icon changes.

### SVG File Selection

The `images/kiro_1.svg` file was chosen because:
1. It provides a clear, recognizable representation of the Kiro character
2. It has appropriate dimensions for status bar display
3. It uses colors that work well with VS Code's UI

### Animation Considerations

The current implementation uses different emoji characters for animation. With an SVG icon, we have two options:
1. Use a single static SVG icon
2. Implement animation by switching between different SVG files or modifying SVG properties

For simplicity and performance, we'll start with a static SVG icon approach and consider animation enhancements in future iterations if needed.

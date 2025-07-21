# Kiro-Chan VS Code Extension

A VS Code extension that displays an animated Kiro character in the status bar using SVG icons. Features reactive animations that respond to typing activity.

## Features

- **SVG Animation**: High-quality SVG icons using custom WOFF font
- **Reactive Animation**: Responds to typing with different animation patterns
- **Two Animation Modes**:
  - **Active State**: Fast animation when typing (100ms intervals)
  - **Standby State**: Slow animation when idle (1500ms intervals)
- **VS Code Integration**: Uses Product Icons system for seamless integration

## Installation

### From VSIX File

1. Download the latest `.vsix` file
2. In VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. Select the downloaded `.vsix` file

### Command Line

```bash
code --install-extension kiro-chan-v4.vsix
```

## Usage

1. **Auto Start**: Kiro appears in the status bar when VS Code starts
2. **Animation**: Automatically switches to active animation when typing
3. **Toggle**: Click on Kiro in the status bar to show/hide

## Settings

Configure in VS Code settings (`settings.json`):

```json
{
  "kiro-chan.enabled": true,
  "kiro-chan.animationSpeed": 1.0,
  "kiro-chan.useSvgIcon": true
}
```

## Animation Patterns

- **Active**: `\e900` → `\e901` → `\e902` (100ms intervals)
- **Standby**: `\e903` → `\e904` (1500ms intervals)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Package
npx vsce package
```

## License

MIT License

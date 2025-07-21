# Kiro-Chan VS Code Extension

A VS Code extension that displays an animated Kiro character in the status bar using SVG icons. Features reactive animations that respond to typing activity.

## Features

- **Reactive Animation**: Responds to typing with different animation patterns
- **Two Animation Modes**:
  - **Active State**: Fast animation when typing
  - **Standby State**: Slow animation when idle

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

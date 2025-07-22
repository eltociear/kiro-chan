# Kiro-Chan VS Code Extension

A VS Code extension that displays an animated Kiro character in the status bar using SVG icons. Features reactive animations that respond to typing activity.

## Features

- **Reactive Animation**: Responds to typing with different animation patterns
- **Two Animation Modes**:
  - **Active State**: Fast animation when typing
  - **Standby State**: Slow animation when idle
- **Task Completion Notifications**: Shows OS native notification after 10 seconds of inactivity
- **Customizable Settings**: Control animations, notifications, and appearance

## Usage

1. **Auto Start**: Kiro appears in the status bar when VS Code starts
2. **Animation**: Automatically switches to active animation when typing
3. **Toggle**: Click on Kiro in the status bar to show/hide
4. **Task Complete**: Get notified when you've been inactive for 10 seconds

## Settings

Configure in VS Code settings (`settings.json`):

```json
{
  "kiro-chan.enabled": true,
  "kiro-chan.animationSpeed": 1.0,
  "kiro-chan.useSvgIcon": true,
  "kiro-chan.notificationEnabled": true
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

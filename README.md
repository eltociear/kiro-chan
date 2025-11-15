# Kiro-Chan

A cute character extension that lives in your VS Code status bar.

## Features

- Displays Kiro character in the status bar
- Animated when typing
- Different animation when idle
- Task completion notifications
- Customizable display color with color picker

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `kiro-chan.enabled` | `true` | Show/hide the character |
| `kiro-chan.displayColor` | `#FFFFFF` | Character and text display color |
| `kiro-chan.notificationEnabled` | `true` | Enable task completion notifications |
| `kiro-chan.soundEnabled` | `true` | Enable notification sound |
| `kiro-chan.soundVolume` | `0.5` | Sound volume (0.0-1.0) |
| `kiro-chan.animationSpeed` | `1` | Animation speed multiplier |

## Commands

- `Kiro Chan: Toggle Kiro Character` - Toggle visibility
- `Kiro Chan: Set Idle State` - Set to idle state
- `Kiro Chan: Set Active State` - Set to active state
- `Kiro Chan: Set Error State` - Set to error state
- `Kiro Chan: Set Complete State` - Set to complete state

## Installation

1. Download the `.vsix` file
2. Run `Extensions: Install from VSIX...` in VS Code
3. Select the downloaded file

## License

MIT

import * as vscode from 'vscode';
import * as path from 'path';

export class IconManager {
    private context: vscode.ExtensionContext;
    private iconPath: string;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.iconPath = path.join(context.extensionPath, 'images', 'kiro.svg');
    }

    // Get the main Kiro icon (no more emojis!)
    getKiroIcon(): string {
        // VS Code status bar supports $(icon-name) syntax for built-in icons
        // For custom icons, we use the icon path
        return '$(symbol-misc)'; // Fallback to built-in icon
    }

    // Get icon for different states (all use the same Kiro image)
    getStateIcon(state: string): string {
        // Always return the same Kiro icon, no more emojis
        return '$(symbol-misc) Kiro';
    }

    // Get animation states (no more emoji animation)
    getAnimationStates(): string[] {
        // Return the same icon for all animation frames
        // This effectively disables emoji animation
        return [
            '$(symbol-misc) Kiro',
            '$(symbol-misc) Kiro',
            '$(symbol-misc) Kiro',
            '$(symbol-misc) Kiro'
        ];
    }

    // Alternative: Use ThemeIcon for better VS Code integration
    getThemeIcon(): vscode.ThemeIcon {
        return new vscode.ThemeIcon('symbol-misc');
    }

    // Get icon URI for the custom SVG
    getIconUri(): vscode.Uri {
        return vscode.Uri.file(this.iconPath);
    }
}

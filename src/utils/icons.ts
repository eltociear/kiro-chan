import * as vscode from 'vscode';
import * as path from 'path';

export class IconManager {
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    // Get the path to the Kiro icon
    getKiroIconPath(): vscode.Uri {
        return vscode.Uri.file(
            path.join(this.context.extensionPath, 'images', 'kiro.svg')
        );
    }

    // Create a status bar item with the Kiro icon
    createStatusBarItemWithIcon(): vscode.StatusBarItem {
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        
        // Try to use the custom icon, fallback to text if not available
        try {
            const iconPath = this.getKiroIconPath();
            // VS Code doesn't support custom icons in status bar directly
            // So we'll use a Unicode character that looks similar
            statusBarItem.text = '$(ghost)'; // VS Code built-in ghost icon
        } catch (error) {
            // Fallback to simple text
            statusBarItem.text = '👻';
        }
        
        return statusBarItem;
    }

    // Get different animation states
    getAnimationStates(): string[] {
        // Using VS Code's built-in icons for animation
        return [
            '$(ghost)',      // Ghost icon
            '$(star-full)',  // Star icon  
            '$(sparkle)',    // Sparkle icon (if available)
            '$(circle-filled)' // Circle icon
        ];
    }

    // Get state-specific icons
    getStateIcon(state: string): string {
        switch (state) {
            case 'idle':
                return '$(ghost)';
            case 'active':
                return '$(zap)';
            case 'error':
                return '$(warning)';
            case 'success':
                return '$(check)';
            case 'completion':
                return '$(trophy)';
            case 'notification':
                return '$(bell)';
            case 'celebration':
                return '$(star-full)';
            default:
                return '$(ghost)';
        }
    }
}

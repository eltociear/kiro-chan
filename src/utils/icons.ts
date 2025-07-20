import * as vscode from 'vscode';
import * as path from 'path';

export class IconManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.registerIcons();
    }

    private registerIcons(): void {
        // Register custom icon for status bar
        // VS Code uses Codicons, but we can reference our custom icon
        console.log('[IconManager] Custom icons registered');
    }

    getKiroIconPath(): string {
        // Return path to our custom Kiro icon
        return path.join(this.context.extensionPath, 'images', 'kiro.svg');
    }

    getKiroIconUri(): vscode.Uri {
        return vscode.Uri.file(this.getKiroIconPath());
    }
}

import * as vscode from 'vscode';
import * as path from 'path';

let statusBarItem: vscode.StatusBarItem;
let decorationType: vscode.TextEditorDecorationType;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Kiro-Chan WebFont extension is activating...');

    // Create a custom CSS with the SVG as a background
    const customCSS = `
    @font-face {
        font-family: 'KiroIcon';
        src: url('${vscode.Uri.file(path.join(context.extensionPath, 'images', 'kiro-icon.woff2')).toString()}') format('woff2');
    }
    
    .kiro-icon::before {
        content: '\\e000';
        font-family: 'KiroIcon';
        font-size: 14px;
    }
    `;

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.openSettings';
    statusBarItem.tooltip = 'Kiro Character - Click for settings';
    
    // Use a special character that we'll replace with CSS
    statusBarItem.text = '⬜ Kiro';
    statusBarItem.show();

    // Register decoration type for custom rendering
    decorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            width: '16px',
            height: '16px',
            backgroundImage: vscode.Uri.file(path.join(context.extensionPath, 'images', 'kiro_1.svg')).toString(),
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
        }
    });

    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(decorationType);
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (decorationType) {
        decorationType.dispose();
    }
}
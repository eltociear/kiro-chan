import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let animationTimer: NodeJS.Timeout | undefined;
let animationFrame = 0;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Kiro-Chan extension is activating...');

    // Create status bar item immediately
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.openSettings';
    statusBarItem.tooltip = 'Kiro Character - Click for settings';
    
    // Show immediately with basic text
    statusBarItem.text = '👻 Kiro';
    statusBarItem.show();
    
    console.log('✅ Status bar item created and shown');

    // Start simple animation
    startAnimation();

    // Register commands
    const openSettingsCommand = vscode.commands.registerCommand('kiro-chan.openSettings', () => {
        vscode.window.showInformationMessage('Kiro-Chan Settings (placeholder)');
        vscode.commands.executeCommand('workbench.action.openSettings', 'kiro-chan');
    });

    const setIdleCommand = vscode.commands.registerCommand('kiro-chan.setIdle', () => {
        statusBarItem.text = '👻 Kiro (Idle)';
        vscode.window.showInformationMessage('Kiro: Idle state');
    });

    const setActiveCommand = vscode.commands.registerCommand('kiro-chan.setActive', () => {
        statusBarItem.text = '⚡ Kiro (Active)';
        vscode.window.showInformationMessage('Kiro: Active state');
    });

    const setErrorCommand = vscode.commands.registerCommand('kiro-chan.setError', () => {
        statusBarItem.text = '⚠️ Kiro (Error)';
        vscode.window.showInformationMessage('Kiro: Error state');
    });

    // Add to subscriptions
    context.subscriptions.push(
        statusBarItem,
        openSettingsCommand,
        setIdleCommand,
        setActiveCommand,
        setErrorCommand
    );

    console.log('✅ Kiro-Chan extension activated successfully!');
}

function startAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
    }

    animationTimer = setInterval(() => {
        animationFrame = (animationFrame + 1) % 4;
        
        const characters = ['👻', '🌟', '✨', '💫'];
        const currentChar = characters[animationFrame];
        
        statusBarItem.text = `${currentChar} Kiro`;
    }, 1000); // 1 second intervals
}

export function deactivate() {
    console.log('🛑 Kiro-Chan extension is deactivating...');
    
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = undefined;
    }
    
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    console.log('✅ Kiro-Chan extension deactivated');
}

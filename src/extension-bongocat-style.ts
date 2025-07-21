import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let animationTimer: NodeJS.Timeout | undefined;
let animationFrame = 0;
let statusBarVisible = true;

// Icon states for different Kiro animations
const KIRO_ICONS = {
    idle: 'kiro-idle',
    active: 'kiro-active', 
    error: 'kiro-error',
    complete: 'kiro-complete'
};

// Animation sequence for idle state
const IDLE_SEQUENCE = [
    KIRO_ICONS.idle,
    KIRO_ICONS.idle,
    KIRO_ICONS.idle,
    KIRO_ICONS.active  // Occasional blink/movement
];

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Kiro-Chan BongoCat-style extension is activating...');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.toggleStatusBar';
    statusBarItem.tooltip = 'Kiro Character - Click to toggle';
    
    // Show initial state
    updateStatusBarIcon(KIRO_ICONS.idle);
    showStatusBar();
    
    // Start animation
    startAnimation();
    
    // Listen for text document changes (similar to BongoCat)
    const textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (statusBarVisible && event.contentChanges.length > 0) {
            // Show active state when typing
            updateStatusBarIcon(KIRO_ICONS.active);
            
            // Reset to idle after a short delay
            if (animationTimer) {
                clearTimeout(animationTimer);
            }
            animationTimer = setTimeout(() => {
                updateStatusBarIcon(KIRO_ICONS.idle);
            }, 500);
        }
    });
    
    // Register commands
    const toggleCommand = vscode.commands.registerCommand('kiro-chan.toggleStatusBar', () => {
        statusBarVisible = !statusBarVisible;
        if (statusBarVisible) {
            showStatusBar();
            startAnimation();
            vscode.window.showInformationMessage('Kiro Character is now visible');
        } else {
            hideStatusBar();
            stopAnimation();
            vscode.window.showInformationMessage('Kiro Character is now hidden');
        }
    });
    
    const setIdleCommand = vscode.commands.registerCommand('kiro-chan.setIdle', () => {
        updateStatusBarIcon(KIRO_ICONS.idle);
        vscode.window.showInformationMessage('Kiro: Idle state');
    });

    const setActiveCommand = vscode.commands.registerCommand('kiro-chan.setActive', () => {
        updateStatusBarIcon(KIRO_ICONS.active);
        vscode.window.showInformationMessage('Kiro: Active state');
    });

    const setErrorCommand = vscode.commands.registerCommand('kiro-chan.setError', () => {
        updateStatusBarIcon(KIRO_ICONS.error);
        vscode.window.showInformationMessage('Kiro: Error state');
    });
    
    const setCompleteCommand = vscode.commands.registerCommand('kiro-chan.setComplete', () => {
        updateStatusBarIcon(KIRO_ICONS.complete);
        vscode.window.showInformationMessage('Kiro: Task completed!');
    });

    // Add to subscriptions
    context.subscriptions.push(
        statusBarItem,
        textChangeDisposable,
        toggleCommand,
        setIdleCommand,
        setActiveCommand,
        setErrorCommand,
        setCompleteCommand
    );

    console.log('✅ Kiro-Chan BongoCat-style extension activated successfully!');
}

function updateStatusBarIcon(iconName: string) {
    if (statusBarItem) {
        // Use the BongoCat-style $(icon-name) format
        statusBarItem.text = `$(${iconName}) Kiro`;
        console.log(`Updated status bar icon to: $(${iconName})`);
    }
}

function showStatusBar() {
    if (statusBarItem) {
        statusBarItem.show();
    }
}

function hideStatusBar() {
    if (statusBarItem) {
        statusBarItem.hide();
    }
}

function startAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
    }
    
    // Subtle animation cycle through idle sequence
    animationTimer = setInterval(() => {
        if (statusBarVisible) {
            animationFrame = (animationFrame + 1) % IDLE_SEQUENCE.length;
            updateStatusBarIcon(IDLE_SEQUENCE[animationFrame]);
        }
    }, 2000); // Change every 2 seconds
}

function stopAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = undefined;
    }
}

export function deactivate() {
    console.log('🛑 Kiro-Chan BongoCat-style extension is deactivating...');
    
    stopAnimation();
    
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    console.log('✅ Kiro-Chan BongoCat-style extension deactivated');
}
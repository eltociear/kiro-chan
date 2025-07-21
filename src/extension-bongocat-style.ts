import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let animationTimer: NodeJS.Timeout | undefined;
let activeAnimationTimer: NodeJS.Timeout | undefined;
let animationFrame = 0;
let statusBarVisible = true;
let isActiveState = false;

// Icon states for different Kiro animations
const KIRO_ICONS = {
    idle: 'kiro-idle',       // \e900
    active: 'kiro-active',   // \e901
    error: 'kiro-error',     // \e902
    complete: 'kiro-complete', // \e903
    standby: 'kiro-standby'  // \e904
};

// Animation sequence for active state (when typing): \e900, \e901, \e902
const ACTIVE_SEQUENCE = [
    KIRO_ICONS.idle,     // \e900
    KIRO_ICONS.active,   // \e901
    KIRO_ICONS.error     // \e902
];

// Animation sequence for standby state: \e903, \e904
const STANDBY_SEQUENCE = [
    KIRO_ICONS.complete, // \e903
    KIRO_ICONS.standby   // \e904
];

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Kiro-Chan BongoCat-style extension is activating...');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.toggleStatusBar';
    statusBarItem.tooltip = 'Kiro Character - Click to toggle';
    
    // Show initial state
    updateStatusBarIcon(KIRO_ICONS.complete);
    showStatusBar();
    
    // Start standby animation
    startStandbyAnimation();
    
    // Listen for text document changes (similar to BongoCat)
    const textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (statusBarVisible && event.contentChanges.length > 0) {
            // Switch to active animation sequence when typing
            startActiveAnimation();
            
            // Reset to standby animation after delay
            if (activeAnimationTimer) {
                clearTimeout(activeAnimationTimer);
            }
            activeAnimationTimer = setTimeout(() => {
                startStandbyAnimation();
            }, 2000);
        }
    });
    
    // Register commands
    const toggleCommand = vscode.commands.registerCommand('kiro-chan.toggleStatusBar', () => {
        statusBarVisible = !statusBarVisible;
        if (statusBarVisible) {
            showStatusBar();
            startStandbyAnimation();
            vscode.window.showInformationMessage('Kiro Character is now visible');
        } else {
            hideStatusBar();
            stopAllAnimations();
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

function startActiveAnimation() {
    stopAllAnimations();
    isActiveState = true;
    animationFrame = 0;
    
    // Active animation: cycle through \e900, \e901, \e902
    animationTimer = setInterval(() => {
        if (statusBarVisible && isActiveState) {
            animationFrame = (animationFrame + 1) % ACTIVE_SEQUENCE.length;
            updateStatusBarIcon(ACTIVE_SEQUENCE[animationFrame]);
        }
    }, 100); // Very fast animation when active
}

function startStandbyAnimation() {
    stopAllAnimations();
    isActiveState = false;
    animationFrame = 0;
    
    // Standby animation: cycle through \e903, \e904
    animationTimer = setInterval(() => {
        if (statusBarVisible && !isActiveState) {
            animationFrame = (animationFrame + 1) % STANDBY_SEQUENCE.length;
            updateStatusBarIcon(STANDBY_SEQUENCE[animationFrame]);
        }
    }, 1500); // Slower animation when standby
}

function stopAllAnimations() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = undefined;
    }
    if (activeAnimationTimer) {
        clearTimeout(activeAnimationTimer);
        activeAnimationTimer = undefined;
    }
}

export function deactivate() {
    console.log('🛑 Kiro-Chan BongoCat-style extension is deactivating...');
    
    stopAllAnimations();
    
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    console.log('✅ Kiro-Chan BongoCat-style extension deactivated');
}
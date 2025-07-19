import * as vscode from 'vscode';
import { NotificationManager } from './notifications/NotificationManager';
import { KiroTaskMonitor } from './monitoring/KiroTaskMonitor';

let statusBarItem: vscode.StatusBarItem;
let animationTimer: NodeJS.Timeout | undefined;
let animationFrame = 0;
let notificationManager: NotificationManager;
let taskMonitor: KiroTaskMonitor;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Kiro-Chan extension is activating...');

    // Initialize notification and monitoring systems
    notificationManager = new NotificationManager();
    taskMonitor = new KiroTaskMonitor(notificationManager);

    // Create status bar item immediately
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.openSettings';
    statusBarItem.tooltip = 'Kiro Character - Click for settings';
    
    // Show immediately with basic text
    statusBarItem.text = '👻 Kiro';
    statusBarItem.show();
    
    console.log('✅ Status bar item created and shown');

    // Start monitoring for task completion
    taskMonitor.startMonitoring();

    // Start simple animation
    startAnimation();

    // Listen for sound events for visual feedback
    setupSoundVisualFeedback();

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

    // Task completion command
    const taskCompletedCommand = vscode.commands.registerCommand('kiro-chan.taskCompleted', async () => {
        await taskMonitor.markTaskCompleted('Manual Task');
        statusBarItem.text = '🎉 Kiro (Completed)';
    });

    // Test notification command
    const testNotificationCommand = vscode.commands.registerCommand('kiro-chan.testNotification', async () => {
        await notificationManager.testNotification();
    });

    // Additional test commands for different scenarios
    const testWorkSessionCommand = vscode.commands.registerCommand('kiro-chan.testWorkSession', async () => {
        await taskMonitor.completeWorkSession(25); // 25-minute Pomodoro session
    });

    const testMilestoneCommand = vscode.commands.registerCommand('kiro-chan.testMilestone', async () => {
        await taskMonitor.celebrateMilestone('100 commits reached! 🚀');
    });

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('kiro-chan')) {
            notificationManager.updateSettings();
        }
    });

    // Add to subscriptions
    context.subscriptions.push(
        statusBarItem,
        openSettingsCommand,
        setIdleCommand,
        setActiveCommand,
        setErrorCommand,
        taskCompletedCommand,
        testNotificationCommand,
        testWorkSessionCommand,
        testMilestoneCommand,
        { dispose: () => taskMonitor.dispose() },
        { dispose: () => notificationManager.dispose() }
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

function setupSoundVisualFeedback() {
    // Listen for sound events to provide visual feedback
    if (typeof globalThis !== 'undefined' && globalThis.addEventListener) {
        globalThis.addEventListener('kiro-sound-played', (event: any) => {
            const soundType = event.detail?.type;
            showSoundVisualFeedback(soundType);
        });
    }
}

function showSoundVisualFeedback(soundType: string) {
    if (!statusBarItem) return;

    const originalText = statusBarItem.text;
    
    // Show visual feedback based on sound type
    switch (soundType) {
        case 'success':
            statusBarItem.text = '✅ Kiro';
            break;
        case 'completion':
            statusBarItem.text = '🎉 Kiro';
            break;
        case 'notification':
            statusBarItem.text = '🔔 Kiro';
            break;
        case 'celebration':
            statusBarItem.text = '🎊 Kiro';
            break;
        default:
            statusBarItem.text = '🔊 Kiro';
    }
    
    // Restore original text after a short delay
    setTimeout(() => {
        if (statusBarItem) {
            statusBarItem.text = originalText;
        }
    }, 2000);
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

    if (taskMonitor) {
        taskMonitor.dispose();
    }

    if (notificationManager) {
        notificationManager.dispose();
    }
    
    console.log('✅ Kiro-Chan extension deactivated');
}

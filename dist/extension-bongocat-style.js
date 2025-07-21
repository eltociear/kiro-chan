"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let statusBarItem;
let animationTimer;
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
    KIRO_ICONS.active // Occasional blink/movement
];
function activate(context) {
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
        }
        else {
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
    context.subscriptions.push(statusBarItem, textChangeDisposable, toggleCommand, setIdleCommand, setActiveCommand, setErrorCommand, setCompleteCommand);
    console.log('✅ Kiro-Chan BongoCat-style extension activated successfully!');
}
function updateStatusBarIcon(iconName) {
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
function deactivate() {
    console.log('🛑 Kiro-Chan BongoCat-style extension is deactivating...');
    stopAnimation();
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    console.log('✅ Kiro-Chan BongoCat-style extension deactivated');
}

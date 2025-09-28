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
let activeAnimationTimer;
let animationFrame = 0;
let statusBarVisible = true;
let isActiveState = false;
let lastActivityTime = Date.now();
let inactivityCheckTimer;
const TASK_COMPLETE_THRESHOLD = 10000; // 10 seconds of inactivity = task complete
// Icon states for different Kiro animations
const KIRO_ICONS = {
    idle: 'kiro-idle', // \e900
    active: 'kiro-active', // \e901
    error: 'kiro-error', // \e902
    complete: 'kiro-complete', // \e903
    standby: 'kiro-standby' // \e904
};
// Animation sequence for active state (when typing): \e900, \e901, \e902
const ACTIVE_SEQUENCE = [
    KIRO_ICONS.idle, // \e900
    KIRO_ICONS.active, // \e901
    KIRO_ICONS.error // \e902
];
// Animation sequence for standby state: \e903, \e904
const STANDBY_SEQUENCE = [
    KIRO_ICONS.complete, // \e903
    KIRO_ICONS.standby // \e904
];
function activate(context) {
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
            // Update last activity time
            lastActivityTime = Date.now();
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
    // Start inactivity checker
    startInactivityChecker(context);
    // Listen for configuration changes
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('kiro-chan.backgroundColor')) {
            console.log('Background color setting changed, updating status bar...');
            applyBackgroundColor();
        }
    });
    // Register commands
    const toggleCommand = vscode.commands.registerCommand('kiro-chan.toggleStatusBar', () => {
        statusBarVisible = !statusBarVisible;
        if (statusBarVisible) {
            showStatusBar();
            startStandbyAnimation();
            vscode.window.showInformationMessage('Kiro Character is now visible');
        }
        else {
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
    context.subscriptions.push(statusBarItem, textChangeDisposable, configChangeDisposable, toggleCommand, setIdleCommand, setActiveCommand, setErrorCommand, setCompleteCommand);
    console.log('✅ Kiro-Chan BongoCat-style extension activated successfully!');
}
function updateStatusBarIcon(iconName) {
    if (statusBarItem) {
        // Use the BongoCat-style $(icon-name) format
        const appName = vscode.env.appName;
        statusBarItem.text = `$(${iconName}) ${appName}`;
        // Apply text color based on backgroundColor setting
        applyTextColor();
        console.log(`Updated status bar icon to: $(${iconName}) ${appName}`);
    }
}
function applyTextColor() {
    if (statusBarItem) {
        const config = vscode.workspace.getConfiguration('kiro-chan');
        const backgroundColor = config.get('backgroundColor', '#007ACC');
        // Apply the color directly to the status bar item
        statusBarItem.color = backgroundColor;
        console.log(`Applied text color: ${backgroundColor}`);
    }
}
function applyBackgroundColor() {
    // Apply text color changes
    applyTextColor();
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
    if (inactivityCheckTimer) {
        clearInterval(inactivityCheckTimer);
        inactivityCheckTimer = undefined;
    }
}
function startInactivityChecker(context) {
    // Check for inactivity every second
    inactivityCheckTimer = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivityTime;
        // If user has been inactive for threshold time, show task complete notification
        if (timeSinceLastActivity >= TASK_COMPLETE_THRESHOLD && isActiveState === false) {
            // Get notification setting
            const config = vscode.workspace.getConfiguration('kiro-chan');
            const notificationEnabled = config.get('notificationEnabled', true);
            if (notificationEnabled) {
                // Show OS native notification
                vscode.window.showInformationMessage('🎉 Kiro Task Complete! Great job!', { modal: false }).then(() => {
                    // Optional: Change to complete animation briefly
                    updateStatusBarIcon(KIRO_ICONS.complete);
                    setTimeout(() => {
                        if (!isActiveState) {
                            startStandbyAnimation();
                        }
                    }, 3000);
                });
                // Reset last activity time to prevent repeated notifications
                lastActivityTime = Date.now();
            }
        }
    }, 1000);
}
function deactivate() {
    console.log('🛑 Kiro-Chan BongoCat-style extension is deactivating...');
    stopAllAnimations();
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    console.log('✅ Kiro-Chan BongoCat-style extension deactivated');
}
//# sourceMappingURL=extension-bongocat-style.js.map
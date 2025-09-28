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
exports.isActive = isActive;
exports.getCurrentState = getCurrentState;
exports.setCurrentState = setCurrentState;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
const SvgIconUtils_1 = require("./utils/SvgIconUtils");
let statusBarItem = null;
let animationInterval = null;
let currentState = types_1.KiroState.IDLE;
let animationFrame = 0;
let extensionContext = null;
// Extension entry point
async function activate(context) {
    try {
        console.log('[Extension] Kiro Status Character extension activating...');
        // Store the extension context for later use
        extensionContext = context;
        // Create status bar item immediately
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'kiro-chan.openSettings';
        statusBarItem.tooltip = 'Kiro Character - Click to open settings';
        // Show immediately with default state
        updateStatusBar();
        statusBarItem.show();
        // Start animation
        startAnimation();
        // Register commands
        registerCommands(context);
        // Add to subscriptions for proper cleanup
        context.subscriptions.push(statusBarItem);
        // Listen for configuration changes
        const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('kiro-chan')) {
                handleConfigurationChange();
            }
        });
        context.subscriptions.push(configWatcher);
        console.log('[Extension] Kiro Status Character extension activated successfully');
        vscode.window.showInformationMessage('Kiro Character is now active in the status bar!');
    }
    catch (error) {
        console.error('[Extension] Failed to activate Kiro Status Character extension:', error);
        vscode.window.showErrorMessage(`Kiro Character activation failed: ${error}`);
    }
}
function deactivate() {
    try {
        console.log('[Extension] Kiro Status Character extension deactivating...');
        // Stop animation
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        // Dispose status bar item
        if (statusBarItem) {
            statusBarItem.dispose();
            statusBarItem = null;
        }
        console.log('[Extension] Kiro Status Character extension deactivated successfully');
    }
    catch (error) {
        console.error('[Extension] Error during deactivation:', error);
    }
}
// Animation and state management functions
function updateStatusBar() {
    if (!statusBarItem)
        return;
    const stateText = getStateText();
    try {
        if (extensionContext) {
            // Use SVG icon if extension context is available
            statusBarItem.text = SvgIconUtils_1.SvgIconUtils.getStatusBarTextWithIcon(extensionContext, 'idle', 'Kiro');
        }
        else {
            // Fallback to emoji character if no extension context
            const character = getAnimatedCharacter();
            statusBarItem.text = `${character} Kiro`;
        }
        statusBarItem.tooltip = `Kiro Character (${stateText}) - Click to open settings`;
    }
    catch (error) {
        // If any error occurs, fall back to the emoji character
        const character = getAnimatedCharacter();
        statusBarItem.text = `${character} Kiro`;
        statusBarItem.tooltip = `Kiro Character (${stateText}) - Click to open settings`;
        console.error('[Extension] Error updating status bar:', error);
    }
}
function getAnimatedCharacter() {
    const frame = animationFrame % 8;
    switch (currentState) {
        case types_1.KiroState.IDLE:
            // Gentle animation - slower changes
            if (frame < 4)
                return '👻';
            else if (frame < 6)
                return '🌟';
            else
                return '✨';
        case types_1.KiroState.EXECUTING:
            // Active animation - faster changes
            const activeChars = ['👻', '⚡', '🔥', '✨', '🚀', '💫', '⭐', '🌟'];
            return activeChars[frame];
        case types_1.KiroState.ERROR:
            // Error animation - warning indicators
            return frame % 2 === 0 ? '👻' : '⚠️';
        default:
            return '👻';
    }
}
function getStateText() {
    switch (currentState) {
        case types_1.KiroState.IDLE:
            return 'Idle';
        case types_1.KiroState.EXECUTING:
            return 'Active';
        case types_1.KiroState.ERROR:
            return 'Error';
        default:
            return 'Unknown';
    }
}
function startAnimation() {
    if (animationInterval)
        return;
    const config = vscode.workspace.getConfiguration('kiro-chan');
    const enabled = config.get('enabled', true);
    const speed = config.get('animationSpeed', 1.0);
    if (!enabled)
        return;
    // For SVG icon, we can reduce the animation rate since we're primarily using it for state changes
    // rather than animation frames
    const frameRate = Math.max(1, Math.min(5, speed * 1)); // 1-5 fps is sufficient for state changes
    const frameTime = 1000 / frameRate;
    animationInterval = setInterval(() => {
        animationFrame++;
        updateStatusBar();
    }, frameTime);
}
function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}
function handleConfigurationChange() {
    const config = vscode.workspace.getConfiguration('kiro-chan');
    const enabled = config.get('enabled', true);
    if (enabled) {
        if (statusBarItem) {
            statusBarItem.show();
            startAnimation();
        }
    }
    else {
        if (statusBarItem) {
            statusBarItem.hide();
            stopAnimation();
        }
    }
}
// Utility functions
function isActive() {
    return statusBarItem !== null;
}
function getCurrentState() {
    return currentState;
}
function setCurrentState(state) {
    currentState = state;
    updateStatusBar();
}
// Register commands
function registerCommands(context) {
    // 設定を開くコマンド
    const openSettingsCommand = vscode.commands.registerCommand('kiro-chan.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'kiro-chan');
    });
    // 状態を手動で変更するコマンド（デバッグ用）
    const setIdleCommand = vscode.commands.registerCommand('kiro-chan.setIdle', () => {
        setCurrentState(types_1.KiroState.IDLE);
        vscode.window.showInformationMessage('👻 Kiro Character: Idle state');
    });
    const setActiveCommand = vscode.commands.registerCommand('kiro-chan.setActive', () => {
        setCurrentState(types_1.KiroState.EXECUTING);
        vscode.window.showInformationMessage('⚡ Kiro Character: Active state');
    });
    const setErrorCommand = vscode.commands.registerCommand('kiro-chan.setError', () => {
        setCurrentState(types_1.KiroState.ERROR);
        vscode.window.showInformationMessage('⚠️ Kiro Character: Error state');
    });
    context.subscriptions.push(openSettingsCommand, setIdleCommand, setActiveCommand, setErrorCommand);
}
//# sourceMappingURL=extension.js.map
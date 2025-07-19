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
function activate(context) {
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
    context.subscriptions.push(statusBarItem, openSettingsCommand, setIdleCommand, setActiveCommand, setErrorCommand);
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
function deactivate() {
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
//# sourceMappingURL=extension-simple.js.map
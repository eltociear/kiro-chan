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
exports.NotificationManager = void 0;
const vscode = __importStar(require("vscode"));
const SoundManager_1 = require("../sounds/SoundManager");
class NotificationManager {
    constructor() {
        this.isNotificationEnabled = true;
        this.isSoundEnabled = true;
        this.soundManager = new SoundManager_1.SoundManager();
        this.loadSettings();
    }
    loadSettings() {
        const config = vscode.workspace.getConfiguration('kiro-chan');
        this.isNotificationEnabled = config.get('notificationEnabled', true);
        this.isSoundEnabled = config.get('soundEnabled', true);
        const volume = config.get('soundVolume', 0.5);
        this.soundManager.setVolume(volume);
    }
    async showTaskCompletedNotification(taskName) {
        const message = taskName
            ? `Task "${taskName}" has been completed!`
            : 'Kiro task has been completed!';
        await this.showNotification({
            title: '✅ Task Completed',
            message,
            type: 'success',
            sound: 'completion',
            actions: [
                {
                    title: 'Great!',
                    action: () => {
                        this.showCelebration();
                    }
                },
                {
                    title: 'Settings',
                    action: () => {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'kiro-chan');
                    }
                }
            ]
        });
    }
    async showWorkSessionCompleted(duration) {
        const message = duration
            ? `Work session completed in ${duration}! Time for a break! ☕`
            : 'Work session completed! Time for a break! ☕';
        await this.showNotification({
            title: '🎯 Session Complete',
            message,
            type: 'success',
            sound: 'celebration',
            actions: [
                {
                    title: 'Take Break',
                    action: () => {
                        vscode.window.showInformationMessage('Enjoy your break! 😊');
                    }
                }
            ]
        });
    }
    async showMilestoneReached(milestone) {
        await this.showNotification({
            title: '🏆 Milestone Reached!',
            message: `Congratulations! You've reached: ${milestone}`,
            type: 'success',
            sound: 'celebration'
        });
    }
    async showNotification(options) {
        // Play sound first (if enabled)
        if (this.isSoundEnabled && options.sound) {
            this.playSound(options.sound);
        }
        // Show notification (if enabled)
        if (this.isNotificationEnabled) {
            await this.displayNotification(options);
        }
    }
    playSound(soundType) {
        switch (soundType) {
            case 'success':
                this.soundManager.playSuccessSound();
                break;
            case 'completion':
                this.soundManager.playCompletionSound();
                break;
            case 'notification':
                this.soundManager.playNotificationSound();
                break;
            case 'celebration':
                this.soundManager.playCelebrationSound();
                break;
        }
    }
    async displayNotification(options) {
        const fullMessage = `${options.title}\n${options.message}`;
        let result;
        // Prepare action titles
        const actionTitles = options.actions?.map(action => action.title) || [];
        switch (options.type) {
            case 'success':
            case 'info':
                result = await vscode.window.showInformationMessage(fullMessage, ...actionTitles);
                break;
            case 'warning':
                result = await vscode.window.showWarningMessage(fullMessage, ...actionTitles);
                break;
            case 'error':
                result = await vscode.window.showErrorMessage(fullMessage, ...actionTitles);
                break;
        }
        // Execute action if user clicked a button
        if (result && options.actions) {
            const selectedAction = options.actions.find(action => action.title === result);
            if (selectedAction) {
                selectedAction.action();
            }
        }
    }
    showCelebration() {
        // Show a fun celebration message
        const celebrations = [
            'Awesome work!',
            'You\'re on fire!',
            'Keep it up!',
            'Great job!',
            'Perfect!',
            'Excellent!',
            'Outstanding!'
        ];
        const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];
        vscode.window.showInformationMessage(randomCelebration);
        // Play celebration sound
        if (this.isSoundEnabled) {
            this.soundManager.playCelebrationSound();
        }
    }
    // Test notification (for debugging)
    async testNotification() {
        await this.showNotification({
            title: '🧪 Test Notification',
            message: 'This is a test notification with sound!',
            type: 'info',
            sound: 'notification',
            actions: [
                {
                    title: 'Success Sound',
                    action: () => this.soundManager.playSuccessSound()
                },
                {
                    title: 'Celebration Sound',
                    action: () => this.soundManager.playCelebrationSound()
                }
            ]
        });
    }
    // Update settings
    updateSettings() {
        this.loadSettings();
    }
    dispose() {
        this.soundManager.dispose();
    }
}
exports.NotificationManager = NotificationManager;
//# sourceMappingURL=NotificationManager.js.map
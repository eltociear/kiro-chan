import * as vscode from 'vscode';
import { SoundManager } from '../sounds/SoundManager';

export interface NotificationOptions {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    sound?: 'success' | 'completion' | 'notification' | 'celebration';
    actions?: Array<{
        title: string;
        action: () => void;
    }>;
}

export class NotificationManager {
    private soundManager: SoundManager;
    private isNotificationEnabled: boolean = true;
    private isSoundEnabled: boolean = true;

    constructor() {
        this.soundManager = new SoundManager();
        this.loadSettings();
    }

    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('kiro-chan');
        this.isNotificationEnabled = config.get<boolean>('notificationEnabled', true);
        this.isSoundEnabled = config.get<boolean>('soundEnabled', true);
        
        const volume = config.get<number>('soundVolume', 0.5);
        this.soundManager.setVolume(volume);
    }

    async showTaskCompletedNotification(taskName?: string): Promise<void> {
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

    async showWorkSessionCompleted(duration?: string): Promise<void> {
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

    async showMilestoneReached(milestone: string): Promise<void> {
        await this.showNotification({
            title: '🏆 Milestone Reached!',
            message: `Congratulations! You've reached: ${milestone}`,
            type: 'success',
            sound: 'celebration'
        });
    }

    async showNotification(options: NotificationOptions): Promise<void> {
        // Play sound first (if enabled)
        if (this.isSoundEnabled && options.sound) {
            this.playSound(options.sound);
        }

        // Show notification (if enabled)
        if (this.isNotificationEnabled) {
            await this.displayNotification(options);
        }
    }

    private playSound(soundType: string): void {
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

    private async displayNotification(options: NotificationOptions): Promise<void> {
        const fullMessage = `${options.title}\n${options.message}`;
        
        let result: string | undefined;

        // Prepare action titles
        const actionTitles = options.actions?.map(action => action.title) || [];

        switch (options.type) {
            case 'success':
            case 'info':
                result = await vscode.window.showInformationMessage(
                    fullMessage,
                    ...actionTitles
                );
                break;
            case 'warning':
                result = await vscode.window.showWarningMessage(
                    fullMessage,
                    ...actionTitles
                );
                break;
            case 'error':
                result = await vscode.window.showErrorMessage(
                    fullMessage,
                    ...actionTitles
                );
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

    private showCelebration(): void {
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
    async testNotification(): Promise<void> {
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
    updateSettings(): void {
        this.loadSettings();
    }

    dispose(): void {
        this.soundManager.dispose();
    }
}

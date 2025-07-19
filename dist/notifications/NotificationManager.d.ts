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
export declare class NotificationManager {
    private soundManager;
    private isNotificationEnabled;
    private isSoundEnabled;
    constructor();
    private loadSettings;
    showTaskCompletedNotification(taskName?: string): Promise<void>;
    showWorkSessionCompleted(duration?: string): Promise<void>;
    showMilestoneReached(milestone: string): Promise<void>;
    showNotification(options: NotificationOptions): Promise<void>;
    private playSound;
    private displayNotification;
    private showCelebration;
    testNotification(): Promise<void>;
    updateSettings(): void;
    dispose(): void;
}
//# sourceMappingURL=NotificationManager.d.ts.map
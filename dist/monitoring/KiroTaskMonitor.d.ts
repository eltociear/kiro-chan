import { NotificationManager } from '../notifications/NotificationManager';
export interface TaskInfo {
    id: string;
    name: string;
    startTime: Date;
    status: 'running' | 'completed' | 'failed';
}
export declare class KiroTaskMonitor {
    private notificationManager;
    private activeTasks;
    private completedTasks;
    private isMonitoring;
    private monitoringInterval;
    constructor(notificationManager: NotificationManager);
    startMonitoring(): void;
    stopMonitoring(): void;
    private setupTerminalMonitoring;
    private setupFileWatcher;
    private handleFileChange;
    private checkForTaskCompletion;
    private checkActiveTerminals;
    private checkWorkspaceState;
    private checkForKiroCompletionMessages;
    private checkForBuildCompletion;
    private checkForTestCompletion;
    private getLastCheckTime;
    private setLastCheckTime;
    private handlePotentialTaskCompletion;
    markTaskCompleted(taskName: string): Promise<void>;
    completeWorkSession(durationMinutes?: number): Promise<void>;
    celebrateMilestone(milestone: string): Promise<void>;
    private generateTaskId;
    getTaskStats(): {
        activeTasks: number;
        completedTasks: number;
        recentCompletions: TaskInfo[];
    };
    dispose(): void;
}
//# sourceMappingURL=KiroTaskMonitor.d.ts.map
import * as vscode from 'vscode';
import { NotificationManager } from '../notifications/NotificationManager';

export interface TaskInfo {
    id: string;
    name: string;
    startTime: Date;
    status: 'running' | 'completed' | 'failed';
}

export class KiroTaskMonitor {
    private notificationManager: NotificationManager;
    private activeTasks: Map<string, TaskInfo> = new Map();
    private completedTasks: TaskInfo[] = [];
    private isMonitoring: boolean = false;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor(notificationManager: NotificationManager) {
        this.notificationManager = notificationManager;
    }

    startMonitoring(): void {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        console.log('[KiroTaskMonitor] Started monitoring Kiro tasks');

        // Monitor VS Code terminal output for Kiro completion messages
        this.setupTerminalMonitoring();

        // Monitor file changes that might indicate task completion
        this.setupFileWatcher();

        // Periodic check for task completion indicators
        this.monitoringInterval = setInterval(() => {
            this.checkForTaskCompletion();
        }, 5000); // Check every 5 seconds
    }

    stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        console.log('[KiroTaskMonitor] Stopped monitoring Kiro tasks');
    }

    private setupTerminalMonitoring(): void {
        // Listen for terminal output that might indicate task completion
        vscode.window.onDidOpenTerminal((terminal) => {
            console.log(`[KiroTaskMonitor] New terminal opened: ${terminal.name}`);
        });

        vscode.window.onDidCloseTerminal((terminal) => {
            console.log(`[KiroTaskMonitor] Terminal closed: ${terminal.name}`);
            
            // If a Kiro-related terminal closes, it might indicate task completion
            if (terminal.name.toLowerCase().includes('kiro')) {
                this.handlePotentialTaskCompletion(`Terminal task: ${terminal.name}`);
            }
        });
    }

    private setupFileWatcher(): void {
        // Watch for file changes that might indicate task completion
        const watcher = vscode.workspace.createFileSystemWatcher('**/*');
        
        watcher.onDidChange((uri) => {
            this.handleFileChange(uri, 'changed');
        });

        watcher.onDidCreate((uri) => {
            this.handleFileChange(uri, 'created');
        });
    }

    private handleFileChange(uri: vscode.Uri, changeType: string): void {
        const fileName = uri.fsPath.toLowerCase();
        
        // Check for files that might indicate task completion
        const completionIndicators = [
            'build',
            'dist',
            'output',
            '.log',
            'result',
            'complete'
        ];

        const isCompletionFile = completionIndicators.some(indicator => 
            fileName.includes(indicator)
        );

        if (isCompletionFile) {
            console.log(`[KiroTaskMonitor] Potential completion file ${changeType}: ${uri.fsPath}`);
            this.handlePotentialTaskCompletion(`File ${changeType}: ${uri.fsPath}`);
        }
    }

    private checkForTaskCompletion(): void {
        // Check for various indicators of task completion
        this.checkActiveTerminals();
        this.checkWorkspaceState();
        this.checkForKiroCompletionMessages();
    }

    private checkActiveTerminals(): void {
        const terminals = vscode.window.terminals;
        
        terminals.forEach(terminal => {
            if (terminal.name.toLowerCase().includes('kiro')) {
                // This is a Kiro-related terminal
                // In a real implementation, we might check the terminal's output
                // For now, we'll simulate task detection
            }
        });
    }

    private checkWorkspaceState(): void {
        // Check workspace state for completion indicators
        // This could include checking:
        // - Recent file modifications
        // - Build output directories
        // - Log files
        // - Git commits
        
        // Check for common completion patterns in workspace
        this.checkForBuildCompletion();
        this.checkForTestCompletion();
    }

    private checkForKiroCompletionMessages(): void {
        // Look for Kiro-specific completion indicators
        // This could monitor:
        // - Output panel messages
        // - Status bar changes
        // - Notification history
        // - Extension activity
        
        // For now, we'll simulate detection based on time patterns
        const now = Date.now();
        const lastCheck = this.getLastCheckTime();
        
        // If it's been a while since last activity, might indicate completion
        if (now - lastCheck > 300000) { // 5 minutes
            this.setLastCheckTime(now);
        }
    }

    private checkForBuildCompletion(): void {
        // Check for build completion indicators
        const buildIndicators = [
            'dist/',
            'build/',
            'out/',
            '.next/',
            'target/'
        ];

        // In a real implementation, you'd check file timestamps
        // For demo purposes, we'll use a simple heuristic
    }

    private checkForTestCompletion(): void {
        // Check for test completion indicators
        const testIndicators = [
            'coverage/',
            'test-results/',
            '.nyc_output/',
            'junit.xml'
        ];

        // Similar to build completion, check for test output files
    }

    private getLastCheckTime(): number {
        // In a real implementation, this would be persisted
        return Date.now() - 60000; // Simulate 1 minute ago
    }

    private setLastCheckTime(time: number): void {
        // In a real implementation, this would be persisted
        console.log(`[KiroTaskMonitor] Last check time updated: ${new Date(time)}`);
    }

    private async handlePotentialTaskCompletion(taskName: string): Promise<void> {
        console.log(`[KiroTaskMonitor] Potential task completion detected: ${taskName}`);
        
        // Avoid duplicate notifications for the same task
        const taskId = this.generateTaskId(taskName);
        if (this.completedTasks.some(task => task.id === taskId)) {
            return;
        }

        // Record the completed task
        const completedTask: TaskInfo = {
            id: taskId,
            name: taskName,
            startTime: new Date(Date.now() - 60000), // Assume task started 1 minute ago
            status: 'completed'
        };

        this.completedTasks.push(completedTask);
        
        // Show notification
        await this.notificationManager.showTaskCompletedNotification(taskName);
    }

    // Manual task completion (for testing or manual triggers)
    async markTaskCompleted(taskName: string): Promise<void> {
        await this.handlePotentialTaskCompletion(taskName);
    }

    // Simulate a work session completion
    async completeWorkSession(durationMinutes?: number): Promise<void> {
        const duration = durationMinutes 
            ? `${durationMinutes} minutes`
            : undefined;
            
        await this.notificationManager.showWorkSessionCompleted(duration);
    }

    // Celebrate a milestone
    async celebrateMilestone(milestone: string): Promise<void> {
        await this.notificationManager.showMilestoneReached(milestone);
    }

    private generateTaskId(taskName: string): string {
        return `task_${Date.now()}_${taskName.replace(/\s+/g, '_').toLowerCase()}`;
    }

    // Get task statistics
    getTaskStats(): {
        activeTasks: number;
        completedTasks: number;
        recentCompletions: TaskInfo[];
    } {
        const recentThreshold = new Date(Date.now() - 3600000); // 1 hour ago
        const recentCompletions = this.completedTasks.filter(
            task => task.startTime > recentThreshold
        );

        return {
            activeTasks: this.activeTasks.size,
            completedTasks: this.completedTasks.length,
            recentCompletions
        };
    }

    dispose(): void {
        this.stopMonitoring();
        this.activeTasks.clear();
        this.completedTasks = [];
    }
}

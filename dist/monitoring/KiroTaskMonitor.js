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
exports.KiroTaskMonitor = void 0;
const vscode = __importStar(require("vscode"));
class KiroTaskMonitor {
    constructor(notificationManager) {
        this.activeTasks = new Map();
        this.completedTasks = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.notificationManager = notificationManager;
    }
    startMonitoring() {
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
    stopMonitoring() {
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
    setupTerminalMonitoring() {
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
    setupFileWatcher() {
        // Watch for file changes that might indicate task completion
        const watcher = vscode.workspace.createFileSystemWatcher('**/*');
        watcher.onDidChange((uri) => {
            this.handleFileChange(uri, 'changed');
        });
        watcher.onDidCreate((uri) => {
            this.handleFileChange(uri, 'created');
        });
    }
    handleFileChange(uri, changeType) {
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
        const isCompletionFile = completionIndicators.some(indicator => fileName.includes(indicator));
        if (isCompletionFile) {
            console.log(`[KiroTaskMonitor] Potential completion file ${changeType}: ${uri.fsPath}`);
            this.handlePotentialTaskCompletion(`File ${changeType}: ${uri.fsPath}`);
        }
    }
    checkForTaskCompletion() {
        // Check for various indicators of task completion
        this.checkActiveTerminals();
        this.checkWorkspaceState();
        this.checkForKiroCompletionMessages();
    }
    checkActiveTerminals() {
        const terminals = vscode.window.terminals;
        terminals.forEach(terminal => {
            if (terminal.name.toLowerCase().includes('kiro')) {
                // This is a Kiro-related terminal
                // In a real implementation, we might check the terminal's output
                // For now, we'll simulate task detection
            }
        });
    }
    checkWorkspaceState() {
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
    checkForKiroCompletionMessages() {
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
    checkForBuildCompletion() {
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
    checkForTestCompletion() {
        // Check for test completion indicators
        const testIndicators = [
            'coverage/',
            'test-results/',
            '.nyc_output/',
            'junit.xml'
        ];
        // Similar to build completion, check for test output files
    }
    getLastCheckTime() {
        // In a real implementation, this would be persisted
        return Date.now() - 60000; // Simulate 1 minute ago
    }
    setLastCheckTime(time) {
        // In a real implementation, this would be persisted
        console.log(`[KiroTaskMonitor] Last check time updated: ${new Date(time)}`);
    }
    async handlePotentialTaskCompletion(taskName) {
        console.log(`[KiroTaskMonitor] Potential task completion detected: ${taskName}`);
        // Avoid duplicate notifications for the same task
        const taskId = this.generateTaskId(taskName);
        if (this.completedTasks.some(task => task.id === taskId)) {
            return;
        }
        // Record the completed task
        const completedTask = {
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
    async markTaskCompleted(taskName) {
        await this.handlePotentialTaskCompletion(taskName);
    }
    // Simulate a work session completion
    async completeWorkSession(durationMinutes) {
        const duration = durationMinutes
            ? `${durationMinutes} minutes`
            : undefined;
        await this.notificationManager.showWorkSessionCompleted(duration);
    }
    // Celebrate a milestone
    async celebrateMilestone(milestone) {
        await this.notificationManager.showMilestoneReached(milestone);
    }
    generateTaskId(taskName) {
        return `task_${Date.now()}_${taskName.replace(/\s+/g, '_').toLowerCase()}`;
    }
    // Get task statistics
    getTaskStats() {
        const recentThreshold = new Date(Date.now() - 3600000); // 1 hour ago
        const recentCompletions = this.completedTasks.filter(task => task.startTime > recentThreshold);
        return {
            activeTasks: this.activeTasks.size,
            completedTasks: this.completedTasks.length,
            recentCompletions
        };
    }
    dispose() {
        this.stopMonitoring();
        this.activeTasks.clear();
        this.completedTasks = [];
    }
}
exports.KiroTaskMonitor = KiroTaskMonitor;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMonitor = void 0;
const types_1 = require("../types");
class StateMonitor {
    constructor() {
        this.stateChangeCallbacks = [];
        this.currentState = types_1.KiroState.IDLE;
        this.isMonitoring = false;
        this.monitoringInterval = 0;
        this.lastStateChange = 0;
        this.debounceDelay = 100; // ms
        this.monitoringFrequency = 1000; // ms
        this.bindEventListeners();
    }
    startMonitoring() {
        if (this.isMonitoring) {
            return;
        }
        this.isMonitoring = true;
        this.monitoringInterval = window.setInterval(() => {
            this.checkKiroState();
        }, this.monitoringFrequency);
        // Initial state check
        this.checkKiroState();
    }
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = 0;
        }
    }
    getCurrentState() {
        return this.currentState;
    }
    onStateChange(callback) {
        this.stateChangeCallbacks.push(callback);
    }
    removeStateChangeCallback(callback) {
        const index = this.stateChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this.stateChangeCallbacks.splice(index, 1);
        }
    }
    bindEventListeners() {
        // Listen for various events that might indicate Kiro state changes
        if (typeof window !== 'undefined') {
            // Listen for focus/blur events
            window.addEventListener('focus', () => this.handleActivityEvent());
            window.addEventListener('blur', () => this.handleInactivityEvent());
            // Listen for user interaction events
            document.addEventListener('keydown', () => this.handleActivityEvent());
            document.addEventListener('mousedown', () => this.handleActivityEvent());
            document.addEventListener('mousemove', this.throttle(() => this.handleActivityEvent(), 1000));
        }
    }
    handleActivityEvent() {
        this.updateState(types_1.KiroState.EXECUTING);
        // Auto-return to idle after a period of inactivity
        setTimeout(() => {
            if (this.currentState === types_1.KiroState.EXECUTING) {
                this.updateState(types_1.KiroState.IDLE);
            }
        }, 3000);
    }
    handleInactivityEvent() {
        // Don't immediately switch to idle, wait a bit
        setTimeout(() => {
            if (this.currentState === types_1.KiroState.EXECUTING) {
                this.updateState(types_1.KiroState.IDLE);
            }
        }, 1000);
    }
    checkKiroState() {
        // This method would integrate with actual Kiro API to check state
        // For now, we'll simulate state detection based on various indicators
        try {
            const detectedState = this.detectCurrentState();
            if (detectedState !== this.currentState) {
                this.updateState(detectedState);
            }
        }
        catch (error) {
            console.error('[StateMonitor] Error checking Kiro state:', error);
            this.updateState(types_1.KiroState.ERROR);
            // Auto-recover from error state after a delay
            setTimeout(() => {
                if (this.currentState === types_1.KiroState.ERROR) {
                    this.updateState(types_1.KiroState.IDLE);
                }
            }, 5000);
        }
    }
    detectCurrentState() {
        // Simulate state detection logic
        // In a real implementation, this would check:
        // - Kiro API status
        // - Active processes
        // - Error conditions
        // - User activity
        // Check for error conditions
        if (this.hasErrorConditions()) {
            return types_1.KiroState.ERROR;
        }
        // Check for active execution
        if (this.hasActiveExecution()) {
            return types_1.KiroState.EXECUTING;
        }
        // Default to idle
        return types_1.KiroState.IDLE;
    }
    hasErrorConditions() {
        // Simulate error detection
        // This could check for:
        // - Network connectivity issues
        // - API errors
        // - System resource problems
        return false;
    }
    hasActiveExecution() {
        // Simulate active execution detection
        // This could check for:
        // - Running tasks
        // - Active API calls
        // - User interactions
        // Simple heuristic: if there was recent activity, consider it executing
        const timeSinceLastActivity = Date.now() - this.lastStateChange;
        return timeSinceLastActivity < 2000 && this.currentState === types_1.KiroState.EXECUTING;
    }
    updateState(newState) {
        if (newState === this.currentState) {
            return;
        }
        // Debounce state changes to avoid rapid switching
        const now = Date.now();
        if (now - this.lastStateChange < this.debounceDelay) {
            return;
        }
        const previousState = this.currentState;
        this.currentState = newState;
        this.lastStateChange = now;
        console.log(`[StateMonitor] State changed: ${previousState} -> ${newState}`);
        // Notify all callbacks
        this.notifyStateChange(newState);
    }
    notifyStateChange(state) {
        // Use setTimeout to ensure callbacks are called asynchronously
        setTimeout(() => {
            this.stateChangeCallbacks.forEach(callback => {
                try {
                    callback(state);
                }
                catch (error) {
                    console.error('[StateMonitor] Error in state change callback:', error);
                }
            });
        }, 0);
    }
    throttle(func, delay) {
        let timeoutId = null;
        let lastExecTime = 0;
        return (...args) => {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func(...args);
                lastExecTime = currentTime;
            }
            else {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = window.setTimeout(() => {
                    func(...args);
                    lastExecTime = Date.now();
                    timeoutId = null;
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    // Public method to manually trigger state changes (for testing or external integration)
    forceStateChange(state) {
        this.updateState(state);
    }
    dispose() {
        this.stopMonitoring();
        this.stateChangeCallbacks = [];
        // Remove event listeners if needed
        // Note: In a real implementation, we'd need to store references to bound functions
        // to properly remove event listeners
    }
}
exports.StateMonitor = StateMonitor;
//# sourceMappingURL=StateMonitor.js.map
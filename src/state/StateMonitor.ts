import { IStateMonitor, KiroState } from '../types';

export class StateMonitor implements IStateMonitor {
  private stateChangeCallbacks: Array<(state: KiroState) => void> = [];
  private currentState: KiroState = KiroState.IDLE;
  private isMonitoring: boolean = false;
  private monitoringInterval: number = 0;
  private lastStateChange: number = 0;
  private readonly debounceDelay: number = 100; // ms
  private readonly monitoringFrequency: number = 1000; // ms

  constructor() {
    this.bindEventListeners();
  }

  startMonitoring(): void {
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

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = 0;
    }
  }

  getCurrentState(): KiroState {
    return this.currentState;
  }

  onStateChange(callback: (state: KiroState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  removeStateChangeCallback(callback: (state: KiroState) => void): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  private bindEventListeners(): void {
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

  private handleActivityEvent(): void {
    this.updateState(KiroState.EXECUTING);
    
    // Auto-return to idle after a period of inactivity
    setTimeout(() => {
      if (this.currentState === KiroState.EXECUTING) {
        this.updateState(KiroState.IDLE);
      }
    }, 3000);
  }

  private handleInactivityEvent(): void {
    // Don't immediately switch to idle, wait a bit
    setTimeout(() => {
      if (this.currentState === KiroState.EXECUTING) {
        this.updateState(KiroState.IDLE);
      }
    }, 1000);
  }

  private checkKiroState(): void {
    // This method would integrate with actual Kiro API to check state
    // For now, we'll simulate state detection based on various indicators
    
    try {
      const detectedState = this.detectCurrentState();
      if (detectedState !== this.currentState) {
        this.updateState(detectedState);
      }
    } catch (error) {
      console.error('[StateMonitor] Error checking Kiro state:', error);
      this.updateState(KiroState.ERROR);
      
      // Auto-recover from error state after a delay
      setTimeout(() => {
        if (this.currentState === KiroState.ERROR) {
          this.updateState(KiroState.IDLE);
        }
      }, 5000);
    }
  }

  private detectCurrentState(): KiroState {
    // Simulate state detection logic
    // In a real implementation, this would check:
    // - Kiro API status
    // - Active processes
    // - Error conditions
    // - User activity
    
    // Check for error conditions
    if (this.hasErrorConditions()) {
      return KiroState.ERROR;
    }
    
    // Check for active execution
    if (this.hasActiveExecution()) {
      return KiroState.EXECUTING;
    }
    
    // Default to idle
    return KiroState.IDLE;
  }

  private hasErrorConditions(): boolean {
    // Simulate error detection
    // This could check for:
    // - Network connectivity issues
    // - API errors
    // - System resource problems
    return false;
  }

  private hasActiveExecution(): boolean {
    // Simulate active execution detection
    // This could check for:
    // - Running tasks
    // - Active API calls
    // - User interactions
    
    // Simple heuristic: if there was recent activity, consider it executing
    const timeSinceLastActivity = Date.now() - this.lastStateChange;
    return timeSinceLastActivity < 2000 && this.currentState === KiroState.EXECUTING;
  }

  private updateState(newState: KiroState): void {
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

  private notifyStateChange(state: KiroState): void {
    // Use setTimeout to ensure callbacks are called asynchronously
    setTimeout(() => {
      this.stateChangeCallbacks.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('[StateMonitor] Error in state change callback:', error);
        }
      });
    }, 0);
  }

  private throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;
    let lastExecTime = 0;
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
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
  forceStateChange(state: KiroState): void {
    this.updateState(state);
  }

  dispose(): void {
    this.stopMonitoring();
    this.stateChangeCallbacks = [];
    
    // Remove event listeners if needed
    // Note: In a real implementation, we'd need to store references to bound functions
    // to properly remove event listeners
  }
}

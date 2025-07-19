import { IStateMonitor, KiroState } from '../types';
export declare class StateMonitor implements IStateMonitor {
    private stateChangeCallbacks;
    private currentState;
    private isMonitoring;
    private monitoringInterval;
    private lastStateChange;
    private readonly debounceDelay;
    private readonly monitoringFrequency;
    constructor();
    startMonitoring(): void;
    stopMonitoring(): void;
    getCurrentState(): KiroState;
    onStateChange(callback: (state: KiroState) => void): void;
    removeStateChangeCallback(callback: (state: KiroState) => void): void;
    private bindEventListeners;
    private handleActivityEvent;
    private handleInactivityEvent;
    private checkKiroState;
    private detectCurrentState;
    private hasErrorConditions;
    private hasActiveExecution;
    private updateState;
    private notifyStateChange;
    private throttle;
    forceStateChange(state: KiroState): void;
    dispose(): void;
}
//# sourceMappingURL=StateMonitor.d.ts.map
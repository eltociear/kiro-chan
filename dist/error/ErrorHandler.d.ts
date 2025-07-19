export declare enum ErrorContext {
    INITIALIZATION = "initialization",
    ANIMATION = "animation",
    PERFORMANCE = "performance",
    SETTINGS = "settings",
    STATE_MONITORING = "state_monitoring",
    DOM_MANIPULATION = "dom_manipulation"
}
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface ErrorInfo {
    error: Error;
    context: ErrorContext;
    severity: ErrorSeverity;
    timestamp: number;
    additionalData?: any;
}
export interface IErrorHandler {
    handleError(error: Error, context: ErrorContext, additionalData?: any): void;
    getErrorHistory(): ErrorInfo[];
    clearErrorHistory(): void;
    setErrorCallback(callback: (errorInfo: ErrorInfo) => void): void;
}
export declare class ErrorHandler implements IErrorHandler {
    private errorHistory;
    private readonly maxHistorySize;
    private errorCallbacks;
    private fallbackStrategies;
    constructor();
    handleError(error: Error, context: ErrorContext, additionalData?: any): void;
    getErrorHistory(): ErrorInfo[];
    clearErrorHistory(): void;
    setErrorCallback(callback: (errorInfo: ErrorInfo) => void): void;
    removeErrorCallback(callback: (errorInfo: ErrorInfo) => void): void;
    private initializeFallbackStrategies;
    private determineSeverity;
    private logError;
    private addToHistory;
    private executeFallbackStrategy;
    private notifyCallbacks;
    private enableMinimalMode;
    private fallbackToStaticDisplay;
    private reduceAnimationComplexity;
    private useDefaultSettings;
    private enableFallbackStateDetection;
    private attemptDomRecovery;
    private dispatchCustomEvent;
    getErrorsByContext(context: ErrorContext): ErrorInfo[];
    getErrorsBySeverity(severity: ErrorSeverity): ErrorInfo[];
    getRecentErrors(timeWindow?: number): ErrorInfo[];
    hasRecentCriticalErrors(timeWindow?: number): boolean;
    getErrorRate(timeWindow?: number): number;
    static handleInitializationError(error: Error, additionalData?: any): void;
    static handleAnimationError(error: Error, additionalData?: any): void;
    static handlePerformanceError(error: Error, additionalData?: any): void;
    static handleSettingsError(error: Error, additionalData?: any): void;
    static handleStateMonitoringError(error: Error, additionalData?: any): void;
    static handleDomError(error: Error, additionalData?: any): void;
    private static instance;
    static getInstance(): ErrorHandler;
    static resetInstance(): void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map
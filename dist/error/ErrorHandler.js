"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ErrorSeverity = exports.ErrorContext = void 0;
var ErrorContext;
(function (ErrorContext) {
    ErrorContext["INITIALIZATION"] = "initialization";
    ErrorContext["ANIMATION"] = "animation";
    ErrorContext["PERFORMANCE"] = "performance";
    ErrorContext["SETTINGS"] = "settings";
    ErrorContext["STATE_MONITORING"] = "state_monitoring";
    ErrorContext["DOM_MANIPULATION"] = "dom_manipulation";
})(ErrorContext || (exports.ErrorContext = ErrorContext = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class ErrorHandler {
    constructor() {
        this.errorHistory = [];
        this.maxHistorySize = 50;
        this.errorCallbacks = [];
        this.fallbackStrategies = new Map();
        this.initializeFallbackStrategies();
    }
    handleError(error, context, additionalData) {
        const severity = this.determineSeverity(error, context);
        const errorInfo = {
            error,
            context,
            severity,
            timestamp: Date.now(),
            additionalData
        };
        // Log the error
        this.logError(errorInfo);
        // Store in history
        this.addToHistory(errorInfo);
        // Execute fallback strategy
        this.executeFallbackStrategy(context, errorInfo);
        // Notify callbacks
        this.notifyCallbacks(errorInfo);
    }
    getErrorHistory() {
        return [...this.errorHistory];
    }
    clearErrorHistory() {
        this.errorHistory = [];
    }
    setErrorCallback(callback) {
        this.errorCallbacks.push(callback);
    }
    removeErrorCallback(callback) {
        const index = this.errorCallbacks.indexOf(callback);
        if (index > -1) {
            this.errorCallbacks.splice(index, 1);
        }
    }
    initializeFallbackStrategies() {
        this.fallbackStrategies.set(ErrorContext.INITIALIZATION, () => {
            console.warn('[ErrorHandler] Initialization failed, using minimal fallback mode');
            this.enableMinimalMode();
        });
        this.fallbackStrategies.set(ErrorContext.ANIMATION, () => {
            console.warn('[ErrorHandler] Animation error, switching to static display');
            this.fallbackToStaticDisplay();
        });
        this.fallbackStrategies.set(ErrorContext.PERFORMANCE, () => {
            console.warn('[ErrorHandler] Performance issue, reducing animation complexity');
            this.reduceAnimationComplexity();
        });
        this.fallbackStrategies.set(ErrorContext.SETTINGS, () => {
            console.warn('[ErrorHandler] Settings error, using default configuration');
            this.useDefaultSettings();
        });
        this.fallbackStrategies.set(ErrorContext.STATE_MONITORING, () => {
            console.warn('[ErrorHandler] State monitoring error, using fallback state detection');
            this.enableFallbackStateDetection();
        });
        this.fallbackStrategies.set(ErrorContext.DOM_MANIPULATION, () => {
            console.warn('[ErrorHandler] DOM error, attempting recovery');
            this.attemptDomRecovery();
        });
    }
    determineSeverity(error, context) {
        // Critical errors that prevent core functionality
        if (context === ErrorContext.INITIALIZATION) {
            return ErrorSeverity.CRITICAL;
        }
        // High severity errors that significantly impact functionality
        if (context === ErrorContext.DOM_MANIPULATION ||
            context === ErrorContext.SETTINGS) {
            return ErrorSeverity.HIGH;
        }
        // Medium severity errors that impact user experience
        if (context === ErrorContext.ANIMATION ||
            context === ErrorContext.STATE_MONITORING) {
            return ErrorSeverity.MEDIUM;
        }
        // Low severity errors that have minimal impact
        if (context === ErrorContext.PERFORMANCE) {
            return ErrorSeverity.LOW;
        }
        // Check error message for severity indicators
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
            return ErrorSeverity.CRITICAL;
        }
        if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
            return ErrorSeverity.HIGH;
        }
        return ErrorSeverity.MEDIUM;
    }
    logError(errorInfo) {
        const logMessage = `[StatusBarCharacter] ${errorInfo.context} error (${errorInfo.severity}):`;
        switch (errorInfo.severity) {
            case ErrorSeverity.CRITICAL:
                console.error(logMessage, errorInfo.error, errorInfo.additionalData);
                break;
            case ErrorSeverity.HIGH:
                console.error(logMessage, errorInfo.error);
                break;
            case ErrorSeverity.MEDIUM:
                console.warn(logMessage, errorInfo.error);
                break;
            case ErrorSeverity.LOW:
                console.log(logMessage, errorInfo.error.message);
                break;
        }
    }
    addToHistory(errorInfo) {
        this.errorHistory.push(errorInfo);
        // Maintain history size limit
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }
    executeFallbackStrategy(context, errorInfo) {
        const strategy = this.fallbackStrategies.get(context);
        if (strategy) {
            try {
                strategy();
            }
            catch (fallbackError) {
                console.error('[ErrorHandler] Fallback strategy failed:', fallbackError);
                // Last resort: enable minimal mode
                this.enableMinimalMode();
            }
        }
    }
    notifyCallbacks(errorInfo) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorInfo);
            }
            catch (callbackError) {
                console.error('[ErrorHandler] Error callback failed:', callbackError);
            }
        });
    }
    // Fallback strategy implementations
    enableMinimalMode() {
        // Disable all non-essential features
        this.dispatchCustomEvent('kiro-character:enable-minimal-mode');
    }
    fallbackToStaticDisplay() {
        // Switch to CSS-only animations
        this.dispatchCustomEvent('kiro-character:fallback-static-display');
    }
    reduceAnimationComplexity() {
        // Reduce animation frame rate and complexity
        this.dispatchCustomEvent('kiro-character:reduce-animation-complexity');
    }
    useDefaultSettings() {
        // Reset to default settings
        this.dispatchCustomEvent('kiro-character:use-default-settings');
    }
    enableFallbackStateDetection() {
        // Use simple state detection methods
        this.dispatchCustomEvent('kiro-character:fallback-state-detection');
    }
    attemptDomRecovery() {
        // Try to recover DOM state
        this.dispatchCustomEvent('kiro-character:attempt-dom-recovery');
    }
    dispatchCustomEvent(eventType, detail) {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent(eventType, { detail });
            window.dispatchEvent(event);
        }
    }
    // Utility methods for error analysis
    getErrorsByContext(context) {
        return this.errorHistory.filter(error => error.context === context);
    }
    getErrorsBySeverity(severity) {
        return this.errorHistory.filter(error => error.severity === severity);
    }
    getRecentErrors(timeWindow = 60000) {
        const cutoff = Date.now() - timeWindow;
        return this.errorHistory.filter(error => error.timestamp > cutoff);
    }
    hasRecentCriticalErrors(timeWindow = 300000) {
        const recentErrors = this.getRecentErrors(timeWindow);
        return recentErrors.some(error => error.severity === ErrorSeverity.CRITICAL);
    }
    getErrorRate(timeWindow = 60000) {
        const recentErrors = this.getRecentErrors(timeWindow);
        return recentErrors.length / (timeWindow / 1000); // errors per second
    }
    // Static convenience methods
    static handleInitializationError(error, additionalData) {
        const handler = ErrorHandler.getInstance();
        handler.handleError(error, ErrorContext.INITIALIZATION, additionalData);
    }
    static handleAnimationError(error, additionalData) {
        const handler = ErrorHandler.getInstance();
        handler.handleError(error, ErrorContext.ANIMATION, additionalData);
    }
    static handlePerformanceError(error, additionalData) {
        const handler = ErrorHandler.getInstance();
        handler.handleError(error, ErrorContext.PERFORMANCE, additionalData);
    }
    static handleSettingsError(error, additionalData) {
        const handler = ErrorHandler.getInstance();
        handler.handleError(error, ErrorContext.SETTINGS, additionalData);
    }
    static handleStateMonitoringError(error, additionalData) {
        const handler = ErrorHandler.getInstance();
        handler.handleError(error, ErrorContext.STATE_MONITORING, additionalData);
    }
    static handleDomError(error, additionalData) {
        const handler = ErrorHandler.getInstance();
        handler.handleError(error, ErrorContext.DOM_MANIPULATION, additionalData);
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    static resetInstance() {
        ErrorHandler.instance = null;
    }
}
exports.ErrorHandler = ErrorHandler;
// Singleton pattern for global error handling
ErrorHandler.instance = null;
//# sourceMappingURL=ErrorHandler.js.map
export enum ErrorContext {
  INITIALIZATION = 'initialization',
  ANIMATION = 'animation',
  PERFORMANCE = 'performance',
  SETTINGS = 'settings',
  STATE_MONITORING = 'state_monitoring',
  DOM_MANIPULATION = 'dom_manipulation'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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

export class ErrorHandler implements IErrorHandler {
  private errorHistory: ErrorInfo[] = [];
  private readonly maxHistorySize: number = 50;
  private errorCallbacks: Array<(errorInfo: ErrorInfo) => void> = [];
  private fallbackStrategies: Map<ErrorContext, () => void> = new Map();

  constructor() {
    this.initializeFallbackStrategies();
  }

  handleError(error: Error, context: ErrorContext, additionalData?: any): void {
    const severity = this.determineSeverity(error, context);
    const errorInfo: ErrorInfo = {
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

  getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory];
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  setErrorCallback(callback: (errorInfo: ErrorInfo) => void): void {
    this.errorCallbacks.push(callback);
  }

  removeErrorCallback(callback: (errorInfo: ErrorInfo) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  private initializeFallbackStrategies(): void {
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

  private determineSeverity(error: Error, context: ErrorContext): ErrorSeverity {
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

  private logError(errorInfo: ErrorInfo): void {
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

  private addToHistory(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);
    
    // Maintain history size limit
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  private executeFallbackStrategy(context: ErrorContext, errorInfo: ErrorInfo): void {
    const strategy = this.fallbackStrategies.get(context);
    if (strategy) {
      try {
        strategy();
      } catch (fallbackError) {
        console.error('[ErrorHandler] Fallback strategy failed:', fallbackError);
        // Last resort: enable minimal mode
        this.enableMinimalMode();
      }
    }
  }

  private notifyCallbacks(errorInfo: ErrorInfo): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('[ErrorHandler] Error callback failed:', callbackError);
      }
    });
  }

  // Fallback strategy implementations
  private enableMinimalMode(): void {
    // Disable all non-essential features
    this.dispatchCustomEvent('kiro-character:enable-minimal-mode');
  }

  private fallbackToStaticDisplay(): void {
    // Switch to CSS-only animations
    this.dispatchCustomEvent('kiro-character:fallback-static-display');
  }

  private reduceAnimationComplexity(): void {
    // Reduce animation frame rate and complexity
    this.dispatchCustomEvent('kiro-character:reduce-animation-complexity');
  }

  private useDefaultSettings(): void {
    // Reset to default settings
    this.dispatchCustomEvent('kiro-character:use-default-settings');
  }

  private enableFallbackStateDetection(): void {
    // Use simple state detection methods
    this.dispatchCustomEvent('kiro-character:fallback-state-detection');
  }

  private attemptDomRecovery(): void {
    // Try to recover DOM state
    this.dispatchCustomEvent('kiro-character:attempt-dom-recovery');
  }

  private dispatchCustomEvent(eventType: string, detail?: any): void {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent(eventType, { detail });
      window.dispatchEvent(event);
    }
  }

  // Utility methods for error analysis
  getErrorsByContext(context: ErrorContext): ErrorInfo[] {
    return this.errorHistory.filter(error => error.context === context);
  }

  getErrorsBySeverity(severity: ErrorSeverity): ErrorInfo[] {
    return this.errorHistory.filter(error => error.severity === severity);
  }

  getRecentErrors(timeWindow: number = 60000): ErrorInfo[] {
    const cutoff = Date.now() - timeWindow;
    return this.errorHistory.filter(error => error.timestamp > cutoff);
  }

  hasRecentCriticalErrors(timeWindow: number = 300000): boolean {
    const recentErrors = this.getRecentErrors(timeWindow);
    return recentErrors.some(error => error.severity === ErrorSeverity.CRITICAL);
  }

  getErrorRate(timeWindow: number = 60000): number {
    const recentErrors = this.getRecentErrors(timeWindow);
    return recentErrors.length / (timeWindow / 1000); // errors per second
  }

  // Static convenience methods
  static handleInitializationError(error: Error, additionalData?: any): void {
    const handler = ErrorHandler.getInstance();
    handler.handleError(error, ErrorContext.INITIALIZATION, additionalData);
  }

  static handleAnimationError(error: Error, additionalData?: any): void {
    const handler = ErrorHandler.getInstance();
    handler.handleError(error, ErrorContext.ANIMATION, additionalData);
  }

  static handlePerformanceError(error: Error, additionalData?: any): void {
    const handler = ErrorHandler.getInstance();
    handler.handleError(error, ErrorContext.PERFORMANCE, additionalData);
  }

  static handleSettingsError(error: Error, additionalData?: any): void {
    const handler = ErrorHandler.getInstance();
    handler.handleError(error, ErrorContext.SETTINGS, additionalData);
  }

  static handleStateMonitoringError(error: Error, additionalData?: any): void {
    const handler = ErrorHandler.getInstance();
    handler.handleError(error, ErrorContext.STATE_MONITORING, additionalData);
  }

  static handleDomError(error: Error, additionalData?: any): void {
    const handler = ErrorHandler.getInstance();
    handler.handleError(error, ErrorContext.DOM_MANIPULATION, additionalData);
  }

  // Singleton pattern for global error handling
  private static instance: ErrorHandler | null = null;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  static resetInstance(): void {
    ErrorHandler.instance = null;
  }
}

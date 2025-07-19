import { ErrorHandler, ErrorContext, ErrorSeverity } from '../src/error/ErrorHandler';

// Mock window and CustomEvent
const mockWindow = {
  dispatchEvent: jest.fn(),
  addEventListener: jest.fn()
};

global.CustomEvent = jest.fn().mockImplementation((type, options) => ({
  type,
  detail: options?.detail
}));

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    ErrorHandler.resetInstance();
    errorHandler = new ErrorHandler();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should reset instance', () => {
      const instance1 = ErrorHandler.getInstance();
      ErrorHandler.resetInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Error Handling', () => {
    test('should handle error with context', () => {
      const error = new Error('Test error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler.handleError(error, ErrorContext.ANIMATION);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(errorHandler.getErrorHistory()).toHaveLength(1);
      
      consoleErrorSpy.mockRestore();
    });

    test('should determine correct severity', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Critical error
      errorHandler.handleError(new Error('Init error'), ErrorContext.INITIALIZATION);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Medium severity error
      errorHandler.handleError(new Error('Animation error'), ErrorContext.ANIMATION);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    test('should store error in history', () => {
      const error = new Error('Test error');
      
      errorHandler.handleError(error, ErrorContext.SETTINGS);
      
      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].error).toBe(error);
      expect(history[0].context).toBe(ErrorContext.SETTINGS);
    });

    test('should limit history size', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Add more errors than the limit (50)
      for (let i = 0; i < 60; i++) {
        errorHandler.handleError(new Error(`Error ${i}`), ErrorContext.PERFORMANCE);
      }
      
      expect(errorHandler.getErrorHistory()).toHaveLength(50);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Fallback Strategies', () => {
    test('should dispatch custom events for fallback strategies', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      errorHandler.handleError(new Error('Animation error'), ErrorContext.ANIMATION);
      
      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kiro-character:fallback-static-display'
        })
      );
      
      consoleWarnSpy.mockRestore();
    });

    test('should handle fallback strategy errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Mock dispatchEvent to throw error
      mockWindow.dispatchEvent.mockImplementation(() => {
        throw new Error('Dispatch error');
      });
      
      errorHandler.handleError(new Error('Test error'), ErrorContext.ANIMATION);
      
      // Should still handle the error gracefully
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Callbacks', () => {
    test('should notify error callbacks', () => {
      const callback = jest.fn();
      errorHandler.setErrorCallback(callback);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, ErrorContext.SETTINGS);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          context: ErrorContext.SETTINGS
        })
      );
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler.setErrorCallback(errorCallback);
      errorHandler.setErrorCallback(goodCallback);
      
      errorHandler.handleError(new Error('Test error'), ErrorContext.SETTINGS);
      
      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should remove error callbacks', () => {
      const callback = jest.fn();
      errorHandler.setErrorCallback(callback);
      errorHandler.removeErrorCallback(callback);
      
      errorHandler.handleError(new Error('Test error'), ErrorContext.SETTINGS);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Error Analysis', () => {
    beforeEach(() => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Add some test errors
      errorHandler.handleError(new Error('Animation error 1'), ErrorContext.ANIMATION);
      errorHandler.handleError(new Error('Animation error 2'), ErrorContext.ANIMATION);
      errorHandler.handleError(new Error('Settings error'), ErrorContext.SETTINGS);
      errorHandler.handleError(new Error('Critical error'), ErrorContext.INITIALIZATION);
      
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    test('should filter errors by context', () => {
      const animationErrors = errorHandler.getErrorsByContext(ErrorContext.ANIMATION);
      expect(animationErrors).toHaveLength(2);
      
      const settingsErrors = errorHandler.getErrorsByContext(ErrorContext.SETTINGS);
      expect(settingsErrors).toHaveLength(1);
    });

    test('should filter errors by severity', () => {
      const criticalErrors = errorHandler.getErrorsBySeverity(ErrorSeverity.CRITICAL);
      expect(criticalErrors).toHaveLength(1);
      
      const mediumErrors = errorHandler.getErrorsBySeverity(ErrorSeverity.MEDIUM);
      expect(mediumErrors).toHaveLength(2);
    });

    test('should get recent errors', () => {
      const recentErrors = errorHandler.getRecentErrors(60000);
      expect(recentErrors).toHaveLength(4);
      
      const veryRecentErrors = errorHandler.getRecentErrors(1);
      expect(veryRecentErrors).toHaveLength(0);
    });

    test('should detect recent critical errors', () => {
      expect(errorHandler.hasRecentCriticalErrors()).toBe(true);
    });

    test('should calculate error rate', () => {
      const errorRate = errorHandler.getErrorRate(60000);
      expect(errorRate).toBeGreaterThan(0);
    });
  });

  describe('Static Methods', () => {
    test('should handle initialization errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      ErrorHandler.handleInitializationError(new Error('Init error'));
      
      const instance = ErrorHandler.getInstance();
      expect(instance.getErrorHistory()).toHaveLength(1);
      expect(instance.getErrorHistory()[0].context).toBe(ErrorContext.INITIALIZATION);
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle animation errors', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      ErrorHandler.handleAnimationError(new Error('Animation error'));
      
      const instance = ErrorHandler.getInstance();
      expect(instance.getErrorHistory()).toHaveLength(1);
      expect(instance.getErrorHistory()[0].context).toBe(ErrorContext.ANIMATION);
      
      consoleWarnSpy.mockRestore();
    });

    test('should handle performance errors', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      ErrorHandler.handlePerformanceError(new Error('Performance error'));
      
      const instance = ErrorHandler.getInstance();
      expect(instance.getErrorHistory()).toHaveLength(1);
      expect(instance.getErrorHistory()[0].context).toBe(ErrorContext.PERFORMANCE);
      
      consoleLogSpy.mockRestore();
    });

    test('should handle settings errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      ErrorHandler.handleSettingsError(new Error('Settings error'));
      
      const instance = ErrorHandler.getInstance();
      expect(instance.getErrorHistory()).toHaveLength(1);
      expect(instance.getErrorHistory()[0].context).toBe(ErrorContext.SETTINGS);
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle state monitoring errors', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      ErrorHandler.handleStateMonitoringError(new Error('State error'));
      
      const instance = ErrorHandler.getInstance();
      expect(instance.getErrorHistory()).toHaveLength(1);
      expect(instance.getErrorHistory()[0].context).toBe(ErrorContext.STATE_MONITORING);
      
      consoleWarnSpy.mockRestore();
    });

    test('should handle DOM errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      ErrorHandler.handleDomError(new Error('DOM error'));
      
      const instance = ErrorHandler.getInstance();
      expect(instance.getErrorHistory()).toHaveLength(1);
      expect(instance.getErrorHistory()[0].context).toBe(ErrorContext.DOM_MANIPULATION);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('History Management', () => {
    test('should clear error history', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler.handleError(new Error('Test error'), ErrorContext.ANIMATION);
      expect(errorHandler.getErrorHistory()).toHaveLength(1);
      
      errorHandler.clearErrorHistory();
      expect(errorHandler.getErrorHistory()).toHaveLength(0);
      
      consoleErrorSpy.mockRestore();
    });
  });
});

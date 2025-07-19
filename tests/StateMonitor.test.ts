import { StateMonitor } from '../src/state/StateMonitor';
import { KiroState } from '../src/types';

// Mock window and document
const mockWindow = {
  addEventListener: jest.fn(),
  setInterval: jest.fn(),
  clearInterval: jest.fn(),
  setTimeout: jest.fn()
};

const mockDocument = {
  addEventListener: jest.fn()
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

describe('StateMonitor', () => {
  let stateMonitor: StateMonitor;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    stateMonitor = new StateMonitor();
    mockCallback = jest.fn();
  });

  afterEach(() => {
    stateMonitor.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with idle state', () => {
      expect(stateMonitor.getCurrentState()).toBe(KiroState.IDLE);
    });

    test('should bind event listeners on construction', () => {
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });
  });

  describe('Monitoring Control', () => {
    test('should start monitoring', () => {
      stateMonitor.startMonitoring();
      expect(mockWindow.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    test('should not start monitoring twice', () => {
      stateMonitor.startMonitoring();
      stateMonitor.startMonitoring();
      expect(mockWindow.setInterval).toHaveBeenCalledTimes(1);
    });

    test('should stop monitoring', () => {
      stateMonitor.startMonitoring();
      stateMonitor.stopMonitoring();
      expect(mockWindow.clearInterval).toHaveBeenCalled();
    });

    test('should handle stop monitoring when not started', () => {
      expect(() => stateMonitor.stopMonitoring()).not.toThrow();
    });
  });

  describe('State Change Callbacks', () => {
    test('should register state change callback', () => {
      stateMonitor.onStateChange(mockCallback);
      
      stateMonitor.forceStateChange(KiroState.EXECUTING);
      
      // Callback should be called asynchronously
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(KiroState.EXECUTING);
      }, 0);
    });

    test('should handle multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      stateMonitor.onStateChange(callback1);
      stateMonitor.onStateChange(callback2);
      
      stateMonitor.forceStateChange(KiroState.ACTIVE);
      
      setTimeout(() => {
        expect(callback1).toHaveBeenCalledWith(KiroState.ACTIVE);
        expect(callback2).toHaveBeenCalledWith(KiroState.ACTIVE);
      }, 0);
    });

    test('should remove state change callback', () => {
      stateMonitor.onStateChange(mockCallback);
      stateMonitor.removeStateChangeCallback(mockCallback);
      
      stateMonitor.forceStateChange(KiroState.ERROR);
      
      setTimeout(() => {
        expect(mockCallback).not.toHaveBeenCalled();
      }, 0);
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      stateMonitor.onStateChange(errorCallback);
      stateMonitor.onStateChange(mockCallback);
      
      stateMonitor.forceStateChange(KiroState.ERROR);
      
      setTimeout(() => {
        expect(errorCallback).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
      }, 0);
    });
  });

  describe('State Management', () => {
    test('should get current state', () => {
      expect(stateMonitor.getCurrentState()).toBe(KiroState.IDLE);
    });

    test('should force state change', () => {
      stateMonitor.onStateChange(mockCallback);
      
      stateMonitor.forceStateChange(KiroState.EXECUTING);
      expect(stateMonitor.getCurrentState()).toBe(KiroState.EXECUTING);
      
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(KiroState.EXECUTING);
      }, 0);
    });

    test('should not trigger callback for same state', () => {
      stateMonitor.onStateChange(mockCallback);
      
      stateMonitor.forceStateChange(KiroState.IDLE); // Same as initial state
      
      setTimeout(() => {
        expect(mockCallback).not.toHaveBeenCalled();
      }, 0);
    });

    test('should log state changes', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      stateMonitor.forceStateChange(KiroState.EXECUTING);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[StateMonitor] State changed: idle -> executing')
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Disposal', () => {
    test('should stop monitoring on dispose', () => {
      stateMonitor.startMonitoring();
      stateMonitor.dispose();
      
      expect(mockWindow.clearInterval).toHaveBeenCalled();
    });

    test('should clear callbacks on dispose', () => {
      stateMonitor.onStateChange(mockCallback);
      stateMonitor.dispose();
      
      stateMonitor.forceStateChange(KiroState.ERROR);
      
      setTimeout(() => {
        expect(mockCallback).not.toHaveBeenCalled();
      }, 0);
    });
  });

  describe('Debouncing', () => {
    test('should debounce rapid state changes', () => {
      stateMonitor.onStateChange(mockCallback);
      
      // Rapid state changes
      stateMonitor.forceStateChange(KiroState.EXECUTING);
      stateMonitor.forceStateChange(KiroState.ERROR);
      stateMonitor.forceStateChange(KiroState.IDLE);
      
      // Only the last state change should be processed due to debouncing
      expect(stateMonitor.getCurrentState()).toBe(KiroState.IDLE);
    });
  });
});

import { activate, deactivate, getStatusBarCharacter, isActive } from '../src/extension';
import { KiroState } from '../src/types';

// Mock DOM environment
const mockDocument = {
  createElement: jest.fn(),
  querySelector: jest.fn(),
  body: { appendChild: jest.fn() },
  head: { appendChild: jest.fn() }
};

const mockWindow = {
  innerWidth: 1024,
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  setInterval: jest.fn(),
  clearInterval: jest.fn(),
  setTimeout: jest.fn(),
  clearTimeout: jest.fn(),
  requestAnimationFrame: jest.fn(),
  cancelAnimationFrame: jest.fn(),
  performance: { now: jest.fn(() => Date.now()) }
};

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(global, 'document', { value: mockDocument, writable: true });
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });
Object.defineProperty(global, 'performance', { value: mockWindow.performance, writable: true });

// Mock DOM elements
const createMockElement = (tagName: string = 'div') => ({
  tagName: tagName.toUpperCase(),
  className: '',
  textContent: '',
  style: { cssText: '', animation: '', transform: '' },
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn()
  },
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  appendChild: jest.fn(),
  insertBefore: jest.fn(),
  removeChild: jest.fn(),
  parentNode: null,
  firstChild: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  focus: jest.fn(),
  tabIndex: 0
});

describe('Integration Tests', () => {
  let mockStatusBar: any;
  let mockCharacterElement: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock elements
    mockStatusBar = createMockElement('div');
    mockCharacterElement = createMockElement('span');
    
    mockDocument.createElement.mockImplementation((tagName: string) => {
      if (tagName === 'span') return mockCharacterElement;
      return createMockElement(tagName);
    });
    
    mockDocument.querySelector.mockReturnValue(mockStatusBar);
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(async () => {
    if (isActive()) {
      deactivate();
    }
  });

  describe('Extension Lifecycle', () => {
    test('should activate extension successfully', async () => {
      await activate();
      
      expect(isActive()).toBe(true);
      expect(getStatusBarCharacter()).not.toBeNull();
    });

    test('should deactivate extension successfully', async () => {
      await activate();
      expect(isActive()).toBe(true);
      
      deactivate();
      expect(isActive()).toBe(false);
      expect(getStatusBarCharacter()).toBeNull();
    });

    test('should handle activation errors gracefully', async () => {
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.createElement.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await activate();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(isActive()).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Full System Integration', () => {
    test('should initialize all components correctly', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      expect(character).not.toBeNull();
      
      if (character) {
        expect(character.getSettingsManager()).toBeDefined();
        expect(character.getAnimationController()).toBeDefined();
        expect(character.getStateMonitor()).toBeDefined();
        expect(character.getPerformanceOptimizer()).toBeDefined();
        expect(character.getErrorHandler()).toBeDefined();
      }
    });

    test('should create and attach DOM element', async () => {
      await activate();
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('span');
      expect(mockCharacterElement.setAttribute).toHaveBeenCalledWith('aria-label', 'Kiro Status Character');
      expect(mockStatusBar.appendChild).toHaveBeenCalledWith(mockCharacterElement);
    });

    test('should handle state changes end-to-end', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const animationController = character.getAnimationController();
        const startAnimationSpy = jest.spyOn(animationController, 'startAnimation');
        
        character.updateState(KiroState.EXECUTING);
        
        // Allow for async state processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(startAnimationSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Settings Integration', () => {
    test('should load and apply settings', async () => {
      const mockSettings = JSON.stringify({
        enabled: false,
        animationSpeed: 2.0,
        position: 'left'
      });
      
      mockLocalStorage.getItem.mockReturnValue(mockSettings);
      
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const settingsManager = character.getSettingsManager();
        expect(settingsManager.isEnabled()).toBe(false);
        expect(settingsManager.getAnimationSpeed()).toBe(2.0);
        expect(settingsManager.getPosition()).toBe('left');
      }
    });

    test('should save settings changes', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const settingsManager = character.getSettingsManager();
        
        settingsManager.setEnabled(false);
        settingsManager.setAnimationSpeed(1.5);
        await settingsManager.saveSettings();
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'kiro-status-character-settings',
          expect.stringContaining('"enabled":false')
        );
      }
    });
  });

  describe('Performance Integration', () => {
    test('should monitor and adjust performance', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const performanceOptimizer = character.getPerformanceOptimizer();
        const animationController = character.getAnimationController();
        
        // Start monitoring
        performanceOptimizer.monitorPerformance();
        
        // Simulate performance adjustment
        performanceOptimizer.adjustPerformance();
        
        expect(mockWindow.setInterval).toHaveBeenCalled();
      }
    });

    test('should reduce animation complexity under load', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const performanceOptimizer = character.getPerformanceOptimizer();
        
        // Force performance reduction
        performanceOptimizer.setMemoryThreshold(10); // Very low threshold
        
        const shouldReduce = performanceOptimizer.shouldReduceAnimation();
        expect(shouldReduce).toBe(true);
        
        const optimalFrameRate = performanceOptimizer.getOptimalFrameRate();
        expect(optimalFrameRate).toBeLessThan(60);
      }
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle and recover from errors', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const errorHandler = character.getErrorHandler();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        // Simulate an animation error
        const testError = new Error('Animation failed');
        errorHandler.handleError(testError, require('../src/error/ErrorHandler').ErrorContext.ANIMATION);
        
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'kiro-character:fallback-static-display'
          })
        );
        
        consoleWarnSpy.mockRestore();
      }
    });

    test('should maintain error history', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const errorHandler = character.getErrorHandler();
        
        // Generate some errors
        errorHandler.handleError(new Error('Error 1'), require('../src/error/ErrorHandler').ErrorContext.ANIMATION);
        errorHandler.handleError(new Error('Error 2'), require('../src/error/ErrorHandler').ErrorContext.SETTINGS);
        
        const history = errorHandler.getErrorHistory();
        expect(history).toHaveLength(2);
      }
    });
  });

  describe('Responsive Behavior', () => {
    test('should adapt to narrow screens', async () => {
      (mockWindow as any).innerWidth = 500; // Narrow screen
      
      await activate();
      
      expect(mockCharacterElement.classList.add).toHaveBeenCalledWith('responsive-hide');
    });

    test('should work on wide screens', async () => {
      (mockWindow as any).innerWidth = 1200; // Wide screen
      
      await activate();
      
      expect(mockCharacterElement.classList.remove).toHaveBeenCalledWith('responsive-hide');
    });
  });

  describe('Memory Management', () => {
    test('should clean up resources on deactivation', async () => {
      await activate();
      
      const character = getStatusBarCharacter();
      if (character) {
        const stateMonitor = character.getStateMonitor();
        const animationController = character.getAnimationController();
        const performanceOptimizer = character.getPerformanceOptimizer();
        
        const stateMonitorDisposeSpy = jest.spyOn(stateMonitor, 'dispose');
        const animationControllerDisposeSpy = jest.spyOn(animationController, 'dispose');
        const performanceOptimizerDisposeSpy = jest.spyOn(performanceOptimizer, 'dispose');
        
        deactivate();
        
        expect(stateMonitorDisposeSpy).toHaveBeenCalled();
        expect(animationControllerDisposeSpy).toHaveBeenCalled();
        expect(performanceOptimizerDisposeSpy).toHaveBeenCalled();
      }
    });

    test('should remove DOM elements on disposal', async () => {
      mockCharacterElement.parentNode = mockStatusBar;
      
      await activate();
      deactivate();
      
      expect(mockStatusBar.removeChild).toHaveBeenCalledWith(mockCharacterElement);
    });
  });

  describe('Accessibility', () => {
    test('should set proper ARIA attributes', async () => {
      await activate();
      
      expect(mockCharacterElement.setAttribute).toHaveBeenCalledWith('aria-label', 'Kiro Status Character');
      expect(mockCharacterElement.setAttribute).toHaveBeenCalledWith('role', 'img');
    });
  });

  describe('Fallback Behavior', () => {
    test('should create fallback status bar when none found', async () => {
      mockDocument.querySelector.mockReturnValue(null);
      
      const fallbackStatusBar = createMockElement('div');
      mockDocument.createElement.mockImplementation((tagName: string) => {
        if (tagName === 'span') return mockCharacterElement;
        if (tagName === 'div') return fallbackStatusBar;
        return createMockElement(tagName);
      });
      
      await activate();
      
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(fallbackStatusBar);
    });
  });
});

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockStatusBar = createMockElement('div');
    const mockCharacterElement = createMockElement('span');
    
    mockDocument.createElement.mockImplementation((tagName: string) => {
      if (tagName === 'span') return mockCharacterElement;
      return createMockElement(tagName);
    });
    
    mockDocument.querySelector.mockReturnValue(mockStatusBar);
  });

  afterEach(() => {
    if (isActive()) {
      deactivate();
    }
  });

  test('should initialize within reasonable time', async () => {
    const startTime = Date.now();
    
    await activate();
    
    const endTime = Date.now();
    const initTime = endTime - startTime;
    
    // Should initialize within 100ms
    expect(initTime).toBeLessThan(100);
  });

  test('should handle rapid state changes efficiently', async () => {
    await activate();
    
    const character = getStatusBarCharacter();
    if (character) {
      const startTime = Date.now();
      
      // Rapid state changes
      for (let i = 0; i < 100; i++) {
        character.updateState(i % 2 === 0 ? KiroState.IDLE : KiroState.EXECUTING);
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should handle 100 state changes within 50ms
      expect(processingTime).toBeLessThan(50);
    }
  });

  test('should not leak memory during long operation', async () => {
    await activate();
    
    const character = getStatusBarCharacter();
    if (character) {
      const performanceOptimizer = character.getPerformanceOptimizer();
      
      // Simulate long operation with performance monitoring
      performanceOptimizer.monitorPerformance();
      
      // Simulate multiple monitoring cycles
      const intervalCallback = (mockWindow.setInterval as jest.Mock).mock.calls[0]?.[0];
      if (intervalCallback) {
        for (let i = 0; i < 20; i++) {
          intervalCallback();
        }
      }
      
      // History should be limited
      const history = performanceOptimizer.getPerformanceHistory();
      expect(history.length).toBeLessThanOrEqual(10);
    }
  });

  test('should maintain smooth animation frame rate', async () => {
    await activate();
    
    const character = getStatusBarCharacter();
    if (character) {
      const animationController = character.getAnimationController();
      
      // Start animation
      animationController.startAnimation(require('../src/types').AnimationPattern.IDLE);
      
      // Should use requestAnimationFrame
      expect(mockWindow.requestAnimationFrame).toHaveBeenCalled();
      
      // Should maintain reasonable frame rate
      const targetFrameRate = animationController.getTargetFrameRate();
      expect(targetFrameRate).toBeGreaterThanOrEqual(15);
      expect(targetFrameRate).toBeLessThanOrEqual(60);
    }
  });
});

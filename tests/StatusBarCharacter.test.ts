import { StatusBarCharacter } from '../src/StatusBarCharacter';
import { KiroState } from '../src/types';

// Mock all dependencies
jest.mock('../src/animation/AnimationController');
jest.mock('../src/state/StateMonitor');
jest.mock('../src/state/StateAnimationBridge');
jest.mock('../src/settings/SettingsManager');
jest.mock('../src/performance/PerformanceOptimizer');

// Mock DOM APIs
const mockDocument = {
  createElement: jest.fn(),
  querySelector: jest.fn(),
  body: {
    appendChild: jest.fn()
  }
};

const mockWindow = {
  innerWidth: 1024
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('StatusBarCharacter', () => {
  let statusBarCharacter: StatusBarCharacter;
  let mockElement: HTMLElement;
  let mockStatusBar: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock DOM elements
    mockElement = {
      className: '',
      textContent: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      },
      setAttribute: jest.fn(),
      parentNode: {
        removeChild: jest.fn()
      }
    } as any;

    mockStatusBar = {
      insertBefore: jest.fn(),
      appendChild: jest.fn(),
      firstChild: null
    } as any;

    mockDocument.createElement.mockReturnValue(mockElement);
    mockDocument.querySelector.mockReturnValue(mockStatusBar);

    statusBarCharacter = new StatusBarCharacter();
  });

  afterEach(() => {
    statusBarCharacter.dispose();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(statusBarCharacter.initialize()).resolves.not.toThrow();
    });

    test('should not initialize twice', async () => {
      await statusBarCharacter.initialize();
      await expect(statusBarCharacter.initialize()).resolves.not.toThrow();
    });

    test('should create DOM element during initialization', async () => {
      await statusBarCharacter.initialize();
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('span');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-label', 'Kiro Status Character');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('role', 'img');
    });

    test('should attach to status bar during initialization', async () => {
      await statusBarCharacter.initialize();
      
      expect(mockDocument.querySelector).toHaveBeenCalled();
      expect(mockStatusBar.appendChild).toHaveBeenCalledWith(mockElement);
    });

    test('should handle initialization errors gracefully', async () => {
      mockDocument.querySelector.mockReturnValue(null);
      
      await expect(statusBarCharacter.initialize()).rejects.toThrow();
    });
  });

  describe('Display Control', () => {
    beforeEach(async () => {
      await statusBarCharacter.initialize();
    });

    test('should show character', () => {
      statusBarCharacter.show();
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockElement.classList.add).toHaveBeenCalledWith('visible');
    });

    test('should hide character', () => {
      statusBarCharacter.hide();
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('visible');
      expect(mockElement.classList.add).toHaveBeenCalledWith('hidden');
    });

    test('should handle show when element not created', () => {
      const newCharacter = new StatusBarCharacter();
      expect(() => newCharacter.show()).not.toThrow();
      newCharacter.dispose();
    });

    test('should check visibility status', () => {
      (mockElement.classList.contains as jest.Mock).mockReturnValue(true);
      expect(statusBarCharacter.isVisible()).toBe(true);
      
      (mockElement.classList.contains as jest.Mock).mockReturnValue(false);
      expect(statusBarCharacter.isVisible()).toBe(false);
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await statusBarCharacter.initialize();
    });

    test('should update state', () => {
      const stateMonitor = statusBarCharacter.getStateMonitor();
      const forceStateChangeSpy = jest.spyOn(stateMonitor, 'forceStateChange');
      
      statusBarCharacter.updateState(KiroState.EXECUTING);
      
      expect(forceStateChangeSpy).toHaveBeenCalledWith(KiroState.EXECUTING);
    });
  });

  describe('Settings Management', () => {
    beforeEach(async () => {
      await statusBarCharacter.initialize();
    });

    test('should refresh settings', async () => {
      const settingsManager = statusBarCharacter.getSettingsManager();
      const loadSettingsSpy = jest.spyOn(settingsManager, 'loadSettings').mockResolvedValue();
      const isEnabledSpy = jest.spyOn(settingsManager, 'isEnabled').mockReturnValue(true);
      
      await statusBarCharacter.refreshSettings();
      
      expect(loadSettingsSpy).toHaveBeenCalled();
    });

    test('should handle settings refresh errors', async () => {
      const settingsManager = statusBarCharacter.getSettingsManager();
      jest.spyOn(settingsManager, 'loadSettings').mockRejectedValue(new Error('Settings error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await statusBarCharacter.refreshSettings();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Status Bar Integration', () => {
    test('should find status bar with multiple selectors', async () => {
      mockDocument.querySelector
        .mockReturnValueOnce(null) // First selector fails
        .mockReturnValueOnce(mockStatusBar); // Second selector succeeds
      
      await statusBarCharacter.initialize();
      
      expect(mockDocument.querySelector).toHaveBeenCalledTimes(2);
    });

    test('should create fallback status bar when none found', async () => {
      mockDocument.querySelector.mockReturnValue(null);
      
      const fallbackElement = {
        className: '',
        style: { cssText: '' },
        appendChild: jest.fn(),
        insertBefore: jest.fn(),
        firstChild: null
      };
      
      mockDocument.createElement
        .mockReturnValueOnce(mockElement) // Character element
        .mockReturnValueOnce(fallbackElement); // Fallback status bar
      
      await statusBarCharacter.initialize();
      
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(fallbackElement);
    });

    test('should position character based on settings', async () => {
      const settingsManager = statusBarCharacter.getSettingsManager();
      jest.spyOn(settingsManager, 'getPosition').mockReturnValue('left');
      
      await statusBarCharacter.initialize();
      
      expect(mockStatusBar.insertBefore).toHaveBeenCalledWith(mockElement, null);
    });
  });

  describe('Responsive Behavior', () => {
    test('should apply responsive classes on narrow screens', async () => {
      (mockWindow as any).innerWidth = 500; // Narrow screen
      
      await statusBarCharacter.initialize();
      
      expect(mockElement.classList.add).toHaveBeenCalledWith('responsive-hide');
    });

    test('should not apply responsive classes on wide screens', async () => {
      (mockWindow as any).innerWidth = 1200; // Wide screen
      
      await statusBarCharacter.initialize();
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('responsive-hide');
    });
  });

  describe('Component Access', () => {
    beforeEach(async () => {
      await statusBarCharacter.initialize();
    });

    test('should provide access to settings manager', () => {
      expect(statusBarCharacter.getSettingsManager()).toBeDefined();
    });

    test('should provide access to animation controller', () => {
      expect(statusBarCharacter.getAnimationController()).toBeDefined();
    });

    test('should provide access to state monitor', () => {
      expect(statusBarCharacter.getStateMonitor()).toBeDefined();
    });

    test('should provide access to performance optimizer', () => {
      expect(statusBarCharacter.getPerformanceOptimizer()).toBeDefined();
    });

    test('should provide access to DOM element', () => {
      expect(statusBarCharacter.getElement()).toBe(mockElement);
    });
  });

  describe('Disposal', () => {
    test('should dispose all components', async () => {
      await statusBarCharacter.initialize();
      
      const stateMonitor = statusBarCharacter.getStateMonitor();
      const animationController = statusBarCharacter.getAnimationController();
      const performanceOptimizer = statusBarCharacter.getPerformanceOptimizer();
      
      const stateMonitorDisposeSpy = jest.spyOn(stateMonitor, 'dispose');
      const animationControllerDisposeSpy = jest.spyOn(animationController, 'dispose');
      const performanceOptimizerDisposeSpy = jest.spyOn(performanceOptimizer, 'dispose');
      
      statusBarCharacter.dispose();
      
      expect(stateMonitorDisposeSpy).toHaveBeenCalled();
      expect(animationControllerDisposeSpy).toHaveBeenCalled();
      expect(performanceOptimizerDisposeSpy).toHaveBeenCalled();
    });

    test('should remove DOM element on disposal', async () => {
      await statusBarCharacter.initialize();
      
      statusBarCharacter.dispose();
      
      expect(mockElement.parentNode.removeChild).toHaveBeenCalledWith(mockElement);
    });

    test('should handle disposal errors gracefully', async () => {
      await statusBarCharacter.initialize();
      
      const stateMonitor = statusBarCharacter.getStateMonitor();
      jest.spyOn(stateMonitor, 'dispose').mockImplementation(() => {
        throw new Error('Disposal error');
      });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => statusBarCharacter.dispose()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should clear element reference after disposal', async () => {
      await statusBarCharacter.initialize();
      
      statusBarCharacter.dispose();
      
      expect(statusBarCharacter.getElement()).toBeNull();
    });
  });
});

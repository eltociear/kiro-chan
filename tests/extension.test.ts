import { activate, deactivate, getStatusBarCharacter, isActive, restart } from '../src/extension';

// Mock StatusBarCharacter
jest.mock('../src/StatusBarCharacter', () => {
  return {
    StatusBarCharacter: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      dispose: jest.fn(),
      show: jest.fn(),
      hide: jest.fn()
    }))
  };
});

// Mock ErrorHandler
jest.mock('../src/error/ErrorHandler', () => ({
  ErrorHandler: {
    handleInitializationError: jest.fn(),
    resetInstance: jest.fn()
  }
}));

describe('Extension Entry Point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure clean state
    if (isActive()) {
      deactivate();
    }
  });

  describe('Activation', () => {
    test('should activate successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await activate();
      
      expect(isActive()).toBe(true);
      expect(getStatusBarCharacter()).not.toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('activated successfully')
      );
      
      consoleLogSpy.mockRestore();
    });

    test('should handle activation errors gracefully', async () => {
      const { StatusBarCharacter } = require('../src/StatusBarCharacter');
      const mockInstance = {
        initialize: jest.fn().mockRejectedValue(new Error('Init failed')),
        dispose: jest.fn()
      };
      StatusBarCharacter.mockImplementation(() => mockInstance);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const { ErrorHandler } = require('../src/error/ErrorHandler');
      
      await activate();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(ErrorHandler.handleInitializationError).toHaveBeenCalled();
      expect(isActive()).toBe(false);
      expect(mockInstance.dispose).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should not activate twice', async () => {
      await activate();
      const firstInstance = getStatusBarCharacter();
      
      await activate();
      const secondInstance = getStatusBarCharacter();
      
      expect(firstInstance).toBe(secondInstance);
    });
  });

  describe('Deactivation', () => {
    test('should deactivate successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await activate();
      const character = getStatusBarCharacter();
      
      deactivate();
      
      expect(isActive()).toBe(false);
      expect(getStatusBarCharacter()).toBeNull();
      expect(character?.dispose).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('deactivated successfully')
      );
      
      consoleLogSpy.mockRestore();
    });

    test('should handle deactivation errors gracefully', async () => {
      await activate();
      const character = getStatusBarCharacter();
      
      if (character) {
        (character.dispose as jest.Mock).mockImplementation(() => {
          throw new Error('Dispose failed');
        });
      }
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => deactivate()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(isActive()).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle deactivation when not active', () => {
      expect(() => deactivate()).not.toThrow();
      expect(isActive()).toBe(false);
    });
  });

  describe('Restart', () => {
    test('should restart extension', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await activate();
      const firstInstance = getStatusBarCharacter();
      
      await restart();
      const secondInstance = getStatusBarCharacter();
      
      expect(firstInstance).not.toBe(secondInstance);
      expect(isActive()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Restarting')
      );
      
      consoleLogSpy.mockRestore();
    });

    test('should restart when not initially active', async () => {
      expect(isActive()).toBe(false);
      
      await restart();
      
      expect(isActive()).toBe(true);
      expect(getStatusBarCharacter()).not.toBeNull();
    });
  });

  describe('State Queries', () => {
    test('should report active state correctly', async () => {
      expect(isActive()).toBe(false);
      
      await activate();
      expect(isActive()).toBe(true);
      
      deactivate();
      expect(isActive()).toBe(false);
    });

    test('should return character instance when active', async () => {
      expect(getStatusBarCharacter()).toBeNull();
      
      await activate();
      expect(getStatusBarCharacter()).not.toBeNull();
      
      deactivate();
      expect(getStatusBarCharacter()).toBeNull();
    });
  });

  describe('Error Recovery', () => {
    test('should reset error handler on deactivation', async () => {
      const { ErrorHandler } = require('../src/error/ErrorHandler');
      
      await activate();
      deactivate();
      
      expect(ErrorHandler.resetInstance).toHaveBeenCalled();
    });

    test('should handle multiple activation failures', async () => {
      const { StatusBarCharacter } = require('../src/StatusBarCharacter');
      StatusBarCharacter.mockImplementation(() => ({
        initialize: jest.fn().mockRejectedValue(new Error('Always fails')),
        dispose: jest.fn()
      }));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Multiple failed activations should not crash
      await activate();
      await activate();
      await activate();
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      expect(isActive()).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Lifecycle Management', () => {
    test('should properly manage extension lifecycle', async () => {
      // Initial state
      expect(isActive()).toBe(false);
      expect(getStatusBarCharacter()).toBeNull();
      
      // Activate
      await activate();
      expect(isActive()).toBe(true);
      const character = getStatusBarCharacter();
      expect(character).not.toBeNull();
      expect(character?.initialize).toHaveBeenCalled();
      
      // Deactivate
      deactivate();
      expect(isActive()).toBe(false);
      expect(getStatusBarCharacter()).toBeNull();
      expect(character?.dispose).toHaveBeenCalled();
    });

    test('should handle rapid activation/deactivation cycles', async () => {
      for (let i = 0; i < 5; i++) {
        await activate();
        expect(isActive()).toBe(true);
        
        deactivate();
        expect(isActive()).toBe(false);
      }
    });
  });
});

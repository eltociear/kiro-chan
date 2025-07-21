import * as vscode from 'vscode';
import { SvgIconUtils } from '../src/utils/SvgIconUtils';

// Mock VS Code API
jest.mock('vscode', () => {
  return {
    Uri: {
      joinPath: jest.fn((uri, ...pathSegments) => {
        // Simple mock that joins the path segments
        const joinedPath = [uri.toString(), ...pathSegments].join('/');
        return {
          toString: () => joinedPath
        };
      })
    },
    workspace: {
      getConfiguration: jest.fn(() => ({
        get: jest.fn((key, defaultValue) => {
          if (key === 'useSvgIcon') {
            return true; // Default to true for tests
          }
          return defaultValue;
        }),
        has: jest.fn(),
        inspect: jest.fn(),
        update: jest.fn()
      })),
      fs: {
        stat: jest.fn(() => Promise.resolve())
      }
    },
    window: {
      activeColorTheme: {
        kind: 1 // Light theme by default
      }
    },
    ColorThemeKind: {
      Light: 1,
      Dark: 2,
      HighContrast: 3
    },
    version: '1.94.0'
  };
});

describe('SvgIconUtils', () => {
  // Mock extension context
  const mockContext = {
    extensionUri: {
      toString: () => 'extension/path'
    }
  } as unknown as vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSvgIconUri', () => {
    it('should return a valid URI for an SVG icon', () => {
      const result = SvgIconUtils.getSvgIconUri(mockContext, 'kiro_1.svg');
      expect(result).toBe('extension/path/images/kiro_1.svg');
      expect(vscode.Uri.joinPath).toHaveBeenCalledWith(mockContext.extensionUri, 'images', 'kiro_1.svg');
    });

    it('should return undefined if an error occurs', () => {
      // Mock an error being thrown
      (vscode.Uri.joinPath as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = SvgIconUtils.getSvgIconUri(mockContext, 'kiro_1.svg');
      expect(result).toBeUndefined();
    });
  });

  describe('getStatusBarTextWithIcon', () => {
    it('should return text with product icon syntax for idle state', () => {
      const result = SvgIconUtils.getStatusBarTextWithIcon(mockContext, 'idle', 'Kiro');
      expect(result).toBe('$(kiro-idle) Kiro');
    });

    it('should return text with product icon syntax for active state', () => {
      const result = SvgIconUtils.getStatusBarTextWithIcon(mockContext, 'active', 'Kiro');
      expect(result).toBe('$(kiro-active) Kiro');
    });

    it('should return text with product icon syntax for error state', () => {
      const result = SvgIconUtils.getStatusBarTextWithIcon(mockContext, 'error', 'Kiro');
      expect(result).toBe('$(kiro-error) Kiro');
    });

    it('should return text with fallback icon if SVG icons are disabled', () => {
      // Mock SVG icons being disabled in settings
      jest.spyOn(vscode.workspace, 'getConfiguration').mockImplementationOnce(() => ({
        get: jest.fn((key) => key === 'useSvgIcon' ? false : true),
        has: jest.fn(),
        inspect: jest.fn(),
        update: jest.fn()
      }));

      const result = SvgIconUtils.getStatusBarTextWithIcon(mockContext, 'idle', 'Kiro');
      expect(result).toBe('👻 Kiro');
    });

    it('should return text with fallback icon if SVG icons are not supported', () => {
      // Mock SVG icons not being supported
      jest.spyOn(SvgIconUtils, 'isSvgIconSupported').mockReturnValueOnce(false);

      const result = SvgIconUtils.getStatusBarTextWithIcon(mockContext, 'idle', 'Kiro');
      expect(result).toBe('👻 Kiro');
    });

    it('should return text with fallback icon if an error occurs', () => {
      // Mock an error being thrown
      jest.spyOn(SvgIconUtils as any, 'isProductIconAvailable').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = SvgIconUtils.getStatusBarTextWithIcon(mockContext, 'idle', 'Kiro');
      expect(result).toBe('👻 Kiro');
    });
  });

  describe('isSvgIconSupported', () => {
    it('should return true for VS Code version 1.54.0 and later', () => {
      // VS Code version is already mocked as '1.94.0'
      const result = SvgIconUtils.isSvgIconSupported();
      expect(result).toBe(true);
    });

    it('should return false for older VS Code versions', () => {
      // Mock an older VS Code version
      const originalVersion = vscode.version;
      Object.defineProperty(vscode, 'version', { value: '1.53.0' });
      
      // We need to mock the version parsing since our mock doesn't actually parse the version string
      jest.spyOn(String.prototype, 'split').mockImplementationOnce(() => ['0', '53', '0']);
      
      const result = SvgIconUtils.isSvgIconSupported();
      
      // Restore the original version
      Object.defineProperty(vscode, 'version', { value: originalVersion });
      
      expect(result).toBe(false);
    });

    it('should return false if an error occurs', () => {
      // Mock an error being thrown
      jest.spyOn(String.prototype, 'split').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = SvgIconUtils.isSvgIconSupported();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentThemeType', () => {
    it('should return "light" for light theme', () => {
      // VS Code theme is already mocked as light (kind: 1)
      const result = SvgIconUtils.getCurrentThemeType();
      expect(result).toBe('light');
    });

    it('should return "dark" for dark theme', () => {
      // Mock dark theme
      const originalTheme = vscode.window.activeColorTheme;
      Object.defineProperty(vscode.window, 'activeColorTheme', { 
        value: { kind: vscode.ColorThemeKind.Dark } 
      });
      
      const result = SvgIconUtils.getCurrentThemeType();
      
      // Restore the original theme
      Object.defineProperty(vscode.window, 'activeColorTheme', { value: originalTheme });
      
      expect(result).toBe('dark');
    });

    it('should return "high-contrast" for high contrast theme', () => {
      // Mock high contrast theme
      const originalTheme = vscode.window.activeColorTheme;
      Object.defineProperty(vscode.window, 'activeColorTheme', { 
        value: { kind: vscode.ColorThemeKind.HighContrast } 
      });
      
      const result = SvgIconUtils.getCurrentThemeType();
      
      // Restore the original theme
      Object.defineProperty(vscode.window, 'activeColorTheme', { value: originalTheme });
      
      expect(result).toBe('high-contrast');
    });

    it('should return "dark" as default if an error occurs', () => {
      // Mock an error being thrown
      jest.spyOn(vscode.window, 'activeColorTheme', 'get').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = SvgIconUtils.getCurrentThemeType();
      expect(result).toBe('dark');
    });
  });

  describe('getThemeAwareIconName', () => {
    it('should return "kiro-idle" for idle state', () => {
      const result = SvgIconUtils.getThemeAwareIconName('idle');
      expect(result).toBe('kiro-idle');
    });

    it('should return "kiro-active" for active state', () => {
      const result = SvgIconUtils.getThemeAwareIconName('active');
      expect(result).toBe('kiro-active');
    });

    it('should return "kiro-active" for executing state', () => {
      const result = SvgIconUtils.getThemeAwareIconName('executing');
      expect(result).toBe('kiro-active');
    });

    it('should return "kiro-error" for error state', () => {
      const result = SvgIconUtils.getThemeAwareIconName('error');
      expect(result).toBe('kiro-error');
    });

    it('should return "kiro-icon" for unknown state', () => {
      const result = SvgIconUtils.getThemeAwareIconName('unknown');
      expect(result).toBe('kiro-icon');
    });
  });

  describe('getFallbackEmoji', () => {
    it('should return ghost emoji for idle state', () => {
      const result = SvgIconUtils.getFallbackEmoji('idle');
      expect(result).toBe('👻');
    });

    it('should return lightning emoji for active state', () => {
      const result = SvgIconUtils.getFallbackEmoji('active');
      expect(result).toBe('⚡');
    });

    it('should return lightning emoji for executing state', () => {
      const result = SvgIconUtils.getFallbackEmoji('executing');
      expect(result).toBe('⚡');
    });

    it('should return warning emoji for error state', () => {
      const result = SvgIconUtils.getFallbackEmoji('error');
      expect(result).toBe('⚠️');
    });

    it('should return ghost emoji for unknown state', () => {
      const result = SvgIconUtils.getFallbackEmoji('unknown');
      expect(result).toBe('👻');
    });
  });
});

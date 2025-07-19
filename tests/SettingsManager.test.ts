import { SettingsManager } from '../src/settings/SettingsManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;

  beforeEach(() => {
    localStorageMock.clear();
    settingsManager = new SettingsManager();
  });

  describe('Default Settings', () => {
    test('should have correct default values', () => {
      expect(settingsManager.isEnabled()).toBe(true);
      expect(settingsManager.getAnimationSpeed()).toBe(1.0);
      expect(settingsManager.getPosition()).toBe('right');
    });
  });

  describe('Enabled Setting', () => {
    test('should set and get enabled state', () => {
      settingsManager.setEnabled(false);
      expect(settingsManager.isEnabled()).toBe(false);
      
      settingsManager.setEnabled(true);
      expect(settingsManager.isEnabled()).toBe(true);
    });
  });

  describe('Animation Speed Setting', () => {
    test('should set and get animation speed', () => {
      settingsManager.setAnimationSpeed(2.0);
      expect(settingsManager.getAnimationSpeed()).toBe(2.0);
    });

    test('should throw error for invalid animation speed', () => {
      expect(() => settingsManager.setAnimationSpeed(0.05)).toThrow();
      expect(() => settingsManager.setAnimationSpeed(4.0)).toThrow();
    });

    test('should accept valid animation speed range', () => {
      expect(() => settingsManager.setAnimationSpeed(0.1)).not.toThrow();
      expect(() => settingsManager.setAnimationSpeed(3.0)).not.toThrow();
    });
  });

  describe('Position Setting', () => {
    test('should set and get position', () => {
      settingsManager.setPosition('left');
      expect(settingsManager.getPosition()).toBe('left');
      
      settingsManager.setPosition('right');
      expect(settingsManager.getPosition()).toBe('right');
    });
  });

  describe('Settings Persistence', () => {
    test('should save and load settings', async () => {
      settingsManager.setEnabled(false);
      settingsManager.setAnimationSpeed(2.5);
      settingsManager.setPosition('left');
      
      await settingsManager.saveSettings();
      
      const newManager = new SettingsManager();
      await newManager.loadSettings();
      
      expect(newManager.isEnabled()).toBe(false);
      expect(newManager.getAnimationSpeed()).toBe(2.5);
      expect(newManager.getPosition()).toBe('left');
    });

    test('should handle corrupted settings gracefully', async () => {
      localStorageMock.setItem('kiro-status-character-settings', 'invalid-json');
      
      await settingsManager.loadSettings();
      
      expect(settingsManager.isEnabled()).toBe(true);
      expect(settingsManager.getAnimationSpeed()).toBe(1.0);
      expect(settingsManager.getPosition()).toBe('right');
    });

    test('should validate loaded settings', async () => {
      const invalidSettings = {
        enabled: 'not-boolean',
        animationSpeed: 10,
        position: 'invalid'
      };
      
      localStorageMock.setItem('kiro-status-character-settings', JSON.stringify(invalidSettings));
      
      await settingsManager.loadSettings();
      
      expect(settingsManager.isEnabled()).toBe(true);
      expect(settingsManager.getAnimationSpeed()).toBe(1.0);
      expect(settingsManager.getPosition()).toBe('right');
    });
  });
});

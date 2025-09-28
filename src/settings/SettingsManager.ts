import { ISettingsManager, CharacterSettings } from '../types';

export class SettingsManager implements ISettingsManager {
  private settings: CharacterSettings;
  private readonly storageKey = 'kiro-status-character-settings';

  constructor() {
    this.settings = this.getDefaultSettings();
  }

  private getDefaultSettings(): CharacterSettings {
    return {
      enabled: true,
      animationSpeed: 1.0,
      position: 'right',
      backgroundColor: '#007ACC'
    };
  }

  isEnabled(): boolean {
    return this.settings.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
  }

  getAnimationSpeed(): number {
    return this.settings.animationSpeed;
  }

  setAnimationSpeed(speed: number): void {
    if (speed < 0.1 || speed > 3.0) {
      throw new Error('Animation speed must be between 0.1 and 3.0');
    }
    this.settings.animationSpeed = speed;
  }

  getPosition(): 'left' | 'right' {
    return this.settings.position;
  }

  setPosition(position: 'left' | 'right'): void {
    this.settings.position = position;
  }

  getBackgroundColor(): string {
    return this.settings.backgroundColor;
  }

  setBackgroundColor(color: string): void {
    if (!this.validateBackgroundColor(color)) {
      throw new Error('Invalid background color format. Please use HEX format (e.g., #007ACC)');
    }
    this.settings.backgroundColor = color;
  }

  private validateBackgroundColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  async loadSettings(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
        this.validateSettings();
      }
    } catch (error) {
      console.warn('[SettingsManager] Failed to load settings, using defaults:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  async saveSettings(): Promise<void> {
    try {
      this.validateSettings();
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error('[SettingsManager] Failed to save settings:', error);
      throw error;
    }
  }

  private validateSettings(): void {
    if (typeof this.settings.enabled !== 'boolean') {
      this.settings.enabled = true;
    }
    
    if (typeof this.settings.animationSpeed !== 'number' || 
        this.settings.animationSpeed < 0.1 || 
        this.settings.animationSpeed > 3.0) {
      this.settings.animationSpeed = 1.0;
    }
    
    if (this.settings.position !== 'left' && this.settings.position !== 'right') {
      this.settings.position = 'right';
    }
    
    if (typeof this.settings.backgroundColor !== 'string' || 
        !this.validateBackgroundColor(this.settings.backgroundColor)) {
      this.settings.backgroundColor = '#007ACC';
    }
  }

  getSettings(): CharacterSettings {
    return { ...this.settings };
  }
}

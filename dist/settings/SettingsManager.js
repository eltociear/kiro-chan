"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = void 0;
class SettingsManager {
    constructor() {
        this.storageKey = 'kiro-status-character-settings';
        this.settings = this.getDefaultSettings();
    }
    getDefaultSettings() {
        return {
            enabled: true,
            animationSpeed: 1.0,
            position: 'right',
            backgroundColor: '#007ACC'
        };
    }
    isEnabled() {
        return this.settings.enabled;
    }
    setEnabled(enabled) {
        this.settings.enabled = enabled;
    }
    getAnimationSpeed() {
        return this.settings.animationSpeed;
    }
    setAnimationSpeed(speed) {
        if (speed < 0.1 || speed > 3.0) {
            throw new Error('Animation speed must be between 0.1 and 3.0');
        }
        this.settings.animationSpeed = speed;
    }
    getPosition() {
        return this.settings.position;
    }
    setPosition(position) {
        this.settings.position = position;
    }
    getBackgroundColor() {
        return this.settings.backgroundColor;
    }
    setBackgroundColor(color) {
        if (!this.validateBackgroundColor(color)) {
            throw new Error('Invalid background color format. Please use HEX format (e.g., #007ACC)');
        }
        this.settings.backgroundColor = color;
    }
    validateBackgroundColor(color) {
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexColorRegex.test(color);
    }
    async loadSettings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
                this.validateSettings();
            }
        }
        catch (error) {
            console.warn('[SettingsManager] Failed to load settings, using defaults:', error);
            this.settings = this.getDefaultSettings();
        }
    }
    async saveSettings() {
        try {
            this.validateSettings();
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        }
        catch (error) {
            console.error('[SettingsManager] Failed to save settings:', error);
            throw error;
        }
    }
    validateSettings() {
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
    getSettings() {
        return { ...this.settings };
    }
}
exports.SettingsManager = SettingsManager;
//# sourceMappingURL=SettingsManager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundManager = void 0;
const audio_data_1 = require("./audio-data");
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
        this.isWebEnvironment = false;
        // Check if we're in a web environment
        this.isWebEnvironment = typeof window !== 'undefined' &&
            (typeof AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined');
    }
    getAudioContext() {
        if (!this.audioContext) {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            else {
                // Fallback for VS Code extension environment
                console.warn('[SoundManager] AudioContext not available in this environment');
                throw new Error('AudioContext not available');
            }
        }
        return this.audioContext;
    }
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    // Play a success sound (cheerful chime)
    playSuccessSound() {
        try {
            // In VS Code extension environment, we'll use system notification sounds
            // or simulate with console beep
            this.playSystemSound('success');
        }
        catch (error) {
            console.warn('[SoundManager] Could not play success sound:', error);
        }
    }
    // Play a completion sound (triumphant)
    playCompletionSound() {
        try {
            this.playSystemSound('completion');
        }
        catch (error) {
            console.warn('[SoundManager] Could not play completion sound:', error);
        }
    }
    // Play a notification sound (gentle bell)
    playNotificationSound() {
        try {
            this.playSystemSound('notification');
        }
        catch (error) {
            console.warn('[SoundManager] Could not play notification sound:', error);
        }
    }
    // Play a celebration sound (party!)
    playCelebrationSound() {
        try {
            this.playSystemSound('celebration');
        }
        catch (error) {
            console.warn('[SoundManager] Could not play celebration sound:', error);
        }
    }
    // System sound fallback for VS Code extension environment
    playSystemSound(type) {
        console.log(`🔊 [SoundManager] Playing ${type} sound (volume: ${this.volume})`);
        if (this.isWebEnvironment) {
            // Try to play actual audio in web environment
            this.playWebAudio(type);
        }
        else {
            // VS Code extension environment - use alternative methods
            this.playVSCodeSound(type);
        }
    }
    playWebAudio(type) {
        try {
            const context = this.getAudioContext();
            const frequencies = audio_data_1.TONE_FREQUENCIES[type] || [440];
            const duration = audio_data_1.TONE_DURATIONS[type] || 300;
            frequencies.forEach((frequency, index) => {
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                oscillator.frequency.setValueAtTime(frequency, context.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0, context.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, context.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);
                const startTime = context.currentTime + (index * 0.1);
                oscillator.start(startTime);
                oscillator.stop(startTime + duration / 1000);
            });
        }
        catch (error) {
            console.warn('[SoundManager] Web audio failed:', error);
            this.playVSCodeSound(type);
        }
    }
    playVSCodeSound(type) {
        // VS Code extension environment alternatives
        // 1. Terminal bell character
        if (typeof process !== 'undefined' && process.stdout) {
            // Multiple beeps for different sound types
            const beepCount = this.getBeepCount(type);
            for (let i = 0; i < beepCount; i++) {
                setTimeout(() => {
                    process.stdout.write('\x07');
                }, i * 100);
            }
        }
        // 2. Visual feedback (could be used to trigger status bar animation)
        this.triggerVisualFeedback(type);
    }
    getBeepCount(type) {
        switch (type) {
            case 'success': return 1;
            case 'completion': return 3;
            case 'notification': return 1;
            case 'celebration': return 5;
            default: return 1;
        }
    }
    triggerVisualFeedback(type) {
        // Emit a custom event that the extension can listen to for visual feedback
        if (typeof globalThis !== 'undefined') {
            const event = new CustomEvent('kiro-sound-played', {
                detail: { type, volume: this.volume }
            });
            if (globalThis.dispatchEvent) {
                globalThis.dispatchEvent(event);
            }
        }
    }
    // Dispose of audio context
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
exports.SoundManager = SoundManager;
//# sourceMappingURL=SoundManager.js.map
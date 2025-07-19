import { TONE_FREQUENCIES, TONE_DURATIONS } from './audio-data';

export class SoundManager {
    private audioContext: AudioContext | null = null;
    private volume: number = 0.5;
    private isWebEnvironment: boolean = false;

    constructor() {
        // Check if we're in a web environment
        this.isWebEnvironment = typeof window !== 'undefined' && 
                               (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined');
    }

    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } else {
                // Fallback for VS Code extension environment
                console.warn('[SoundManager] AudioContext not available in this environment');
                throw new Error('AudioContext not available');
            }
        }
        return this.audioContext;
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Play a success sound (cheerful chime)
    playSuccessSound(): void {
        try {
            // In VS Code extension environment, we'll use system notification sounds
            // or simulate with console beep
            this.playSystemSound('success');
        } catch (error) {
            console.warn('[SoundManager] Could not play success sound:', error);
        }
    }

    // Play a completion sound (triumphant)
    playCompletionSound(): void {
        try {
            this.playSystemSound('completion');
        } catch (error) {
            console.warn('[SoundManager] Could not play completion sound:', error);
        }
    }

    // Play a notification sound (gentle bell)
    playNotificationSound(): void {
        try {
            this.playSystemSound('notification');
        } catch (error) {
            console.warn('[SoundManager] Could not play notification sound:', error);
        }
    }

    // Play a celebration sound (party!)
    playCelebrationSound(): void {
        try {
            this.playSystemSound('celebration');
        } catch (error) {
            console.warn('[SoundManager] Could not play celebration sound:', error);
        }
    }

    // System sound fallback for VS Code extension environment
    private playSystemSound(type: string): void {
        console.log(`🔊 [SoundManager] Playing ${type} sound (volume: ${this.volume})`);
        
        if (this.isWebEnvironment) {
            // Try to play actual audio in web environment
            this.playWebAudio(type);
        } else {
            // VS Code extension environment - use alternative methods
            this.playVSCodeSound(type);
        }
    }

    private playWebAudio(type: string): void {
        try {
            const context = this.getAudioContext();
            const frequencies = TONE_FREQUENCIES[type as keyof typeof TONE_FREQUENCIES] || [440];
            const duration = TONE_DURATIONS[type as keyof typeof TONE_DURATIONS] || 300;
            
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
        } catch (error) {
            console.warn('[SoundManager] Web audio failed:', error);
            this.playVSCodeSound(type);
        }
    }

    private playVSCodeSound(type: string): void {
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

    private getBeepCount(type: string): number {
        switch (type) {
            case 'success': return 1;
            case 'completion': return 3;
            case 'notification': return 1;
            case 'celebration': return 5;
            default: return 1;
        }
    }

    private triggerVisualFeedback(type: string): void {
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
    dispose(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

export declare class SoundManager {
    private audioContext;
    private volume;
    private isWebEnvironment;
    constructor();
    private getAudioContext;
    setVolume(volume: number): void;
    playSuccessSound(): void;
    playCompletionSound(): void;
    playNotificationSound(): void;
    playCelebrationSound(): void;
    private playSystemSound;
    private playWebAudio;
    private playVSCodeSound;
    private getBeepCount;
    private triggerVisualFeedback;
    dispose(): void;
}
//# sourceMappingURL=SoundManager.d.ts.map
import { ISettingsManager, CharacterSettings } from '../types';
export declare class SettingsManager implements ISettingsManager {
    private settings;
    private readonly storageKey;
    constructor();
    private getDefaultSettings;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    getAnimationSpeed(): number;
    setAnimationSpeed(speed: number): void;
    getPosition(): 'left' | 'right';
    setPosition(position: 'left' | 'right'): void;
    getBackgroundColor(): string;
    setBackgroundColor(color: string): void;
    private validateBackgroundColor;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    private validateSettings;
    getSettings(): CharacterSettings;
}
//# sourceMappingURL=SettingsManager.d.ts.map
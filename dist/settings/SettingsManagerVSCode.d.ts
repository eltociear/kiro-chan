import * as vscode from 'vscode';
import { ISettingsManager, CharacterSettings } from '../types';
export declare class SettingsManagerVSCode implements ISettingsManager {
    private readonly configSection;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    getAnimationSpeed(): number;
    setAnimationSpeed(speed: number): void;
    getPosition(): 'left' | 'right';
    setPosition(position: 'left' | 'right'): void;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    getSettings(): CharacterSettings;
    onConfigurationChanged(callback: () => void): vscode.Disposable;
}
//# sourceMappingURL=SettingsManagerVSCode.d.ts.map
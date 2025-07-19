import * as vscode from 'vscode';
import { ISettingsManager, CharacterSettings } from '../types';

export class SettingsManagerVSCode implements ISettingsManager {
  private readonly configSection = 'kiro-chan';

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration(this.configSection);
    return config.get<boolean>('enabled', true);
  }

  setEnabled(enabled: boolean): void {
    const config = vscode.workspace.getConfiguration(this.configSection);
    config.update('enabled', enabled, vscode.ConfigurationTarget.Global);
  }

  getAnimationSpeed(): number {
    const config = vscode.workspace.getConfiguration(this.configSection);
    return config.get<number>('animationSpeed', 1.0);
  }

  setAnimationSpeed(speed: number): void {
    if (speed < 0.1 || speed > 3.0) {
      throw new Error('Animation speed must be between 0.1 and 3.0');
    }
    const config = vscode.workspace.getConfiguration(this.configSection);
    config.update('animationSpeed', speed, vscode.ConfigurationTarget.Global);
  }

  getPosition(): 'left' | 'right' {
    // VS CodeのStatusBarItemは位置をAlignmentで制御するため、
    // この設定は使用しないが、互換性のため残す
    return 'right';
  }

  setPosition(position: 'left' | 'right'): void {
    // VS CodeのStatusBarItemでは位置変更は制限されるため、
    // 実装は空にする
  }

  async loadSettings(): Promise<void> {
    // VS Codeの設定は自動的に読み込まれるため、特別な処理は不要
    return Promise.resolve();
  }

  async saveSettings(): Promise<void> {
    // VS Codeの設定は自動的に保存されるため、特別な処理は不要
    return Promise.resolve();
  }

  getSettings(): CharacterSettings {
    return {
      enabled: this.isEnabled(),
      animationSpeed: this.getAnimationSpeed(),
      position: this.getPosition()
    };
  }

  // VS Code設定変更の監視
  onConfigurationChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(this.configSection)) {
        callback();
      }
    });
  }
}

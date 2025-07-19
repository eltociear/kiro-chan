import * as vscode from 'vscode';
import { IStatusBarCharacter, KiroState } from './types';
import { StateMonitor } from './state/StateMonitor';
import { SettingsManagerVSCode } from './settings/SettingsManagerVSCode';
import { ErrorHandler, ErrorContext } from './error/ErrorHandler';

export class StatusBarCharacterVSCode implements IStatusBarCharacter {
  private statusBarItem: vscode.StatusBarItem;
  private stateMonitor: StateMonitor;
  private settingsManager: SettingsManagerVSCode;
  private errorHandler: ErrorHandler;
  private isInitialized: boolean = false;
  private animationTimer: NodeJS.Timeout | null = null;
  private currentState: KiroState = KiroState.IDLE;
  private animationFrame: number = 0;

  // キャラクターの状態別表示
  private readonly characters = {
    [KiroState.IDLE]: ['👻', '🌟', '✨'],
    [KiroState.EXECUTING]: ['🚀', '⚡', '💫', '🔥'],
    [KiroState.ERROR]: ['💥', '⚠️', '🚨', '❌']
  };

  constructor() {
    // VS CodeのStatusBarItemを作成
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100 // 優先度
    );
    
    this.errorHandler = ErrorHandler.getInstance();
    this.settingsManager = new SettingsManagerVSCode();
    this.stateMonitor = new StateMonitor();
    
    this.setupStatusBarItem();
    this.setupStateMonitoring();
    this.setupConfigurationWatcher();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 設定を読み込み
      await this.settingsManager.loadSettings();
      
      // ステータスバーアイテムを表示
      if (this.settingsManager.isEnabled()) {
        this.show();
      }
      
      // 状態監視を開始
      this.stateMonitor.startMonitoring();
      
      this.isInitialized = true;
      console.log('[StatusBarCharacterVSCode] Initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.INITIALIZATION, {
        isInitialized: this.isInitialized
      });
      throw error;
    }
  }

  show(): void {
    try {
      this.statusBarItem.show();
      this.startAnimation();
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'show'
      });
    }
  }

  hide(): void {
    try {
      this.statusBarItem.hide();
      this.stopAnimation();
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'hide'
      });
    }
  }

  updateState(state: KiroState): void {
    this.currentState = state;
    this.stateMonitor.forceStateChange(state);
    this.updateDisplay();
  }

  dispose(): void {
    try {
      this.stopAnimation();
      this.stateMonitor.dispose();
      this.statusBarItem.dispose();
      
      console.log('[StatusBarCharacterVSCode] Disposed successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'dispose'
      });
    }
  }

  private setupStatusBarItem(): void {
    // 初期表示設定
    this.statusBarItem.text = '👻';
    this.statusBarItem.tooltip = 'Kiro Status Character - Click to open settings';
    
    // クリック時の動作
    this.statusBarItem.command = 'kiro-chan.openSettings';
  }

  private setupStateMonitoring(): void {
    this.stateMonitor.onStateChange((state: KiroState) => {
      this.currentState = state;
      this.updateDisplay();
    });
  }

  private startAnimation(): void {
    if (this.animationTimer) {
      return;
    }

    const animationSpeed = this.settingsManager.getAnimationSpeed();
    const interval = Math.max(500, 2000 / animationSpeed); // 最小500ms間隔

    this.animationTimer = setInterval(() => {
      this.updateAnimationFrame();
    }, interval);
  }

  private stopAnimation(): void {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  private updateAnimationFrame(): void {
    if (!this.settingsManager.isEnabled()) {
      return;
    }

    const characters = this.characters[this.currentState];
    this.animationFrame = (this.animationFrame + 1) % characters.length;
    
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const characters = this.characters[this.currentState];
    const currentChar = characters[this.animationFrame % characters.length];
    
    // 状態に応じたツールチップ
    const stateNames = {
      [KiroState.IDLE]: 'アイドル',
      [KiroState.EXECUTING]: '実行中',
      [KiroState.ERROR]: 'エラー'
    };
    
    this.statusBarItem.text = currentChar;
    this.statusBarItem.tooltip = `Kiro Status Character - ${stateNames[this.currentState]}`;
    
    // 状態に応じた色設定（VS Codeテーマカラーを使用）
    switch (this.currentState) {
      case KiroState.IDLE:
        this.statusBarItem.color = undefined; // デフォルト色
        break;
      case KiroState.EXECUTING:
        this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
        break;
      case KiroState.ERROR:
        this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
        break;
    }
  }

  // 設定変更時の更新
  refreshSettings(): void {
    this.settingsManager.loadSettings().then(() => {
      if (this.settingsManager.isEnabled()) {
        this.show();
      } else {
        this.hide();
      }
      
      // アニメーション速度が変更された場合、再起動
      this.stopAnimation();
      if (this.settingsManager.isEnabled()) {
        this.startAnimation();
      }
    }).catch(error => {
      this.errorHandler.handleError(error as Error, ErrorContext.SETTINGS, {
        action: 'refresh'
      });
    });
  }

  // 公開メソッド（テスト用）
  getStatusBarItem(): vscode.StatusBarItem {
    return this.statusBarItem;
  }

  getSettingsManager(): SettingsManagerVSCode {
    return this.settingsManager;
  }

  getStateMonitor(): StateMonitor {
    return this.stateMonitor;
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  getCurrentState(): KiroState {
    return this.currentState;
  }

  isVisible(): boolean {
    // VS CodeのStatusBarItemには直接的な可視性チェックがないため、
    // 設定から判断
    return this.settingsManager.isEnabled();
  }

  private setupConfigurationWatcher(): void {
    // VS Code設定変更の監視
    this.settingsManager.onConfigurationChanged(() => {
      this.refreshSettings();
    });
  }
}

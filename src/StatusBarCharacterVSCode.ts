import * as vscode from 'vscode';
import { IStatusBarCharacter, KiroState, AnimationPattern } from './types';
import { AnimationController } from './animation/AnimationController';
import { StateMonitor } from './state/StateMonitor';
import { StateAnimationBridge } from './state/StateAnimationBridge';
import { SettingsManager } from './settings/SettingsManager';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';
import { ErrorHandler, ErrorContext } from './error/ErrorHandler';

export class StatusBarCharacterVSCode implements IStatusBarCharacter {
  private statusBarItem: vscode.StatusBarItem;
  private animationController: AnimationController;
  private stateMonitor: StateMonitor;
  private stateAnimationBridge: StateAnimationBridge;
  private settingsManager: SettingsManager;
  private performanceOptimizer: PerformanceOptimizer;
  private errorHandler: ErrorHandler;
  private isInitialized: boolean = false;
  private animationInterval: NodeJS.Timeout | null = null;
  private currentAnimationFrame: number = 0;

  constructor() {
    this.errorHandler = ErrorHandler.getInstance();
    this.settingsManager = new SettingsManager();
    this.performanceOptimizer = new PerformanceOptimizer();
    this.animationController = new AnimationController(undefined, this.performanceOptimizer);
    this.stateMonitor = new StateMonitor();
    this.stateAnimationBridge = new StateAnimationBridge(this.stateMonitor, this.animationController);
    
    // Create VS Code status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'kiro-chan.openSettings';
    this.statusBarItem.tooltip = 'Kiro Character - Click to open settings';
    
    this.setupErrorHandling();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load settings from VS Code configuration
      await this.loadVSCodeSettings();

      // Initialize components
      this.initializeComponents();

      // Start services
      this.startServices();

      // Show the status bar item if enabled
      if (this.settingsManager.isEnabled()) {
        this.show();
      }

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
      if (this.settingsManager.isEnabled()) {
        this.statusBarItem.show();
        this.startAnimation();
      }
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
    this.stateMonitor.forceStateChange(state);
    this.updateStatusBarText(state);
  }

  dispose(): void {
    try {
      // Stop animation
      this.stopAnimation();

      // Dispose components
      this.stateMonitor.dispose();
      this.animationController.dispose();
      this.stateAnimationBridge.dispose();
      this.performanceOptimizer.dispose();

      // Dispose VS Code status bar item
      this.statusBarItem.dispose();

      this.isInitialized = false;
      console.log('[StatusBarCharacterVSCode] Disposed successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'dispose'
      });
    }
  }

  private async loadVSCodeSettings(): Promise<void> {
    const config = vscode.workspace.getConfiguration('kiro-chan');
    
    const enabled = config.get<boolean>('enabled', true);
    const animationSpeed = config.get<number>('animationSpeed', 1.0);
    
    this.settingsManager.setEnabled(enabled);
    this.settingsManager.setAnimationSpeed(animationSpeed);
    
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('kiro-chan')) {
        this.onConfigurationChanged();
      }
    });
  }

  private onConfigurationChanged(): void {
    const config = vscode.workspace.getConfiguration('kiro-chan');
    
    const enabled = config.get<boolean>('enabled', true);
    const animationSpeed = config.get<number>('animationSpeed', 1.0);
    
    this.settingsManager.setEnabled(enabled);
    this.settingsManager.setAnimationSpeed(animationSpeed);
    this.animationController.setAnimationSpeed(animationSpeed);
    
    if (enabled) {
      this.show();
    } else {
      this.hide();
    }
  }

  private initializeComponents(): void {
    this.animationController.setAnimationSpeed(this.settingsManager.getAnimationSpeed());
  }

  private startServices(): void {
    this.performanceOptimizer.monitorPerformance();
    this.stateMonitor.startMonitoring();
    
    // Set up state change handler
    this.stateMonitor.onStateChange((state: KiroState) => {
      this.updateStatusBarText(state);
    });
  }

  private startAnimation(): void {
    if (this.animationInterval) {
      return;
    }

    const frameRate = Math.max(15, this.performanceOptimizer.getOptimalFrameRate());
    const frameTime = 1000 / frameRate;

    this.animationInterval = setInterval(() => {
      this.updateAnimationFrame();
    }, frameTime);
  }

  private stopAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  private updateAnimationFrame(): void {
    if (!this.settingsManager.isEnabled()) {
      return;
    }

    this.currentAnimationFrame++;
    const currentState = this.stateMonitor.getCurrentState();
    this.updateStatusBarText(currentState);
  }

  private updateStatusBarText(state: KiroState): void {
    const character = this.getAnimatedCharacter(state);
    const stateText = this.getStateText(state);
    
    this.statusBarItem.text = `${character} Kiro`;
    this.statusBarItem.tooltip = `Kiro Character (${stateText}) - Click to open settings`;
  }

  private getAnimatedCharacter(state: KiroState): string {
    const baseCharacter = '👻';
    
    // Simple text-based animation by rotating through variations
    const frame = this.currentAnimationFrame % 4;
    
    switch (state) {
      case KiroState.IDLE:
        // Gentle animation - slower changes
        return frame < 2 ? '👻' : '🌟';
        
      case KiroState.EXECUTING:
        // Active animation - faster changes
        const activeChars = ['👻', '⚡', '🔥', '✨'];
        return activeChars[frame];
        
      case KiroState.ERROR:
        // Error animation - warning indicators
        return frame % 2 === 0 ? '👻' : '⚠️';
        
      default:
        return baseCharacter;
    }
  }

  private getStateText(state: KiroState): string {
    switch (state) {
      case KiroState.IDLE:
        return 'Idle';
      case KiroState.EXECUTING:
        return 'Active';
      case KiroState.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
  }

  private setupErrorHandling(): void {
    // Set up error recovery event listeners
    if (typeof globalThis !== 'undefined') {
      // Use globalThis instead of window in VS Code extension context
      const eventTarget = globalThis as any;
      
      if (eventTarget.addEventListener) {
        eventTarget.addEventListener('kiro-character:enable-minimal-mode', () => {
          this.enableMinimalMode();
        });

        eventTarget.addEventListener('kiro-character:fallback-static-display', () => {
          this.fallbackToStaticDisplay();
        });

        eventTarget.addEventListener('kiro-character:reduce-animation-complexity', () => {
          this.reduceAnimationComplexity();
        });

        eventTarget.addEventListener('kiro-character:use-default-settings', () => {
          this.useDefaultSettings();
        });
      }
    }
  }

  private enableMinimalMode(): void {
    try {
      console.log('[StatusBarCharacterVSCode] Enabling minimal mode');
      this.stopAnimation();
      this.statusBarItem.text = '👻 Kiro';
    } catch (error) {
      console.error('[StatusBarCharacterVSCode] Failed to enable minimal mode:', error);
    }
  }

  private fallbackToStaticDisplay(): void {
    try {
      console.log('[StatusBarCharacterVSCode] Falling back to static display');
      this.stopAnimation();
      this.statusBarItem.text = '👻 Kiro (Static)';
    } catch (error) {
      console.error('[StatusBarCharacterVSCode] Failed to fallback to static display:', error);
    }
  }

  private reduceAnimationComplexity(): void {
    try {
      console.log('[StatusBarCharacterVSCode] Reducing animation complexity');
      this.animationController.setAnimationSpeed(0.5);
      this.performanceOptimizer.adjustPerformance();
    } catch (error) {
      console.error('[StatusBarCharacterVSCode] Failed to reduce animation complexity:', error);
    }
  }

  private useDefaultSettings(): void {
    try {
      console.log('[StatusBarCharacterVSCode] Using default settings');
      this.settingsManager = new SettingsManager();
      this.onConfigurationChanged();
    } catch (error) {
      console.error('[StatusBarCharacterVSCode] Failed to use default settings:', error);
    }
  }

  // Public methods for external control
  refreshSettings(): void {
    this.onConfigurationChanged();
  }

  isVisible(): boolean {
    return this.settingsManager.isEnabled();
  }

  getStatusBarItem(): vscode.StatusBarItem {
    return this.statusBarItem;
  }

  getSettingsManager(): SettingsManager {
    return this.settingsManager;
  }

  getAnimationController(): AnimationController {
    return this.animationController;
  }

  getStateMonitor(): StateMonitor {
    return this.stateMonitor;
  }

  getPerformanceOptimizer(): PerformanceOptimizer {
    return this.performanceOptimizer;
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }
}

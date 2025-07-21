import * as vscode from 'vscode';
import { IStatusBarCharacter, KiroState } from './types';
import { AnimationController } from './animation/AnimationController';
import { StateMonitor } from './state/StateMonitor';
import { SettingsManager } from './settings/SettingsManager';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';
import { ErrorHandler } from './error/ErrorHandler';
export declare class StatusBarCharacterVSCode implements IStatusBarCharacter {
    private statusBarItem;
    private animationController;
    private stateMonitor;
    private stateAnimationBridge;
    private settingsManager;
    private performanceOptimizer;
    private errorHandler;
    private isInitialized;
    private animationInterval;
    private currentAnimationFrame;
    private extensionContext;
    constructor(context?: vscode.ExtensionContext);
    initialize(): Promise<void>;
    show(): void;
    hide(): void;
    updateState(state: KiroState): void;
    dispose(): void;
    private loadVSCodeSettings;
    private onConfigurationChanged;
    private initializeComponents;
    private startServices;
    private startAnimation;
    private stopAnimation;
    private updateAnimationFrame;
    private updateStatusBarText;
    private getAnimatedCharacter;
    /**
     * Get the appropriate SVG icon file name based on the current state
     * @param state The current Kiro state
     * @returns The SVG file name to use
     */
    private getSvgIconForState;
    private getStateText;
    private setupErrorHandling;
    private enableMinimalMode;
    private fallbackToStaticDisplay;
    private reduceAnimationComplexity;
    private useDefaultSettings;
    refreshSettings(): void;
    isVisible(): boolean;
    getStatusBarItem(): vscode.StatusBarItem;
    getSettingsManager(): SettingsManager;
    getAnimationController(): AnimationController;
    getStateMonitor(): StateMonitor;
    getPerformanceOptimizer(): PerformanceOptimizer;
    getErrorHandler(): ErrorHandler;
}
//# sourceMappingURL=StatusBarCharacterVSCode.d.ts.map
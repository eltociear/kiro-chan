import { IStatusBarCharacter, KiroState } from './types';
import { AnimationController } from './animation/AnimationController';
import { StateMonitor } from './state/StateMonitor';
import { StateAnimationBridge } from './state/StateAnimationBridge';
import { SettingsManager } from './settings/SettingsManager';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';
import { ErrorHandler, ErrorContext } from './error/ErrorHandler';

export class StatusBarCharacter implements IStatusBarCharacter {
  private element: HTMLElement | null = null;
  private animationController: AnimationController;
  private stateMonitor: StateMonitor;
  private stateAnimationBridge: StateAnimationBridge;
  private settingsManager: SettingsManager;
  private performanceOptimizer: PerformanceOptimizer;
  private errorHandler: ErrorHandler;
  private isInitialized: boolean = false;
  private statusBarContainer: HTMLElement | null = null;

  constructor() {
    this.errorHandler = ErrorHandler.getInstance();
    this.settingsManager = new SettingsManager();
    this.performanceOptimizer = new PerformanceOptimizer();
    this.animationController = new AnimationController(undefined, this.performanceOptimizer);
    this.stateMonitor = new StateMonitor();
    this.stateAnimationBridge = new StateAnimationBridge(this.stateMonitor, this.animationController);
    
    this.setupErrorHandling();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load settings
      await this.settingsManager.loadSettings();

      // Create DOM element
      this.createElement();

      // Find and attach to status bar
      this.attachToStatusBar();

      // Initialize components
      this.initializeComponents();

      // Start monitoring and optimization
      this.startServices();

      this.isInitialized = true;
      console.log('[StatusBarCharacter] Initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.INITIALIZATION, {
        isInitialized: this.isInitialized,
        hasElement: !!this.element
      });
      throw error;
    }
  }

  show(): void {
    try {
      if (!this.element) {
        console.warn('[StatusBarCharacter] Cannot show: element not created');
        return;
      }

      this.element.classList.remove('hidden');
      this.element.classList.add('visible');
      
      // Start animation if enabled
      if (this.settingsManager.isEnabled()) {
        this.animationController.startAnimation(
          this.mapStateToAnimationPattern(this.stateMonitor.getCurrentState())
        );
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'show',
        hasElement: !!this.element
      });
    }
  }

  hide(): void {
    try {
      if (!this.element) {
        return;
      }

      this.element.classList.remove('visible');
      this.element.classList.add('hidden');
      this.animationController.stopAnimation();
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'hide',
        hasElement: !!this.element
      });
    }
  }

  updateState(state: KiroState): void {
    this.stateMonitor.forceStateChange(state);
  }

  dispose(): void {
    try {
      // Stop all services
      this.stateMonitor.dispose();
      this.animationController.dispose();
      this.stateAnimationBridge.dispose();
      this.performanceOptimizer.dispose();

      // Remove DOM element
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      // Clear references
      this.element = null;
      this.statusBarContainer = null;
      this.isInitialized = false;

      console.log('[StatusBarCharacter] Disposed successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'dispose'
      });
    }
  }

  private createElement(): void {
    this.element = document.createElement('span');
    this.element.className = 'kiro-character hidden';
    this.element.textContent = '👻';
    this.element.setAttribute('aria-label', 'Kiro Status Character');
    this.element.setAttribute('role', 'img');

    // Apply settings-based styling
    this.applySettings();

    // Set up the animation controller with the element
    this.animationController.setElement(this.element);
  }

  private attachToStatusBar(): void {
    // Try to find the status bar container
    this.statusBarContainer = this.findStatusBarContainer();
    
    if (!this.statusBarContainer || !this.element) {
      throw new Error('Could not find status bar container');
    }

    // Insert the character based on position setting
    const position = this.settingsManager.getPosition();
    if (position === 'left') {
      this.statusBarContainer.insertBefore(this.element, this.statusBarContainer.firstChild);
    } else {
      this.statusBarContainer.appendChild(this.element);
    }

    console.log(`[StatusBarCharacter] Attached to status bar (${position})`);
  }

  private findStatusBarContainer(): HTMLElement | null {
    try {
      // Try multiple selectors to find the status bar
      const selectors = [
        '.status-bar',
        '[class*="status-bar"]',
        '[class*="statusbar"]',
        '.bottom-panel .status-bar',
        '#status-bar',
        '[role="status"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          return element;
        }
      }

      // Fallback: create a status bar container if none found
      console.warn('[StatusBarCharacter] Status bar not found, creating fallback container');
      return this.createFallbackStatusBar();
    } catch (error) {
      this.errorHandler.handleError(error as Error, ErrorContext.DOM_MANIPULATION, {
        action: 'findStatusBar'
      });
      return this.createFallbackStatusBar();
    }
  }

  private createFallbackStatusBar(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'kiro-status-bar-fallback';
    container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 24px;
      background: var(--vscode-statusBar-background, #007acc);
      color: var(--vscode-statusBar-foreground, #ffffff);
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 12px;
      z-index: 1000;
    `;
    
    document.body.appendChild(container);
    return container;
  }

  private initializeComponents(): void {
    // Configure animation speed from settings
    this.animationController.setAnimationSpeed(this.settingsManager.getAnimationSpeed());

    // Set up settings change listeners
    this.setupSettingsListeners();
  }

  private setupSettingsListeners(): void {
    // In a real implementation, this would listen to settings changes
    // For now, we'll provide a method to refresh settings
  }

  private startServices(): void {
    // Start performance monitoring
    this.performanceOptimizer.monitorPerformance();

    // Start state monitoring
    this.stateMonitor.startMonitoring();

    // Show the character if enabled
    if (this.settingsManager.isEnabled()) {
      this.show();
    }
  }

  private applySettings(): void {
    if (!this.element) return;

    const settings = this.settingsManager.getSettings();
    
    // Apply position class
    this.element.classList.remove('position-left', 'position-right');
    this.element.classList.add(`position-${settings.position}`);

    // Apply responsive behavior
    this.applyResponsiveBehavior();
  }

  private applyResponsiveBehavior(): void {
    if (!this.element) return;

    // Check if we should hide on narrow screens
    const shouldHideOnNarrow = window.innerWidth < 768;
    
    if (shouldHideOnNarrow) {
      this.element.classList.add('responsive-hide');
    } else {
      this.element.classList.remove('responsive-hide');
    }
  }

  private mapStateToAnimationPattern(state: KiroState): import('./types').AnimationPattern {
    switch (state) {
      case KiroState.IDLE:
        return import('./types').AnimationPattern.IDLE;
      case KiroState.EXECUTING:
        return import('./types').AnimationPattern.ACTIVE;
      case KiroState.ERROR:
        return import('./types').AnimationPattern.ERROR;
      default:
        return import('./types').AnimationPattern.IDLE;
    }
  }

  // Public methods for external control
  refreshSettings(): void {
    if (this.settingsManager) {
      this.settingsManager.loadSettings().then(() => {
        this.applySettings();
        this.animationController.setAnimationSpeed(this.settingsManager.getAnimationSpeed());
        
        if (this.settingsManager.isEnabled()) {
          this.show();
        } else {
          this.hide();
        }
      }).catch(error => {
        this.errorHandler.handleError(error as Error, ErrorContext.SETTINGS, {
          action: 'refresh'
        });
      });
    }
  }

  isVisible(): boolean {
    return this.element ? this.element.classList.contains('visible') : false;
  }

  getElement(): HTMLElement | null {
    return this.element;
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

  showSettings(): void {
    // This would be called by a command or menu item
    const { SettingsUI } = require('./ui/SettingsUI');
    const settingsUI = new SettingsUI(this.settingsManager, this);
    settingsUI.show();
  }

  private setupErrorHandling(): void {
    // Set up error recovery event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('kiro-character:enable-minimal-mode', () => {
        this.enableMinimalMode();
      });

      window.addEventListener('kiro-character:fallback-static-display', () => {
        this.fallbackToStaticDisplay();
      });

      window.addEventListener('kiro-character:reduce-animation-complexity', () => {
        this.reduceAnimationComplexity();
      });

      window.addEventListener('kiro-character:use-default-settings', () => {
        this.useDefaultSettings();
      });

      window.addEventListener('kiro-character:fallback-state-detection', () => {
        this.enableFallbackStateDetection();
      });

      window.addEventListener('kiro-character:attempt-dom-recovery', () => {
        this.attemptDomRecovery();
      });
    }
  }

  private enableMinimalMode(): void {
    try {
      console.log('[StatusBarCharacter] Enabling minimal mode');
      this.animationController.stopAnimation();
      if (this.element) {
        this.element.style.animation = 'none';
        this.element.style.transform = 'none';
      }
    } catch (error) {
      console.error('[StatusBarCharacter] Failed to enable minimal mode:', error);
    }
  }

  private fallbackToStaticDisplay(): void {
    try {
      console.log('[StatusBarCharacter] Falling back to static display');
      this.animationController.stopAnimation();
      if (this.element) {
        this.element.classList.add('css-fallback');
      }
    } catch (error) {
      console.error('[StatusBarCharacter] Failed to fallback to static display:', error);
    }
  }

  private reduceAnimationComplexity(): void {
    try {
      console.log('[StatusBarCharacter] Reducing animation complexity');
      this.animationController.setAnimationSpeed(0.5);
      this.performanceOptimizer.adjustPerformance();
    } catch (error) {
      console.error('[StatusBarCharacter] Failed to reduce animation complexity:', error);
    }
  }

  private useDefaultSettings(): void {
    try {
      console.log('[StatusBarCharacter] Using default settings');
      // Reset settings manager to defaults
      this.settingsManager = new SettingsManager();
      this.applySettings();
    } catch (error) {
      console.error('[StatusBarCharacter] Failed to use default settings:', error);
    }
  }

  private enableFallbackStateDetection(): void {
    try {
      console.log('[StatusBarCharacter] Enabling fallback state detection');
      this.stateMonitor.stopMonitoring();
      // Use simple idle state as fallback
      this.updateState(KiroState.IDLE);
    } catch (error) {
      console.error('[StatusBarCharacter] Failed to enable fallback state detection:', error);
    }
  }

  private attemptDomRecovery(): void {
    try {
      console.log('[StatusBarCharacter] Attempting DOM recovery');
      if (!this.element || !this.element.parentNode) {
        this.createElement();
        this.attachToStatusBar();
        if (this.settingsManager.isEnabled()) {
          this.show();
        }
      }
    } catch (error) {
      console.error('[StatusBarCharacter] DOM recovery failed:', error);
    }
  }
}

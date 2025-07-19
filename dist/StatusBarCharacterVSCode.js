"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarCharacterVSCode = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
const AnimationController_1 = require("./animation/AnimationController");
const StateMonitor_1 = require("./state/StateMonitor");
const StateAnimationBridge_1 = require("./state/StateAnimationBridge");
const SettingsManager_1 = require("./settings/SettingsManager");
const PerformanceOptimizer_1 = require("./performance/PerformanceOptimizer");
const ErrorHandler_1 = require("./error/ErrorHandler");
class StatusBarCharacterVSCode {
    constructor() {
        this.isInitialized = false;
        this.animationInterval = null;
        this.currentAnimationFrame = 0;
        this.errorHandler = ErrorHandler_1.ErrorHandler.getInstance();
        this.settingsManager = new SettingsManager_1.SettingsManager();
        this.performanceOptimizer = new PerformanceOptimizer_1.PerformanceOptimizer();
        this.animationController = new AnimationController_1.AnimationController(undefined, this.performanceOptimizer);
        this.stateMonitor = new StateMonitor_1.StateMonitor();
        this.stateAnimationBridge = new StateAnimationBridge_1.StateAnimationBridge(this.stateMonitor, this.animationController);
        // Create VS Code status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'kiro-chan.openSettings';
        this.statusBarItem.tooltip = 'Kiro Character - Click to open settings';
        this.setupErrorHandling();
    }
    async initialize() {
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
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.INITIALIZATION, {
                isInitialized: this.isInitialized
            });
            throw error;
        }
    }
    show() {
        try {
            if (this.settingsManager.isEnabled()) {
                this.statusBarItem.show();
                this.startAnimation();
            }
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: 'show'
            });
        }
    }
    hide() {
        try {
            this.statusBarItem.hide();
            this.stopAnimation();
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: 'hide'
            });
        }
    }
    updateState(state) {
        this.stateMonitor.forceStateChange(state);
        this.updateStatusBarText(state);
    }
    dispose() {
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
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: 'dispose'
            });
        }
    }
    async loadVSCodeSettings() {
        const config = vscode.workspace.getConfiguration('kiro-chan');
        const enabled = config.get('enabled', true);
        const animationSpeed = config.get('animationSpeed', 1.0);
        this.settingsManager.setEnabled(enabled);
        this.settingsManager.setAnimationSpeed(animationSpeed);
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('kiro-chan')) {
                this.onConfigurationChanged();
            }
        });
    }
    onConfigurationChanged() {
        const config = vscode.workspace.getConfiguration('kiro-chan');
        const enabled = config.get('enabled', true);
        const animationSpeed = config.get('animationSpeed', 1.0);
        this.settingsManager.setEnabled(enabled);
        this.settingsManager.setAnimationSpeed(animationSpeed);
        this.animationController.setAnimationSpeed(animationSpeed);
        if (enabled) {
            this.show();
        }
        else {
            this.hide();
        }
    }
    initializeComponents() {
        this.animationController.setAnimationSpeed(this.settingsManager.getAnimationSpeed());
    }
    startServices() {
        this.performanceOptimizer.monitorPerformance();
        this.stateMonitor.startMonitoring();
        // Set up state change handler
        this.stateMonitor.onStateChange((state) => {
            this.updateStatusBarText(state);
        });
    }
    startAnimation() {
        if (this.animationInterval) {
            return;
        }
        const frameRate = Math.max(15, this.performanceOptimizer.getOptimalFrameRate());
        const frameTime = 1000 / frameRate;
        this.animationInterval = setInterval(() => {
            this.updateAnimationFrame();
        }, frameTime);
    }
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
    updateAnimationFrame() {
        if (!this.settingsManager.isEnabled()) {
            return;
        }
        this.currentAnimationFrame++;
        const currentState = this.stateMonitor.getCurrentState();
        this.updateStatusBarText(currentState);
    }
    updateStatusBarText(state) {
        const character = this.getAnimatedCharacter(state);
        const stateText = this.getStateText(state);
        this.statusBarItem.text = `${character} Kiro`;
        this.statusBarItem.tooltip = `Kiro Character (${stateText}) - Click to open settings`;
    }
    getAnimatedCharacter(state) {
        const baseCharacter = '👻';
        // Simple text-based animation by rotating through variations
        const frame = this.currentAnimationFrame % 4;
        switch (state) {
            case types_1.KiroState.IDLE:
                // Gentle animation - slower changes
                return frame < 2 ? '👻' : '🌟';
            case types_1.KiroState.EXECUTING:
                // Active animation - faster changes
                const activeChars = ['👻', '⚡', '🔥', '✨'];
                return activeChars[frame];
            case types_1.KiroState.ERROR:
                // Error animation - warning indicators
                return frame % 2 === 0 ? '👻' : '⚠️';
            default:
                return baseCharacter;
        }
    }
    getStateText(state) {
        switch (state) {
            case types_1.KiroState.IDLE:
                return 'Idle';
            case types_1.KiroState.EXECUTING:
                return 'Active';
            case types_1.KiroState.ERROR:
                return 'Error';
            default:
                return 'Unknown';
        }
    }
    setupErrorHandling() {
        // Set up error recovery event listeners
        if (typeof globalThis !== 'undefined') {
            // Use globalThis instead of window in VS Code extension context
            const eventTarget = globalThis;
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
    enableMinimalMode() {
        try {
            console.log('[StatusBarCharacterVSCode] Enabling minimal mode');
            this.stopAnimation();
            this.statusBarItem.text = '👻 Kiro';
        }
        catch (error) {
            console.error('[StatusBarCharacterVSCode] Failed to enable minimal mode:', error);
        }
    }
    fallbackToStaticDisplay() {
        try {
            console.log('[StatusBarCharacterVSCode] Falling back to static display');
            this.stopAnimation();
            this.statusBarItem.text = '👻 Kiro (Static)';
        }
        catch (error) {
            console.error('[StatusBarCharacterVSCode] Failed to fallback to static display:', error);
        }
    }
    reduceAnimationComplexity() {
        try {
            console.log('[StatusBarCharacterVSCode] Reducing animation complexity');
            this.animationController.setAnimationSpeed(0.5);
            this.performanceOptimizer.adjustPerformance();
        }
        catch (error) {
            console.error('[StatusBarCharacterVSCode] Failed to reduce animation complexity:', error);
        }
    }
    useDefaultSettings() {
        try {
            console.log('[StatusBarCharacterVSCode] Using default settings');
            this.settingsManager = new SettingsManager_1.SettingsManager();
            this.onConfigurationChanged();
        }
        catch (error) {
            console.error('[StatusBarCharacterVSCode] Failed to use default settings:', error);
        }
    }
    // Public methods for external control
    refreshSettings() {
        this.onConfigurationChanged();
    }
    isVisible() {
        return this.settingsManager.isEnabled();
    }
    getStatusBarItem() {
        return this.statusBarItem;
    }
    getSettingsManager() {
        return this.settingsManager;
    }
    getAnimationController() {
        return this.animationController;
    }
    getStateMonitor() {
        return this.stateMonitor;
    }
    getPerformanceOptimizer() {
        return this.performanceOptimizer;
    }
    getErrorHandler() {
        return this.errorHandler;
    }
}
exports.StatusBarCharacterVSCode = StatusBarCharacterVSCode;
//# sourceMappingURL=StatusBarCharacterVSCode.js.map
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
exports.StatusBarCharacter = void 0;
const types_1 = require("./types");
const AnimationController_1 = require("./animation/AnimationController");
const StateMonitor_1 = require("./state/StateMonitor");
const StateAnimationBridge_1 = require("./state/StateAnimationBridge");
const SettingsManager_1 = require("./settings/SettingsManager");
const PerformanceOptimizer_1 = require("./performance/PerformanceOptimizer");
const ErrorHandler_1 = require("./error/ErrorHandler");
class StatusBarCharacter {
    constructor() {
        this.element = null;
        this.isInitialized = false;
        this.statusBarContainer = null;
        this.errorHandler = ErrorHandler_1.ErrorHandler.getInstance();
        this.settingsManager = new SettingsManager_1.SettingsManager();
        this.performanceOptimizer = new PerformanceOptimizer_1.PerformanceOptimizer();
        this.animationController = new AnimationController_1.AnimationController(undefined, this.performanceOptimizer);
        this.stateMonitor = new StateMonitor_1.StateMonitor();
        this.stateAnimationBridge = new StateAnimationBridge_1.StateAnimationBridge(this.stateMonitor, this.animationController);
        this.setupErrorHandling();
    }
    async initialize() {
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
            console.log("[StatusBarCharacter] Initialized successfully");
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.INITIALIZATION, {
                isInitialized: this.isInitialized,
                hasElement: !!this.element,
            });
            throw error;
        }
    }
    show() {
        try {
            if (!this.element) {
                console.warn("[StatusBarCharacter] Cannot show: element not created");
                return;
            }
            this.element.classList.remove("hidden");
            this.element.classList.add("visible");
            // Start animation if enabled
            if (this.settingsManager.isEnabled()) {
                this.animationController.startAnimation(this.mapStateToAnimationPattern(this.stateMonitor.getCurrentState()));
            }
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: "show",
                hasElement: !!this.element,
            });
        }
    }
    hide() {
        try {
            if (!this.element) {
                return;
            }
            this.element.classList.remove("visible");
            this.element.classList.add("hidden");
            this.animationController.stopAnimation();
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: "hide",
                hasElement: !!this.element,
            });
        }
    }
    updateState(state) {
        this.stateMonitor.forceStateChange(state);
    }
    dispose() {
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
            console.log("[StatusBarCharacter] Disposed successfully");
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: "dispose",
            });
        }
    }
    createElement() {
        this.element = document.createElement("span");
        this.element.className = "kiro-character hidden";
        this.element.textContent = "👻";
        this.element.setAttribute("aria-label", "Kiro Status Character");
        this.element.setAttribute("role", "img");
        // Apply settings-based styling
        this.applySettings();
        // Set up the animation controller with the element
        this.animationController.setElement(this.element);
    }
    attachToStatusBar() {
        // Try to find the status bar container
        this.statusBarContainer = this.findStatusBarContainer();
        if (!this.statusBarContainer || !this.element) {
            throw new Error("Could not find status bar container");
        }
        // Insert the character based on position setting
        const position = this.settingsManager.getPosition();
        if (position === "left") {
            this.statusBarContainer.insertBefore(this.element, this.statusBarContainer.firstChild);
        }
        else {
            this.statusBarContainer.appendChild(this.element);
        }
        console.log(`[StatusBarCharacter] Attached to status bar (${position})`);
    }
    findStatusBarContainer() {
        try {
            // Try multiple selectors to find the status bar
            const selectors = [
                ".status-bar",
                '[class*="status-bar"]',
                '[class*="statusbar"]',
                ".bottom-panel .status-bar",
                "#status-bar",
                '[role="status"]',
            ];
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    return element;
                }
            }
            // Fallback: create a status bar container if none found
            console.warn("[StatusBarCharacter] Status bar not found, creating fallback container");
            return this.createFallbackStatusBar();
        }
        catch (error) {
            this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.DOM_MANIPULATION, {
                action: "findStatusBar",
            });
            return this.createFallbackStatusBar();
        }
    }
    createFallbackStatusBar() {
        const container = document.createElement("div");
        container.className = "kiro-status-bar-fallback";
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
    initializeComponents() {
        // Configure animation speed from settings
        this.animationController.setAnimationSpeed(this.settingsManager.getAnimationSpeed());
        // Set up settings change listeners
        this.setupSettingsListeners();
    }
    setupSettingsListeners() {
        // In a real implementation, this would listen to settings changes
        // For now, we'll provide a method to refresh settings
    }
    startServices() {
        // Start performance monitoring
        this.performanceOptimizer.monitorPerformance();
        // Start state monitoring
        this.stateMonitor.startMonitoring();
        // Show the character if enabled
        if (this.settingsManager.isEnabled()) {
            this.show();
        }
    }
    applySettings() {
        if (!this.element)
            return;
        const settings = this.settingsManager.getSettings();
        // Apply position class
        this.element.classList.remove("position-left", "position-right");
        this.element.classList.add(`position-${settings.position}`);
        // Apply responsive behavior
        this.applyResponsiveBehavior();
    }
    applyResponsiveBehavior() {
        if (!this.element)
            return;
        // Check if we should hide on narrow screens
        const shouldHideOnNarrow = window.innerWidth < 768;
        if (shouldHideOnNarrow) {
            this.element.classList.add("responsive-hide");
        }
        else {
            this.element.classList.remove("responsive-hide");
        }
    }
    mapStateToAnimationPattern(state) {
        switch (state) {
            case types_1.KiroState.IDLE:
                return types_1.AnimationPattern.IDLE;
            case types_1.KiroState.EXECUTING:
                return types_1.AnimationPattern.ACTIVE;
            case types_1.KiroState.ERROR:
                return types_1.AnimationPattern.ERROR;
            default:
                return types_1.AnimationPattern.IDLE;
        }
    }
    // Public methods for external control
    refreshSettings() {
        if (this.settingsManager) {
            this.settingsManager
                .loadSettings()
                .then(() => {
                this.applySettings();
                this.animationController.setAnimationSpeed(this.settingsManager.getAnimationSpeed());
                if (this.settingsManager.isEnabled()) {
                    this.show();
                }
                else {
                    this.hide();
                }
            })
                .catch((error) => {
                this.errorHandler.handleError(error, ErrorHandler_1.ErrorContext.SETTINGS, {
                    action: "refresh",
                });
            });
        }
    }
    isVisible() {
        return this.element ? this.element.classList.contains("visible") : false;
    }
    getElement() {
        return this.element;
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
    showSettings() {
        // This would be called by a command or menu item
        Promise.resolve().then(() => __importStar(require("./ui/SettingsUI"))).then(({ SettingsUI }) => {
            const settingsUI = new SettingsUI(this.settingsManager, this);
            settingsUI.show();
        })
            .catch((error) => {
            console.error("[StatusBarCharacter] Failed to load settings UI:", error);
        });
    }
    setupErrorHandling() {
        // Set up error recovery event listeners
        if (typeof window !== "undefined") {
            window.addEventListener("kiro-character:enable-minimal-mode", () => {
                this.enableMinimalMode();
            });
            window.addEventListener("kiro-character:fallback-static-display", () => {
                this.fallbackToStaticDisplay();
            });
            window.addEventListener("kiro-character:reduce-animation-complexity", () => {
                this.reduceAnimationComplexity();
            });
            window.addEventListener("kiro-character:use-default-settings", () => {
                this.useDefaultSettings();
            });
            window.addEventListener("kiro-character:fallback-state-detection", () => {
                this.enableFallbackStateDetection();
            });
            window.addEventListener("kiro-character:attempt-dom-recovery", () => {
                this.attemptDomRecovery();
            });
        }
    }
    enableMinimalMode() {
        try {
            console.log("[StatusBarCharacter] Enabling minimal mode");
            this.animationController.stopAnimation();
            if (this.element) {
                this.element.style.animation = "none";
                this.element.style.transform = "none";
            }
        }
        catch (error) {
            console.error("[StatusBarCharacter] Failed to enable minimal mode:", error);
        }
    }
    fallbackToStaticDisplay() {
        try {
            console.log("[StatusBarCharacter] Falling back to static display");
            this.animationController.stopAnimation();
            if (this.element) {
                this.element.classList.add("css-fallback");
            }
        }
        catch (error) {
            console.error("[StatusBarCharacter] Failed to fallback to static display:", error);
        }
    }
    reduceAnimationComplexity() {
        try {
            console.log("[StatusBarCharacter] Reducing animation complexity");
            this.animationController.setAnimationSpeed(0.5);
            this.performanceOptimizer.adjustPerformance();
        }
        catch (error) {
            console.error("[StatusBarCharacter] Failed to reduce animation complexity:", error);
        }
    }
    useDefaultSettings() {
        try {
            console.log("[StatusBarCharacter] Using default settings");
            // Reset settings manager to defaults
            this.settingsManager = new SettingsManager_1.SettingsManager();
            this.applySettings();
        }
        catch (error) {
            console.error("[StatusBarCharacter] Failed to use default settings:", error);
        }
    }
    enableFallbackStateDetection() {
        try {
            console.log("[StatusBarCharacter] Enabling fallback state detection");
            this.stateMonitor.stopMonitoring();
            // Use simple idle state as fallback
            this.updateState(types_1.KiroState.IDLE);
        }
        catch (error) {
            console.error("[StatusBarCharacter] Failed to enable fallback state detection:", error);
        }
    }
    attemptDomRecovery() {
        try {
            console.log("[StatusBarCharacter] Attempting DOM recovery");
            if (!this.element || !this.element.parentNode) {
                this.createElement();
                this.attachToStatusBar();
                if (this.settingsManager.isEnabled()) {
                    this.show();
                }
            }
        }
        catch (error) {
            console.error("[StatusBarCharacter] DOM recovery failed:", error);
        }
    }
}
exports.StatusBarCharacter = StatusBarCharacter;
//# sourceMappingURL=StatusBarCharacter.js.map
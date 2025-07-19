"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateAnimationBridge = void 0;
const types_1 = require("../types");
class StateAnimationBridge {
    constructor(stateMonitor, animationController) {
        this.transitionDelay = 300; // ms
        this.transitionTimeout = 0;
        this.stateMonitor = stateMonitor;
        this.animationController = animationController;
        this.bindStateChanges();
    }
    bindStateChanges() {
        this.stateMonitor.onStateChange((state) => {
            this.handleStateChange(state);
        });
    }
    handleStateChange(state) {
        // Clear any pending transition
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
        }
        // Add a small delay for smooth transitions
        this.transitionTimeout = window.setTimeout(() => {
            const animationPattern = this.mapStateToAnimationPattern(state);
            this.animationController.startAnimation(animationPattern);
        }, this.transitionDelay);
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
    setTransitionDelay(delay) {
        if (delay < 0 || delay > 2000) {
            throw new Error('Transition delay must be between 0 and 2000ms');
        }
        this.transitionDelay = delay;
    }
    getTransitionDelay() {
        return this.transitionDelay;
    }
    // Force immediate state-to-animation mapping without delay
    forceImmediateTransition(state) {
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
        }
        const animationPattern = this.mapStateToAnimationPattern(state);
        this.animationController.startAnimation(animationPattern);
    }
    dispose() {
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
            this.transitionTimeout = 0;
        }
    }
}
exports.StateAnimationBridge = StateAnimationBridge;
//# sourceMappingURL=StateAnimationBridge.js.map
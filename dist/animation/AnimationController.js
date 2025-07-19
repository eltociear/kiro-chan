"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationController = void 0;
const types_1 = require("../types");
class AnimationController {
    constructor(element, performanceOptimizer) {
        this.animationFrame = 0;
        this.currentPattern = types_1.AnimationPattern.IDLE;
        this.animationSpeed = 1.0;
        this.isRunning = false;
        this.element = null;
        this.startTime = 0;
        this.performanceOptimizer = null;
        this.targetFrameRate = 60;
        this.lastFrameTime = 0;
        this.animate = () => {
            if (!this.isRunning || !this.element) {
                return;
            }
            const currentTime = performance.now();
            // Apply performance optimization
            if (this.performanceOptimizer) {
                this.targetFrameRate = this.performanceOptimizer.getOptimalFrameRate();
                // Skip frames if needed to maintain target frame rate
                const targetFrameTime = 1000 / this.targetFrameRate;
                if (currentTime - this.lastFrameTime < targetFrameTime) {
                    this.animationFrame = requestAnimationFrame(this.animate);
                    return;
                }
            }
            this.lastFrameTime = currentTime;
            const elapsed = (currentTime - this.startTime) * this.animationSpeed;
            // Measure animation performance
            const measureName = `animation-frame-${this.currentPattern}`;
            if (typeof performance !== 'undefined' && performance.mark) {
                performance.mark(`${measureName}-start`);
            }
            this.updateElementTransform(elapsed);
            if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
                performance.mark(`${measureName}-end`);
                try {
                    performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
                }
                catch (error) {
                    // Ignore measurement errors
                }
            }
            // Reduce animation complexity if performance is poor
            if (this.performanceOptimizer && this.performanceOptimizer.shouldReduceAnimation()) {
                this.applyPerformanceReduction();
            }
            this.animationFrame = requestAnimationFrame(this.animate);
        };
        this.element = element || null;
        this.performanceOptimizer = performanceOptimizer || null;
    }
    setElement(element) {
        this.element = element;
    }
    setPerformanceOptimizer(optimizer) {
        this.performanceOptimizer = optimizer;
    }
    startAnimation(pattern) {
        if (this.currentPattern === pattern && this.isRunning) {
            return;
        }
        this.stopAnimation();
        this.currentPattern = pattern;
        this.isRunning = true;
        this.startTime = performance.now();
        this.animate();
    }
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = 0;
        }
        this.isRunning = false;
    }
    setAnimationSpeed(speed) {
        if (speed < 0.1 || speed > 3.0) {
            throw new Error('Animation speed must be between 0.1 and 3.0');
        }
        this.animationSpeed = speed;
    }
    getCurrentPattern() {
        return this.currentPattern;
    }
    getAnimationSpeed() {
        return this.animationSpeed;
    }
    isAnimating() {
        return this.isRunning;
    }
    updateElementTransform(elapsed) {
        if (!this.element)
            return;
        const transform = this.calculateTransform(elapsed);
        this.element.style.transform =
            `translateX(${transform.translateX}px) ` +
                `translateY(${transform.translateY}px) ` +
                `rotate(${transform.rotate}deg) ` +
                `scale(${transform.scale})`;
    }
    calculateTransform(elapsed) {
        switch (this.currentPattern) {
            case types_1.AnimationPattern.IDLE:
                return this.calculateIdleTransform(elapsed);
            case types_1.AnimationPattern.ACTIVE:
                return this.calculateActiveTransform(elapsed);
            case types_1.AnimationPattern.ERROR:
                return this.calculateErrorTransform(elapsed);
            default:
                return { translateX: 0, translateY: 0, rotate: 0, scale: 1 };
        }
    }
    calculateIdleTransform(elapsed) {
        // Gentle floating animation
        const cycle = elapsed / 2000; // 2 second cycle
        const translateY = Math.sin(cycle * Math.PI * 2) * 2;
        const rotate = Math.sin(cycle * Math.PI * 2) * 1;
        return {
            translateX: 0,
            translateY,
            rotate,
            scale: 1
        };
    }
    calculateActiveTransform(elapsed) {
        // More energetic bouncing animation
        const cycle = elapsed / 1000; // 1 second cycle
        const translateY = Math.abs(Math.sin(cycle * Math.PI * 2)) * -4;
        const scale = 1 + Math.abs(Math.sin(cycle * Math.PI * 2)) * 0.1;
        return {
            translateX: 0,
            translateY,
            rotate: 0,
            scale
        };
    }
    calculateErrorTransform(elapsed) {
        // Shaking animation for error state
        const intensity = Math.max(0, 1 - elapsed / 3000); // Fade out over 3 seconds
        const translateX = (Math.random() - 0.5) * 4 * intensity;
        const translateY = (Math.random() - 0.5) * 2 * intensity;
        return {
            translateX,
            translateY,
            rotate: 0,
            scale: 1
        };
    }
    applyPerformanceReduction() {
        // Reduce animation complexity when performance is poor
        // This could involve:
        // - Simplifying transform calculations
        // - Reducing animation frequency
        // - Using CSS animations as fallback
        if (this.element) {
            // Add a class to enable CSS fallback animations
            this.element.classList.add('css-fallback');
            // Reduce JavaScript animation complexity
            this.animationSpeed = Math.max(0.5, this.animationSpeed * 0.8);
        }
    }
    restorePerformance() {
        if (this.element) {
            this.element.classList.remove('css-fallback');
            this.animationSpeed = Math.min(3.0, this.animationSpeed * 1.2);
        }
    }
    getTargetFrameRate() {
        return this.targetFrameRate;
    }
    dispose() {
        this.stopAnimation();
        this.element = null;
        this.performanceOptimizer = null;
    }
}
exports.AnimationController = AnimationController;
//# sourceMappingURL=AnimationController.js.map
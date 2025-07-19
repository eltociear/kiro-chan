"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizer = void 0;
class PerformanceOptimizer {
    constructor() {
        this.cpuUsageThreshold = 80; // percentage
        this.memoryUsageThreshold = 500; // MB
        this.currentFrameRate = 60;
        this.minFrameRate = 15;
        this.maxFrameRate = 60;
        this.isMonitoring = false;
        this.monitoringInterval = 0;
        this.performanceHistory = [];
        this.historyLimit = 10;
        this.monitoringFrequency = 2000; // ms
        this.bindPerformanceObserver();
    }
    shouldReduceAnimation() {
        const currentMemory = this.getCurrentMemoryUsage();
        const averageFrameRate = this.getAverageFrameRate();
        return (currentMemory > this.memoryUsageThreshold ||
            averageFrameRate < this.minFrameRate * 1.5 ||
            this.isSystemUnderLoad());
    }
    getOptimalFrameRate() {
        if (this.shouldReduceAnimation()) {
            return Math.max(this.minFrameRate, this.currentFrameRate * 0.5);
        }
        return this.currentFrameRate;
    }
    monitorPerformance() {
        if (this.isMonitoring) {
            return;
        }
        this.isMonitoring = true;
        this.monitoringInterval = window.setInterval(() => {
            this.collectPerformanceMetrics();
        }, this.monitoringFrequency);
        // Initial collection
        this.collectPerformanceMetrics();
    }
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = 0;
        }
    }
    adjustPerformance() {
        const shouldReduce = this.shouldReduceAnimation();
        if (shouldReduce && this.currentFrameRate > this.minFrameRate) {
            this.currentFrameRate = Math.max(this.minFrameRate, this.currentFrameRate * 0.8);
            console.log(`[PerformanceOptimizer] Reduced frame rate to ${this.currentFrameRate}`);
        }
        else if (!shouldReduce && this.currentFrameRate < this.maxFrameRate) {
            this.currentFrameRate = Math.min(this.maxFrameRate, this.currentFrameRate * 1.2);
            console.log(`[PerformanceOptimizer] Increased frame rate to ${this.currentFrameRate}`);
        }
    }
    bindPerformanceObserver() {
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    this.processPerformanceEntries(entries);
                });
                observer.observe({ entryTypes: ['measure', 'navigation'] });
            }
            catch (error) {
                console.warn('[PerformanceOptimizer] PerformanceObserver not supported:', error);
            }
        }
    }
    processPerformanceEntries(entries) {
        entries.forEach(entry => {
            if (entry.entryType === 'measure' && entry.name.includes('animation')) {
                // Track animation performance
                const frameTime = entry.duration;
                const estimatedFrameRate = frameTime > 0 ? 1000 / frameTime : 60;
                this.updateFrameRateEstimate(estimatedFrameRate);
            }
        });
    }
    updateFrameRateEstimate(frameRate) {
        // Smooth the frame rate estimate
        this.currentFrameRate = (this.currentFrameRate * 0.9) + (frameRate * 0.1);
    }
    collectPerformanceMetrics() {
        const metrics = {
            timestamp: Date.now(),
            frameRate: this.currentFrameRate,
            memoryUsage: this.getCurrentMemoryUsage()
        };
        this.performanceHistory.push(metrics);
        // Keep history within limits
        if (this.performanceHistory.length > this.historyLimit) {
            this.performanceHistory.shift();
        }
        // Auto-adjust performance based on metrics
        this.adjustPerformance();
    }
    getCurrentMemoryUsage() {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const memory = performance.memory;
            if (memory) {
                // Convert bytes to MB
                return memory.usedJSHeapSize / (1024 * 1024);
            }
        }
        // Fallback estimation based on performance history
        return this.estimateMemoryUsage();
    }
    estimateMemoryUsage() {
        // Simple heuristic based on animation complexity and time
        const baseUsage = 50; // MB
        const animationOverhead = this.currentFrameRate * 0.5;
        return baseUsage + animationOverhead;
    }
    getAverageFrameRate() {
        if (this.performanceHistory.length === 0) {
            return this.currentFrameRate;
        }
        const sum = this.performanceHistory.reduce((acc, entry) => acc + entry.frameRate, 0);
        return sum / this.performanceHistory.length;
    }
    isSystemUnderLoad() {
        // Check if the system appears to be under load
        const recentHistory = this.performanceHistory.slice(-3);
        if (recentHistory.length < 2) {
            return false;
        }
        // Check for declining performance trend
        const frameRates = recentHistory.map(entry => entry.frameRate);
        const isDecreasing = frameRates.every((rate, index) => index === 0 || rate <= frameRates[index - 1]);
        const averageFrameRate = frameRates.reduce((sum, rate) => sum + rate, 0) / frameRates.length;
        return isDecreasing && averageFrameRate < this.maxFrameRate * 0.7;
    }
    // Configuration methods
    setCpuThreshold(threshold) {
        if (threshold < 10 || threshold > 100) {
            throw new Error('CPU threshold must be between 10 and 100');
        }
        this.cpuUsageThreshold = threshold;
    }
    setMemoryThreshold(threshold) {
        if (threshold < 50 || threshold > 2000) {
            throw new Error('Memory threshold must be between 50 and 2000 MB');
        }
        this.memoryUsageThreshold = threshold;
    }
    setFrameRateRange(min, max) {
        if (min < 1 || min > max || max > 120) {
            throw new Error('Invalid frame rate range');
        }
        this.minFrameRate = min;
        this.maxFrameRate = max;
        this.currentFrameRate = Math.min(this.currentFrameRate, max);
    }
    // Getter methods for testing and monitoring
    getCurrentFrameRate() {
        return this.currentFrameRate;
    }
    getPerformanceHistory() {
        return [...this.performanceHistory];
    }
    getCpuThreshold() {
        return this.cpuUsageThreshold;
    }
    getMemoryThreshold() {
        return this.memoryUsageThreshold;
    }
    getFrameRateRange() {
        return {
            min: this.minFrameRate,
            max: this.maxFrameRate
        };
    }
    dispose() {
        this.stopMonitoring();
        this.performanceHistory = [];
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
//# sourceMappingURL=PerformanceOptimizer.js.map
import { IPerformanceOptimizer } from '../types';

export class PerformanceOptimizer implements IPerformanceOptimizer {
  private cpuUsageThreshold: number = 80; // percentage
  private memoryUsageThreshold: number = 500; // MB
  private currentFrameRate: number = 60;
  private minFrameRate: number = 15;
  private maxFrameRate: number = 60;
  private isMonitoring: boolean = false;
  private monitoringInterval: number = 0;
  private performanceHistory: Array<{
    timestamp: number;
    frameRate: number;
    memoryUsage: number;
  }> = [];
  private readonly historyLimit: number = 10;
  private readonly monitoringFrequency: number = 2000; // ms

  constructor() {
    this.bindPerformanceObserver();
  }

  shouldReduceAnimation(): boolean {
    const currentMemory = this.getCurrentMemoryUsage();
    const averageFrameRate = this.getAverageFrameRate();
    
    return (
      currentMemory > this.memoryUsageThreshold ||
      averageFrameRate < this.minFrameRate * 1.5 ||
      this.isSystemUnderLoad()
    );
  }

  getOptimalFrameRate(): number {
    if (this.shouldReduceAnimation()) {
      return Math.max(this.minFrameRate, this.currentFrameRate * 0.5);
    }
    
    return this.currentFrameRate;
  }

  monitorPerformance(): void {
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

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = 0;
    }
  }

  adjustPerformance(): void {
    const shouldReduce = this.shouldReduceAnimation();
    
    if (shouldReduce && this.currentFrameRate > this.minFrameRate) {
      this.currentFrameRate = Math.max(
        this.minFrameRate,
        this.currentFrameRate * 0.8
      );
      console.log(`[PerformanceOptimizer] Reduced frame rate to ${this.currentFrameRate}`);
    } else if (!shouldReduce && this.currentFrameRate < this.maxFrameRate) {
      this.currentFrameRate = Math.min(
        this.maxFrameRate,
        this.currentFrameRate * 1.2
      );
      console.log(`[PerformanceOptimizer] Increased frame rate to ${this.currentFrameRate}`);
    }
  }

  private bindPerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          this.processPerformanceEntries(entries);
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('[PerformanceOptimizer] PerformanceObserver not supported:', error);
      }
    }
  }

  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      if (entry.entryType === 'measure' && entry.name.includes('animation')) {
        // Track animation performance
        const frameTime = entry.duration;
        const estimatedFrameRate = frameTime > 0 ? 1000 / frameTime : 60;
        this.updateFrameRateEstimate(estimatedFrameRate);
      }
    });
  }

  private updateFrameRateEstimate(frameRate: number): void {
    // Smooth the frame rate estimate
    this.currentFrameRate = (this.currentFrameRate * 0.9) + (frameRate * 0.1);
  }

  private collectPerformanceMetrics(): void {
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

  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const memory = (performance as any).memory;
      if (memory) {
        // Convert bytes to MB
        return memory.usedJSHeapSize / (1024 * 1024);
      }
    }
    
    // Fallback estimation based on performance history
    return this.estimateMemoryUsage();
  }

  private estimateMemoryUsage(): number {
    // Simple heuristic based on animation complexity and time
    const baseUsage = 50; // MB
    const animationOverhead = this.currentFrameRate * 0.5;
    return baseUsage + animationOverhead;
  }

  private getAverageFrameRate(): number {
    if (this.performanceHistory.length === 0) {
      return this.currentFrameRate;
    }

    const sum = this.performanceHistory.reduce((acc, entry) => acc + entry.frameRate, 0);
    return sum / this.performanceHistory.length;
  }

  private isSystemUnderLoad(): boolean {
    // Check if the system appears to be under load
    const recentHistory = this.performanceHistory.slice(-3);
    
    if (recentHistory.length < 2) {
      return false;
    }

    // Check for declining performance trend
    const frameRates = recentHistory.map(entry => entry.frameRate);
    const isDecreasing = frameRates.every((rate, index) => 
      index === 0 || rate <= frameRates[index - 1]
    );

    const averageFrameRate = frameRates.reduce((sum, rate) => sum + rate, 0) / frameRates.length;
    
    return isDecreasing && averageFrameRate < this.maxFrameRate * 0.7;
  }

  // Configuration methods
  setCpuThreshold(threshold: number): void {
    if (threshold < 10 || threshold > 100) {
      throw new Error('CPU threshold must be between 10 and 100');
    }
    this.cpuUsageThreshold = threshold;
  }

  setMemoryThreshold(threshold: number): void {
    if (threshold < 50 || threshold > 2000) {
      throw new Error('Memory threshold must be between 50 and 2000 MB');
    }
    this.memoryUsageThreshold = threshold;
  }

  setFrameRateRange(min: number, max: number): void {
    if (min < 1 || min > max || max > 120) {
      throw new Error('Invalid frame rate range');
    }
    this.minFrameRate = min;
    this.maxFrameRate = max;
    this.currentFrameRate = Math.min(this.currentFrameRate, max);
  }

  // Getter methods for testing and monitoring
  getCurrentFrameRate(): number {
    return this.currentFrameRate;
  }

  getPerformanceHistory(): Array<{
    timestamp: number;
    frameRate: number;
    memoryUsage: number;
  }> {
    return [...this.performanceHistory];
  }

  getCpuThreshold(): number {
    return this.cpuUsageThreshold;
  }

  getMemoryThreshold(): number {
    return this.memoryUsageThreshold;
  }

  getFrameRateRange(): { min: number; max: number } {
    return {
      min: this.minFrameRate,
      max: this.maxFrameRate
    };
  }

  dispose(): void {
    this.stopMonitoring();
    this.performanceHistory = [];
  }
}

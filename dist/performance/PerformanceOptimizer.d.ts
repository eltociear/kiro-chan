import { IPerformanceOptimizer } from '../types';
export declare class PerformanceOptimizer implements IPerformanceOptimizer {
    private cpuUsageThreshold;
    private memoryUsageThreshold;
    private currentFrameRate;
    private minFrameRate;
    private maxFrameRate;
    private isMonitoring;
    private monitoringInterval;
    private performanceHistory;
    private readonly historyLimit;
    private readonly monitoringFrequency;
    constructor();
    shouldReduceAnimation(): boolean;
    getOptimalFrameRate(): number;
    monitorPerformance(): void;
    stopMonitoring(): void;
    adjustPerformance(): void;
    private bindPerformanceObserver;
    private processPerformanceEntries;
    private updateFrameRateEstimate;
    private collectPerformanceMetrics;
    private getCurrentMemoryUsage;
    private estimateMemoryUsage;
    private getAverageFrameRate;
    private isSystemUnderLoad;
    setCpuThreshold(threshold: number): void;
    setMemoryThreshold(threshold: number): void;
    setFrameRateRange(min: number, max: number): void;
    getCurrentFrameRate(): number;
    getPerformanceHistory(): Array<{
        timestamp: number;
        frameRate: number;
        memoryUsage: number;
    }>;
    getCpuThreshold(): number;
    getMemoryThreshold(): number;
    getFrameRateRange(): {
        min: number;
        max: number;
    };
    dispose(): void;
}
//# sourceMappingURL=PerformanceOptimizer.d.ts.map
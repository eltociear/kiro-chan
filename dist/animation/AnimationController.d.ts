import { IAnimationController, AnimationPattern, IPerformanceOptimizer } from '../types';
export declare class AnimationController implements IAnimationController {
    private animationFrame;
    private currentPattern;
    private animationSpeed;
    private isRunning;
    private element;
    private startTime;
    private performanceOptimizer;
    private targetFrameRate;
    private lastFrameTime;
    constructor(element?: HTMLElement, performanceOptimizer?: IPerformanceOptimizer);
    setElement(element: HTMLElement): void;
    setPerformanceOptimizer(optimizer: IPerformanceOptimizer): void;
    startAnimation(pattern: AnimationPattern): void;
    stopAnimation(): void;
    setAnimationSpeed(speed: number): void;
    getCurrentPattern(): AnimationPattern;
    getAnimationSpeed(): number;
    isAnimating(): boolean;
    private animate;
    private updateElementTransform;
    private calculateTransform;
    private calculateIdleTransform;
    private calculateActiveTransform;
    private calculateErrorTransform;
    private applyPerformanceReduction;
    restorePerformance(): void;
    getTargetFrameRate(): number;
    dispose(): void;
}
//# sourceMappingURL=AnimationController.d.ts.map
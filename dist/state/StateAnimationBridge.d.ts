import { KiroState } from '../types';
import { StateMonitor } from './StateMonitor';
import { AnimationController } from '../animation/AnimationController';
export declare class StateAnimationBridge {
    private stateMonitor;
    private animationController;
    private transitionDelay;
    private transitionTimeout;
    constructor(stateMonitor: StateMonitor, animationController: AnimationController);
    private bindStateChanges;
    private handleStateChange;
    private mapStateToAnimationPattern;
    setTransitionDelay(delay: number): void;
    getTransitionDelay(): number;
    forceImmediateTransition(state: KiroState): void;
    dispose(): void;
}
//# sourceMappingURL=StateAnimationBridge.d.ts.map
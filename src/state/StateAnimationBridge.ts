import { KiroState, AnimationPattern } from '../types';
import { StateMonitor } from './StateMonitor';
import { AnimationController } from '../animation/AnimationController';

export class StateAnimationBridge {
  private stateMonitor: StateMonitor;
  private animationController: AnimationController;
  private transitionDelay: number = 300; // ms
  private transitionTimeout: number = 0;

  constructor(stateMonitor: StateMonitor, animationController: AnimationController) {
    this.stateMonitor = stateMonitor;
    this.animationController = animationController;
    this.bindStateChanges();
  }

  private bindStateChanges(): void {
    this.stateMonitor.onStateChange((state: KiroState) => {
      this.handleStateChange(state);
    });
  }

  private handleStateChange(state: KiroState): void {
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

  private mapStateToAnimationPattern(state: KiroState): AnimationPattern {
    switch (state) {
      case KiroState.IDLE:
        return AnimationPattern.IDLE;
      case KiroState.EXECUTING:
        return AnimationPattern.ACTIVE;
      case KiroState.ERROR:
        return AnimationPattern.ERROR;
      default:
        return AnimationPattern.IDLE;
    }
  }

  setTransitionDelay(delay: number): void {
    if (delay < 0 || delay > 2000) {
      throw new Error('Transition delay must be between 0 and 2000ms');
    }
    this.transitionDelay = delay;
  }

  getTransitionDelay(): number {
    return this.transitionDelay;
  }

  // Force immediate state-to-animation mapping without delay
  forceImmediateTransition(state: KiroState): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    
    const animationPattern = this.mapStateToAnimationPattern(state);
    this.animationController.startAnimation(animationPattern);
  }

  dispose(): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = 0;
    }
  }
}

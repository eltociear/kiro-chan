// Core enums
export enum KiroState {
  IDLE = 'idle',
  EXECUTING = 'executing',
  ERROR = 'error'
}

export enum AnimationPattern {
  IDLE = 'idle',
  ACTIVE = 'active',
  ERROR = 'error'
}

// Core interfaces
export interface IStatusBarCharacter {
  initialize(): Promise<void>;
  show(): void;
  hide(): void;
  updateState(state: KiroState): void;
  dispose(): void;
}

export interface IAnimationController {
  startAnimation(pattern: AnimationPattern): void;
  stopAnimation(): void;
  setAnimationSpeed(speed: number): void;
  getCurrentPattern(): AnimationPattern;
}

export interface IStateMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  getCurrentState(): KiroState;
  onStateChange(callback: (state: KiroState) => void): void;
}

export interface ISettingsManager {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  getAnimationSpeed(): number;
  setAnimationSpeed(speed: number): void;
  loadSettings(): Promise<void>;
  saveSettings(): Promise<void>;
}

export interface IPerformanceOptimizer {
  shouldReduceAnimation(): boolean;
  getOptimalFrameRate(): number;
  monitorPerformance(): void;
  adjustPerformance(): void;
}

// Data models
export interface CharacterSettings {
  enabled: boolean;
  animationSpeed: number;
  position: 'left' | 'right';
  backgroundColor: string;
}

export interface CharacterState {
  isVisible: boolean;
  currentAnimation: AnimationPattern;
  position: {
    x: number;
    y: number;
  };
  animationSpeed: number;
  lastUpdate: number;
}

export interface AnimationFrame {
  character: string;
  transform: {
    translateX: number;
    translateY: number;
    rotate: number;
    scale: number;
  };
  duration: number;
}

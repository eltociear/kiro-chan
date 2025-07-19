# Design Document

## Overview

Kiroステータスバー常駐キャラクター拡張機能は、ユーザーにKiroの動作状態を視覚的に伝える軽量なアニメーション機能です。👻キャラクターがステータスバーに表示され、Kiroの状態に応じて異なる動きパターンを実行します。

## Architecture

### 全体アーキテクチャ

```
┌─────────────────────────────────────┐
│           Kiro Extension            │
├─────────────────────────────────────┤
│  StatusBarCharacter (Main Module)  │
├─────────────────────────────────────┤
│  ┌─────────────┐ ┌───────────────┐  │
│  │ Animation   │ │ State Monitor │  │
│  │ Controller  │ │               │  │
│  └─────────────┘ └───────────────┘  │
├─────────────────────────────────────┤
│  ┌─────────────┐ ┌───────────────┐  │
│  │ Settings    │ │ Performance   │  │
│  │ Manager     │ │ Optimizer     │  │
│  └─────────────┘ └───────────────┘  │
└─────────────────────────────────────┘
```

### コンポーネント間の関係

- **StatusBarCharacter**: メインコントローラー、他のコンポーネントを統合
- **AnimationController**: キャラクターのアニメーション制御
- **StateMonitor**: Kiroの状態変化を監視
- **SettingsManager**: ユーザー設定の管理
- **PerformanceOptimizer**: リソース使用量の最適化

## Components and Interfaces

### 1. StatusBarCharacter (メインクラス)

```typescript
interface IStatusBarCharacter {
  initialize(): Promise<void>;
  show(): void;
  hide(): void;
  updateState(state: KiroState): void;
  dispose(): void;
}

class StatusBarCharacter implements IStatusBarCharacter {
  private element: HTMLElement;
  private animationController: AnimationController;
  private stateMonitor: StateMonitor;
  private settingsManager: SettingsManager;
  private performanceOptimizer: PerformanceOptimizer;
}
```

### 2. AnimationController

```typescript
interface IAnimationController {
  startAnimation(pattern: AnimationPattern): void;
  stopAnimation(): void;
  setAnimationSpeed(speed: number): void;
  getCurrentPattern(): AnimationPattern;
}

enum AnimationPattern {
  IDLE = 'idle',
  ACTIVE = 'active',
  ERROR = 'error'
}

class AnimationController implements IAnimationController {
  private animationFrame: number;
  private currentPattern: AnimationPattern;
  private animationSpeed: number;
}
```

### 3. StateMonitor

```typescript
interface IStateMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  getCurrentState(): KiroState;
  onStateChange(callback: (state: KiroState) => void): void;
}

enum KiroState {
  IDLE = 'idle',
  EXECUTING = 'executing',
  ERROR = 'error'
}

class StateMonitor implements IStateMonitor {
  private stateChangeCallbacks: Array<(state: KiroState) => void>;
  private currentState: KiroState;
}
```

### 4. SettingsManager

```typescript
interface ISettingsManager {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  getAnimationSpeed(): number;
  setAnimationSpeed(speed: number): void;
  loadSettings(): Promise<void>;
  saveSettings(): Promise<void>;
}

interface CharacterSettings {
  enabled: boolean;
  animationSpeed: number;
  position: 'left' | 'right';
}
```

### 5. PerformanceOptimizer

```typescript
interface IPerformanceOptimizer {
  shouldReduceAnimation(): boolean;
  getOptimalFrameRate(): number;
  monitorPerformance(): void;
  adjustPerformance(): void;
}

class PerformanceOptimizer implements IPerformanceOptimizer {
  private cpuUsageThreshold: number = 80;
  private memoryUsageThreshold: number = 500; // MB
  private currentFrameRate: number = 60;
}
```

## Data Models

### CharacterState

```typescript
interface CharacterState {
  isVisible: boolean;
  currentAnimation: AnimationPattern;
  position: {
    x: number;
    y: number;
  };
  animationSpeed: number;
  lastUpdate: number;
}
```

### AnimationFrame

```typescript
interface AnimationFrame {
  character: string; // 👻 or variations
  transform: {
    translateX: number;
    translateY: number;
    rotate: number;
    scale: number;
  };
  duration: number;
}
```

## Error Handling

### エラー分類と対応

1. **初期化エラー**
   - ステータスバーアクセス失敗
   - 設定読み込み失敗
   - 対応: フォールバック設定で継続、ログ記録

2. **アニメーションエラー**
   - requestAnimationFrame失敗
   - DOM操作エラー
   - 対応: アニメーション停止、静的表示に切り替え

3. **パフォーマンスエラー**
   - メモリリーク検出
   - CPU使用率過多
   - 対応: アニメーション頻度自動調整、一時停止

4. **設定エラー**
   - 設定保存/読み込み失敗
   - 不正な設定値
   - 対応: デフォルト設定使用、ユーザー通知

### エラーハンドリング戦略

```typescript
class ErrorHandler {
  static handleError(error: Error, context: string): void {
    console.error(`[StatusBarCharacter] ${context}:`, error);
    
    switch (context) {
      case 'animation':
        this.fallbackToStaticDisplay();
        break;
      case 'performance':
        this.reduceAnimationComplexity();
        break;
      case 'settings':
        this.useDefaultSettings();
        break;
    }
  }
}
```

## Testing Strategy

### 1. ユニットテスト

- **AnimationController**: アニメーションパターンの切り替え、フレームレート制御
- **StateMonitor**: 状態変化の検出、コールバック実行
- **SettingsManager**: 設定の保存/読み込み、バリデーション
- **PerformanceOptimizer**: パフォーマンス監視、自動調整

### 2. 統合テスト

- **拡張機能の初期化**: 全コンポーネントの正常な起動
- **状態変化の連携**: Kiro状態変化からアニメーション変更まで
- **設定変更の反映**: ユーザー設定変更の即座反映

### 3. パフォーマンステスト

- **リソース使用量**: CPU、メモリ使用量の測定
- **長時間動作**: メモリリークの検出
- **負荷テスト**: 高負荷時のアニメーション品質

### 4. ユーザビリティテスト

- **視認性**: 異なる画面サイズでの表示確認
- **邪魔にならない**: 他のUI要素との干渉チェック
- **設定の使いやすさ**: 設定変更の直感性

### テスト実装例

```typescript
describe('AnimationController', () => {
  test('should change animation pattern correctly', () => {
    const controller = new AnimationController();
    controller.startAnimation(AnimationPattern.ACTIVE);
    expect(controller.getCurrentPattern()).toBe(AnimationPattern.ACTIVE);
  });

  test('should respect performance constraints', () => {
    const controller = new AnimationController();
    const optimizer = new PerformanceOptimizer();
    
    // High CPU usage simulation
    optimizer.adjustPerformance();
    expect(controller.getFrameRate()).toBeLessThan(60);
  });
});
```

## Implementation Notes

### CSS アニメーション実装

```css
.kiro-character {
  position: relative;
  display: inline-block;
  font-size: 16px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(2deg); }
}

.kiro-character.active {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-5px) scale(1.1); }
}
```

### パフォーマンス最適化

- **requestAnimationFrame**を使用した効率的なアニメーション
- **Intersection Observer**による表示領域外での処理停止
- **throttle/debounce**による状態変化イベントの制御
- **Web Workers**による重い処理の分離（必要に応じて）

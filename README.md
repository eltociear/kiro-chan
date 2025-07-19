# Kiro Status Character Extension

Kiro のステータスバーに常駐する動的キャラクター（👻）を表示する拡張機能です。このキャラクターは常に少しずつ動いており、ユーザーに Kiro が動作していることを視覚的に示し、親しみやすい体験を提供します。

## 機能

- **動的キャラクター表示**: ステータスバーに 👻 キャラクターを表示
- **状態反映アニメーション**: Kiro の状態（アイドル、実行中、エラー）に応じて異なる動きパターン
- **パフォーマンス最適化**: システムリソースに応じた自動的なアニメーション調整
- **カスタマイズ可能**: 表示/非表示、アニメーション速度、位置の設定
- **レスポンシブ対応**: 画面サイズに応じた適応的表示
- **アクセシビリティ対応**: ARIA 属性とキーボードナビゲーション

## インストール

1. プロジェクトをクローンまたはダウンロード
2. 依存関係をインストール:
   ```bash
   npm install
   ```
3. TypeScript をコンパイル:
   ```bash
   npm run build
   ```

## 使用方法

### 基本的な使用

```typescript
import { activate, deactivate } from "./src/extension";

// 拡張機能を有効化
await activate();

// 拡張機能を無効化
deactivate();
```

### 設定のカスタマイズ

```typescript
import { StatusBarCharacter } from "./src/StatusBarCharacter";

const character = new StatusBarCharacter();
await character.initialize();

// 設定UI を表示
character.showSettings();
```

### 手動での状態制御

```typescript
import { KiroState } from "./src/types";

// 状態を手動で変更
character.updateState(KiroState.EXECUTING);
character.updateState(KiroState.ERROR);
character.updateState(KiroState.IDLE);
```

## 設定オプション

| 設定項目         | 説明                      | デフォルト値 | 範囲              |
| ---------------- | ------------------------- | ------------ | ----------------- |
| `enabled`        | キャラクターの表示/非表示 | `true`       | boolean           |
| `animationSpeed` | アニメーション速度        | `1.0`        | 0.1 - 3.0         |
| `position`       | ステータスバー内の位置    | `'right'`    | 'left' \| 'right' |

## アニメーションパターン

### アイドル状態

- ゆっくりとした浮遊アニメーション
- 2 秒周期で上下に微細な動き
- 軽微な回転効果

### アクティブ状態

- エネルギッシュなバウンスアニメーション
- 1 秒周期でより活発な動き
- スケール変化による強調効果

### エラー状態

- 振動アニメーション
- ランダムな左右の動き
- 3 秒後に自動的に減衰

## パフォーマンス最適化

- **自動フレームレート調整**: システム負荷に応じて 15-60FPS で動作
- **メモリ使用量監視**: 閾値を超えた場合の自動的な複雑度削減
- **CSS フォールバック**: JavaScript アニメーションが困難な場合の CSS 代替
- **レスポンシブ制御**: 狭い画面での自動非表示

## エラーハンドリング

拡張機能は包括的なエラーハンドリングシステムを備えています：

- **初期化エラー**: フォールバック設定での継続動作
- **アニメーションエラー**: 静的表示への自動切り替え
- **パフォーマンスエラー**: 動的な品質調整
- **設定エラー**: デフォルト設定の自動適用

## 開発

### プロジェクト構造

```
src/
├── animation/          # アニメーション制御
├── error/             # エラーハンドリング
├── performance/       # パフォーマンス最適化
├── settings/          # 設定管理
├── state/            # 状態監視
├── types/            # TypeScript型定義
├── ui/               # ユーザーインターフェース
├── extension.ts      # 拡張機能エントリーポイント
└── StatusBarCharacter.ts  # メインコントローラー

styles/
└── character.css     # スタイルシート

tests/
├── unit tests        # ユニットテスト
├── integration.test.ts  # 統合テスト
└── extension.test.ts    # 拡張機能テスト
```

### スクリプト

```bash
# 開発用ビルド（ウォッチモード）
npm run watch

# プロダクションビルド
npm run build

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch
```

### テスト

プロジェクトには包括的なテストスイートが含まれています：

- **ユニットテスト**: 各コンポーネントの個別テスト
- **統合テスト**: コンポーネント間の連携テスト
- **パフォーマンステスト**: メモリ使用量と実行時間の検証
- **エラーハンドリングテスト**: 異常系の動作確認

## アーキテクチャ

### コンポーネント構成

```
StatusBarCharacter (メインコントローラー)
├── AnimationController (アニメーション制御)
├── StateMonitor (状態監視)
├── StateAnimationBridge (状態-アニメーション連携)
├── SettingsManager (設定管理)
├── PerformanceOptimizer (パフォーマンス最適化)
└── ErrorHandler (エラーハンドリング)
```

### データフロー

1. **状態検出**: StateMonitor が Kiro の状態変化を検出
2. **状態変換**: StateAnimationBridge が状態をアニメーションパターンに変換
3. **アニメーション実行**: AnimationController が DOM 要素を制御
4. **パフォーマンス監視**: PerformanceOptimizer がリソース使用量を監視
5. **自動調整**: 必要に応じてアニメーション品質を動的調整

## ブラウザサポート

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## アクセシビリティ

- ARIA ラベルとロール属性
- キーボードナビゲーション対応
- ハイコントラストモード対応
- モーション設定の尊重（`prefers-reduced-motion`）

## ライセンス

MIT License

## 貢献

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 変更履歴

### v1.0.0

- 初回リリース
- 基本的なキャラクター表示機能
- 状態反映アニメーション
- パフォーマンス最適化
- 設定 UI
- 包括的なエラーハンドリング

## サポート

問題や質問がある場合は、GitHub の Issues ページで報告してください。

## 謝辞

このプロジェクトは、開発者の生産性向上と Kiro エクスペリエンスの向上を目的として開発されました。

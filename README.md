# Kiro-Chan VS Code Extension

VS Code ステータスバーでSVGアニメーションするKiroキャラクターを表示する拡張機能です。BongoCat風のリアクティブアニメーションで、タイピング時とスタンバイ時で異なるアニメーションパターンを楽しめます。

## 機能

- **SVGアニメーション**: カスタムWOFFフォントによる高品質なSVGアイコン表示
- **リアクティブアニメーション**: タイピング検出による状態変化
- **2つのアニメーションモード**: 
  - **アクティブ状態**: タイピング時の高速アニメーション（100ms間隔）
  - **スタンバイ状態**: 待機時のゆっくりアニメーション（1500ms間隔）
- **BongoCat風実装**: Product Icons システムを使用した本格的なSVGフォント統合
- **簡単カスタマイズ**: VS Code設定からアニメーション速度や表示設定を変更可能

## アニメーションパターン

### アクティブ状態（タイピング時）
- Unicode文字: `\e900` → `\e901` → `\e902` をサイクル
- 更新間隔: 100ms（高速）
- トリガー: ドキュメントの変更検出
- 自動復帰: 2秒後にスタンバイ状態に戻る

### スタンバイ状態（待機時）
- Unicode文字: `\e903` → `\e904` をサイクル
- 更新間隔: 1500ms（ゆっくり）
- デフォルト状態: 拡張機能起動時やアイドル時

## インストール

### VSIXファイルからインストール

1. 最新の `.vsix` ファイルをダウンロード
2. VS Code で `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. ダウンロードした `.vsix` ファイルを選択

### コマンドラインからインストール

```bash
code --install-extension kiro-chan-v4.vsix
```

### 開発者向けビルド

```bash
# 依存関係のインストール
npm install

# TypeScriptビルド
npm run build

# 拡張機能パッケージ作成
npx vsce package
```

## 使用方法

### 基本操作

1. **自動起動**: VS Code起動時にステータスバー右側にKiroが表示されます
2. **アニメーション**: テキスト編集時に自動的にアクティブアニメーションに切り替わります
3. **手動制御**: ステータスバーのKiroをクリックして表示/非表示を切り替え

### コマンドパレット

- `Ctrl+Shift+P` で以下のコマンドが使用可能:
  - `Kiro Chan: Toggle Kiro Character` - 表示切り替え
  - `Kiro Chan: Set Idle State` - アイドル状態に設定
  - `Kiro Chan: Set Active State` - アクティブ状態に設定
  - `Kiro Chan: Set Error State` - エラー状態に設定
  - `Kiro Chan: Set Complete State` - 完了状態に設定

## 設定オプション

VS Code設定（`settings.json`）で以下の項目をカスタマイズできます：

```json
{
  "kiro-chan.enabled": true,
  "kiro-chan.animationSpeed": 1.0,
  "kiro-chan.notificationEnabled": true,
  "kiro-chan.soundEnabled": true,
  "kiro-chan.soundVolume": 0.5,
  "kiro-chan.useSvgIcon": true
}
```

| 設定項目 | 説明 | デフォルト値 | 範囲 |
|---------|------|-------------|------|
| `enabled` | Kiroキャラクターの表示/非表示 | `true` | boolean |
| `animationSpeed` | アニメーション速度倍率 | `1.0` | 0.1 - 3.0 |
| `notificationEnabled` | タスク完了通知の表示 | `true` | boolean |
| `soundEnabled` | 音声効果の有効/無効 | `true` | boolean |
| `soundVolume` | 音声ボリューム | `0.5` | 0.0 - 1.0 |
| `useSvgIcon` | SVGアイコンの使用（絵文字の代わり） | `true` | boolean |

## 技術仕様

### アーキテクチャ

- **Product Icons システム**: VS Code標準のアイコンシステムを使用
- **WOFFフォント**: IcoMoonで生成されたWebフォントファイル（`kiro.woff`）
- **Unicode マッピング**: 各アニメーションフレームに対応するUnicode文字
- **BongoCat実装**: テキスト変更イベントによるリアクティブアニメーション

### ファイル構成

```
kiro-chan/
├── src/
│   └── extension-bongocat-style.ts    # メイン拡張機能ロジック
├── images/
│   └── kiro_1.svg                     # オリジナルSVGファイル
├── svg-for-icomoon/                   # IcoMoon用統合SVGファイル
│   ├── kiro-idle.svg                  # \e900
│   ├── kiro-active.svg                # \e901
│   ├── kiro-error.svg                 # \e902
│   └── kiro-complete.svg              # \e903
├── svg-simplified/                    # 簡略化SVGファイル
├── kiro.woff                          # Webフォントファイル
├── package.json                       # 拡張機能設定
└── README.md
```

### Unicode文字マッピング

| 状態 | Unicode | 用途 |
|------|---------|------|
| `\e900` | kiro-idle | アクティブアニメーション1フレーム目 |
| `\e901` | kiro-active | アクティブアニメーション2フレーム目 |
| `\e902` | kiro-error | アクティブアニメーション3フレーム目 |
| `\e903` | kiro-complete | スタンバイアニメーション1フレーム目 |
| `\e904` | kiro-standby | スタンバイアニメーション2フレーム目 |

## 開発

### フォント作成ワークフロー

1. **SVG統合**: `scripts/create-unified-svgs.js` で複数パスを統合
2. **IcoMoon変換**: [IcoMoon App](https://icomoon.io/app/) でSVGをWOFFに変換
3. **Unicode設定**: 各SVGファイルに対応するUnicode文字を設定
4. **VS Code統合**: `package.json` の `contributes.icons` セクションで定義

### テスト

```bash
# TypeScriptビルド
npm run build

# 拡張機能パッケージ作成
npx vsce package

# VS Codeでのテスト
code --install-extension ./kiro-chan-v4.vsix
```

## トラブルシューティング

### SVGが表示されない場合

1. `kiro.woff` ファイルが正しく配置されているか確認
2. `package.json` の `contributes.icons` 設定を確認
3. VS Code を再起動してキャッシュをクリア

### アニメーションが動作しない場合

1. `kiro-chan.enabled` 設定が `true` になっているか確認
2. ステータスバーのKiroをクリックして手動で有効化
3. コマンドパレットから手動で状態を変更してテスト

## ライセンス

MIT License

## 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/new-feature`)
3. 変更をコミット (`git commit -m 'Add new feature'`)
4. ブランチにプッシュ (`git push origin feature/new-feature`)
5. プルリクエストを作成

## 参考

- [BongoCat for VS Code](https://github.com/kitgore/BongoCat) - アニメーション実装の参考
- [VS Code Extension API](https://code.visualstudio.com/api) - 拡張機能開発ガイド
- [VS Code Product Icons](https://code.visualstudio.com/api/extension-guides/product-icon-theme) - アイコンシステム
- [IcoMoon App](https://icomoon.io/app/) - SVGからWOFFフォント生成ツール
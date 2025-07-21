# Kiro Font Creation Guide

## 問題
VS CodeのProduct Icon SystemはWOFFフォントファイル内の実際のグリフ（文字形状）を必要とします。
単純なヘッダー情報だけでは「a Kiro」のようにUnicode文字が表示されてしまいます。

## 解決方法：外部ツールを使用してSVGをWOFFに変換

### Option 1: IcoMoon (推奨)
1. **IcoMoon App** (https://icomoon.io/app/) にアクセス
2. **Import Icons** → `images/kiro_1.svg` をアップロード
3. 4つのコピーを作成し、それぞれ異なる色に編集：
   - kiro-idle.svg (紫: #9046ff)
   - kiro-active.svg (オレンジ: #ff6b35)  
   - kiro-error.svg (赤: #ff4757)
   - kiro-complete.svg (緑: #2ed573)
4. **Generate Font** → Unicode値を設定：
   - kiro-idle: U+0061 (a)
   - kiro-active: U+0062 (b)
   - kiro-error: U+0063 (c)
   - kiro-complete: U+0064 (d)
5. **Download** → WOFF形式でダウンロード
6. `kiro.woff` として保存

### Option 2: Fontello
1. **Fontello** (https://fontello.com/) にアクセス
2. **Custom Icons** → SVGファイルをドラッグ&ドロップ
3. 各アイコンにUnicode値を割り当て
4. **Download webfont** → WOFF形式を選択

### Option 3: Font Forge (上級者向け)
1. **FontForge** をインストール
2. 新しいフォントファイルを作成
3. SVGファイルをインポートしてグリフを作成
4. WOFF形式でエクスポート

## 現在のテスト状況

### ✅ 動作確認済み
- BongoCatのフォントファイル (`kiro-test.woff`) を使用
- package.jsonの設定は正しい
- 拡張機能のロジックは正常動作
- `$(kiro-idle)`, `$(kiro-active)` 等の呼び出しは機能する

### ❌ 未解決
- Kiro用の実際のグリフデータを含むWOFFファイル

## 一時的な解決策

現在のテストバージョンはBongoCatのフォントを使用しているため、猫の絵が表示されます。
これによりシステム全体が正常に動作することを確認できます。

## 最終的な実装

1. 上記の外部ツールでKiroのWOFFフォントを作成
2. `kiro.woff` として保存
3. package.jsonで `./kiro.woff` を指定
4. 拡張機能を再パッケージ

## 代替案：複数SVGファイルアプローチ

もし単一フォントファイルが困難な場合：
1. 各状態用のSVGファイルを個別に作成
2. それぞれを個別のWOFFフォントに変換
3. package.jsonで異なるfontPathを指定

## ファイル構成

```
kiro-chan/
├── kiro.woff           # 最終的なKiroフォントファイル
├── kiro-test.woff      # テスト用（BongoCat）
├── images/
│   └── kiro_1.svg      # 元のSVGファイル
└── package.json        # アイコン定義
```

## 検証方法

1. 拡張機能をインストール
2. ステータスバーを確認
3. 「a Kiro」ではなく実際の画像が表示されることを確認
4. テキスト入力時にアニメーション変化を確認
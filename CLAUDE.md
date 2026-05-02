# れんめも（RENMEMO）- 楽器練習記録アプリ

## 🎯 プロジェクト概要

吹奏楽・バンドなど楽器を趣味にしている人向けの練習記録Webアプリ。
練習曲や教本を登録し、練習内容・時間の記録、カレンダー管理、チューナー・メトロノーム機能を提供する。

## 🛠 技術スタック

- **フロントエンド**: React (Vite)
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase（認証・データ永続化）
- **デプロイ**: Vercel
- **チューナー**: Web Audio API（ブラウザネイティブ）
- **メトロノーム**: Web Audio API（ブラウザネイティブ）

## 📁 ディレクトリ構成

```
renmemo/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.jsx      # 未認証リダイレクト
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── Layout.jsx
│   │   ├── pieces/          # 曲・教本管理
│   │   │   ├── PieceCard.jsx
│   │   │   └── PieceForm.jsx
│   │   ├── records/         # 練習記録
│   │   │   ├── RecordForm.jsx
│   │   │   └── RecordItem.jsx
│   │   ├── calendar/        # カレンダー
│   │   │   ├── CalendarView.jsx   # カスタムカレンダーグリッド
│   │   │   ├── EventBadge.jsx
│   │   │   └── EventForm.jsx
│   │   ├── tuner/           # チューナー
│   │   │   └── Tuner.jsx
│   │   ├── metronome/       # メトロノーム
│   │   │   └── Metronome.jsx
│   │   └── ui/              # 共通UIコンポーネント
│   │       ├── Modal.jsx
│   │       └── Badge.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx        # 認証状態管理（signIn/signUp/signOut）
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── PiecesPage.jsx
│   │   ├── RecordsPage.jsx
│   │   ├── CalendarPage.jsx
│   │   └── ToolsPage.jsx    # チューナー・メトロノーム（ピル型タブ切り替え）
│   ├── hooks/
│   │   ├── usePieces.js
│   │   ├── useRecords.js
│   │   └── useEvents.js
│   ├── lib/
│   │   └── supabase.js      # Supabaseクライアント初期化
│   ├── App.jsx
│   └── main.jsx
├── .env.local               # SUPABASE_URLとSUPABASE_ANON_KEY
├── CLAUDE.md                # このファイル
└── package.json
```

## 🗄 データベース設計（Supabase）

### テーブル一覧

#### `pieces`（曲・教本）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | auth.users FK |
| title | text | 曲名・教本名 |
| type | text | `'piece'` or `'textbook'` |
| composer | text | 作曲者（任意） |
| image_url | text | 画像URL（任意） |
| external_url | text | YouTube・Amazon URLなど（任意） |
| memo | text | メモ（任意） |
| is_active | boolean | 練習中かどうか |
| created_at | timestamp | |

#### `records`（練習記録）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | auth.users FK |
| piece_id | uuid | pieces FK（任意） |
| date | date | 練習日 |
| duration_minutes | int | 練習時間（分） |
| memo | text | 練習内容メモ |
| created_at | timestamp | |

#### `events`（演奏会・イベント）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | auth.users FK |
| title | text | イベント名 |
| date | date | 開催日 |
| type | text | `'concert'` `'rehearsal'` `'other'` |
| memo | text | メモ（任意） |
| created_at | timestamp | |

## 📱 画面構成

### 1. ホーム（`/`）
- 今日の練習サマリー
- 直近のイベントと「本番まであとN日」表示
- 最近の練習記録（直近3件）

### 2. 曲・教本管理（`/pieces`）
- 登録済みの曲・教本一覧（カード表示）
- 追加・編集・削除
- フォーム項目：タイトル、種別、作曲者、画像URL、外部URL、メモ

### 3. 練習記録（`/records`）
- 記録一覧（日付順）
- 追加・編集・削除
- フォーム項目：日付、曲・教本の紐づけ（任意）、練習時間、メモ

### 4. カレンダー（`/calendar`）
- カスタム月表示グリッド（react-calendar 不使用）
- 各日セルに練習時間バー・イベント名を直接表示
- 月ナビゲーション（前後ボタン＋今日に戻る）
- 日付クリックで当日の記録・イベントをスケジュール帳風に表示
- イベントの追加・編集・削除

### 5. ツール（`/tools`）
- チューナーとメトロノームをタブ切り替え

#### チューナー仕様
- マイク入力（`getUserMedia`）で音高検出（自己相関法）
- EMA（指数移動平均）で周波数・セント値をスムージング（ちらつき防止）
- 音名安定化: 同じ音名がSTABLE_FRAMES連続したときのみ表示切替
- A4基準ピッチを選択可能（440Hz〜444Hz）
- 音名・周波数・セントずれを表示
- グラデーション弧＋針のSVGメーター（ダークテーマ）

#### メトロノーム仕様
- lookaheadスケジューラーで正確なタイミング制御（UIスレッドのジッターを回避）
- BPM設定（40〜240、スライダー＋数値入力＋長押し対応±ボタン）
- 拍子設定（2/4, 3/4, 4/4, 6/8）
- 強拍・弱拍で音量・周波数・ビジュアルを変化
- タップテンポ機能（直近4タップの平均）
- テンポ名リアルタイム表示（Largo / Andante / Allegro 等）

## 🔐 認証

- Supabase Authのメール＆パスワード認証を使用
- 未ログインの場合はログイン画面にリダイレクト
- Row Level Security（RLS）でuser_idが一致するデータのみ取得・更新可能にする

## 🎨 デザイン方針

- **カラーテーマ**: 落ち着いた音楽系の配色（例：ディープパープル〜インディゴ系 + アクセントにゴールド）
- **フォント**: 日本語対応のものを使用（Noto Sans JP など）
- **レスポンシブ**: スマホ・タブレットファーストで設計
- **ボトムナビゲーション**: スマホ表示時はiOSアプリ風のボトムナビ

## ✅ 実装の優先順位

### Phase 1（MVP）✅ 完了
1. Supabase接続・認証
2. 曲・教本のCRUD
3. 練習記録のCRUD
4. カレンダー表示（記録の可視化）

### Phase 2 ✅ 完了
5. イベント管理・カウントダウン表示
6. チューナー実装
7. メトロノーム実装

### Phase 3（将来）
8. 練習時間グラフ（週・月単位）
9. 目標設定・達成率表示
10. データエクスポート（CSV等）

## 💡 実装上の注意事項

- チューナーはHTTPS環境でないとマイクアクセスができないため、開発時はlocalhostを使用する（localhostはHTTPS扱い）
- Supabaseの`.env.local`は`.gitignore`に必ず追加する
- メトロノームはlookaheadスケジューラー（`setInterval` + Web Audio API）で実装済みのためWebWorker不要
- カレンダーはカスタム実装（react-calendar 未使用）。CalendarView.jsx が月グリッドを担当
- チューナーのスムージング定数（`FREQ_ALPHA`, `CENTS_ALPHA`, `STABLE_FRAMES`）はTuner.jsx上部で調整可能

## 🚀 ローカル開発の始め方

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev

# .env.localに以下を設定
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

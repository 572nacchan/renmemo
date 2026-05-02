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
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── Layout.jsx
│   │   ├── pieces/          # 曲・教本管理
│   │   │   ├── PieceCard.jsx
│   │   │   ├── PieceForm.jsx
│   │   │   └── PieceList.jsx
│   │   ├── records/         # 練習記録
│   │   │   ├── RecordForm.jsx
│   │   │   ├── RecordItem.jsx
│   │   │   └── RecordList.jsx
│   │   ├── calendar/        # カレンダー
│   │   │   ├── CalendarView.jsx
│   │   │   └── EventBadge.jsx
│   │   ├── tuner/           # チューナー
│   │   │   └── Tuner.jsx
│   │   ├── metronome/       # メトロノーム
│   │   │   └── Metronome.jsx
│   │   └── ui/              # 共通UIコンポーネント
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       └── Badge.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── PiecesPage.jsx
│   │   ├── RecordsPage.jsx
│   │   ├── CalendarPage.jsx
│   │   └── ToolsPage.jsx    # チューナー・メトロノーム
│   ├── hooks/
│   │   ├── usePieces.js
│   │   ├── useRecords.js
│   │   └── useAudio.js
│   ├── lib/
│   │   ├── supabase.js      # Supabaseクライアント初期化
│   │   └── utils.js
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
- 月表示カレンダー
- 練習記録のある日に色マーカー
- 演奏会・イベントのある日にバッジ表示
- 日付クリックで当日の記録・イベント表示

### 5. ツール（`/tools`）
- チューナーとメトロノームをタブ切り替え

#### チューナー仕様
- マイク入力（`getUserMedia`）で音高検出
- A4基準ピッチを選択可能（440Hz / 441Hz / 442Hz / 443Hz / 444Hz）
- 現在の音名と周波数を表示
- セント単位のズレを針メーター（ゲージUI）で表示

#### メトロノーム仕様
- BPM設定（40〜240、スライダー＋数値入力）
- 拍子設定（2/4, 3/4, 4/4, 6/8 など）
- 強拍・弱拍で音を変える
- タップテンポ機能

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

### Phase 1（MVP）
1. Supabase接続・認証
2. 曲・教本のCRUD
3. 練習記録のCRUD
4. カレンダー表示（記録の可視化）

### Phase 2
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
- 音声処理（チューナー・メトロノーム）はWebWorkerの使用を検討する（UIスレッドのブロックを避けるため）
- カレンダーライブラリは`react-calendar`または`@fullcalendar/react`を推奨

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

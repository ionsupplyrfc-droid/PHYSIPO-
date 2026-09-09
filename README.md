# フィジポッ（Physipo）

回復期病院に勤務する理学療法士向けのセッション記録・検索アプリです。日々の患者対応（カルテ内容）を整理・蓄積し、後から似た症例やアプローチを検索・参照できます。

詳しい仕様は [`docs/要件定義書_physipo_v1.0.md`](./docs/要件定義書_physipo_v1.0.md) を参照してください。

## 画面一覧

| 画面 | パス | 概要 |
|---|---|---|
| S1 ログイン | `/login` | 合言葉のみによるログイン（本人専用のため氏名選択なし） |
| S2 セッション入力 | `/input` | 疾患区分別のセッション記録入力（スマホ最適化） |
| S3 閲覧・検索 | `/search` | 症例の一覧・検索・展開表示、テンプレート保存 |
| S4 編集専用 | `/edit` | 過去セッションの編集・削除（PC・タブレット専用） |
| S5 テンプレート管理 | `/templates` | テンプレートの一覧・命名変更・削除（PC・タブレット専用） |

## 技術スタック

- Frontend: Next.js（App Router）/ TypeScript / Tailwind CSS
- Backend: Neon（Serverless Postgres）
- Hosting: Vercel
- 認証: 合言葉＋署名付きセッションCookieによる簡易認証（Day1〜Day3暫定構成。Day4でNeon Auth・RLSへ改修予定）

## ディレクトリ構成

```
app/                 画面・APIルート（Next.js App Router）
  login/             S1 ログイン画面
  input/             S2 セッション入力画面
  search/            S3 閲覧・検索画面
  edit/              S4 編集専用画面
  templates/         S5 テンプレート管理画面
  api/               サーバー側API（認証・症例・セッション・タグ・テンプレート等）
components/          画面を構成するReactコンポーネント
lib/                 DB接続・認証・セッション署名・共通定数などのサーバー側ロジック
db/
  schema.sql         テーブル定義（Neonへ流し込むSQL）
  seed.sql           初期ユーザー投入SQL
docs/                要件定義書
```

## デプロイ

デプロイ手順は [`DEPLOYMENT.md`](./DEPLOYMENT.md) を参照してください（超初心者向けに手順を記載しています）。

## 動作確認

動作確認手順は [`VERIFICATION.md`](./VERIFICATION.md) を参照してください。

## 環境変数（すべてVercelのサーバー専用環境変数として設定）

| 変数名 | 用途 |
|---|---|
| `DATABASE_URL` | Neonへの接続情報（Vercel連携で設定） |
| `APP_SHARED_PASSWORD` | 全員共通の合言葉 |
| `SESSION_SECRET` | セッションCookie署名用のランダムな文字列 |

`.env.local` は使用しません。環境変数はVercel上でのみ管理してください。

## 注意事項（Day1時点の暫定構成）

- 現時点ではNeon AuthやRLSは導入していません。データの絞り込みはアプリ側（サーバー側）でuser_idにより行っています。
- 本人専用アプリのためログイン画面に氏名選択はなく、合言葉が正しければ登録済みの利用者（role: player）で自動的にログインします。それでも個人情報・健康情報などの機微なデータは登録しないでください。

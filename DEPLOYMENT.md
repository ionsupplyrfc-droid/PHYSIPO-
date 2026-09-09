# デプロイ手順書（DEPLOYMENT.md）

この手順書は、パソコンの操作にあまり詳しくない方でも迷わず進められるように、画面ごとの操作を丁寧に説明しています。ターミナル（黒い画面）やコマンド入力は一切使いません。すべてブラウザの画面操作だけで完了します。

大まかな流れは次のとおりです。

1. Neon（データベース）でプロジェクトを作る
2. Neonにテーブルを作る（GitHub上のSQLファイルを使う）
3. Vercel（ホスティング）でプロジェクトを作り、GitHubリポジトリを取り込む
4. Neonの接続情報をVercelに設定する
5. 合言葉とセッション用の文字列をVercelに設定する
6. デプロイ（公開）する

---

## 1. Neonプロジェクトの作成

1. ブラウザで [https://neon.tech](https://neon.tech) を開き、GitHubアカウントでログインします。
2. 「New Project（新規プロジェクト作成）」ボタンを押します。
3. 以下のように設定します。
   - **Project name**：`physipo` など分かりやすい名前
   - **Region**：利用者に近いリージョン（日本国内利用が中心なら `AWS Asia Pacific (Tokyo)` など、東京リージョンがあればそれを選択。なければ利用者に近い他のリージョンで構いません）
   - **Postgres version**：初期設定のままでOK
   - **Neon Auth**：Day1では有効化しません。Neon Authを有効化する項目が表示されても、チェックを入れずに進めてください（Day4で本格導入予定のため）。
4. 「Create Project」を押すとプロジェクトが作成されます。

## 2. テーブルの作成（db/schema.sql・db/seed.sql の実行）

このアプリのテーブル定義は、GitHubリポジトリの `db/schema.sql` に、初期ユーザーは `db/seed.sql` にまとめてあります。

### 2-1. GitHub上でファイルの中身を確認する手順

1. ブラウザでこのリポジトリ（`ionsupplyrfc-droid/PHYSIPO-`）を開きます。
2. リポジトリ画面の中央あたりにあるファイル一覧から `db` フォルダをクリックします。
3. `schema.sql` をクリックすると中身が表示されます。右上あたりの「Raw」ボタンを押すと、コピーしやすいテキストだけの画面になります。
4. 表示された内容を全選択してコピーします（`Ctrl+A` → `Ctrl+C`、Macは `Cmd+A` → `Cmd+C`）。
5. 同様に `seed.sql` の中身も確認します。

### 2-2. NeonのSQL Editorで実行する手順

1. Neonのプロジェクト画面に戻り、左側のメニューから「SQL Editor」を開きます。
2. 先ほどコピーした `schema.sql` の内容を貼り付け、「Run」ボタンを押します。テーブルが作成されます。
3. 続けて `seed.sql` の内容も貼り付けて「Run」を押します。本人専用の利用者（1名）が登録されます。

## 3. Vercelプロジェクトの作成（GitHubリポジトリのインポート）

1. ブラウザで [https://vercel.com](https://vercel.com) を開き、GitHubアカウントでログインします。
2. 「Add New...」→「Project」を選びます。
3. 「Import Git Repository」の一覧から、このリポジトリ（`ionsupplyrfc-droid/PHYSIPO-`）を探して「Import」を押します。
4. Framework Presetは自動的に「Next.js」と認識されます。特に変更は不要です。

## 4. 環境変数の設定

インポート画面（またはプロジェクト作成後の「Settings」→「Environment Variables」画面）で、以下の3つを設定します。**すべて「値を公開しない」サーバー専用の変数として設定してください（`NEXT_PUBLIC_` は付けません）。**

### 4-1. DATABASE_URL（Neonの接続情報）

1. Neonのプロジェクト画面に戻り、「Connection Details」または「Dashboard」を開きます。
2. 「Connection string」という項目に表示されている文字列（`postgresql://...` から始まるもの）をコピーします。
3. Vercelの環境変数設定画面で、
   - Key：`DATABASE_URL`
   - Value：コピーした接続文字列
   を入力し、「Add」を押します。

### 4-2. APP_SHARED_PASSWORD（全員共通の合言葉）

- Key：`APP_SHARED_PASSWORD`
- Value：ログイン時に使う合言葉を自由に決めて入力してください。

### 4-3. SESSION_SECRET（ログイン状態を守るための文字列）

- Key：`SESSION_SECRET`
- Value：AIエージェント（Claude Code）が実装完了時にチャット上に生成・表示した文字列をそのままコピーして貼り付けてください。openssl等のコマンドをターミナルで実行する必要はありません。

3つとも入力できたら「Deploy」ボタンを押します。

## 5. デプロイの実行と確認

1. 「Deploy」を押すとビルドが始まります。数分待つと完了します。
2. 完了後に表示されるURL（`https://xxxxx.vercel.app` のような形式）を開き、ログイン画面が表示されることを確認します。
3. ログイン画面には合言葉の入力欄のみが表示されます。設定した合言葉を入力してログインできることを確認します（本人専用アプリのため氏名選択はありません）。

## 6. 以後の更新について

- GitHubの`main`ブランチに変更がpushされると、Vercelが自動的に再デプロイします。
- 環境変数を変更した場合は、Vercelの「Deployments」画面から再デプロイ（Redeploy）を行ってください。

## 困ったときは

- ログインできない：`APP_SHARED_PASSWORD` の設定値と、入力した合言葉が一致しているか確認してください。
- データが表示されない・エラーになる：`DATABASE_URL` が正しくコピーされているか、Neon側でテーブル作成（`schema.sql`）が完了しているか確認してください。
- デプロイが失敗する：Vercelの「Deployments」画面からビルドログを開き、エラーメッセージを確認してください。

# Netlifyへのデプロイガイド

このアプリケーションは **Next.js** と **Prisma (SQLite)** を使用しています。
Netlifyなどのサーバーレス環境にデプロイする場合、ローカルのSQLiteファイル（`dev.db`）は使用できません。
そのため、クラウド上のSQLiteデータベースである **Turso** を使用するのが最も簡単でおすすめです。

すでにプロジェクトは **Turso (LibSQL)** に対応するように構成されています。以下の手順でデプロイを行ってください。

## 1. Turso (データベース) のセットアップ

1. [Turso](https://turso.tech/) にサインアップし、CLIをインストールします。
   ```bash
   brew install tursodatabase/tap/turso
   turso auth signup
   ```
2. データベースを作成します。
   ```bash
   turso db create diagnostic-saas
   ```
3. 接続URLを取得します。
   ```bash
   turso db show diagnostic-saas --url
   # 例: libsql://diagnostic-saas-username.turso.io
   ```
4. 認証トークンを作成します。
   ```bash
   turso db tokens create diagnostic-saas
   # 長い文字列が表示されます
   ```
5. 取得したURLとトークンをメモしておきます。

## 2. GitHubへのプッシュ

まだリポジトリがない場合は作成し、コードをプッシュしてください。

## 3. Netlifyへのデプロイ

1. [Netlify](https://www.netlify.com/) にログインし、「Add new site」 -> 「Import an existing project」を選択します。
2. GitHubを選択し、このリポジトリを選びます。
3. **Build settings** は以下の通りであることを確認します（通常は自動検出されます）。
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` 

4. **Environment variables (環境変数)** を設定します。これが最重要です。

| 変数名 | 値の例/説明 |
| :--- | :--- |
| `TURSO_DATABASE_URL` | 手順1-3で取得したURL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | 手順1-4で取得したトークン |
| `AUTH_SECRET` | 任意のランダムな文字列（`openssl rand -base64 32`などで生成） |
| `AUTH_TURSO_KEY` | *(不要)* Prismaアダプターを使用しているため不要 |
| `GOOGLE_GEMINI_API_KEY` | 取得済みのGemini APIキー |
| `RESEND_API_KEY` | 取得済みのResend APIキー |
| `EMAIL_FROM` | `onboarding@resend.dev` または確認済みドメイン |
| `NEXT_PUBLIC_APP_URL` | NetlifyのURL (例: `https://your-site.netlify.app`) |

5. 「Deploy site」をクリックします。

## 4. デプロイ後のDBセットアップ（重要）

デプロイした後、クラウド上のデータベース（Turso）に対してテーブルを作成する必要があります。
ローカルのターミナルから以下のコマンドを実行してください。

```bash
# 環境変数を指定して、本番DBに対してマイグレーションを実行
TURSO_DATABASE_URL="libsql://your-db-url" TURSO_AUTH_TOKEN="your-token" npx prisma migrate deploy
```

これで完了です！NetlifyのURLにアクセスして動作を確認してください。

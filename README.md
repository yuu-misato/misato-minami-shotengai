# 三郷駅南商店会

JR三郷駅南口の商店会ポータルサイト。トップページ、加盟店紹介、商店会についての3ページで構成。

## 構成

- `public/index.html` — トップページ（お知らせ、加盟店ピックアップ、アクセス）
- `public/shops.html` — 加盟店紹介（カテゴリ絞り込み・検索付き）
- `public/about.html` — 商店会について
- `public/style.css` — 共通スタイル
- `public/app.js` — 共通スクリプト（ナビゲーション、店舗一覧描画）
- `public/shops-data.js` — サンプル加盟店データ（Supabase未設定時のフォールバック）
- `functions/api/shops.js` — `/api/shops` エンドポイント（Supabaseが設定されていれば本番データを返す）

## 技術スタック

- Cloudflare Pages（ホスティング）
- Cloudflare Pages Functions（API）
- Supabase（DB・認証）任意

## セットアップ

```bash
npm install
cp .dev.vars.example .dev.vars  # Supabase認証情報を設定（任意）
npm run dev
```

Supabase未設定でもサンプルデータで動作します。

## デプロイ

### Cloudflare Pages (GitHub連携)

推奨。Cloudflareダッシュボードで一度接続すれば、`main`へのpushで自動デプロイされます。

1. Cloudflareダッシュボード → Workers & Pages → Create application → Pages → **Connect to Git**
2. このリポジトリ (`misato-minami-shotengai`) を選択
3. ビルド設定:
   - Production branch: `main`
   - Build command: （空欄でOK。静的サイト）
   - Build output directory: `public`
   - Root directory: `/`
4. （任意）Environment variables に `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定すると、`functions/api/shops.js` が実DBから取得します。未設定でもサンプルデータで動作します。
5. Save and Deploy

`functions/` 配下のPages Functionsは自動的に検出され、`/api/*` のエンドポイントとして動作します。

### CLIから手動デプロイ

```bash
npm run deploy
```

事前に `npx wrangler login` が必要です。

## Supabaseスキーマ（参考）

```sql
create table public.shops (
  id text primary key,
  name text not null,
  category text not null,         -- 飲食 / 物販 / サービス
  subcategory text,
  description text,
  address text,
  phone text,
  hours text,
  image_url text,
  featured boolean default false,
  is_published boolean default true,
  sort_order int default 999,
  created_at timestamptz default now()
);
```

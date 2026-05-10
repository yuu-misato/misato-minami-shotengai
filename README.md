# 三郷駅南商店街

JR三郷駅南口の商店街ポータルサイト。

## 技術スタック

- Cloudflare Pages（ホスティング）
- Supabase（DB・認証）

## セットアップ

```bash
npm install
cp .dev.vars.example .dev.vars  # Supabase認証情報を設定
npm run dev
```

## デプロイ

```bash
npm run deploy
```

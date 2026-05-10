// GET /api/shops
// Cloudflare Pages Function: Supabaseが設定されていれば加盟店データを返す。
// 未設定または取得失敗時は空配列を返し、フロント側のサンプルデータにフォールバックさせる。
export async function onRequestGet({ env }) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;

  const json = (data, init = {}) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        ...(init.headers || {}),
      },
    });

  if (!url || !key || url.includes('xxxxx')) {
    return json({ shops: [], source: 'unconfigured' });
  }

  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/shops?select=*&is_published=eq.true&order=sort_order.asc`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      return json({ shops: [], source: 'error', status: res.status });
    }
    const shops = await res.json();
    return json({ shops, source: 'supabase' });
  } catch (err) {
    return json({ shops: [], source: 'error', message: String(err) }, { status: 200 });
  }
}

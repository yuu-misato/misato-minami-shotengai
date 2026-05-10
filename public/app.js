import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = '__SUPABASE_URL__'
const supabaseKey = '__SUPABASE_ANON_KEY__'
const supabase = createClient(supabaseUrl, supabaseKey)

async function loadShops() {
  const container = document.getElementById('shops')
  const { data: shops, error } = await supabase
    .from('shops')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')

  if (error) {
    container.innerHTML = '<p>店舗情報を読み込めませんでした。</p>'
    return
  }

  if (!shops?.length) {
    container.innerHTML = '<p>現在、登録店舗はありません。</p>'
    return
  }

  container.innerHTML = shops.map(shop => `
    <article class="shop-card">
      ${shop.image_url ? `<img src="${shop.image_url}" alt="${shop.name}">` : ''}
      <div class="info">
        <h2>${shop.name}</h2>
        <p>${shop.description || ''}</p>
      </div>
    </article>
  `).join('')
}

loadShops()

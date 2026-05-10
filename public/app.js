import { SAMPLE_SHOPS } from '/shops-data.js';

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (s) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[s]));

const CATEGORY_SLUG = {
  '飲食店': 'food',
  '医療・治療': 'medical',
  '福祉・カルチャー': 'welfare',
};
const SLUG_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_SLUG).map(([k, v]) => [v, k])
);

const categoryClass = (cat) => CATEGORY_SLUG[cat] || 'other';

function shopCard(shop) {
  const initial = shop.name.slice(0, 1);
  const slug = categoryClass(shop.category);
  return `
    <article class="shop-card" data-category="${escapeHtml(shop.category)}" data-name="${escapeHtml(shop.name)}" data-keywords="${escapeHtml(shop.subcategory || '')} ${escapeHtml(shop.description || '')}">
      <div class="shop-card__visual shop-card__visual--${slug}" aria-hidden="true">
        <span class="shop-card__initial">${escapeHtml(initial)}</span>
      </div>
      <div class="shop-card__body">
        <div class="shop-card__head">
          <h3 class="shop-card__name">${escapeHtml(shop.name)}</h3>
          <span class="shop-card__category shop-card__category--${slug}">${escapeHtml(shop.category)}</span>
        </div>
        ${shop.subcategory ? `<p class="shop-card__subcategory">${escapeHtml(shop.subcategory)}</p>` : ''}
        ${shop.description ? `<p class="shop-card__desc">${escapeHtml(shop.description)}</p>` : ''}
        <div class="shop-card__meta">
          ${shop.address ? `
            <div class="shop-card__meta-row">
              <span class="shop-card__meta-label">所在地</span>
              <span class="shop-card__meta-value">${escapeHtml(shop.address)}</span>
            </div>` : ''}
          ${shop.phone ? `
            <div class="shop-card__meta-row">
              <span class="shop-card__meta-label">電話</span>
              <span class="shop-card__meta-value">${escapeHtml(shop.phone)}</span>
            </div>` : ''}
          ${shop.hours ? `
            <div class="shop-card__meta-row">
              <span class="shop-card__meta-label">営業</span>
              <span class="shop-card__meta-value">${escapeHtml(shop.hours)}</span>
            </div>` : ''}
        </div>
      </div>
    </article>
  `;
}

async function fetchShops() {
  try {
    const res = await fetch('/api/shops', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('api error');
    const json = await res.json();
    if (json?.source === 'supabase' && Array.isArray(json.shops)) {
      return json.shops;
    }
  } catch {
    // unconfigured / error 時のみサンプルデータへフォールバック
  }
  return SAMPLE_SHOPS;
}

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
    nav.classList.toggle('is-open', !open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'メニューを開く');
      nav.classList.remove('is-open');
    }
  });
}

async function initFeatured() {
  const container = document.getElementById('featured-shops');
  if (!container) return;
  const shops = await fetchShops();
  const featured = shops.filter((s) => s.featured).slice(0, 4);
  const list = featured.length ? featured : shops.slice(0, 4);
  container.innerHTML = list.map(shopCard).join('');
}

async function initShopsPage() {
  const container = document.getElementById('shops');
  if (!container) return;
  const countEl = document.getElementById('shops-count');
  const emptyEl = document.getElementById('shops-empty');
  const searchEl = document.getElementById('shop-search');
  const filterButtons = document.querySelectorAll('.filter-chip');

  const shops = await fetchShops();
  const sorted = [...shops].sort(
    (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
  );

  let activeCategory = 'all';
  let query = '';

  const render = () => {
    const q = query.trim().toLowerCase();
    const filtered = sorted.filter((shop) => {
      const matchesCat =
        activeCategory === 'all' || shop.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [
        shop.name,
        shop.category,
        shop.subcategory,
        shop.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    container.innerHTML = filtered.map(shopCard).join('');
    if (countEl) {
      countEl.textContent = `全${filtered.length}件 / ${sorted.length}件中`;
    }
    if (emptyEl) {
      emptyEl.hidden = filtered.length !== 0;
      emptyEl.textContent =
        sorted.length === 0
          ? '現在、登録されている加盟店はありません。'
          : '該当するお店が見つかりませんでした。検索条件を変更してお試しください。';
    }
  };

  const setActiveByCategory = (category) => {
    activeCategory = category;
    filterButtons.forEach((b) => {
      const isActive = (b.dataset.category || 'all') === category;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category || 'all';
      setActiveByCategory(cat);
      const slug = btn.dataset.slug;
      const newHash = slug && slug !== 'all' ? `#${slug}` : '';
      if (location.hash !== newHash) {
        history.replaceState(null, '', `${location.pathname}${newHash}`);
      }
      render();
    });
  });

  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      query = e.target.value || '';
      render();
    });
  }

  // 初期表示時、URLハッシュにマッチするカテゴリがあればそれを選択
  const applyHash = () => {
    const slug = location.hash.replace(/^#/, '');
    const category = SLUG_TO_CATEGORY[slug];
    if (category) {
      setActiveByCategory(category);
    } else {
      setActiveByCategory('all');
    }
    render();
  };
  applyHash();
  window.addEventListener('hashchange', applyHash);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initFeatured();
  initShopsPage();
});

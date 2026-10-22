const GEM_PACKAGES = [
  { id: 'p50', gems: 50, stars: 50 },
  { id: 'p150', gems: 150, stars: 130, tag: 'popular' },
  { id: 'p500', gems: 500, stars: 400, tag: 'best' }
];

window.renderShopScreen = function(root) {
  const state = window.app.state;
  const cards = GEM_PACKAGES.map(p => `
    <div class="shop-card ${p.tag ? 'tagged' : ''}">
      ${p.tag === 'popular' ? '<div class="shop-tag">🔥 Popular</div>' : ''}
      ${p.tag === 'best' ? '<div class="shop-tag">💎 Best value</div>' : ''}
      <div class="shop-gems">💎 ${p.gems}</div>
      <div class="shop-stars">${p.stars} ⭐</div>
      <button class="menu-btn primary" style="width:100%; padding:12px;" onclick="window.buyGems('${p.id}')">${window.t('shop_buy')}</button>
    </div>
  `).join('');

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">💎 ${state.player.gems}</span></div>
    </div>
    <h2 style="margin-bottom: 8px;">${window.t('menu_shop')}</h2>
    <p style="color:var(--text-dim); font-size:13px; margin-bottom:20px;">${window.t('shop_desc')}</p>

    <div class="shop-grid">${cards}</div>

    <p style="text-align:center; color:var(--text-dim); font-size:12px; margin-top:24px;">
      ${window.t('shop_soon')}
    </p>
  `;
};

window.buyGems = function(packageId) {
  // ЗАГЛУШКА: здесь будет вызов Telegram Stars createInvoiceLink
  // когда подключим серверную часть на Vercel
  alert(window.t('shop_soon'));
};
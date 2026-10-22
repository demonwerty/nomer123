window.renderCarChests = function(root) {
  const state = window.app.state;
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>
    <h2 style="text-align:center; margin-bottom: 20px;">${window.t('menu_cars')}</h2>
    
    <div class="chests-container">
      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'car', pool: 'rusty' })">
        <div class="chest-icon">📦</div>
        <div class="chest-info">
          <h3>${window.t('chest_rusty')}</h3>
          <p style="color:var(--common);">Common / Uncommon</p>
        </div>
        <div class="chest-price">${window.formatMoney(500)}</div>
      </div>
      
      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'car', pool: 'city' })">
        <div class="chest-icon">🎁</div>
        <div class="chest-info">
          <h3>${window.t('chest_city')}</h3>
          <p style="color:var(--rare);">Rare / Epic</p>
        </div>
        <div class="chest-price">${window.formatMoney(1500)}</div>
      </div>
      
      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'car', pool: 'elite' })">
        <div class="chest-icon">💎</div>
        <div class="chest-info">
          <h3>${window.t('chest_elite')}</h3>
          <p style="color:var(--legendary);">Legendary / Mythic</p>
        </div>
        <div class="chest-price">${window.formatMoney(5000)}</div>
      </div>
    </div>
  `;
};
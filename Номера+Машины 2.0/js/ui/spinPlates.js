window.renderPlateChests = function(root) {
  const state = window.app.state;
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>
    <h2 style="text-align:center; margin-bottom: 20px;">${window.t('menu_plates')}</h2>
    
    <div class="chests-container">
      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'plate', country: 'RU' })">
        <div class="chest-icon">🇷🇺</div>
        <div class="chest-info">
          <h3>${window.t('country_ru')}</h3>
          <p style="color:var(--text-dim);">ГОСТ + Блатные</p>
        </div>
        <div class="chest-price">${window.formatMoney(500)}</div>
      </div>
      
      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'plate', country: 'BY' })">
        <div class="chest-icon">🇧🇾</div>
        <div class="chest-info">
          <h3>${window.t('country_by')}</h3>
          <p style="color:var(--text-dim);">Формат BY</p>
        </div>
        <div class="chest-price">${window.formatMoney(500)}</div>
      </div>
      
      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'plate', country: 'KZ' })">
        <div class="chest-icon">🇰🇿</div>
        <div class="chest-info">
          <h3>${window.t('country_kz')}</h3>
          <p style="color:var(--text-dim);">Формат KZ</p>
        </div>
        <div class="chest-price">${window.formatMoney(500)}</div>
      </div>

      <div class="chest-card" onclick="window.navigate('spin_process', { type: 'plate', country: 'US' })">
        <div class="chest-icon">🇺🇸</div>
        <div class="chest-info">
          <h3>${window.t('country_us')}</h3>
          <p style="color:var(--text-dim);">US Format</p>
        </div>
        <div class="chest-price">${window.formatMoney(500)}</div>
      </div>
    </div>
  `;
};
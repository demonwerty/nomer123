window.renderSettingsScreen = function(root) {
  const s = window.app.state.settings;
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
    </div>
    <h2 style="margin-bottom: 20px;">${window.t('menu_settings')}</h2>

    <div class="settings-list">
      <div class="settings-row" onclick="window.toggleLang()">
        <span>🌐 ${window.t('settings_lang')}</span>
        <span class="settings-value">${s.lang === 'ru' ? 'Русский' : 'English'}</span>
      </div>
      <div class="settings-row" onclick="window.toggleSetting('haptic')">
        <span>📳 ${window.t('settings_haptic')}</span>
        <span class="settings-value">${s.haptic ? '✓' : '✗'}</span>
      </div>
      <div class="settings-row" onclick="window.toggleSetting('sound')">
        <span>🔊 ${window.t('settings_sound')}</span>
        <span class="settings-value">${s.sound ? '✓' : '✗'}</span>
      </div>
    </div>

    <div style="margin-top: 32px;">
      <button class="menu-btn danger" style="width: 100%;" onclick="window.resetProgress()">
        🗑️ ${window.t('settings_reset')}
      </button>
    </div>

    <p style="text-align:center; color:var(--text-dim); font-size:12px; margin-top:32px;">
      Garage Spin · ${window.t('settings_version')} 0.4
    </p>
  `;
};

window.toggleSetting = function(key) {
  const s = window.app.state.settings;
  s[key] = !s[key];
  window.saveState();
  window.navigate('settings');
  if (key === 'haptic' && s.haptic && window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
};

window.resetProgress = function() {
  if (!confirm(window.t('settings_reset_confirm'))) return;
  if (!confirm('Точно-точно? Всё сгорит.')) return;
  localStorage.removeItem('garage_spin_save_v1');
  window.location.reload();
};
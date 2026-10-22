// Реферальная система (заглушка). Код хранится в state.player.refCode.
function copyTextFallback(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

window.renderReferralScreen = function(root) {
  const state = window.app.state;
  const refCode = window.ensureRefCode();
  const friends = state.player.referralFriends || 0;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>

    <h2 class="screen-title">👥 ${window.t('referral_title')}</h2>
    <p class="screen-subtitle">${window.t('referral_subtitle')}</p>

    <div class="referral-card">
      <div class="referral-glow"></div>
      <div class="referral-card-icon">🎁</div>
      <div class="referral-label">${window.t('referral_your_code')}</div>
      <div class="ref-code-box">
        <span class="ref-code" id="ref-code">${refCode}</span>
        <button class="ref-copy-btn" onclick="window.copyRefCode()">📋 ${window.t('referral_copy')}</button>
      </div>
      <div class="referral-stats">
        <div class="referral-stat">
          <span class="referral-stat-value">${friends}</span>
          <span class="referral-stat-label">${window.t('referral_friends')}</span>
        </div>
      </div>
    </div>

    <button class="menu-btn primary referral-invite-btn" onclick="window.inviteFriend()">
      🚀 ${window.t('referral_invite')}
    </button>

    <div class="referral-reward-note">
      <span class="referral-reward-icon">🎁</span>
      <span>${window.t('referral_reward')}</span>
    </div>
    <p class="referral-soon">${window.t('referral_soon')}</p>
  `;
};

window.copyRefCode = function() {
  const code = window.ensureRefCode();
  const onSuccess = function() {
    if (window.app.state.settings?.haptic !== false && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    alert(window.t('referral_copied'));
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(onSuccess).catch(function() {
      if (copyTextFallback(code)) onSuccess();
      else alert(window.t('referral_copy_failed'));
    });
  } else {
    if (copyTextFallback(code)) onSuccess();
    else alert(window.t('referral_copy_failed'));
  }
};

window.inviteFriend = function() {
  const code = window.ensureRefCode();
  const text = window.t('referral_share_text').replace('{code}', code);
  const shareUrl = 'https://t.me/share/url?url=' +
    encodeURIComponent(window.GARAGE_SPIN_BOT_LINK) +
    '&text=' + encodeURIComponent(text);

  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
};

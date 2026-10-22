// Ежедневные квесты. Данные хранятся в state.quests (см. js/main.js).
window.QUESTS_CONFIG = [
  { id: 'spins', progressKey: 'spins', titleKey: 'quest_spins', descKey: 'quest_spins_desc', icon: '🎰', goal: 5, coins: 300, tickets: 0, xp: 100 },
  { id: 'jobs', progressKey: 'jobs', titleKey: 'quest_jobs', descKey: 'quest_jobs_desc', icon: '💼', goal: 3, coins: 0, tickets: 2, xp: 150 },
  { id: 'plates', progressKey: 'platesEquipped', titleKey: 'quest_plates', descKey: 'quest_plates_desc', icon: '🪪', goal: 1, coins: 200, tickets: 0, xp: 50 }
];

window.renderQuestsScreen = function(root) {
  const state = window.app.state;
  window.ensureQuestReset();
  const quests = state.quests;

  const cardsHtml = window.QUESTS_CONFIG.map(function(def) {
    const value = quests[def.progressKey] || 0;
    const done = value >= def.goal;
    const claimed = quests.claimed.indexOf(def.id) !== -1;
    const percent = Math.min(100, Math.floor((value / def.goal) * 100));

    const rewards = [];
    if (def.coins) rewards.push('🪙 ' + def.coins);
    if (def.tickets) rewards.push('🎟️ ' + def.tickets);
    rewards.push('⭐ ' + def.xp + ' XP');

    let actionHtml;
    if (claimed) {
      actionHtml = `<button class="quest-claim claimed" disabled>✓ ${window.t('quest_claimed')}</button>`;
    } else if (done) {
      actionHtml = `<button class="quest-claim ready" onclick="window.claimQuest('${def.id}')">${window.t('quest_claim')}</button>`;
    } else {
      actionHtml = `<button class="quest-claim" disabled>${window.t('quest_claim')}</button>`;
    }

    return `
      <div class="quest-card ${done && !claimed ? 'done' : ''} ${claimed ? 'is-claimed' : ''}">
        <div class="quest-icon">${def.icon}</div>
        <div class="quest-body">
          <div class="quest-title">${window.t(def.titleKey)}</div>
          <div class="quest-desc">${window.t(def.descKey)}</div>
          <div class="quest-progress-row">
            <span class="quest-count">${Math.min(value, def.goal)} / ${def.goal}</span>
            <span class="quest-status">${claimed ? window.t('quest_claimed') : (done ? window.t('quest_done') : '')}</span>
          </div>
          <div class="quest-track">
            <div class="quest-fill ${done ? 'is-complete' : ''}" style="width: ${claimed ? 100 : percent}%"></div>
          </div>
          <div class="quest-rewards">
            <span class="quest-reward-label">${window.t('quest_reward')}:</span>
            ${rewards.map(r => `<span class="quest-reward">${r}</span>`).join('')}
          </div>
        </div>
        <div class="quest-action">${actionHtml}</div>
      </div>
    `;
  }).join('');

  const allClaimed = window.QUESTS_CONFIG.every(function(def) {
    return quests.claimed.indexOf(def.id) !== -1;
  });

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>

    <h2 class="screen-title">📋 ${window.t('quests_title')}</h2>
    <p class="screen-subtitle">${window.t('quests_subtitle')}</p>

    <div class="quests-list">${cardsHtml}</div>

    ${allClaimed ? `<div class="quests-done-banner">🏆 ${window.t('quests_empty')}</div>` : ''}

    <button class="bottom-back-btn" onclick="window.navigate('menu')">
      <span class="back-arrow">←</span> ${window.t('back')}
    </button>
  `;
};

window.claimQuest = function(questId) {
  window.ensureQuestReset();
  const state = window.app.state;
  const def = window.QUESTS_CONFIG.find(function(q) { return q.id === questId; });
  if (!def) return;

  const value = state.quests[def.progressKey] || 0;
  const alreadyClaimed = state.quests.claimed.indexOf(def.id) !== -1;
  if (alreadyClaimed || value < def.goal) return;

  if (def.coins) state.player.coins += def.coins;
  if (def.tickets) state.player.spinTickets += def.tickets;
  state.quests.claimed.push(def.id);
  window.saveState();

  if ((state.settings?.haptic !== false) && window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
  }

  const rewardParts = [];
  if (def.coins) rewardParts.push('🪙 +' + def.coins);
  if (def.tickets) rewardParts.push('🎟️ +' + def.tickets);
  rewardParts.push('⭐ +' + def.xp + ' XP');
  alert(window.t('quest_claim_success') + '\n' + rewardParts.join(' · '));

  if (def.xp) window.addXp(def.xp);

  window.navigate('quests');
};

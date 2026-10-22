const DAILY_REWARDS = [
  { day: 1, coins: 100 },
  { day: 2, coins: 150 },
  { day: 3, tickets: 1 },
  { day: 4, coins: 250 },
  { day: 5, tickets: 2 },
  { day: 6, coins: 400 },
  { day: 7, gems: 5, tickets: 3 }
];

function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() { return new Date(Date.now() - 86400000).toISOString().slice(0, 10); }

window.renderDailyScreen = function(root) {
  const state = window.app.state;
  const p = state.player;
  const today = todayStr();
  const yesterday = yesterdayStr();
  
  const alreadyClaimedToday = p.lastClaimDate === today;
  let currentDay;
  if (alreadyClaimedToday) {
    currentDay = ((p.streak - 1) % 7) + 1;
  } else if (p.lastClaimDate === yesterday) {
    currentDay = ((p.streak) % 7) + 1;
  } else {
    currentDay = 1;
  }
  
  const cardsHtml = DAILY_REWARDS.map(r => {
    const isPast = r.day < currentDay || (alreadyClaimedToday && r.day <= currentDay);
    const isCurrent = r.day === currentDay && !alreadyClaimedToday;
    const rewardText = r.coins ? `🪙 ${r.coins}` : (r.gems ? `💎 ${r.gems}` : `🎟️ ${r.tickets}`);
    return `
      <div class="daily-cell ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}">
        <div class="daily-day">${window.t('day')} ${r.day}</div>
        <div class="daily-reward">${rewardText}</div>
      </div>
    `;
  }).join('');
  
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🔥 ${p.streak}</span></div>
    </div>
    <h2 style="margin-bottom: 16px;">${window.t('daily_title')}</h2>
    <div class="daily-grid">${cardsHtml}</div>
    
    <div style="margin-top: 24px; text-align:center;">
      ${alreadyClaimedToday 
        ? `<p style="color:var(--text-dim);">${window.t('daily_claimed')}</p>` 
        : `<button class="menu-btn primary" style="width:100%; padding:20px;" onclick="window.claimDaily()">${window.t('daily_claim')}</button>`}
    </div>
  `;
};

window.claimDaily = function() {
  const state = window.app.state;
  const p = state.player;
  const today = todayStr();
  const yesterday = yesterdayStr();
  
  if (p.lastClaimDate === today) return;
  
  let newStreak;
  if (p.lastClaimDate === yesterday) {
    newStreak = (p.streak || 0) + 1;
  } else {
    newStreak = 1;
  }
  
  const dayInCycle = ((newStreak - 1) % 7) + 1;
  const reward = DAILY_REWARDS[dayInCycle - 1];
  
  if (reward.coins) p.coins += reward.coins;
  if (reward.tickets) p.spinTickets += reward.tickets;
  if (reward.gems) p.gems += reward.gems;
  
  p.streak = newStreak;
  p.lastClaimDate = today;
  window.saveState();
  
  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
  }
  
  let msg = 'Награда: ';
  if (reward.coins) msg += '🪙 ' + reward.coins + ' ';
  if (reward.tickets) msg += '🎟️ ' + reward.tickets + ' ';
  if (reward.gems) msg += '💎 ' + reward.gems;
  alert(msg);
  
  window.navigate('daily');
};
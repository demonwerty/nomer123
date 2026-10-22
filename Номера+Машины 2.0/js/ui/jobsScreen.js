window.renderJobsScreen = function(root) {
  const state = window.app.state;
  const now = Date.now();
  
  // --- Мойка ---
  const washReady = now >= state.jobs.washCooldownEnd;
  const washProgress = state.jobs.washProgress || 0;
  const washHtml = `
    <div class="job-card">
      <h3>🧼 ${window.t('jobs_wash')}</h3>
      <p style="color:var(--text-dim); font-size:13px; margin-bottom:12px;">${window.t('jobs_wash_desc')}</p>
      ${washReady ? `
        <div class="progress-track"><div class="progress-fill" style="width: ${(washProgress/20)*100}%"></div></div>
        <div style="font-size:12px; color:var(--text-dim); margin:6px 0;">${washProgress}/20</div>
        <button id="btn-wash" class="menu-btn primary" style="width:100%; padding:16px;">${window.t('start')} (${washProgress}/20)</button>
      ` : `
        <div class="pill" style="margin-top: 8px;">⏳ ${window.t('cooldown')} ${Math.ceil((state.jobs.washCooldownEnd - now)/1000)}s</div>
      `}
    </div>
  `;
  
  // --- Курьер ---
  const courierActive = state.jobs.courierStart > 0;
  const courierReady = courierActive && (now - state.jobs.courierStart >= 3 * 60 * 1000);
  let courierHtml = `
    <div class="job-card">
      <h3>🚚 ${window.t('jobs_courier')}</h3>
      <p style="color:var(--text-dim); font-size:13px; margin-bottom:12px;">${window.t('jobs_courier_desc')}</p>
  `;
  if (!courierActive) {
    courierHtml += `<button id="btn-courier" class="menu-btn primary" style="width:100%; padding:16px;">${window.t('start')}</button>`;
  } else if (courierReady) {
    courierHtml += `<button id="btn-courier-claim" class="menu-btn primary" style="width:100%; padding:16px;">${window.t('ready')} +300</button>`;
  } else {
    const remain = Math.ceil((3 * 60 * 1000 - (now - state.jobs.courierStart)) / 1000);
    courierHtml += `<div class="pill">⏳ ${Math.floor(remain/60)}:${String(remain%60).padStart(2,'0')}</div>`;
  }
  courierHtml += `</div>`;
  
  // --- Лотерея ---
  const lotteryReady = now >= state.jobs.lotteryCooldownEnd;
  const lotteryHtml = `
    <div class="job-card">
      <h3>🎰 ${window.t('jobs_lottery')}</h3>
      <p style="color:var(--text-dim); font-size:13px; margin-bottom:12px;">${window.t('jobs_lottery_desc')}</p>
      ${lotteryReady ? `
        <div class="lottery-bar" id="lottery-bar">
          <div class="lottery-target"></div>
          <div class="lottery-cursor" id="lottery-cursor"></div>
        </div>
        <button id="btn-lottery" class="menu-btn primary" style="width:100%; padding:16px; margin-top:12px;">${window.t('start')}</button>
      ` : `
        <div class="pill">⏳ ${window.t('cooldown')} ${Math.ceil((state.jobs.lotteryCooldownEnd - now)/1000)}s</div>
      `}
    </div>
  `;
  
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>
    <h2 style="margin-bottom: 16px;">${window.t('menu_jobs')}</h2>
    ${washHtml}
    ${courierHtml}
    ${lotteryHtml}
  `;
  
  // --- Мойка handler ---
  const washBtn = document.getElementById('btn-wash');
  if (washBtn) {
    washBtn.addEventListener('click', function() {
      state.jobs.washProgress = (state.jobs.washProgress || 0) + 1;
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      
      if (state.jobs.washProgress >= 20) {
        const reward = 100 + Math.floor(Math.random() * 100);
        state.player.coins += reward;
        state.jobs.washProgress = 0;
        state.jobs.washCooldownEnd = Date.now() + 60 * 1000;
        window.progressQuest('jobs', 1);
        window.addXp(100);
        window.saveState();
        alert('+ ' + window.formatMoney(reward));
        window.navigate('jobs');
      } else {
        window.saveState();
        window.navigate('jobs');
      }
    });
  }
  
  // --- Курьер handlers ---
  const courierBtn = document.getElementById('btn-courier');
  if (courierBtn) {
    courierBtn.addEventListener('click', function() {
      state.jobs.courierStart = Date.now();
      window.saveState();
      window.navigate('jobs');
    });
  }
  
  const courierClaim = document.getElementById('btn-courier-claim');
  if (courierClaim) {
    courierClaim.addEventListener('click', function() {
      state.player.coins += 300;
      state.player.spinTickets += 1;
      state.jobs.courierStart = 0;
      window.progressQuest('jobs', 1);
      window.addXp(100);
      window.saveState();
      alert('+ ' + window.formatMoney(300) + ' + 🎟️ 1');
      window.navigate('jobs');
    });
  }
  
  // --- Лотерея handler ---
  const lotteryBtn = document.getElementById('btn-lottery');
  if (lotteryBtn) {
    const cursor = document.getElementById('lottery-cursor');
    const target = document.querySelector('.lottery-target');
    // цель: 60-70% ширины
    const targetStart = 55 + Math.random() * 15;
    target.style.left = targetStart + '%';
    target.style.width = '12%';
    
    let pos = 0;
    let dir = 1;
    let running = true;
    const speed = 2.5;
    
    const anim = setInterval(() => {
      if (!running) return;
      pos += dir * speed;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      cursor.style.left = pos + '%';
    }, 16);
    
    lotteryBtn.addEventListener('click', function() {
      if (!running) return;
      running = false;
      clearInterval(anim);
      
      const inTarget = pos >= targetStart && pos <= targetStart + 12;
      const reward = inTarget ? 500 : 100;
      state.player.coins += reward;
      state.jobs.lotteryCooldownEnd = Date.now() + 30 * 1000;
      window.progressQuest('jobs', 1);
      window.addXp(100);
      window.saveState();
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(inTarget ? 'success' : 'warning');
      }
      
      setTimeout(() => {
        alert((inTarget ? '🎯 Точное попадание! ' : 'Почти. ') + '+' + window.formatMoney(reward));
        window.navigate('jobs');
      }, 200);
    });
  }
};
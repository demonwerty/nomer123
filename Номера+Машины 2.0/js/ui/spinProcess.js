window.renderSpinProcess = function(root, params) {
  const state = window.app.state;
  
  let price = 500;
  if (params.type === 'car' && params.pool === 'city') price = 1500;
  if (params.type === 'car' && params.pool === 'elite') price = 5000;

  const isRookie = (state.player.rookieSpinsUsed || 0) < 7;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('${params.type === 'car' ? 'spin_cars' : 'spin_plates'}')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>
    ${isRookie ? `<div class="rookie-banner">${window.t('rookie_badge')}</div>` : ''}
    <div class="spin-container" style="text-align:center; padding-top: 20px;">
      <div class="reel-window">
        <div id="reel-items" class="reel-items"></div>
        <div class="reel-pointer"></div>
      </div>

      <div id="spin-result" style="min-height: 80px; margin-bottom: 20px; font-weight: bold; font-size: 18px;"></div>

      <button id="btn-spin" class="menu-btn primary" style="padding: 20px; width: 100%; font-size:18px;">
        ${window.t('spin')} за ${window.formatMoney(price)}
      </button>
    </div>
  `;

  const reelItems = document.getElementById('reel-items');
  const fillReel = () => {
    reelItems.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      const icon = params.type === 'car' ? '🚗' : '🪪';
      reelItems.innerHTML += `<div class="reel-item">${icon}</div>`;
    }
  };
  fillReel();

  document.getElementById('btn-spin').addEventListener('click', function() {
    if (params.type === 'plate' && state.plates.length >= state.plateLimit) {
      alert(window.t('limit_reached'));
      return;
    }
    if (state.player.coins < price) {
      alert(window.t('no_money')); 
      return;
    }
    
    state.player.coins -= price;
    window.saveState();
    
    this.disabled = true;
    this.innerText = '...';
    document.getElementById('spin-result').innerHTML = '';

    reelItems.style.transition = 'none';
    reelItems.style.transform = 'translateX(0)';
    
    setTimeout(() => {
      reelItems.style.transition = 'transform 3s cubic-bezier(0.1, 0.8, 0.1, 1)';
      reelItems.style.transform = `translateX(-${80 * 10}px)`;
      
      setTimeout(() => {
        let resultHtml = '';
        const rookieActive = (state.player.rookieSpinsUsed || 0) < 7;
        
        if (params.type === 'car') {
          let allowedRarities = [];
          if (params.pool === 'rusty') allowedRarities = ['Common', 'Uncommon'];
          if (params.pool === 'city') allowedRarities = ['Rare', 'Epic'];
          if (params.pool === 'elite') allowedRarities = ['Legendary', 'Mythic'];

          // Rookie boost: 50% шанс выкинуть лучшую редкость из пула
          if (rookieActive && Math.random() < 0.5) {
            allowedRarities = [allowedRarities[allowedRarities.length - 1]];
          }
          
          const filtered = window.CARS_DATA.filter(c => allowedRarities.includes(c.rarity));
          const carData = filtered[Math.floor(Math.random() * filtered.length)];
          
          const newCar = { id: 'car_'+Date.now(), templateId: carData.id, name: carData.name, rarity: carData.rarity, baseIncome: carData.baseIncome, color: carData.colors[0], plateId: null };
          state.cars.push(newCar);
          resultHtml = `${window.t('spin_result')} <span style="color:var(--${newCar.rarity.toLowerCase()})">${newCar.name}</span>`;
        } else {
          let newPlate = window.PLATES_DATA.generate(params.country);
          // Rookie boost: до 3 попыток, чтобы выбить не Common
          if (rookieActive) {
            for (let i = 0; i < 3 && newPlate.rarity === 'Common'; i++) {
              newPlate = window.PLATES_DATA.generate(params.country);
            }
          }
          state.plates.push(newPlate);
          resultHtml = `${window.t('spin_result')} <span style="color:var(--${newPlate.rarity.toLowerCase()})">${newPlate.formatted}</span>`;
        }

        // Инкремент rookie-счётчика
        state.player.rookieSpinsUsed = (state.player.rookieSpinsUsed || 0) + 1;

        // Прогресс ежедневного квеста и опыт
        window.progressQuest('spins', 1);
        window.addXp(50);
        
        document.getElementById('spin-result').innerHTML = resultHtml;
        document.querySelector('.balance').innerHTML = `<span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span>`;
        
        window.saveState();
        this.disabled = false;
        this.innerText = window.t('spin') + ' еще';
        reelItems.style.transition = 'none';
        reelItems.style.transform = 'translateX(0)';

        // Haptic на награду
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      }, 3100);
    }, 50);
  });
};
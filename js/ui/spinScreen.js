window.renderSpinScreen = function(root) {
  const state = window.app.state;
  
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">←</button>
      <div class="balance">
        <span class="bal-item">🪙 ${state.player.coins}</span>
        <span class="bal-item">🎟️ ${state.player.spinTickets}</span>
      </div>
    </div>
    
    <div class="spin-container" style="text-align:center; padding-top: 40px;">
      <h2 style="margin-bottom: 20px;">Крутка</h2>
      
      <!-- Лента -->
      <div class="reel-window" style="background: var(--bg-2); border: 2px solid var(--border); height: 120px; border-radius: 16px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div id="reel-items" style="display: flex; gap: 10px; transition: transform 3s cubic-bezier(0.1, 0.8, 0.1, 1);">
          <!-- Заполняется JS -->
        </div>
        <div style="position:absolute; top:0; bottom:0; left:50%; width:4px; background:var(--accent); transform:translateX(-50%); z-index: 10;"></div>
      </div>

      <div id="spin-result" style="min-height: 80px; margin-bottom: 20px; font-weight: bold; font-size: 18px;">
        Жми кнопку, бро!
      </div>

      <div style="display:flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
        <button id="btn-spin-car" class="menu-btn primary" style="padding: 20px; flex: 1; font-size:16px;">Крутить тачку<br><small style="font-weight:normal; font-size:12px;">🎟️ 1 билет</small></button>
        <button id="btn-spin-plate" class="menu-btn primary" style="padding: 20px; flex: 1; font-size:16px; background: linear-gradient(135deg, #2196f3, #00bcd4); color: white; border-color:#2196f3;">Крутить номер<br><small style="font-weight:normal; font-size:12px;">🎟️ 1 билет</small></button>
      </div>
    </div>
  `;

  // Наполняем ленту визуально
  const reelItems = document.getElementById('reel-items');
  const fillReel = () => {
    reelItems.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      reelItems.innerHTML += `<div style="width: 80px; height: 80px; background: var(--bg-3); border-radius: 12px; display:flex; align-items:center; justify-content:center; font-size:32px;">🚗</div>`;
    }
  };
  fillReel();

  const doSpin = (type) => {
    if (state.player.spinTickets < 1 && state.player.coins < 250) {
      alert('Нет билетов или монет!'); return;
    }
    
    // Тратим
    if (state.player.spinTickets > 0) {
      state.player.spinTickets--;
    } else {
      state.player.coins -= 250;
    }
    window.saveState();

    // Анимация
    const btn1 = document.getElementById('btn-spin-car');
    const btn2 = document.getElementById('btn-spin-plate');
    btn1.disabled = true; btn2.disabled = true;
    document.getElementById('spin-result').innerHTML = 'Крутим...';

    reelItems.style.transition = 'none';
    reelItems.style.transform = 'translateX(0)';
    
    setTimeout(() => {
      reelItems.style.transition = 'transform 3s cubic-bezier(0.1, 0.8, 0.1, 1)';
      reelItems.style.transform = `translateX(-${80 * 10}px)`; // Прокрутка
      
      setTimeout(() => {
        // Результат
        if (type === 'car') {
          const carData = window.CARS_DATA[Math.floor(Math.random() * window.CARS_DATA.length)];
          const newCar = { id: 'car_'+Date.now(), templateId: carData.id, name: carData.name, rarity: carData.rarity, baseIncome: carData.baseIncome, color: carData.colors[0], plateId: null };
          state.cars.push(newCar);
          document.getElementById('spin-result').innerHTML = `Выпала: <span style="color:var(--${newCar.rarity.toLowerCase()})">${newCar.name}</span> (${newCar.rarity})`;
        } else {
          const newPlate = window.PLATES_DATA.generate();
          state.plates.push(newPlate);
          document.getElementById('spin-result').innerHTML = `Выпал номер: <span style="color:var(--${newPlate.rarity.toLowerCase()})">${newPlate.formatted}</span> (${newPlate.rarity})`;
        }
        
        // Обновляем топбар
        const bal = document.querySelector('.balance');
        bal.innerHTML = `<span class="bal-item">🪙 ${state.player.coins}</span><span class="bal-item">🎟️ ${state.player.spinTickets}</span>`;
        
        window.saveState();
        btn1.disabled = false; btn2.disabled = false;
        reelItems.style.transition = 'none';
        reelItems.style.transform = 'translateX(0)';
      }, 3100); // Ждем окончания анимации
    }, 50);
  };

  document.getElementById('btn-spin-car').addEventListener('click', () => doSpin('car'));
  document.getElementById('btn-spin-plate').addEventListener('click', () => doSpin('plate'));
};
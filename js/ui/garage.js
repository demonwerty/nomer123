window.renderGarageScreen = function(root) {
  const state = window.app.state;
  
  let carsHtml = state.cars.map(car => {
    const plate = car.plateId ? state.plates.find(p => p.id === car.plateId) : null;
    const plateHtml = plate
      ? `<div class="plate-badge">${plate.formatted}</div>`
      : `<div style="color:var(--text-dim); font-size:12px; margin-top:10px;">—</div>`;
    
    return `
      <div class="car-card">
        <div style="width: 100%; height: 60px; background: ${car.color}; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 -10px 20px rgba(0,0,0,0.5);"></div>
        <div style="font-weight: bold; font-size: 14px; text-align:center;">${car.name}</div>
        <div style="color: var(--${car.rarity.toLowerCase()}); font-size: 12px;">${car.rarity}</div>
        ${plateHtml}
        ${!plate 
          ? `<button onclick="window.openPlateModal('${car.id}')" class="car-btn primary">${window.t('put_plate')}</button>` 
          : `<button onclick="window.removePlate('${car.id}')" class="car-btn">${window.t('remove_plate')}</button>`}
      </div>
    `;
  }).join('');

  if (state.cars.length === 0) {
    carsHtml = `<div style="grid-column: 1 / -1; text-align:center; color:var(--text-dim); padding:40px;">${window.t('empty_garage')}</div>`;
  }

  const income = window.Economy.calculateAccumulated();

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('menu')">← ${window.t('back')}</button>
      <div class="balance">
        <span class="bal-item">🚗 ${state.cars.length}</span>
        <span class="bal-item">🪪 ${state.plates.length}/${state.plateLimit}</span>
      </div>
    </div>
    
    ${income.amount > 0 ? `<div class="income-banner" onclick="window.collectIncome()"><div>💰 ${window.t('income_title')}: <b>${window.formatMoney(income.amount)}</b></div><div style="font-size:12px; color:var(--text-dim);">${window.formatMoney(income.perHour)}${window.t('per_hour')}</div></div>` : ''}
    
    <button class="menu-btn" style="margin-bottom: 16px;" onclick="window.navigate('plates_inv')">🪪 ${window.t('plates_inv')} (${state.plates.length}/${state.plateLimit})</button>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 40px;">
      ${carsHtml}
    </div>
  `;
};

window.openPlateModal = function(carId) {
  const state = window.app.state;
  const availablePlates = state.plates.filter(p => p.equippedCarId === null);
  
  if (availablePlates.length === 0) {
    alert(window.t('no_plates'));
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${window.t('put_plate')}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="modal-list">
        ${availablePlates.map(p => `
          <div class="plate-row" onclick="window.equipPlate('${carId}', '${p.id}'); this.closest('.modal-overlay').remove();">
            <div class="plate-badge">${p.formatted}</div>
            <div style="color:var(--${p.rarity.toLowerCase()}); font-size:12px;">${p.rarity} +${Math.round((p.incomeBonus||0)*100)}%</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.equipPlate = function(carId, plateId) {
  const state = window.app.state;
  const car = state.cars.find(c => c.id === carId);
  const plate = state.plates.find(p => p.id === plateId);
  if (!car || !plate) return;
  car.plateId = plate.id;
  plate.equippedCarId = carId;
  window.progressQuest('platesEquipped', 1);
  window.saveState();
  window.navigate('garage');
};

window.removePlate = function(carId) {
  const state = window.app.state;
  const car = state.cars.find(c => c.id === carId);
  if (!car) return;
  const plate = state.plates.find(p => p.id === car.plateId);
  if (plate) plate.equippedCarId = null;
  car.plateId = null;
  window.saveState();
  window.navigate('garage');
};

window.renderPlatesInventory = function(root) {
  const state = window.app.state;
  
  const platesHtml = state.plates.map(p => {
    const isEquipped = p.equippedCarId !== null;
    return `
      <div class="plate-inv-row">
        <div style="flex:1;">
          <div class="plate-badge">${p.formatted}</div>
          <div style="color:var(--${p.rarity.toLowerCase()}); font-size:12px; margin-top:4px;">${p.rarity} • ${p.country}</div>
        </div>
        ${isEquipped 
          ? `<div class="pill equipped">${window.t('equipped')}</div>`
          : `<button class="btn-sell" onclick="window.sellPlate('${p.id}')">${window.t('sell')} ${window.formatMoney(window.Economy.sellPrice(p.rarity))}</button>`}
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('garage')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪪 ${state.plates.length}/${state.plateLimit}</span></div>
    </div>
    
    <h2 style="margin-bottom: 12px;">${window.t('plates_inv')}</h2>
    <p style="color:var(--text-dim); font-size:13px; margin-bottom:16px;">${window.t('plate_limit')}: ${state.plateLimit}</p>
    
    ${state.plateLimit < 200 ? `<button class="menu-btn" style="margin-bottom: 16px;" onclick="window.upgradePlateLimit()">⬆️ ${window.t('upgrade_limit')} — ${window.formatMoney(5000)}</button>` : ''}
    
    <div style="padding-bottom: 40px;">
      ${platesHtml || '<div style="text-align:center; color:var(--text-dim); padding:40px;">—</div>'}
    </div>
  `;
};

window.sellPlate = function(plateId) {
  const state = window.app.state;
  const idx = state.plates.findIndex(p => p.id === plateId);
  if (idx === -1) return;
  const plate = state.plates[idx];
  if (plate.equippedCarId) { alert('Сначала сними номер с машины.'); return; }
  const price = window.Economy.sellPrice(plate.rarity);
  if (!confirm(`${window.t('sell')} ${plate.formatted} за ${window.formatMoney(price)}?`)) return;
  state.player.coins += price;
  state.plates.splice(idx, 1);
  window.saveState();
  window.navigate('plates_inv');
};

window.upgradePlateLimit = function() {
  const state = window.app.state;
  if (state.player.coins < 5000) { alert(window.t('no_money')); return; }
  if (!confirm(`${window.t('upgrade_limit')} за ${window.formatMoney(5000)}?`)) return;
  state.player.coins -= 5000;
  state.plateLimit = 200;
  window.saveState();
  window.navigate('plates_inv');
};
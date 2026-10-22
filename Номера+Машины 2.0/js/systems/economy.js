window.Economy = {
  MAX_OFFLINE_HOURS: 8,
  
  calculateIncomePerHour: function() {
    const state = window.app.state;
    let total = 0;
    state.cars.forEach(car => {
      let carIncome = car.baseIncome || 0;
      if (car.plateId) {
        const plate = state.plates.find(p => p.id === car.plateId);
        if (plate) carIncome *= (1 + (plate.incomeBonus || 0));
      }
      total += carIncome;
    });
    return Math.floor(total);
  },
  
  calculateAccumulated: function() {
    const state = window.app.state;
    if (!state.cars || state.cars.length === 0) return { amount: 0, hours: 0, perHour: 0 };
    const perHour = this.calculateIncomePerHour();
    const now = Date.now();
    const last = state.lastCollectTime || now;
    let elapsedHours = (now - last) / (1000 * 60 * 60);
    if (elapsedHours > this.MAX_OFFLINE_HOURS) elapsedHours = this.MAX_OFFLINE_HOURS;
    if (elapsedHours < 0) elapsedHours = 0;
    return {
      amount: Math.floor(perHour * elapsedHours),
      hours: elapsedHours,
      perHour: perHour
    };
  },
  
  collect: function() {
    const state = window.app.state;
    const acc = this.calculateAccumulated();
    if (acc.amount > 0) {
      state.player.coins += acc.amount;
      state.lastCollectTime = Date.now();
      window.saveState();
    }
    return acc.amount;
  },
  
  sellPrice: function(rarity) {
    const prices = { Common: 50, Uncommon: 150, Rare: 500, Epic: 1500, Legendary: 5000, Mythic: 15000 };
    return prices[rarity] || 50;
  }
};

window.collectIncome = function() {
  const amount = window.Economy.collect();
  if (amount > 0) {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    alert('Собрано: ' + window.formatMoney(amount));
    window.navigate('menu');
  }
};
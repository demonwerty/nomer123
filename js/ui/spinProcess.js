window.renderSpinProcess = function(root, params) {
  params = params || {};

  const state = window.app.state;
  const type = params.type === 'car' ? 'car' : 'plate';
  const country = params.country || 'RU';
  const backScreen = type === 'car' ? 'spin_cars' : 'spin_plates';

  let price = 500;
  if (type === 'car' && params.pool === 'city') price = 1500;
  if (type === 'car' && params.pool === 'elite') price = 5000;

  const isRookie = (state.player.rookieSpinsUsed || 0) < 7;

  const stageHtml = type === 'plate'
    ? `
      <div class="plate-stage" id="plate-stage">
        <div class="plate-reel" id="plate-reel">
          ${window.PLATES_DATA.render(window.PLATES_DATA.preview(country), { size: 'lg' })}
        </div>
      </div>
    `
    : `
      <div class="reel-window">
        <div id="reel-items" class="reel-items"></div>
        <div class="reel-pointer"></div>
      </div>
    `;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('${backScreen}')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>
    ${isRookie ? `<div class="rookie-banner">${window.t('rookie_badge')}</div>` : ''}
    <div class="spin-container" style="text-align:center; padding-top: 20px;">
      ${stageHtml}
      <div id="spin-result" class="spin-result-line"></div>
      <button id="btn-spin" class="menu-btn primary" style="padding: 20px; width: 100%; font-size:18px;">
        ${window.t('spin')} за ${window.formatMoney(price)}
      </button>
    </div>
  `;

  const btnSpin = document.getElementById('btn-spin');
  const resultEl = document.getElementById('spin-result');
  const reelItems = type === 'car' ? document.getElementById('reel-items') : null;
  const plateStage = type === 'plate' ? document.getElementById('plate-stage') : null;

  if (reelItems) fillCarReel();

  function fillCarReel() {
    reelItems.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      reelItems.innerHTML += '<div class="reel-item">🚗</div>';
    }
  }

  function updateBalance() {
    const balanceEl = document.querySelector('.balance');
    if (balanceEl) {
      balanceEl.innerHTML = '<span class="bal-item">🪙 ' + window.formatMoney(state.player.coins) + '</span>';
    }
  }

  function hapticSuccess() {
    if (state.settings && state.settings.haptic === false) return;
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  }

  function finishSpin() {
    state.player.rookieSpinsUsed = (state.player.rookieSpinsUsed || 0) + 1;
    window.progressQuest('spins', 1);
    window.addXp(50);
    window.saveState();

    if (btnSpin && btnSpin.isConnected) {
      btnSpin.disabled = false;
      btnSpin.innerText = window.t('spin') + ' ещё';
    }

    updateBalance();
    hapticSuccess();
  }

  btnSpin.addEventListener('click', function() {
    if (btnSpin.disabled) return;

    if (type === 'plate' && state.plates.length >= state.plateLimit) {
      alert(window.t('limit_reached'));
      return;
    }
    if (state.player.coins < price) {
      alert(window.t('no_money'));
      return;
    }

    state.player.coins -= price;
    window.saveState();

    btnSpin.disabled = true;
    btnSpin.innerText = '...';
    if (resultEl) resultEl.innerHTML = '';
    updateBalance();

    if (type === 'car') {
      runCarSpin();
    } else {
      runPlateSpin();
    }
  });

  /* --------------------------- машины --------------------------- */

  function runCarSpin() {
    if (!reelItems) return;

    reelItems.style.transition = 'none';
    reelItems.style.transform = 'translateX(0)';

    setTimeout(function() {
      reelItems.style.transition = 'transform 3s cubic-bezier(0.1, 0.8, 0.1, 1)';
      reelItems.style.transform = 'translateX(-800px)';
    }, 50);

    setTimeout(function() {
      const rookieActive = (state.player.rookieSpinsUsed || 0) < 7;

      let allowedRarities = [];
      if (params.pool === 'rusty') allowedRarities = ['Common', 'Uncommon'];
      if (params.pool === 'city') allowedRarities = ['Rare', 'Epic'];
      if (params.pool === 'elite') allowedRarities = ['Legendary', 'Mythic'];

      // Rookie boost: 50% шанс выкинуть лучшую редкость из пула
      if (rookieActive && Math.random() < 0.5) {
        allowedRarities = [allowedRarities[allowedRarities.length - 1]];
      }

      const filtered = window.CARS_DATA.filter(function(car) {
        return allowedRarities.indexOf(car.rarity) !== -1;
      });
      const pool = filtered.length ? filtered : window.CARS_DATA;
      const carData = pool[Math.floor(Math.random() * pool.length)];

      const newCar = {
        id: 'car_' + Date.now(),
        templateId: carData.id,
        name: carData.name,
        rarity: carData.rarity,
        baseIncome: carData.baseIncome,
        color: carData.colors[0],
        plateId: null
      };
      state.cars.push(newCar);

      if (resultEl && resultEl.isConnected) {
        resultEl.innerHTML =
          '<div class="spin-result-rarity" style="color:var(--' + newCar.rarity.toLowerCase() + ')">' + newCar.rarity + '</div>' +
          '<div>' + window.t('spin_result') + ' <b style="color:var(--' + newCar.rarity.toLowerCase() + ')">' + newCar.name + '</b></div>';
      }

      finishSpin();

      if (reelItems) {
        reelItems.style.transition = 'none';
        reelItems.style.transform = 'translateX(0)';
      }
    }, 3100);
  }

  /* --------------------------- номера --------------------------- */

  function runPlateSpin() {
    const rookieActive = (state.player.rookieSpinsUsed || 0) < 7;

    // Сразу определяем выигрыш — символы будут крутиться именно к нему
    let newPlate = window.PLATES_DATA.generate(country);

    // Rookie boost: до 3 попыток, чтобы выбить не Common
    if (rookieActive) {
      for (let i = 0; i < 3 && newPlate.rarity === 'Common'; i++) {
        newPlate = window.PLATES_DATA.generate(country);
      }
    }

    const reel = document.getElementById('plate-reel');
    if (!reel) {
      // Экран уже закрыт — номер всё равно выдаём
      state.plates.push(newPlate);
      finishSpin();
      return;
    }

    // Рендерим номер как набор отдельных span'ов
    reel.innerHTML = window.PLATES_DATA.render(newPlate, { size: 'lg', animated: true });

    const charEls = Array.prototype.slice.call(reel.querySelectorAll('[data-char-index]'));
    const pools = window.PLATES_DATA.getPools(country);
    const intervals = [];

    // Каждый символ быстро перебирает случайные значения из своего пула
    charEls.forEach(function(el, idx) {
      const pool = el.getAttribute('data-char-type') === 'digit' ? pools.digits : pools.letters;
      el.classList.add('is-spinning');

      const interval = setInterval(function() {
        el.textContent = pool[Math.floor(Math.random() * pool.length)];
      }, 55 + (idx % 3) * 10);

      intervals.push(interval);
    });

    const totalDuration = 3000;
    const stopStep = 100;
    // Последний символ останавливается на ~2900 мс, анимация длится 3 секунды
    const firstStop = Math.max(1000, totalDuration - charEls.length * stopStep);

    // Останавливаем символы поочерёдно слева направо
    charEls.forEach(function(el, idx) {
      setTimeout(function() {
        clearInterval(intervals[idx]);
        el.classList.remove('is-spinning');
        el.textContent = newPlate.mainChars[idx] || el.textContent;

        // Перезапуск CSS-анимации «защёлкивания»
        void el.offsetWidth;
        el.classList.add('is-locked');
      }, firstStop + idx * stopStep);
    });

    // Когда все символы остановились — собираем финальный номер
    setTimeout(function() {
      // Страховка: если таймер браузера «подвис», жёстко фиксируем финал
      charEls.forEach(function(el, idx) {
        clearInterval(intervals[idx]);
        el.classList.remove('is-spinning');
        el.textContent = newPlate.mainChars[idx] || el.textContent;
      });

      if (!plateStage || !plateStage.isConnected) {
        state.plates.push(newPlate);
        finishSpin();
        return;
      }

      const collected = charEls.map(function(el) {
        return el.textContent;
      }).join('');

      window.PLATES_DATA.setChars(newPlate, collected);

      // Красивый финальный рендер
      const finalReel = document.getElementById('plate-reel');
      if (finalReel) {
        finalReel.innerHTML = window.PLATES_DATA.render(newPlate, {
          size: 'lg',
          className: 'plate-reveal'
        });
      }

      // Записываем номер в state только после остановки всех символов
      state.plates.push(newPlate);

      if (resultEl && resultEl.isConnected) {
        const rarityColor = 'var(--' + newPlate.rarity.toLowerCase() + ')';
        const bonus = Math.round((newPlate.incomeBonus || 0) * 100);

        resultEl.innerHTML =
          '<div class="spin-result-rarity" style="color:' + rarityColor + '">' +
            newPlate.rarity + (newPlate.isBlatnoy ? ' • БЛАТНОЙ' : '') +
          '</div>' +
          '<div>' + window.t('spin_result') + ' <b style="color:' + rarityColor + '">' +
            newPlate.formatted +
          '</b></div>' +
          (bonus > 0 ? '<div class="spin-result-note">+' + bonus + '% к доходу</div>' : '');
      }

      finishSpin();
    }, totalDuration + 120);
  }
};


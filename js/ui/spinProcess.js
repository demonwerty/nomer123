window.renderSpinProcess = function(root, params) {
  const state = window.app.state;
  params = params || {};
  const isCar = params.type === 'car';

  let price = 500;
  if (isCar && params.pool === 'city') price = 1500;
  if (isCar && params.pool === 'elite') price = 5000;

  const isRookie = (state.player.rookieSpinsUsed || 0) < 7;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" onclick="window.navigate('${isCar ? 'spin_cars' : 'spin_plates'}')">← ${window.t('back')}</button>
      <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span></div>
    </div>
    ${isRookie ? `<div class="rookie-banner">${window.t('rookie_badge')}</div>` : ''}
    <div class="spin-container" style="text-align:center; padding-top: 20px;">
      <div class="reel-window reel-window--vertical">
        <div id="reel-items" class="reel-items reel-items--vertical" aria-live="polite"></div>
        <div class="reel-pointer reel-pointer--horizontal"></div>
      </div>

      <div id="spin-result" style="min-height: 80px; margin-bottom: 20px; font-weight: bold; font-size: 18px;"></div>

      <button id="btn-spin" class="menu-btn primary" style="padding: 20px; width: 100%; font-size:18px;">
        ${window.t('spin')} за ${window.formatMoney(price)}
      </button>
    </div>
  `;

  const reelItems = document.getElementById('reel-items');
  const spinButton = document.getElementById('btn-spin');
  const resultEl = document.getElementById('spin-result');
  const balanceEl = root.querySelector ? root.querySelector('.balance') : document.querySelector('.balance');

  const REEL_ITEM_COUNT = 22;
  const FINAL_INDEX = REEL_ITEM_COUNT - 1;
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const SPIN_DURATION = reduceMotion ? 650 : 3400;
  let spinning = false;

  function updateBalance() {
    if (balanceEl && balanceEl.isConnected) {
      balanceEl.innerHTML = `<span class="bal-item">🪙 ${window.formatMoney(state.player.coins)}</span>`;
    }
  }

  function randomCarData() {
    return window.CARS_DATA[Math.floor(Math.random() * window.CARS_DATA.length)];
  }

  function plateReelItem(plate, selected) {
    const plateHtml = window.renderPlateHTML
      ? window.renderPlateHTML(plate)
      : `<span class="reel-plate-fallback">${plate.formatted || ''}</span>`;
    return `<div class="reel-item reel-item--plate${selected ? ' is-final' : ''}">${plateHtml}</div>`;
  }

  function carReelItem(car, selected) {
    return `
      <div class="reel-item reel-item--car${selected ? ' is-final' : ''}">
        <span class="reel-car-emoji">🚗</span>
        <span class="reel-car-name">${car && car.name ? car.name : ''}</span>
      </div>
    `;
  }

  function fillReel(finalItem) {
    reelItems.innerHTML = '';
    for (let i = 0; i < REEL_ITEM_COUNT; i++) {
      const isFinal = i === FINAL_INDEX;
      if (isCar) {
        reelItems.insertAdjacentHTML('beforeend', carReelItem(isFinal ? finalItem : randomCarData(), isFinal));
      } else {
        const plate = isFinal ? finalItem : window.PLATES_DATA.generate(params.country);
        reelItems.insertAdjacentHTML('beforeend', plateReelItem(plate, isFinal));
      }
    }
  }

  fillReel(isCar ? randomCarData() : window.PLATES_DATA.generate(params.country));

  function getReelStep() {
    const styles = window.getComputedStyle(reelItems);
    const gap = parseFloat(styles.rowGap || styles.gap || '8') || 8;
    const firstItem = reelItems.querySelector('.reel-item');
    const height = firstItem ? firstItem.getBoundingClientRect().height : 96;
    return (height || 96) + gap;
  }

  function pickCarResult() {
    const rookieActive = (state.player.rookieSpinsUsed || 0) < 7;
    let allowedRarities = [];
    if (params.pool === 'rusty') allowedRarities = ['Common', 'Uncommon'];
    if (params.pool === 'city') allowedRarities = ['Rare', 'Epic'];
    if (params.pool === 'elite') allowedRarities = ['Legendary', 'Mythic'];

    // Rookie boost: 50% шанс выкинуть лучшую редкость из пула
    if (rookieActive && allowedRarities.length && Math.random() < 0.5) {
      allowedRarities = [allowedRarities[allowedRarities.length - 1]];
    }

    const filtered = window.CARS_DATA.filter(c => allowedRarities.includes(c.rarity));
    const pool = filtered.length ? filtered : window.CARS_DATA;
    const carData = pool[Math.floor(Math.random() * pool.length)];

    return {
      id: 'car_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      templateId: carData.id,
      name: carData.name,
      rarity: carData.rarity,
      baseIncome: carData.baseIncome,
      color: carData.colors[0],
      plateId: null
    };
  }

  function pickPlateResult() {
    const rookieActive = (state.player.rookieSpinsUsed || 0) < 7;
    let newPlate = window.PLATES_DATA.generate(params.country);
    // Rookie boost: до 3 попыток, чтобы выбить не Common
    if (rookieActive) {
      for (let i = 0; i < 3 && newPlate.rarity === 'Common'; i++) {
        newPlate = window.PLATES_DATA.generate(params.country);
      }
    }
    return newPlate;
  }

  spinButton.addEventListener('click', function() {
    if (spinning) return;

    if (!isCar && state.plates.length >= state.plateLimit) {
      alert(window.t('limit_reached'));
      return;
    }
    if (state.player.coins < price) {
      alert(window.t('no_money'));
      return;
    }

    // Результат выбираем до старта, чтобы лента остановилась именно на нём.
    const finalResult = isCar ? pickCarResult() : pickPlateResult();

    spinning = true;
    state.player.coins -= price;
    window.saveState();
    updateBalance();

    spinButton.disabled = true;
    spinButton.innerText = '...';
    resultEl.innerHTML = '';
    fillReel(finalResult);

    const step = getReelStep();
    reelItems.style.transition = 'none';
    reelItems.style.transform = 'translate3d(0, 0, 0)';
    void reelItems.offsetHeight;

    let finished = false;
    let finishTimer = null;

    function finishSpin() {
      if (finished) return;
      finished = true;
      if (finishTimer) clearTimeout(finishTimer);
      reelItems.removeEventListener('transitionend', onTransitionEnd);

      const finalEl = reelItems.querySelectorAll('.reel-item')[FINAL_INDEX];
      if (finalEl) finalEl.classList.add('is-selected');

      let resultHtml = '';
      if (isCar) {
        state.cars.push(finalResult);
        resultHtml = `${window.t('spin_result')} <span style="color:var(--${finalResult.rarity.toLowerCase()})">${finalResult.name}</span>`;
      } else {
        state.plates.push(finalResult);
        resultHtml = `${window.t('spin_result')} <span style="color:var(--${finalResult.rarity.toLowerCase()})">${finalResult.formatted}</span>`;
      }

      // Инкремент rookie-счётчика
      state.player.rookieSpinsUsed = (state.player.rookieSpinsUsed || 0) + 1;

      // Прогресс ежедневного квеста и опыт
      window.progressQuest('spins', 1);
      window.addXp(50);

      resultEl.innerHTML = resultHtml;
      updateBalance();
      window.saveState();

      spinning = false;
      spinButton.disabled = false;
      spinButton.innerText = window.t('spin');

      // Haptic на награду
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }

    function onTransitionEnd(event) {
      if (event.target === reelItems && event.propertyName === 'transform') {
        finishSpin();
      }
    }

    reelItems.addEventListener('transitionend', onTransitionEnd);
    finishTimer = setTimeout(finishSpin, SPIN_DURATION + 300);

    function startAnimation() {
      reelItems.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.74, 0.08, 1)`;
      reelItems.style.transform = `translate3d(0, -${FINAL_INDEX * step}px, 0)`;
    }

    // Даём браузеру зафиксировать стартовую позицию ленты перед запуском transition.
    setTimeout(startAnimation, 30);
  });
};

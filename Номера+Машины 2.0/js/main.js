const app = { state: null };
window.app = app;

window.i18n = {
  ru: {
    menu_cars: 'Машины', menu_plates: 'Номера', menu_garage: 'Гараж', menu_jobs: 'Подработки',
    menu_daily: 'Ежедневки', menu_settings: 'Настройки', menu_shop: 'Магазин',
    spin: 'Крутить', back: 'Назад', chest_rusty: 'Ржавый', chest_city: 'Городской', chest_elite: 'Элитный',
    country_ru: 'Россия', country_by: 'Беларусь', country_kz: 'Казахстан', country_us: 'США',
    no_money: 'Недостаточно средств!', spin_result: 'Выпало:',
    income_title: 'Гараж заработал', collect: 'Собрать', per_hour: '/ч',
    plates_inv: 'Мои номера', plate_limit: 'Лимит номеров', upgrade_limit: 'Улучшить до 200',
    sell: 'Продать', equipped: 'Надет', not_equipped: 'Свободен', empty_garage: 'Гараж пуст. Крути тачки!',
    put_plate: 'Надеть номер', remove_plate: 'Снять', no_plates: 'Нет свободных номеров. Крути рулетку!',
    limit_reached: 'Лимит номеров! Продай лишние или улучши лимит.',
    jobs_wash: 'Мойка', jobs_courier: 'Курьер', jobs_lottery: 'Лотерея на заправке',
    jobs_wash_desc: 'Протри машину 20 раз — получи монеты', jobs_courier_desc: 'Ждёшь 3 минуты — забираешь кэш',
    jobs_lottery_desc: 'Поймай зелёную зону — сорви куш',
    start: 'Начать', wait: 'Ждать', ready: 'Забрать', cooldown: 'Кулдаун',
    daily_title: 'Ежедневный вход', daily_streak: 'Стрик', daily_claimed: 'Уже забрано, бро. Возвращайся завтра.',
    daily_claim: 'Забрать награду', day: 'День',
    settings_lang: 'Язык', settings_sound: 'Звук', settings_haptic: 'Вибрация',
    settings_reset: 'Сбросить прогресс', settings_reset_confirm: 'Точно сбросить ВЕСЬ прогресс? Это нельзя отменить.',
    settings_version: 'Версия',
    shop_desc: 'Поддержи игру — получи гемы', shop_buy: 'Купить',
    shop_soon: 'Оплата звёздами скоро. Спасибо, что поддерживаешь!',
    ad_button: 'Смотреть рекламу', ad_reward: '+200 ₽ за рекламу', ad_cooldown: 'Кулдаун',
    rookie_badge: '🌱 Новичок — удача на твоей стороне',
  },
  en: {
    menu_cars: 'Cars', menu_plates: 'Plates', menu_garage: 'Garage', menu_jobs: 'Jobs',
    menu_daily: 'Daily', menu_settings: 'Settings', menu_shop: 'Shop',
    spin: 'Spin', back: 'Back', chest_rusty: 'Rusty', chest_city: 'City', chest_elite: 'Elite',
    country_ru: 'Russia', country_by: 'Belarus', country_kz: 'Kazakhstan', country_us: 'USA',
    no_money: 'Not enough money!', spin_result: 'You got:',
    income_title: 'Garage earned', collect: 'Collect', per_hour: '/h',
    plates_inv: 'My Plates', plate_limit: 'Plate limit', upgrade_limit: 'Upgrade to 200',
    sell: 'Sell', equipped: 'Equipped', not_equipped: 'Free', empty_garage: 'Garage is empty. Go spin!',
    put_plate: 'Equip plate', remove_plate: 'Remove', no_plates: 'No free plates. Go spin!',
    limit_reached: 'Plate limit reached! Sell or upgrade.',
    jobs_wash: 'Car Wash', jobs_courier: 'Courier', jobs_lottery: 'Gas Station Lottery',
    jobs_wash_desc: 'Wipe the car 20 times — get coins', jobs_courier_desc: 'Wait 3 minutes — grab cash',
    jobs_lottery_desc: 'Catch the green zone — win big',
    start: 'Start', wait: 'Wait', ready: 'Claim', cooldown: 'Cooldown',
    daily_title: 'Daily Login', daily_streak: 'Streak', daily_claimed: 'Already claimed, bro. Come back tomorrow.',
    daily_claim: 'Claim reward', day: 'Day',
    settings_lang: 'Language', settings_sound: 'Sound', settings_haptic: 'Haptic',
    settings_reset: 'Reset progress', settings_reset_confirm: 'Really reset ALL progress? Cannot be undone.',
    settings_version: 'Version',
    shop_desc: 'Support the game — get gems', shop_buy: 'Buy',
    shop_soon: 'Stars payment coming soon. Thanks for the support!',
    ad_button: 'Watch ad', ad_reward: '+$200 for ad', ad_cooldown: 'Cooldown',
    rookie_badge: '🌱 Rookie — luck is on your side',
  }
};

window.t = function(key) {
  const lang = app.state?.settings?.lang || 'ru';
  return window.i18n[lang][key] || key;
};

window.formatMoney = function(amount) {
  const lang = app.state?.settings?.lang || 'ru';
  if (lang === 'en') return '$' + amount;
  return amount + ' ₽';
};

window.navigate = function(screen, params = {}) {
  const el = document.getElementById('screen');
  el.innerHTML = '';
  
  if (screen === 'menu') {
    const p = app.state.player;
    const income = window.Economy.calculateAccumulated();
    const isRookie = (p.rookieSpinsUsed || 0) < 7;
    const adReady = window.Ads.canShow();

    const incomeHtml = income.amount > 0 ? `
      <div class="income-banner" onclick="window.collectIncome()">
        <div>💰 ${window.t('income_title')}: <b>${window.formatMoney(income.amount)}</b></div>
        <div style="font-size:12px; color:var(--text-dim);">${window.formatMoney(income.perHour)}${window.t('per_hour')} • ${income.hours.toFixed(1)}ч • ${window.t('collect')}</div>
      </div>
    ` : '';

    const rookieHtml = isRookie ? `<div class="rookie-banner">${window.t('rookie_badge')}</div>` : '';

    const adHtml = `
      <div class="ad-banner ${adReady ? '' : 'disabled'}" onclick="${adReady ? 'window.watchAdForCoins()' : ''}">
        <div>📺 <b>${window.t('ad_reward')}</b></div>
        <div style="font-size:12px; color:var(--text-dim);">${adReady ? window.t('ad_button') : window.t('ad_cooldown') + ': ' + window.Ads.cooldownRemaining() + 's'}</div>
      </div>
    `;

    el.innerHTML = `
      <div class="topbar">
        <div class="balance"><span class="bal-item">🪙 ${window.formatMoney(p.coins)}</span></div>
        <button onclick="window.toggleLang()" class="lang-btn">${app.state.settings.lang.toUpperCase()}</button>
      </div>
      ${incomeHtml}
      ${adHtml}
      ${rookieHtml}
      <div class="menu-hero">
        <h1 class="menu-title">GARAGE<span class="accent">SPIN</span></h1>
      </div>
      <div class="menu-grid">
        <button class="menu-btn primary" onclick="window.navigate('spin_cars')">🚗 ${window.t('menu_cars')}</button>
        <button class="menu-btn primary" onclick="window.navigate('spin_plates')">🪪 ${window.t('menu_plates')}</button>
        <button class="menu-btn" onclick="window.navigate('garage')">🏠 ${window.t('menu_garage')}</button>
        <button class="menu-btn" onclick="window.navigate('jobs')">💼 ${window.t('menu_jobs')}</button>
        <button class="menu-btn" onclick="window.navigate('daily')">🎁 ${window.t('menu_daily')}</button>
        <button class="menu-btn" onclick="window.navigate('shop')">💎 ${window.t('menu_shop')}</button>
        <button class="menu-btn" style="grid-column: 1/-1;" onclick="window.navigate('settings')">⚙️ ${window.t('menu_settings')}</button>
      </div>
    `;

    // Автообновление кулдауна рекламы
    if (!adReady) {
      setTimeout(() => {
        if (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#/menu') {
          window.navigate('menu');
        }
      }, 1000);
    }
  } else if (screen === 'spin_cars') {
    window.renderCarChests(el);
  } else if (screen === 'spin_plates') {
    window.renderPlateChests(el);
  } else if (screen === 'spin_process') {
    window.renderSpinProcess(el, params);
  } else if (screen === 'garage') {
    window.renderGarageScreen(el);
  } else if (screen === 'plates_inv') {
    window.renderPlatesInventory(el);
  } else if (screen === 'jobs') {
    window.renderJobsScreen(el);
  } else if (screen === 'daily') {
    window.renderDailyScreen(el);
  } else if (screen === 'settings') {
    window.renderSettingsScreen(el);
  } else if (screen === 'shop') {
    window.renderShopScreen(el);
  }
};

window.toggleLang = function() {
  app.state.settings.lang = app.state.settings.lang === 'ru' ? 'en' : 'ru';
  window.saveState();
  window.navigate('menu');
};

window.watchAdForCoins = async function() {
  const reward = await window.Ads.show();
  if (reward) {
    app.state.player.coins += 200;
    window.saveState();
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    alert('+ ' + window.formatMoney(200));
    window.navigate('menu');
  }
};

window.saveState = function() {
  app.state.lastSeenAt = Date.now();
  localStorage.setItem('garage_spin_save_v1', JSON.stringify(app.state));
};

function init() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  const saved = localStorage.getItem('garage_spin_save_v1');
  if (saved) {
    app.state = JSON.parse(saved);
  } else {
    app.state = {
      player: { coins: 2000, spinTickets: 0, gems: 0, streak: 0, lastClaimDate: null, rookieSpinsUsed: 0 },
      settings: { lang: 'ru', sound: true, haptic: true },
      cars: [],
      plates: [],
      jobs: { washProgress: 0, washCooldownEnd: 0, courierStart: 0, courierCooldownEnd: 0, lotteryCooldownEnd: 0 },
      plateLimit: 100,
      lastCollectTime: Date.now()
    };
  }

  // Миграции для старых сохранений
  if (!app.state.player) app.state.player = { coins: 500, spinTickets: 0, gems: 0, streak: 0, lastClaimDate: null };
  if (app.state.player.rookieSpinsUsed === undefined) app.state.player.rookieSpinsUsed = 0;
  if (!app.state.settings) app.state.settings = { lang: 'ru', sound: true, haptic: true };
  if (app.state.settings.sound === undefined) app.state.settings.sound = true;
  if (app.state.settings.haptic === undefined) app.state.settings.haptic = true;
  if (!app.state.cars) app.state.cars = [];
  if (!app.state.plates) app.state.plates = [];
  if (!app.state.jobs) app.state.jobs = { washProgress: 0, washCooldownEnd: 0, courierStart: 0, courierCooldownEnd: 0, lotteryCooldownEnd: 0 };
  if (!app.state.lastCollectTime) app.state.lastCollectTime = Date.now();
  if (!app.state.plateLimit) app.state.plateLimit = 100;

  if (app.state.cars.length === 0) {
    app.state.cars.push({ id: 'car_start', templateId: 'vaz_2101', name: 'ВАЗ-2101', rarity: 'Common', baseIncome: 10, color: '#8a4a2b', plateId: null });
  }

  window.saveState();
  window.Ads.init();
  window.navigate('menu');
}

document.addEventListener('DOMContentLoaded', init);
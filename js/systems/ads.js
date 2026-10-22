window.Ads = {
  blockId: 'YOUR_BLOCK_ID', // ← сюда вставим реальный
  controller: null,
  isReady: false,
  lastAdTime: 0,
  cooldownMs: 3 * 60 * 1000, // 3 минуты

  init: function() {
    if (typeof window.Adsgram === 'undefined') {
      console.warn('[ads] Adsgram SDK not loaded');
      return;
    }
    if (!this.blockId || this.blockId === 'YOUR_BLOCK_ID') {
      console.warn('[ads] blockId not set, ad disabled');
      return;
    }
    try {
      this.controller = window.Adsgram.init({ blockId: this.blockId });
      this.isReady = true;
      console.log('[ads] ready');
    } catch (e) {
      console.warn('[ads] init failed', e);
    }
  },

  canShow: function() {
    return (Date.now() - this.lastAdTime) >= this.cooldownMs;
  },

  cooldownRemaining: function() {
    const r = this.cooldownMs - (Date.now() - this.lastAdTime);
    return Math.max(0, Math.ceil(r / 1000));
  },

  // Возвращает Promise<boolean>: true — награда, false — нет
  show: function() {
    return new Promise((resolve) => {
      // Fallback: если реклама недоступна, не блокируем игрока
      if (!this.isReady || !this.controller) {
        // dev-режим: даём награду без рекламы (для теста)
        console.warn('[ads] SDK not ready, granting fallback reward');
        this.lastAdTime = Date.now();
        resolve(true);
        return;
      }
      if (!this.canShow()) {
        alert(window.t('ad_cooldown') + ': ' + this.cooldownRemaining() + ' сек');
        resolve(false);
        return;
      }
      this.controller.show().then((result) => {
        if (result && result.done) {
          this.lastAdTime = Date.now();
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch((err) => {
        console.warn('[ads] show error', err);
        // Награда-фолбэк: не блокируем
        this.lastAdTime = Date.now();
        resolve(true);
      });
    });
  }
};
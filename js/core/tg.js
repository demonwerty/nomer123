export const TG = window.Telegram?.WebApp || null;

export function initTelegram() {
  if (!TG) {
    console.warn('[tg] Not in Telegram, running in browser mode');
    return false;
  }
  TG.ready();
  TG.expand();
  try { TG.enableClosingConfirmation?.(); } catch (e) {}
  return true;
}

export function haptic(type = 'light') {
  if (!TG?.HapticFeedback) return;
  try {
    if (['success', 'error', 'warning'].includes(type)) {
      TG.HapticFeedback.notificationOccurred(type);
    } else {
      TG.HapticFeedback.impactOccurred(type);
    }
  } catch (e) {}
}

export function getUser() {
  return TG?.initDataUnsafe?.user || null;
}

export function isInTelegram() {
  return Boolean(TG?.initData);
}
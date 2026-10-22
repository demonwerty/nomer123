import { app } from '../core/state.js';
import { go } from '../core/router.js';
import { haptic } from '../core/tg.js';

export function renderMainMenu(root) {
  const s = app.strings;
  const p = app.state.player;

  root.innerHTML = `
    <div class="topbar">
      <div class="balance">
        <span class="bal-item">🪙 ${p.coins}</span>
        <span class="bal-item">🎟️ ${p.spinTickets}</span>
        <span class="bal-item">💎 ${p.gems}</span>
      </div>
      <div class="streak">🔥 ${p.streak}</div>
    </div>

    <div class="menu-hero">
      <h1 class="menu-title">GARAGE<span class="accent">SPIN</span></h1>
      <p class="menu-sub">${s['menu.tagline']}</p>
    </div>

    <div class="menu-grid">
      <button class="menu-btn primary" data-action="spin">
        <span class="btn-icon">🎰</span>
        <span class="btn-label">${s['menu.spin']}</span>
      </button>
      <button class="menu-btn" data-action="garage">
        <span class="btn-icon">🚗</span>
        <span class="btn-label">${s['menu.garage']}</span>
      </button>
      <button class="menu-btn" data-action="jobs">
        <span class="btn-icon">💼</span>
        <span class="btn-label">${s['menu.jobs']}</span>
      </button>
      <button class="menu-btn" data-action="daily">
        <span class="btn-icon">🎁</span>
        <span class="btn-label">${s['menu.daily']}</span>
      </button>
      <button class="menu-btn" data-action="referral">
        <span class="btn-icon">👥</span>
        <span class="btn-label">${s['menu.referral']}</span>
      </button>
      <button class="menu-btn" data-action="settings">
        <span class="btn-icon">⚙️</span>
        <span class="btn-label">${s['menu.settings']}</span>
      </button>
    </div>

    <p class="menu-version">v0.1 · ${s['menu.soon']}</p>
  `;

  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      haptic('light');
      const a = btn.dataset.action;
      if (a === 'referral') {
        alert(s['common.soon']);
        return;
      }
      // заглушки для экранов Этапа 1+
      alert(`${a}: ${s['common.soon']}`);
    });
  });
}
const routes = {};

export function register(name, renderFn) {
  routes[name] = renderFn;
}

export function navigate(name, params = {}) {
  const render = routes[name];
  if (!render) {
    console.error('[router] Route not found:', name);
    return;
  }
  const screen = document.getElementById('screen');
  screen.innerHTML = '';
  screen.classList.remove('fade-in');
  void screen.offsetWidth;
  screen.classList.add('fade-in');
  render(screen, params);
  window.scrollTo(0, 0);
}

export function go(name) {
  window.location.hash = '#/' + name;
}
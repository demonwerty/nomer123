export const app = {
  state: null,
  strings: {},
  lang: 'ru'
};

export function setState(s) { app.state = s; }
export function setLang(lang, strings) { app.lang = lang; app.strings = strings; }
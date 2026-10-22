/**
 * Данные и рендер номерных знаков.
 * Работает без ES-модулей: всё доступно через window.PLATES_DATA.
 *
 * Формат номера:
 *   mainChars — массив отдельных символов, которые крутятся в слоте;
 *   region    — код региона (RU / KZ);
 *   stateName — название штата (US);
 *   formatted — текстовая версия для confirm/alert и старых сохранений.
 */
window.PLATES_DATA = {
  version: 2,

  ruLetters: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],

  pools: {
    RU: {
      letters: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],
      digits: '0123456789'
    },
    KZ: {
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'X', 'Y'],
      digits: '0123456789'
    },
    BY: {
      letters: ['A', 'B', 'C', 'E', 'H', 'K', 'M', 'O', 'P', 'T', 'X', 'Y'],
      digits: '0123456789'
    },
    US: {
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      digits: '0123456789'
    }
  },

  // «Блатные» серии РФ: первая буква + 3 цифры + две последние буквы + регион
  ruBlat: [
    { first: 'А', last: 'МР', digits: '001', region: '77', rarity: 'Legendary' },
    { first: 'Е', last: 'КХ', digits: '001', region: '77', rarity: 'Legendary' },
    { first: 'С', last: 'МР', digits: '777', region: '77', rarity: 'Epic' },
    { first: 'А', last: 'ММ', digits: '999', region: '99', rarity: 'Epic' },
    { first: 'О', last: 'ОО', digits: '001', region: '97', rarity: 'Epic' }
  ],

  regionsRU: ['77', '99', '97', '50', '78', '23', '161', '116', '199', '777'],

  usStates: [
    'CALIFORNIA', 'TEXAS', 'FLORIDA', 'NEW YORK', 'NEVADA',
    'ARIZONA', 'COLORADO', 'OHIO', 'ILLINOIS', 'WASHINGTON'
  ],

  /* ------------------------- утилиты ------------------------- */

  _randInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  _pick: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  _randomDigits: function(length) {
    let out = '';
    for (let i = 0; i < length; i++) out += String(this._randInt(0, 9));
    return out;
  },

  _esc: function(value) {
    return String(value).replace(/[&<>"']/g, function(ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  },

  _bonusFor: function(rarity) {
    if (rarity === 'Rare') return 0.10;
    if (rarity === 'Epic') return 0.20;
    if (rarity === 'Legendary') return 0.40;
    if (rarity === 'Mythic') return 0.60;
    return 0;
  },

  getPools: function(country) {
    const pool = this.pools[country] || this.pools.RU;
    return {
      letters: pool.letters.slice(),
      digits: pool.digits.split('')
    };
  },

  /* ------------------------- генерация ------------------------- */

  generate: function(country) {
    country = country || 'RU';
    const pool = this.pools[country] || this.pools.RU;

    const rndLetter = () => this._pick(pool.letters);
    const rndDigit = () => this._pick(pool.digits.split(''));

    let mainChars = [];
    let region = '';
    let stateName = '';
    let rarity = 'Common';
    let isBlatnoy = false;

    if (country === 'RU') {
      if (Math.random() < 0.02) {
        // 2% — блатной номер
        const blat = this._pick(this.ruBlat);
        mainChars = [
          blat.first,
          blat.digits[0], blat.digits[1], blat.digits[2],
          blat.last[0], blat.last[1]
        ];
        region = blat.region;
        rarity = blat.rarity;
        isBlatnoy = true;
      } else {
        const first = rndLetter();
        const digits = this._randomDigits(3);
        const last = rndLetter() + rndLetter();
        mainChars = [first, digits[0], digits[1], digits[2], last[0], last[1]];
        region = this._pick(this.regionsRU);

        if (digits === '001' || digits === '777' || digits === '999') rarity = 'Rare';
        if (digits === '777' || digits === '999') rarity = 'Epic';
      }
    } else if (country === 'KZ') {
      const digits = this._randomDigits(3);
      const letters = rndLetter() + rndLetter() + rndLetter();
      region = String(this._randInt(1, 20)).padStart(2, '0');
      mainChars = digits.split('').concat(letters.split(''));

      if (digits === '001' || digits === '777' || digits === '999') rarity = 'Rare';
      if (letters[0] === letters[1] && letters[1] === letters[2]) rarity = 'Epic';
    } else if (country === 'BY') {
      const digits = this._randomDigits(4);
      const letter = rndLetter();
      const regionDigit = String(this._randInt(1, 7));
      mainChars = digits.split('').concat([letter, regionDigit]);

      if (digits === '7777' || digits === '0001' || digits === '1111') rarity = 'Rare';
    } else if (country === 'US') {
      const firstDigit = rndDigit();
      const letters = rndLetter() + rndLetter() + rndLetter();
      const digits = this._randomDigits(3);
      stateName = this._pick(this.usStates);
      mainChars = [firstDigit].concat(letters.split('')).concat(digits.split(''));

      if (digits === '777' || digits === '999' || digits === '001') rarity = 'Rare';
      if (letters === 'AAA' || letters === 'ZZZ') rarity = 'Epic';
    }

    return {
      id: 'plate_' + Date.now() + Math.random().toString(36).substr(2, 5),
      country: country,
      mainChars: mainChars,
      region: region,
      stateName: stateName,
      formatted: this.buildFormatted(country, mainChars, region, stateName),
      rarity: rarity,
      isBlatnoy: isBlatnoy,
      incomeBonus: this._bonusFor(rarity),
      equippedCarId: null
    };
  },

  // Нейтральный превью-номер для экрана прокрутки
  preview: function(country) {
    const plate = this.generate(country || 'RU');
    plate.rarity = 'Common';
    plate.isBlatnoy = false;
    plate.incomeBonus = 0;
    return plate;
  },

  /* ------------------------- текст / нормализация ------------------------- */

  buildFormatted: function(country, chars, region, stateName) {
    chars = (chars || []).map(String);

    if (country === 'RU') {
      return [
        chars[0] || '',
        chars.slice(1, 4).join(''),
        chars.slice(4, 6).join(''),
        region || ''
      ].filter(Boolean).join(' ');
    }

    if (country === 'KZ') {
      return [
        chars.slice(0, 3).join(''),
        chars.slice(3).join(''),
        region || ''
      ].filter(Boolean).join(' ');
    }

    if (country === 'BY') {
      const head = chars.slice(0, 4).join('');
      const middle = chars.slice(4, Math.max(5, chars.length - 1)).join('');
      const tail = chars.length > 4 ? chars[chars.length - 1] : '';
      return (head + ' ' + middle + '-' + tail).trim();
    }

    if (country === 'US') {
      return (stateName ? stateName + ' ' : '') + chars.join('');
    }

    return chars.join('');
  },

  formatText: function(plate) {
    if (!plate) return '';
    if (plate.formatted) return plate.formatted;
    const data = this.normalize(plate);
    return this.buildFormatted(data.country, data.mainChars, data.region, data.stateName);
  },

  /**
   * Приводит номер (включая старые сохранения, где был только formatted)
   * к актуальному виду: { country, mainChars, region, stateName }.
   */
  normalize: function(plate) {
    if (!plate) {
      return { country: 'RU', mainChars: [], region: '', stateName: '' };
    }

    const country = plate.country || 'RU';

    if (Array.isArray(plate.mainChars) && plate.mainChars.length) {
      return {
        country: country,
        mainChars: plate.mainChars.map(String),
        region: plate.region || '',
        stateName: plate.stateName || ''
      };
    }

    return this._parseFormatted(country, plate.formatted || '');
  },

  _parseFormatted: function(country, formatted) {
    const raw = String(formatted || '').toUpperCase().trim();
    const compact = raw.replace(/\s+/g, '');

    if (country === 'RU') {
      const m = compact.match(/^([А-ЯA-Z])(\d{3})([А-ЯA-Z]{2})(\d{2,3})$/);
      if (m) {
        return {
          country: 'RU',
          mainChars: [m[1]].concat(m[2].split('')).concat(m[3].split('')),
          region: m[4],
          stateName: ''
        };
      }
    }

    if (country === 'KZ') {
      const m = compact.match(/^(\d{3})([A-Z]{2,3})(\d{1,2})$/);
      if (m) {
        return {
          country: 'KZ',
          mainChars: m[1].split('').concat(m[2].split('')),
          region: String(m[3]).padStart(2, '0'),
          stateName: ''
        };
      }
    }

    if (country === 'BY') {
      const m = compact.match(/^(\d{4})([A-ZА-Я]{1,2})(\d)$/);
      if (m) {
        return {
          country: 'BY',
          mainChars: m[1].split('').concat(m[2].split('')).concat([m[3]]),
          region: '',
          stateName: ''
        };
      }
    }

    if (country === 'US') {
      // Новый формат: 1 цифра + 3 буквы + 3 цифры
      const fresh = compact.match(/^(\d)([A-Z]{3})(\d{3})$/);
      if (fresh) {
        return {
          country: 'US',
          mainChars: [fresh[1]].concat(fresh[2].split('')).concat(fresh[3].split('')),
          region: '',
          stateName: 'CALIFORNIA'
        };
      }

      // Старый формат: 3 буквы + 3-4 цифры
      const legacy = compact.match(/^([A-Z]{3})(\d{3,4})$/);
      if (legacy) {
        const digits = legacy[2].padStart(4, '0');
        return {
          country: 'US',
          mainChars: [digits[0]].concat(legacy[1].split('')).concat(digits.slice(1).split('')),
          region: '',
          stateName: 'CALIFORNIA'
        };
      }
    }

    return this._fallbackChars(country, compact);
  },

  _fallbackChars: function(country, raw) {
    const clean = String(raw || '').replace(/[^0-9A-ZА-Я]/gi, '').split('');
    if (!clean.length) {
      const plate = this.generate(country);
      return {
        country: plate.country,
        mainChars: plate.mainChars,
        region: plate.region,
        stateName: plate.stateName
      };
    }
    return {
      country: country,
      mainChars: clean.slice(0, 7),
      region: '',
      stateName: country === 'US' ? 'CALIFORNIA' : ''
    };
  },

  /**
   * Обновляет символы номера (используется после остановки слот-машины).
   */
  setChars: function(plate, chars) {
    if (!plate) return plate;
    const arr = Array.isArray(chars) ? chars.map(String) : String(chars || '').split('');
    plate.mainChars = arr;
    plate.formatted = this.buildFormatted(plate.country || 'RU', arr, plate.region || '', plate.stateName || '');
    return plate;
  },

  /* ------------------------- HTML-рендер ------------------------- */

  /**
   * @param {Object} plate
   * @param {Object} opts
   *   size: 'sm' | 'md' | 'lg' | 'xl'
   *   animated: true — добавить data-char-index/data-char-type для слот-анимации
   *   className: дополнительный класс
   */
  render: function(plate, opts) {
    opts = opts || {};
    const data = this.normalize(plate);
    const country = data.country || 'RU';
    const chars = data.mainChars || [];
    const size = opts.size || 'md';
    const animated = !!opts.animated;

    const classes = ['plate', 'plate-' + country, 'plate--' + size];
    if (plate && plate.rarity) classes.push('plate-rarity-' + String(plate.rarity).toLowerCase());
    if (opts.className) classes.push(opts.className);

    const idAttr = plate && plate.id ? ' data-plate-id="' + this._esc(plate.id) + '"' : '';

    const gapAfter = country === 'RU' ? { 0: true, 3: true }
      : country === 'KZ' ? { 2: true }
      : country === 'US' ? { 0: true, 3: true }
      : {};

    let charsHtml = '';
    chars.forEach(function(ch, idx) {
      const isDigit = /^[0-9]$/.test(ch);
      const cls = ['plate-char'];
      if (gapAfter[idx]) cls.push('gap-after');

      const attrs = animated
        ? ' data-char-index="' + idx + '" data-char-type="' + (isDigit ? 'digit' : 'letter') + '"'
        : '';

      charsHtml += '<span class="' + cls.join(' ') + '"' + attrs + '>' + this._esc(ch) + '</span>';

      if (country === 'BY' && idx === 3) {
        charsHtml += '<span class="plate-divider" aria-hidden="true"></span>';
      }
      if (country === 'BY' && idx === 4) {
        charsHtml += '<span class="plate-dash" aria-hidden="true">–</span>';
      }
    }, this);

    const main = '<div class="plate-main"><div class="plate-chars">' + charsHtml + '</div></div>';

    if (country === 'RU') {
      const region = data.region || '77';
      return '<div class="' + classes.join(' ') + '"' + idAttr + '>' +
        main +
        '<div class="plate-side plate-side--ru">' +
          '<span class="plate-region">' + this._esc(region) + '</span>' +
          '<span class="plate-country">' +
            '<i class="plate-flag plate-flag--ru" aria-hidden="true"></i>' +
            '<span class="plate-country-text">RUS</span>' +
          '</span>' +
        '</div>' +
      '</div>';
    }

    if (country === 'KZ') {
      const region = data.region || '01';
      return '<div class="' + classes.join(' ') + '"' + idAttr + '>' +
        '<div class="plate-country-block">' +
          '<i class="plate-flag plate-flag--kz" aria-hidden="true"></i>' +
          '<span class="plate-country-text">KZ</span>' +
        '</div>' +
        main +
        '<div class="plate-side plate-side--kz">' +
          '<span class="plate-region">' + this._esc(region) + '</span>' +
        '</div>' +
      '</div>';
    }

    if (country === 'BY') {
      return '<div class="' + classes.join(' ') + '"' + idAttr + '>' +
        '<div class="plate-country-block">' +
          '<i class="plate-flag plate-flag--by" aria-hidden="true"></i>' +
          '<span class="plate-country-text">BY</span>' +
        '</div>' +
        main +
      '</div>';
    }

    const stateName = data.stateName || 'CALIFORNIA';
    return '<div class="' + classes.join(' ') + '"' + idAttr + '>' +
      '<div class="plate-US-top">' + this._esc(stateName) + '</div>' +
      '<div class="plate-main plate-main--us"><div class="plate-chars">' + charsHtml + '</div></div>' +
    '</div>';
  }
};


window.PLATES_DATA = {
  // Данные для правой полосы номера. Цвет полосы задаётся CSS-классом страны.
  countries: {
    RU: { flag: '🇷🇺', code: 'RUS' },
    KZ: { flag: '🇰🇿', code: 'KAZ' },
    BY: { flag: '🇧🇾', code: 'BLR' },
    US: { flag: '🇺🇸', code: 'USA' }
  },

  ruLetters: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],
  ruBlat: [
    { letters: 'АМР', region: '77', rarity: 'Legendary' },
    { letters: 'ЕКХ', region: '77', rarity: 'Legendary' },
    { letters: 'СМР', region: '77', rarity: 'Epic' },
    { letters: 'АММ', region: '77', rarity: 'Epic' }
  ],
  usRegions: ['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'NJ', 'PA'],

  // Старый formatted остаётся для совместимости с сохранениями и confirm-диалогами.
  format: function(main, region, country) {
    if (!main) return region || '';
    if (!region) return main;
    return country === 'BY' ? main + '-' + region : main + ' ' + region;
  },

  // Разбирает старые номера, у которых был только formatted.
  splitFormatted: function(formatted, country) {
    const text = String(formatted || '').trim();
    if (!text) return { main: '', region: '' };

    if (country === 'BY') {
      const match = text.match(/^(.*?)(?:[-\s])(\d{1,2})$/);
      if (match) return { main: match[1].trim(), region: match[2] };
      return { main: text, region: '' };
    }

    const parts = text.split(/\s+/);
    if (country === 'RU' && parts.length >= 4) {
      return { main: parts.slice(0, -1).join(' '), region: parts[parts.length - 1] };
    }
    if (country === 'KZ' && parts.length >= 3) {
      return { main: parts.slice(0, -1).join(' '), region: parts[parts.length - 1] };
    }

    return { main: text, region: '' };
  },

  // Приводит и новый, и старый объект номера к единому виду для рендера.
  normalize: function(plate) {
    const src = plate || {};
    const requestedCountry = String(src.country || 'RU').toUpperCase();
    const country = this.countries[requestedCountry] ? requestedCountry : 'RU';
    const config = this.countries[country];
    const hasRegion = src.region !== undefined && src.region !== null && String(src.region).trim() !== '';
    const parsed = (!src.main || !hasRegion)
      ? this.splitFormatted(src.formatted, country)
      : { main: src.main, region: src.region };

    const main = String(src.main || parsed.main || src.formatted || '').trim();
    let region = String(hasRegion ? src.region : (parsed.region || '')).trim();
    if (!region && country === 'US') region = 'USA';

    return Object.assign({}, src, {
      country: country,
      main: main,
      region: region,
      formatted: src.formatted || this.format(main, region, country),
      countryCode: src.countryCode || config.code,
      flag: src.flag || config.flag
    });
  },

  generate: function(country) {
    const requestedCountry = String(country || 'RU').toUpperCase();
    const plateCountry = this.countries[requestedCountry] ? requestedCountry : 'RU';
    const config = this.countries[plateCountry];

    let main = '';
    let region = '';
    let rarity = 'Common';
    let isBlatnoy = false;

    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const rndLetter = () => this.ruLetters[Math.floor(Math.random() * this.ruLetters.length)];
    const rndLatin = (length) => Array.from(
      { length: length },
      () => String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');

    if (plateCountry === 'RU') {
      if (Math.random() < 0.02) { // 2% блатные
        const blat = this.ruBlat[Math.floor(Math.random() * this.ruBlat.length)];
        const num = String(rand(1, 999)).padStart(3, '0');
        main = `${blat.letters[0]} ${num} ${blat.letters.slice(1)}`;
        region = blat.region;
        rarity = blat.rarity;
        isBlatnoy = true;
      } else {
        const letters = `${rndLetter()}${rndLetter()}${rndLetter()}`;
        const num = String(rand(1, 999)).padStart(3, '0');
        const regions = ['77', '99', '97', '50', '78', '23', '161', '116'];
        region = regions[Math.floor(Math.random() * regions.length)];
        main = `${letters[0]} ${num} ${letters[1]}${letters[2]}`;
        if (num === '001' || num === '777' || num === '999') rarity = 'Rare';
      }
    } else if (plateCountry === 'US') {
      const letters = rndLatin(3);
      const num = String(rand(1000, 9999));
      main = `${letters} ${num}`;
      region = this.usRegions[Math.floor(Math.random() * this.usRegions.length)];
      if (num === '1111' || num === '7777') rarity = 'Rare';
    } else if (plateCountry === 'BY') {
      const letters = rndLatin(2);
      const num = String(rand(1000, 9999));
      main = `${num} ${letters}`;
      region = String(rand(1, 7));
    } else if (plateCountry === 'KZ') {
      const letters = rndLatin(2);
      const num = String(rand(1, 999)).padStart(3, '0');
      main = `${num} ${letters}`;
      region = String(rand(1, 20));
    }

    let bonus = 0;
    if (rarity === 'Rare') bonus = 0.10;
    if (rarity === 'Epic') bonus = 0.20;
    if (rarity === 'Legendary') bonus = 0.40;

    return {
      id: 'plate_' + Date.now() + Math.random().toString(36).substr(2, 5),
      country: plateCountry,
      main: main,
      region: region,
      formatted: this.format(main, region, plateCountry),
      countryCode: config.code,
      flag: config.flag,
      rarity: rarity,
      isBlatnoy: isBlatnoy,
      incomeBonus: bonus,
      equippedCarId: null
    };
  }
};

function escapePlateHtml(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function(char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

// Собирает настоящий номерной знак: основное поле + правая полоса региона/страны.
window.renderPlateHTML = function(plateObj) {
  const plate = window.PLATES_DATA.normalize(plateObj);
  const main = escapePlateHtml(plate.main || plate.formatted);
  const region = escapePlateHtml(plate.region || '—');
  const countryCode = escapePlateHtml(plate.countryCode || plate.country);
  const flag = escapePlateHtml(plate.flag || '');
  const countryClass = String(plate.country || 'RU').toLowerCase().replace(/[^a-z]/g, '') || 'ru';
  const ariaLabel = escapePlateHtml([plate.main, plate.region, plate.countryCode].filter(Boolean).join(', '));

  return `
    <div class="real-plate real-plate--${countryClass}" role="img" aria-label="${ariaLabel}">
      <div class="real-plate-main">${main}</div>
      <div class="real-plate-side">
        <div class="real-plate-region">${region}</div>
        <div class="real-plate-country">
          <span class="real-plate-flag">${flag}</span>
          <span class="real-plate-code">${countryCode}</span>
        </div>
      </div>
    </div>
  `;
};
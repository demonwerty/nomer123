window.PLATES_DATA = {
  ruLetters: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],
  ruBlat: [
    { letters: 'АМР', region: '77', rarity: 'Legendary' },
    { letters: 'ЕКХ', region: '77', rarity: 'Legendary' },
    { letters: 'СМР', region: '77', rarity: 'Epic' },
    { letters: 'АММ', region: '77', rarity: 'Epic' }
  ],
  
  generate: function(country) {
    let formatted = '';
    let rarity = 'Common';
    let isBlatnoy = false;
    
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const rndLetter = () => this.ruLetters[Math.floor(Math.random() * this.ruLetters.length)];

    if (country === 'RU') {
      if (Math.random() < 0.02) { // 2% блатные
        const blat = this.ruBlat[Math.floor(Math.random() * this.ruBlat.length)];
        const num = String(rand(1, 999)).padStart(3, '0');
        formatted = `${blat.letters[0]} ${num} ${blat.letters.slice(1)} ${blat.region}`;
        rarity = blat.rarity;
        isBlatnoy = true;
      } else {
        const letters = `${rndLetter()}${rndLetter()}${rndLetter()}`;
        const num = String(rand(1, 999)).padStart(3, '0');
        const regions = ['77', '99', '97', '50', '78', '23', '161', '116'];
        const region = regions[Math.floor(Math.random() * regions.length)];
        formatted = `${letters[0]} ${num} ${letters[1]}${letters[2]} ${region}`;
        if (num === '001' || num === '777' || num === '999') rarity = 'Rare';
      }
    } else if (country === 'US') {
      const letters = Array.from({length: 3}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      const num = String(rand(1000, 9999));
      formatted = `${letters} ${num}`;
      if (num === '1111' || num === '7777') rarity = 'Rare';
    } else if (country === 'BY') {
      const letters = Array.from({length: 2}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      const num = String(rand(1000, 9999));
      const region = rand(1, 7);
      formatted = `${num} ${letters}-${region}`;
    } else if (country === 'KZ') {
      const letters = Array.from({length: 2}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      const num = String(rand(1, 999)).padStart(3, '0');
      formatted = `${num} ${letters} ${rand(1, 20)}`;
    }

    let bonus = 0;
    if (rarity === 'Rare') bonus = 0.10;
    if (rarity === 'Epic') bonus = 0.20;
    if (rarity === 'Legendary') bonus = 0.40;

    return {
      id: 'plate_' + Date.now() + Math.random().toString(36).substr(2, 5),
      country, formatted, rarity, isBlatnoy, incomeBonus: bonus, equippedCarId: null
    };
  }
};
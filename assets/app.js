/* Режим «без бумаги» – инструмент Грега (03.10.2026: «ползунок в меню, который отключает фактуры, обводки и подписи карандашом –
   всё "не цифровое"»; виден только на локальном сайте или после ?plain=1). Когда включён, у <html> снимаются классы бумаги
   (papier, papier-swiatlo): assets/papier*.js сами не запускаются, стили html.papier… не действуют; «бумажное» вне этой системы
   (сгиб, перфорация, тень листа) гасит html.plain в styles.css, карандашные иконки меняются на обычные. Состояние – localStorage
   'ap-plain'; ?plain=1 / ?plain=0 в адресе включает и выключает режим и показывает ползунок и на опубликованном сайте
   ('ap-plain-ui'). Сам ползунок «Papier» ставит блок меню компьютера ниже. В кадрах стендов docs/… режим не действует.
   Правило: новое бумажное украшение – под html.papier либо с отменой под html.plain, иначе режим «протечёт». */
(function () {
  var root = document.documentElement, ls = null, q = /[?&]plain=([01])(?:&|$)/.exec(location.search);
  try { if (window.top !== window && /\/docs\//.test(window.parent.location.pathname)) return; } catch (e) {}
  try { ls = window.localStorage; ls.getItem('ap-plain'); } catch (e) { ls = null; }
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$|\.local$/.test(location.hostname);
  if (q && ls) { ls.setItem('ap-plain', q[1]); ls.setItem('ap-plain-ui', '1'); }
  var on = q ? q[1] === '1' : !!ls && ls.getItem('ap-plain') === '1';
  window.AP_PLAIN = { on: on, ui: local || !!q || (!!ls && ls.getItem('ap-plain-ui') === '1'),
    set: function (v) {
      if (ls) ls.setItem('ap-plain', v ? '1' : '0');
      var u = new URL(location.href);
      if (u.searchParams.has('plain')) { u.searchParams.set('plain', v ? '1' : '0'); location.replace(u.toString()); } else location.reload();
    } };
  if (!on) return;
  root.classList.remove('papier', 'papier-swiatlo'); root.classList.add('plain');
  /* иконки карандашом → обычные: ico-*-reka.svg → ico-*.svg, без увеличения */
  Array.prototype.forEach.call(document.querySelectorAll('img[src*="-reka.svg"]'), function (im) {
    im.src = im.getAttribute('src').replace('-reka.svg', '.svg'); im.classList.remove('gdz-crest--big');
  });
})();

(function () {
  // Словарь для часов и календаря: язык берётся из <html lang>
  var I18N = {
    pl: { months: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
          wd: ['Pn','Wt','Śr','Cz','Pt','So','Nd'], summer: 'czas letni', winter: 'czas zimowy',
          open: 'Teraz pracujemy', closed: 'Poza godzinami', sat: 'Sobota – po uzgodnieniu', sun: 'Niedziela – nieczynne',
          msgOpenLate: 'Zdążymy dziś – piszemy zwykle w ciągu 15 minut.', msgOpen: 'Odpowiadamy zwykle w ciągu 15 minut.',
          msgToday: 'Napisz teraz – odpowiemy dziś od 7:00.', msgTomorrow: 'Napisz teraz – odpowiemy jutro od 7:00.',
          msgFri: 'Napisz teraz – w sobotę pracujemy po uzgodnieniu, najpóźniej odpiszemy w poniedziałek od 7:00.',
          msgSat: 'Napisz, a potwierdzimy termin. Standardowo wracamy w poniedziałek od 7:00.',
          msgSun: 'Zgłoszenie przyjmiemy teraz, odpowiemy w poniedziałek od 7:00.',
          msgOff: 'Odpowiadamy jak zwykle, ale urzędy są dziś zamknięte, więc dokumenty złożymy w najbliższy dzień roboczy.', holiday: 'Dzień ustawowo wolny', msgNext: 'Napisz teraz – odpowiemy w najbliższy dzień roboczy od 7:00.',
          book: { hint: 'Kliknij dostępny dzień – wybierzesz porę spotkania.', tz: 'czas warszawski', pick: 'Wybierz porę spotkania', cta: 'Umów spotkanie', note: 'Dokładną godzinę potwierdzimy w odpowiedzi.', late: 'Na dziś jest już za późno – wybierz inny dzień.', placeL: 'Miejsce spotkania',
                  parts: ['Rano','Południe','Wieczór'], place: 'Śródmieście, centrum Warszawy',
                  msg: 'Dzień dobry! Chcę umówić spotkanie w Śródmieściu: {date}, {part}, godz. {time} czasu warszawskiego.' },
          hol: { ny: 'Nowy Rok', epi: 'Święto Trzech Króli', may1: 'Święto Pracy', may3: 'Święto Konstytucji 3 Maja',
                 aug15: 'Wniebowzięcie NMP · Święto Wojska Polskiego', nov1: 'Wszystkich Świętych', nov11: 'Narodowe Święto Niepodległości',
                 xmasEve: 'Wigilia Bożego Narodzenia', xmas1: 'Boże Narodzenie – pierwszy dzień', xmas2: 'Boże Narodzenie – drugi dzień', easter: 'Wielkanoc',
                 easterMon: 'Poniedziałek Wielkanocny', pent: 'Zielone Świątki', corpus: 'Boże Ciało' } },
    uk: { months: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
          wd: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'], summer: 'літній час', winter: 'зимовий час',
          open: 'Зараз працюємо', closed: 'Поза робочими годинами', sat: 'Субота – за домовленістю', sun: 'Неділя – вихідний',
          msgOpenLate: 'Встигнемо сьогодні – відповідаємо зазвичай за 15 хвилин.', msgOpen: 'Відповідаємо зазвичай за 15 хвилин.',
          msgToday: 'Напишіть зараз – відповімо сьогодні з 7:00.', msgTomorrow: 'Напишіть зараз – відповімо завтра з 7:00.',
          msgFri: 'Напишіть зараз – у суботу працюємо за домовленістю, найпізніше відповімо в понеділок з 7:00.',
          msgSat: 'Напишіть, і ми підтвердимо термін. Зазвичай повертаємося в понеділок з 7:00.',
          msgSun: 'Заявку приймемо зараз, відповімо в понеділок з 7:00.',
          msgOff: 'Відповідаємо як завжди. Установи сьогодні зачинені – документи подамо найближчого робочого дня.', holiday: 'Державний вихідний у Польщі', msgNext: 'Напишіть зараз – відповімо найближчого робочого дня з 7:00.',
          book: { hint: 'Натисніть на доступний день – оберете час зустрічі.', tz: 'час варшавський', pick: 'Оберіть час', cta: 'Записатися', note: 'Точний час підтвердимо у відповіді.', late: 'На сьогодні вже запізно – оберіть інший день.', placeL: 'Місце зустрічі',
                  parts: ['Ранок','Обід','Вечір'], place: 'Середмістя, центр Варшави',
                  msg: 'Добрий день! Хочу записатися на зустріч у Середмісті: {date}, {part}, {time} за варшавським часом.' },
          hol: { ny: 'Новий рік', epi: 'Богоявлення (Трьох Королів)', may1: 'День праці', may3: 'День Конституції 3 Травня',
                 aug15: 'Успіння Богородиці · День Війська Польського', nov1: 'День усіх святих', nov11: 'День Незалежності Польщі',
                 xmasEve: 'Святвечір (Wigilia)', xmas1: 'Різдво – перший день', xmas2: 'Різдво – другий день', easter: 'Великдень',
                 easterMon: 'Великодній понеділок', pent: 'Зелені свята', corpus: 'Свято Тіла Господнього' } },
    ru: { months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
          wd: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], summer: 'летнее время', winter: 'зимнее время',
          open: 'Сейчас работаем', closed: 'Вне рабочих часов', sat: 'Суббота – по договорённости', sun: 'Воскресенье – выходной',
          msgOpenLate: 'Успеем сегодня – отвечаем обычно за 15 минут.', msgOpen: 'Отвечаем обычно за 15 минут.',
          msgToday: 'Напишите сейчас – ответим сегодня с 7:00.', msgTomorrow: 'Напишите сейчас – ответим завтра с 7:00.',
          msgFri: 'Напишите сейчас – в субботу работаем по договорённости, самое позднее ответим в понедельник с 7:00.',
          msgSat: 'Напишите, и мы подтвердим срок. Обычно возвращаемся в понедельник с 7:00.',
          msgSun: 'Заявку примем сейчас, ответим в понедельник с 7:00.',
          msgOff: 'Отвечаем как обычно. Учреждения сегодня закрыты – документы подадим в ближайший рабочий день.', holiday: 'Государственный выходной в Польше', msgNext: 'Напишите сейчас – ответим в ближайший рабочий день с 7:00.',
          book: { hint: 'Нажмите на доступный день – выберете время встречи.', tz: 'время варшавское', pick: 'Выберите время', cta: 'Записаться', note: 'Точное время подтвердим в ответном сообщении.', late: 'На сегодня уже поздно – выберите другой день.', placeL: 'Место встречи',
                  parts: ['Утро','Обед','Вечер'], place: 'Средместье, центр Варшавы',
                  msg: 'Здравствуйте! Хочу записаться на встречу в Средместье: {date}, {part}, {time} по варшавскому времени.' },
          hol: { ny: 'Новый год', epi: 'Богоявление (Трёх Королей)', may1: 'День труда', may3: 'День Конституции 3 Мая',
                 aug15: 'Успение Богородицы · День Войска Польского', nov1: 'День всех святых', nov11: 'День Независимости Польши',
                 xmasEve: 'Сочельник (Wigilia)', xmas1: 'Рождество – первый день', xmas2: 'Рождество – второй день', easter: 'Пасха',
                 easterMon: 'Пасхальный понедельник', pent: 'Троица', corpus: 'Праздник Тела Господня' } },
    en: { months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
          wd: ['Mo','Tu','We','Th','Fr','Sa','Su'], summer: 'summer time', winter: 'winter time',
          open: 'Open now', closed: 'Outside working hours', sat: 'Saturday – by arrangement', sun: 'Sunday – closed',
          msgOpenLate: 'Still today – we usually reply within 15 minutes.', msgOpen: 'We usually reply within 15 minutes.',
          msgToday: 'Write now – we reply today from 7:00.', msgTomorrow: 'Write now – we reply tomorrow from 7:00.',
          msgFri: 'Write now – Saturdays by arrangement, we reply by Monday 7:00 at the latest.',
          msgSat: 'Write and we will confirm a time. Normally we are back on Monday from 7:00.',
          msgSun: 'We take your request now and reply on Monday from 7:00.',
          msgOff: 'We reply as usual. Offices are closed today – we file documents on the next working day.', holiday: 'Public holiday in Poland', msgNext: 'Write now – we reply on the next working day from 7:00.',
          book: { hint: 'Click an available day to pick a meeting time.', tz: 'Warsaw time', pick: 'Pick a time', cta: 'Book a meeting', note: 'We confirm the exact time in our reply.', late: 'It is too late for today – pick another day.', placeL: 'Meeting place',
                  parts: ['Morning','Afternoon','Evening'], place: 'Śródmieście, central Warsaw',
                  msg: 'Hello! I would like to book a meeting in Śródmieście: {date}, {part}, {time} Warsaw time.' },
          hol: { ny: 'New Year', epi: 'Epiphany', may1: 'Labour Day', may3: 'Constitution Day (3 May)',
                 aug15: 'Assumption · Polish Armed Forces Day', nov1: 'All Saints', nov11: 'Independence Day',
                 xmasEve: 'Christmas Eve', xmas1: 'Christmas Day', xmas2: 'Second day of Christmas', easter: 'Easter Sunday',
                 easterMon: 'Easter Monday', pent: 'Pentecost', corpus: 'Corpus Christi' } }
  };
  var L = I18N[(document.documentElement.lang || 'pl').slice(0, 2)] || I18N.pl;

  // Польские dni ustawowo wolne od pracy – общие для статуса «работаем / не работаем» и календаря.
  // Пасха по алгоритму Meeus/Jones/Butcher – подвижные праздники считаются, а не зашиты
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100,
        d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        mo = Math.floor((h + l - 7 * m + 114) / 31),
        da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  }
  var holCache = {};
  function holidays(y) {
    if (holCache[y]) return holCache[y];
    var map = {};
    function put(mo, da, name) { map[mo + '-' + da] = name; }
    function putDate(d, name) { put(d.getMonth() + 1, d.getDate(), name); }
    put(1, 1, L.hol.ny);
    put(1, 6, L.hol.epi);
    put(5, 1, L.hol.may1);
    put(5, 3, L.hol.may3);
    put(8, 15, L.hol.aug15);
    put(11, 1, L.hol.nov1);
    put(11, 11, L.hol.nov11);
    if (y >= 2025) put(12, 24, L.hol.xmasEve);   // Wigilia – день ustawowo wolny с 2025 года (Dz.U. 2024 poz. 1965)
    put(12, 25, L.hol.xmas1);
    put(12, 26, L.hol.xmas2);
    var e = easter(y);
    putDate(e, L.hol.easter);
    putDate(new Date(y, e.getMonth(), e.getDate() + 1), L.hol.easterMon);
    putDate(new Date(y, e.getMonth(), e.getDate() + 49), L.hol.pent);
    putDate(new Date(y, e.getMonth(), e.getDate() + 60), L.hol.corpus);
    holCache[y] = map;
    return map;
  }
  // Логотип: плавно уменьшается пропорционально прокрутке (1.36 → 1.00 на первых 160px)
  var header = document.getElementById('top');
  var LOGO_MAX = 1.36, LOGO_MIN = 1, LOGO_RANGE = 160;
  var logoTicking = false, logoLast = null;
  var logoEl = header && header.querySelector('.logo-brand');
  var logoW = 0; // ширина логотипа с исходными буквами – по ней считается плашка
  function applyLogoScale() {
    logoTicking = false;
    /* до 1280px увеличенный логотип съедал место у меню (шаг между пунктами теперь всегда 24px),
       поэтому там он всегда обычного размера */
    if (window.innerWidth < 1280) {
      if (logoLast !== '1.0000') {
        header.style.setProperty('--logo-scale', '1');
        header.style.setProperty('--logo-extra', '0px');
        logoLast = '1.0000';
      }
      return;
    }
    var p = Math.min(Math.max(window.scrollY, 0) / LOGO_RANGE, 1);
    p = p * p * (3 - 2 * p); // сглаживание на концах – без рывка в начале и в конце
    var s = (LOGO_MAX - (LOGO_MAX - LOGO_MIN) * p).toFixed(4);
    if (s !== logoLast) {
      header.style.setProperty('--logo-scale', s); logoLast = s;
      // плашка логотипа: transform не меняет габарит, поэтому запас справа считаем сами
      if (logoEl) header.style.setProperty('--logo-extra', ((s - 1) * logoW).toFixed(1) + 'px');
    }
  }
  // Ширина логотипа фиксируется (--logo-w): при наведении буквы подменяются знаками других
  // алфавитов и слово меняет ширину, а плашка должна стоять. Меряем без фиксации и не под курсором;
  // повторяем при смене ширины окна (кегль другой) и после загрузки шрифта.
  function measureLogo() {
    if (!logoEl || logoEl.matches(':hover')) return;
    header.style.removeProperty('--logo-w');
    /* в пилюле кегль логотипа уменьшен (--hp) – замер приводим к полному кеглю --logo-fs. Иначе на iPhone
       прокрутка (панели Safari сворачиваются – для страницы это resize) записывала уменьшенную ширину,
       пилюля ужимала логотип ещё раз, и подпись «/ Cennik» наезжала на него (Грег, 23.09.2026) */
    var fs = parseFloat(getComputedStyle(logoEl).fontSize);
    var base = parseFloat(getComputedStyle(header).getPropertyValue('--logo-fs')) || fs;
    logoW = Math.round(logoEl.offsetWidth * base / fs);
    header.style.setProperty('--logo-w', logoW + 'px');
    logoLast = null; applyLogoScale();
  }
  measureLogo();
  window.addEventListener('resize', measureLogo, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureLogo);
  window.addEventListener('scroll', function () {
    if (!logoTicking) { logoTicking = true; requestAnimationFrame(applyLogoScale); }
  }, { passive: true });
  window.addEventListener('resize', applyLogoScale, { passive: true });
  applyLogoScale();

  // Едущая подсветка: плита институтов, список институтов, таблица «Dla kogo tłumaczymy»
  function movingPlate(hostId, plateSel, itemSel, padX, padY, startIndex) {
    var host = document.getElementById(hostId);
    if (!host) return;
    var plate = host.querySelector(plateSel);
    var items = Array.prototype.slice.call(host.querySelectorAll(itemSel));
    if (!plate || !items.length) return;
    var active = Math.min(Math.max(startIndex || 0, 0), items.length - 1);

    function moveTo(i) {
      var hr = host.getBoundingClientRect();
      var ir = items[i].getBoundingClientRect();
      plate.style.left = (ir.left - hr.left - padX) + 'px';
      plate.style.top = (ir.top - hr.top - padY) + 'px';
      plate.style.width = (ir.width + padX * 2) + 'px';
      plate.style.height = (ir.height + padY * 2) + 'px';
      items.forEach(function (el, n) { el.classList.toggle('is-active', n === i); });
      active = i;
    }

    // плашка остаётся там, где мышь была последний раз – без возврата
    items.forEach(function (el, i) { el.addEventListener('mouseenter', function () { moveTo(i); }); });
    window.addEventListener('resize', function () { moveTo(active); }, { passive: true });

    function init() { host.classList.add('is-ready'); moveTo(active); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
    else window.addEventListener('load', init);
    setTimeout(init, 1200);

    return { refresh: function () { moveTo(active); } };
  }

  // плашка по умолчанию стоит на «Sąd Okręgowy» (индекс 1), а не на первой колонке
  movingPlate('slab-grid', '.slab-bg', '.slab-cell', 0, 0, 1);

  // Пояснение под заголовком блока 2 – меняется при наведении, всегда на виду
  (function () {
    var box = document.getElementById('tl-def');
    if (!box) return;
    var words = Array.prototype.slice.call(document.querySelectorAll('.pw-hot[data-def]'));
    var panels = Array.prototype.slice.call(box.querySelectorAll('.tl-def-panel'));
    if (!words.length || !panels.length) return;

    function apply(i) {
      words.forEach(function (w, n) { w.setAttribute('aria-expanded', String(n === i)); });
      panels.forEach(function (pl, n) { pl.classList.toggle('is-open', n === i); });
    }

    words.forEach(function (w, i) {
      w.addEventListener('mouseenter', function () { apply(i); });
      w.addEventListener('focus', function () { apply(i); });
      w.addEventListener('click', function () { apply(i); });
    });
    apply(0);
  })();

  // «cały proces zdalnie» – выезжает справа через 3 секунды после загрузки
  (function () {
    var el = document.querySelector('.hero-sub-in');
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) { el.classList.add('is-in'); return; }
    setTimeout(function () { el.classList.add('is-in'); }, 3000);
  })();

  // Языки в hero: стрелка стоит на месте, список бесконечно едет вверх
  (function () {
    var host = document.getElementById('lang-ticker');
    if (!host) return;
    var view = host.querySelector('.lang-t-view');
    var list = host.querySelector('.lang-t-list');
    if (!view || !list) return;
    var base = Array.prototype.slice.call(list.children);
    if (!base.length) return;
    var n = base.length;
    // три копии списка: сверху и снизу всегда есть строки, стык не виден
    for (var c = 0; c < 2; c++) {
      base.forEach(function (li) {
        var d = li.cloneNode(true);
        d.setAttribute('aria-hidden', 'true');
        list.appendChild(d);
      });
    }
    var items = Array.prototype.slice.call(list.children);
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var step = 0, active = n, jump = null;

    function place(i, instant) {
      if (instant) list.classList.add('no-anim');
      list.style.transform = 'translate3d(0,' + (-(i - 2) * step) + 'px,0)';
      items.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
      if (instant) { void list.offsetHeight; list.classList.remove('no-anim'); }
      active = i;
    }

    function measure() {
      items.forEach(function (el) { el.style.height = ''; });
      // строки разных алфавитов имеют разную высоту – берём максимум и фиксируем её,
      // иначе центр активной строки уезжает и стрелка кажется дрожащей
      var h = 0;
      base.forEach(function (el) { h = Math.max(h, el.getBoundingClientRect().height); });
      if (!h) return;                       // блок скрыт на узких экранах
      h = Math.round(h * 2) / 2;
      step = h;
      items.forEach(function (el) { el.style.height = h + 'px'; });
      view.style.height = (h * 5) + 'px';   // видно пять строк, активная – по центру
      place(active, true);
      host.classList.add('is-live');
    }

    function tick() {
      if (!step) return;
      var next = active + 1;
      place(next);
      if (next >= 2 * n) {                  // доехали до третьей копии – бесшумно возвращаемся
        clearTimeout(jump);
        jump = setTimeout(function () { place(next - n, true); }, 850);
      }
    }

    measure();
    // шрифт подгружается асинхронно и меняет высоту строки – пересчитываем
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    setTimeout(measure, 1200);
    if (!reduce) setInterval(tick, 2400);
    window.addEventListener('resize', measure, { passive: true });
  })();

  // Слово на плашке меняется каждые 4 секунды, выталкиваясь снизу вверх; клик ведёт к описанию
  (function () {
    var el = document.querySelector('.swap');
    if (!el) return;
    var wa = el.querySelector('.swap-a'), wb = el.querySelector('.swap-b');
    if (!wa || !wb) return;
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var showB = false;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Przejdź do opisu tłumaczeń');

    function swap() {
      var out = showB ? wb : wa, inn = showB ? wa : wb;
      out.classList.remove('go-in', 'go-out');
      inn.classList.remove('go-in', 'go-out');
      void el.offsetWidth;                 // перезапуск анимации
      out.classList.add('go-out'); out.classList.remove('is-on');
      inn.classList.add('go-in');  inn.classList.add('is-on');
      showB = !showB;
      el.classList.toggle('is-swapped', showB);
    }

    if (!reduce) setInterval(swap, 4000);

    function goToDef() {
      var idx = showB ? 1 : 0;             // видно «Konsularne» → его описание
      var word = document.querySelector('.pw-hot[data-def="' + idx + '"]');
      if (word && word.getAttribute('aria-expanded') !== 'true') word.click();
      var target = document.getElementById('tlumaczenia');
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    el.addEventListener('click', goToDef);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDef(); }
    });
  })();

  // Бегущий список языков кликабелен так же, как стрелка рядом
  (function () {
    var host = document.getElementById('lang-ticker');
    if (!host) return;
    var view = host.querySelector('.lang-t-view');
    var arrow = host.querySelector('.lang-t-arrow');
    if (!view) return;
    view.setAttribute('role', 'link');
    view.setAttribute('tabindex', '0');
    view.setAttribute('aria-label', 'Przejdź do listy języków tłumaczeń');
    function go() { var t = document.getElementById('jezyki'); if (t) { location.hash = '#jezyki'; } }
    view.addEventListener('click', go);
    view.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
    function hot(on) { host.classList.toggle('is-hot', on); }
    [view, arrow].forEach(function (el) {
      if (!el) return;
      el.addEventListener('mouseenter', function () { hot(true); });
      el.addEventListener('mouseleave', function () { hot(false); });
      el.addEventListener('focus', function () { hot(true); });
      el.addEventListener('blur', function () { hot(false); });
    });
  })();

  // Стрелка «наверх»: появляется после первого экрана
  (function () {
    var btn = document.querySelector('.to-top');
    if (!btn) return;
    var foot = document.querySelector('body > main');   // подвал закреплён, ориентир – конец контента
    var GAP = 63;                       // зазор между стрелкой и краем контента
    /* На телефоне и тач-экранах стрелка висит над правым краем контента – там цены, «+» у вопросов,
       часы работы, стрелки карточек – и закрывала их на каждом экране. Поэтому там она появляется,
       только когда человек листает вверх (то есть хочет вернуться) или дошёл до конца страницы;
       при движении вниз не мешает чтению (21.09.2026). С 23.09.2026 так на всех ширинах (Грег: «сделай везде так»). */
    var lastY = window.scrollY, goingUp = false;
    function check(){
      var y = window.scrollY;
      if (Math.abs(y - lastY) > 8) { goingUp = y < lastY; lastY = y; }
      var deep = y > window.innerHeight * 0.6;
      var atEnd = foot && foot.getBoundingClientRect().bottom < window.innerHeight + 80;
      btn.classList.toggle('is-live', deep && (goingUp || atEnd));
      // стрелка упирается в футер и не заходит на него
      var base = window.matchMedia('(max-width:640px)').matches ? 28 : 64;   /* было 100 – зазор под кнопку WhatsApp, её убрали 20.09.2026 */
      /* на телефоне внизу может висеть кнопка «Zamów wycenę» (.m-dock, 26.09.2026) – стрелка встаёт над ней */
      var dock = document.documentElement.classList.contains('mdock-on') ? document.querySelector('.m-dock') : null;
      if (dock) base = Math.max(base, window.innerHeight - dock.getBoundingClientRect().top + 14);
      var bottom = base;
      if (foot) {
        var top = foot.getBoundingClientRect().bottom;
        var limit = window.innerHeight - top + GAP;
        if (limit > bottom) bottom = limit;
      }
      btn.style.bottom = bottom + 'px';
    }
    window.addEventListener('scroll', check, { passive:true });
    window.addEventListener('resize', check);
    window.addEventListener('mdock', check);
    check();
    btn.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  })();

  // Шапка в режиме бургера (уже 1150px) – «пилюля» по центру: логотип, название страницы и бургер, высота 50px
  // (Грег, 23.09.2026 – сворачивалась при прокрутке; с 24.09.2026 – пилюля всегда, разворот только под меню).
  // Степень сворачивания --hp (0…1) и поле с боков --ps ставит этот скрипт, вид – в styles.css.
  (function () {
    var head = document.getElementById('top');
    var row = head && head.querySelector('.hdr-row');
    if (!row) return;
    var logoSeg = row.querySelector('.hdr-seg--logo'), langSeg = row.querySelector('.hdr-seg--lang');
    var logoEl = logoSeg.querySelector('.logo-brand');
    /* Где я (Грег, 23.09.2026): текущий пункт меню – по самому длинному совпадению адреса (подстраницы
       переводов попадают в «Tłumaczenia»); ссылки с якорем (#faq, #gdzie) не считаются. Пункт получает
       сдвиг и пульсирующую точку перед названием (точку рисует styles.css), а его название стоит лёгким серым рядом с логотипом в пилюле. */
    var here = null, hereLen = 0, pageLabel = null;
    /* языковой префикс не мешает сравнению: страницы языков /tlumaczenia-przysiegle/ukrainski/… написаны по-украински и т.д.,
       а меню у них от /ua|ru|en/ – пункт «Переклади» должен найтись (28.09.2026) */
    var np = function (p) { return p.replace(/^\/(ua|ru|en)(?=\/)/, ''); };
    Array.prototype.forEach.call(document.querySelectorAll('#mobile-nav .mn-link'), function (a) {
      var u = new URL(a.href, location.href);
      if (u.hash || u.pathname.split('/').filter(Boolean).length === (/^\/(ua|ru|en)\//.test(u.pathname) ? 1 : 0)) return;
      if (np(location.pathname).indexOf(np(u.pathname)) === 0 && u.pathname.length > hereLen) { here = a; hereLen = u.pathname.length; }
    });
    /* страница вне пути своего раздела (/apostille-ukraina/, /apostille-bez-przyjazdu/) – раздел из <meta name="hdr-par" content="/apostille/">:
       в меню отмечается он, в шапке – «/ Apostille / Имя» (Грег, 02.10.2026: «не все мелкие подстраницы отображаются серым») */
    var parMeta = document.querySelector('meta[name="hdr-par"]');
    if (!here && parMeta) Array.prototype.forEach.call(document.querySelectorAll('#mobile-nav .mn-link'), function (a) {
      if (np(new URL(a.href, location.href).pathname) === np(parMeta.content.trim())) here = a;
    });
    if (here) {
      here.classList.add('is-here');
      here.setAttribute('aria-current', 'page');
    }
    /* главная пункта в меню не имеет – подпись по языку страницы (Грег, 24.09.2026: «на главной /Główna») */
    var HOME = { pl: 'Główna', uk: 'Головна', ru: 'Главная', en: 'Home' };
    var pageName = here ? here.firstChild.textContent.trim()
      : /^\/((ua|ru|en)\/)?(index\.html)?$/.test(location.pathname) ? HOME[document.documentElement.lang] : '';
    /* подстраница (Грег, 30.09.2026): «/ Apostille / Niekaralność» – короткое имя берётся из
       <meta name="hdr-sub"> страницы; на главной и разделах меню его нет */
    var subMeta = document.querySelector('meta[name="hdr-sub"]');
    var sub = here && subMeta ? subMeta.content.trim() : '';
    /* подстраница, которая сама пункт меню (/apostille/gdzie/ – «Gdzie załatwić»): раздел – пункт меню уровнем выше,
       «/ Apostille / Gdzie załatwić», а не «/ Gdzie załatwić / Gdzie załatwić» (02.10.2026) */
    if (sub && np(new URL(here.href, location.href).pathname) === np(location.pathname)) {
      var sec = null, secLen = 0;
      Array.prototype.forEach.call(document.querySelectorAll('#mobile-nav .mn-link'), function (a) {
        var u = new URL(a.href, location.href);
        if (a === here || u.hash || u.pathname.split('/').filter(Boolean).length === (/^\/(ua|ru|en)\//.test(u.pathname) ? 1 : 0)) return;
        if (np(location.pathname).indexOf(np(u.pathname)) === 0 && u.pathname.length > secLen) { sec = a; secLen = u.pathname.length; }
      });
      if (sec) pageName = sec.firstChild.textContent.trim(); else sub = '';
    }
    var parLen = sub ? pageName.length + 3 : 0;      /* «Apostille / » – прячется, если пилюля не помещается */
    if (sub) pageName += '\u00a0/\u00a0' + sub;
    if (pageName) {
      pageLabel = document.createElement('span');
      pageLabel.className = 'hdr-page';
      pageLabel.setAttribute('aria-hidden', 'true');
      /* «/ Cennik» по буквам: черта первой (порог .12), буквы следом от .25 до .85 – появляются из черты
         и в неё же уходят (Грег, 23.09.2026); пороги --s читает styles.css */
      var word = pageName.split('');
      ['/\u00a0'].concat(word).forEach(function (ch, i) {
        var sp = document.createElement('span');
        sp.textContent = ch;
        sp.style.setProperty('--s', i ? (.25 + .6 * (i - 1) / word.length).toFixed(3) : '.12');
        if (i && i <= parLen) sp.className = 'hp-par';
        else if (parLen && i > parLen) sp.className = 'hp-sub';   /* имя подстраницы – на 2 кегля меньше (styles.css; Грег, 02.10.2026) */
        pageLabel.appendChild(sp);
      });
      logoEl.insertAdjacentElement('afterend', pageLabel);
    }
    var root = document.documentElement;
    var mq = window.matchMedia('(max-width:1149px)');
    var calm = window.matchMedia('(prefers-reduced-motion:reduce)');
    /* нажатие по пилюле мимо логотипа и бургера (подпись «/ Cennik», поля) – к началу страницы: подпись называет
       страницу и ведёт к её началу, как нажатие на строку состояния в iPhone; мёртвых мест в пилюле нет
       (Грег, 23.09.2026: подпись оставить – «нравится по эстетике», – но дать ей дело). Логотип – на главную, как был */
    row.addEventListener('click', function (e) {
      if (!root.classList.contains('hdr-pill') || logoEl.contains(e.target) || langSeg.contains(e.target)) return;
      window.scrollTo({ top:0, behavior: calm.matches ? 'auto' : 'smooth' });
    });
    /* С 24.09.2026 пилюля – основной вид шапки на мобильных, сразу с названием страницы (Грег: «пилюлю основным
       и сразу с написанием текущей страницы, а при клике на бургер разворачиваем»). Прокрутка вид шапки больше
       не меняет. Полный ряд – пока открыто меню или панель wyceny (они рисуются от полного ряда) и пока фокус
       с клавиатуры внутри шапки. Разворот и сворачивание – в темпе меню (.34s) */
    var away = false, settle = 0, hp = 0;
    var ZOOM = 1.36, ZOOM_RANGE = 160, zMax = 1, zTick = false;
    function set(v) {
      if (v === away) return;
      away = v;
      root.classList.toggle('hdr-away', v);
      /* шапка поменялась без прокрутки – пересчитать светлую / тёмную плашку */
      clearTimeout(settle);
      settle = setTimeout(function () { window.dispatchEvent(new Event('scroll')); }, 760);
    }
    /* anim: false – за пальцем, без анимации; true – доводка .7s; 'menu' – разворот под меню в темпе самого
       меню (.34s, как растёт плашка в styles.css), чтобы из пилюли меню выезжало так же, как с полной шапки */
    function apply(anim) {
      var cs = getComputedStyle(head);
      var w = head.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      /* ширина пилюли – по свёрнутому виду: логотип уменьшен на --shr, подпись страницы раскрыта полностью */
      var shr = parseFloat(cs.getPropertyValue('--shr')) || 0;
      /* подпись с подстраницей не входит (телефон: бургер уезжал за край) – остаётся «/ Niekaralność» */
      if (pageLabel && parLen) pageLabel.classList.remove('hp-short');
      var lw = pageLabel ? pageLabel.scrollWidth : 0;
      /* дробные ширины: целые offsetWidth в свёрнутом и развёрнутом виде округляются по-разному, и пилюля после
         закрытия меню выходила на 2px уже, чем при загрузке */
      function bw(el) { return el.getBoundingClientRect().width; }
      var pad = bw(logoSeg) - bw(logoEl) - (pageLabel ? bw(pageLabel) + parseFloat(getComputedStyle(pageLabel).marginLeft) + parseFloat(getComputedStyle(pageLabel).marginRight) : 0);
      var logoW = parseFloat(cs.getPropertyValue('--logo-w')) || logoEl.offsetWidth;
      /* поле слева от логотипа в пилюле = полю справа от линий бургера (Грег, 23.09.2026: «слишком большой
         отступ между лого и левым краем»): сдвиг логотипа 18px уходит к --pill-x */
      var burger = document.getElementById('burger'), bLine = burger && burger.querySelector('span');
      var rightGap = bLine ? langSeg.offsetWidth - burger.offsetLeft - (burger.offsetWidth + bLine.offsetWidth) / 2 : 18;
      var pillX = Math.max(0, rightGap - parseFloat(getComputedStyle(logoSeg).paddingLeft));
      head.style.setProperty('--pill-x', pillX + 'px');
      var free = function () { return (w - pad - logoW * (1 - shr) - lw - (pageLabel ? pillX + 10 + 10 : 0) - langSeg.offsetWidth) / 2; };
      if (parLen && free() < 12) { pageLabel.classList.add('hp-short'); lw = pageLabel.scrollWidth; }
      if (pageLabel) head.style.setProperty('--lw', lw + 'px');
      var ps = Math.max(0, free());
      /* доводка без рывка: начинает мягко и тормозит к концу (Грег, 23.09.2026: «в конце сжатия ещё медленнее») */
      head.style.transition = !anim || calm.matches ? 'none'
        : anim === 'menu' ? '--hp .34s cubic-bezier(.2,.7,.25,1)' : '--hp 1s cubic-bezier(.35,0,.15,1)';
      head.style.setProperty('--ps', ps + 'px');
      /* ширина пилюли – для кнопки «Zamów wycenę» внизу экрана (.m-dock): она по размеру и форме как пилюля (Грег, 27.09.2026) */
      root.style.setProperty('--pill-w', (w - 2 * ps) + 'px');
      /* наибольшее увеличение у верха страницы: 1.36, но по бокам остаётся не меньше 12px воздуха – иначе на
         телефоне пилюля вставала бы от края до края, как прежняя полная шапка. На 320 «/ Cennik» (240px) – ×1.13 */
      zMax = Math.max(1, Math.min(ZOOM, (w - 24) / Math.max(1, w - 2 * ps)));
      zoom();
      /* за пальцем сворачивание замедляется к концу: вид = 1 − (1 − путь)² – у пилюли скорость сходит на нет */
      head.style.setProperty('--hp', 1 - (1 - hp) * (1 - hp));
      root.classList.toggle('hdr-pill', hp > 0);
    }
    function wantsFull() {
      if (root.classList.contains('menu-open') || root.classList.contains('qd-open')) return true;
      var a = document.activeElement;
      try { return !!a && head.contains(a) && a.matches(':focus-visible'); } catch (e) { return false; }
    }
    /* anim – как в apply(); вызов без смены состояния ничего не трогает, иначе оборвал бы идущую анимацию */
    function update(anim) {
      if (!mq.matches) {
        /* уже сброшено – ничего не трогаем: вызов приходит и от MutationObserver на классах <html>, а
           classList.remove пишет атрибут даже без изменений – наблюдатель зациклился бы и повесил страницу */
        if (hp === 0 && head.style.getPropertyValue('--hp') === '') return;
        hp = 0; root.classList.toggle('hdr-pill', false);
        head.style.transition = ''; head.style.removeProperty('--hp'); set(false); return;
      }
      var next = wantsFull() ? 0 : 1;
      if (next === hp && head.style.getPropertyValue('--hp') !== '') return;
      hp = next;
      apply(anim);
      set(hp === 1);
    }
    update(false);                                   /* сразу пилюлей, без анимации */
    /* ширина пилюли зависит от ширины окна и шрифта – пересчёт без анимации */
    function refit() { if (mq.matches) apply(false); }
    /* У верха страницы пилюля крупнее – ×1.36, как логотип на десктопе, и за первые 160px прокрутки плавно
       приходит к обычному размеру (Грег, 24.09.2026: «при загрузке пилюля больше на 36%, по мере скрола
       уменьшается»). Масштаб – transform от верхнего края (styles.css, --pz × --hp): место шапки в потоке
       не меняется, страница не дёргается; при открытии меню --hp → 0, и масштаб сходит к 1 вместе с разворотом */
    function zoom() {
      zTick = false;
      var p = Math.min(Math.max(window.scrollY, 0) / ZOOM_RANGE, 1);
      p = p * p * (3 - 2 * p);                       /* сглаживание на концах, как у логотипа на десктопе */
      head.style.setProperty('--pz', ((zMax - 1) * (1 - p)).toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (mq.matches && !zTick) { zTick = true; requestAnimationFrame(zoom); }
    }, { passive: true });
    /* кириллица Fira Sans грузится отдельно и позже – когда на странице впервые нужны её буквы («/ Контакты») */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refit);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
    }
    window.addEventListener('resize', refit, { passive: true });
    head.addEventListener('focusin', function () { update('menu'); });
    head.addEventListener('focusout', function () { setTimeout(function () { update('menu'); }, 0); });
    new MutationObserver(function () { update('menu'); })
      .observe(root, { attributes: true, attributeFilter: ['class'] });
    (mq.addEventListener ? mq.addEventListener('change', function () { update(false); }) : mq.addListener(function () { update(false); }));
  })();


  // Переключатель языка в шапке (переделан 12.09.2026 по аудиту меню).
  // Единственное состояние – aria-expanded на кнопке; CSS показывает список по нему.
  // Открытие: клик / Enter / Space / стрелка вниз, а при мыши – ещё и наведение.
  // Закрытие: Escape, клик мимо, уход фокуса, выбор пункта, ресайз.
  // Пункты – ссылки: href ставится на ту же страницу в другом языке, обычный клик
  // перехватывается ради проверки HEAD (нет страницы – уходим на главную языка),
  // клик с модификатором или средней кнопкой отдаём браузеру.
  (function () {
    var btn = document.getElementById('lang-switch');
    var pop = document.getElementById('lang-pop');
    if (!btn || !pop) return;
    var wrap = btn.closest('.lang-wrap');
    var seg = btn.closest('.hdr-seg--lang');
    var label = btn.querySelector('.ls-now');
    var opts = Array.prototype.slice.call(pop.querySelectorAll('.lang-opt'));
    var hoverMq = window.matchMedia('(hover:hover) and (pointer:fine)');
    var byHover = false, leaveTimer = 0;

    function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }
    /* плашка языка расширяется вниз ровно на высоту списка (слой ::after, высота --lang-h) */
    function open() {
      clearTimeout(leaveTimer);
      if (isOpen()) return;
      btn.setAttribute('aria-expanded', 'true');
      if (seg) {
        /* до lg список центрируется под кнопкой: её середина относительно плашки */
        var b = btn.getBoundingClientRect(), sr = seg.getBoundingClientRect();
        seg.style.setProperty('--lang-x', (b.left + b.width / 2 - sr.left) + 'px');
        seg.style.setProperty('--lang-h', pop.offsetHeight + 'px');
      }
    }
    function close(focusBtn) {
      clearTimeout(leaveTimer);
      byHover = false;
      if (!isOpen()) return;
      btn.setAttribute('aria-expanded', 'false');
      if (seg) seg.style.setProperty('--lang-h', '0px');
      if (focusBtn) btn.focus();
    }

    /* та же страница в другой языковой версии: /ua/kontakt/ ↔ /kontakt/ ↔ /en/kontakt/ */
    var LANG_DIRS = ['ua', 'ru', 'en'];
    /* страницы, которых пока нет в ua/ru/en: ведём на раздел уровнем выше (иначе 404) */
    var PL_ONLY = /^(tlumaczenia-przysiegle\/(ukrainski|rosyjski|angielski|jezyk-angielski)|apostille-bez-przyjazdu|apostille\/[a-z-]+)$/;   /* 28.09.2026: и /apostille-bez-przyjazdu/, и будущие подстраницы /apostille/… – копий ua/ru/en у них нет */
    function samePageIn(code) {
      var parts = location.pathname.split('/').filter(Boolean);
      if (parts.length && LANG_DIRS.indexOf(parts[0]) !== -1) parts.shift();
      /* пара английской страницы (02.10.2026): /tlumaczenia-przysiegle/angielski/ (EN) ↔ /tlumaczenia-przysiegle/jezyk-angielski/ (PL) */
      var pj = parts.join('/');
      if (code === 'pl' && pj === 'tlumaczenia-przysiegle/angielski') return '/tlumaczenia-przysiegle/jezyk-angielski/' + location.hash;
      if (code === 'en' && pj === 'tlumaczenia-przysiegle/jezyk-angielski') return '/tlumaczenia-przysiegle/angielski/' + location.hash;
      if (code !== 'pl' && PL_ONLY.test(parts.join('/'))) parts.pop();
      /* страницы языков /tlumaczenia-przysiegle/{ukrainski,rosyjski,angielski}/ написаны на своём языке (28.09.2026), польской версии
         у них нет – и «Polski» ведёт на раздел переводов, а не на ту же страницу */
      else if (code === 'pl' && /^tlumaczenia-przysiegle\/(ukrainski|rosyjski|angielski)$/.test(parts.join('/'))) parts.pop();
      if (code !== 'pl') parts.unshift(code);
      return '/' + parts.join('/') + (parts.length ? '/' : '') + location.hash;
    }
    function homeIn(code) { return code === 'pl' ? '/' : '/' + code + '/'; }
    function nameOf(o) { var n = o.querySelector('.lo-name'); return (n || o).textContent.trim(); }
    function isCurrent(o) {
      return o.getAttribute('aria-current') === 'true' || o.classList.contains('is-current');
    }
    /* ссылки ведут на ту же страницу в другом языке – работает и средняя кнопка, и «открыть в новой вкладке» */
    opts.forEach(function (o) {
      var code = o.getAttribute('data-lang');
      if (code && o.tagName === 'A') o.setAttribute('href', samePageIn(code));
    });

    function setLang(name, from) {
      if (label) {
        btn.classList.add('is-changing');
        setTimeout(function () {
          Array.prototype.slice.call(label.querySelectorAll('.nl-a, .nl-b'))
            .forEach(function (n) { n.textContent = name; });
          btn.classList.remove('is-changing');
        }, 170);
      }
      opts.forEach(function (o) {
        o.classList.toggle('is-current', o === from);
        if (o === from) o.setAttribute('aria-current', 'true'); else o.removeAttribute('aria-current');
      });
    }
    /* остаёмся на той же странице; если её нет в этом языке – уходим на главную языка */
    function goTo(o) {
      var code = o.getAttribute('data-lang');
      var already = isCurrent(o);
      close(true);
      if (!code || already) return;
      setLang(nameOf(o), o);
      var url = samePageIn(code), home = homeIn(code);
      if (url === home) { location.href = url; return; }
      var done = false;
      function go(to) { if (!done) { done = true; location.href = to; } }
      setTimeout(function () { go(url); }, 1500);      /* проверка затянулась – идём как раньше */
      fetch(url.split('#')[0], { method: 'HEAD' })
        .then(function (r) { go(r.ok ? url : home); })
        .catch(function () { go(url); });
    }
    opts.forEach(function (o) {
      o.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        goTo(o);
      });
    });

    /* Языки в мобильном меню (21.09.2026). В режиме бургера (уже 1150px) переключатель из ряда шапки убран
       стилями – там остаётся только «Zamów wycenę», – поэтому те же языки стоят первой строкой в панели меню.
       Строка собирается из списка .lang-pop: одна логика на все страницы и языковые версии, разметку
       панели править не нужно. Переход – тот же goTo(): та же страница в другом языке с проверкой HEAD. */
    (function () {
      var mnav = document.getElementById('mobile-nav');
      if (!mnav || mnav.querySelector('.mn-langs')) return;
      var host = mnav.querySelector('.mn-in') || mnav.firstElementChild || mnav;
      var row = document.createElement('div');
      row.className = 'mn-langs';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Language');
      var HREFLANG = { pl: 'pl', ua: 'uk', ru: 'ru', en: 'en' };
      opts.forEach(function (o) {
        var code = o.getAttribute('data-lang');
        if (!code) return;
        var a = document.createElement('a');
        a.className = 'mn-lang' + (isCurrent(o) ? ' is-current' : '');
        a.href = samePageIn(code);
        a.setAttribute('hreflang', HREFLANG[code] || code);
        a.setAttribute('lang', HREFLANG[code] || code);
        if (isCurrent(o)) a.setAttribute('aria-current', 'true');
        /* полное название и код: на экранах уже 340px четыре названия в строку не входят – там показан код */
        var full = document.createElement('span'); full.className = 'mn-lang-full'; full.textContent = nameOf(o);
        var short = document.createElement('span'); short.className = 'mn-lang-code'; short.textContent = code.toUpperCase();
        short.setAttribute('aria-hidden', 'true');
        a.setAttribute('aria-label', nameOf(o));
        a.appendChild(full); a.appendChild(short);
        a.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          goTo(o);          /* текущий язык goTo пропускает; панель меню закрывает её собственный обработчик ссылок */
        });
        row.appendChild(a);
      });
      if (row.children.length) host.insertBefore(row, host.firstChild);
    })();

    /* клик по кнопке только раскрывает и сворачивает список; язык меняют пункты.
       Если список уже открыт наведением, клик его закрепляет, а не закрывает. */
    btn.addEventListener('click', function () {
      if (!isOpen()) { open(); byHover = false; }
      else if (byHover) byHover = false;
      else close();
    });
    /* стрелки: вниз с кнопки – открыть и встать на первый пункт; в списке – по кругу, Home/End */
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); open(); byHover = false;
        var o = opts[e.key === 'ArrowDown' ? 0 : opts.length - 1];
        if (o) o.focus();
      }
    });
    pop.addEventListener('keydown', function (e) {
      var i = opts.indexOf(document.activeElement);
      if (i === -1) return;
      var n = opts.length, to = -1;
      if (e.key === 'ArrowDown') to = (i + 1) % n;
      else if (e.key === 'ArrowUp') to = (i - 1 + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to === -1) return;
      e.preventDefault(); opts[to].focus();
    });
    /* уход фокуса из обёртки закрывает список (Tab дальше по странице) */
    if (wrap) wrap.addEventListener('focusout', function (e) {
      if (!wrap.contains(e.relatedTarget)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(true); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (isOpen() && wrap && !wrap.contains(e.target)) close();
    });
    /* наведение – только там, где есть мышь; тач-устройства открывают тапом */
    if (wrap) {
      wrap.addEventListener('mouseenter', function () {
        if (!hoverMq.matches) return;
        clearTimeout(leaveTimer);
        if (!isOpen()) { open(); byHover = true; }
      });
      wrap.addEventListener('mouseleave', function () {
        if (!hoverMq.matches || !byHover) return;
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(function () { if (byHover) close(); }, 150);
      });
    }
    window.addEventListener('resize', function () { close(); }, { passive: true });
    /* бургер открылся – список языков не нужен */
    var burger = document.getElementById('burger');
    if (burger) burger.addEventListener('click', function () { close(); });
  })();

  // Окно с описанием шага
  (function () {
    var modal = document.getElementById('step-modal');
    var data = document.getElementById('step-data');
    if (!modal || !data) return;
    var kick = modal.querySelector('.step-modal-kicker');
    var title = modal.querySelector('.step-modal-title');
    var body = modal.querySelector('.step-modal-body');
    var items = Array.prototype.slice.call(data.children);
    var lastFocus = null;

    function open(i) {
      var src = items[i];
      if (!src) return;
      kick.textContent = src.getAttribute('data-kicker');
      title.textContent = src.getAttribute('data-title');
      body.innerHTML = src.innerHTML;
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
      var close = modal.querySelector('.step-modal-close');
      if (close) close.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () { if (!modal.classList.contains('is-open')) modal.hidden = true; }, 320);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // открываем по клику в любом месте карточки, не только по стрелке
    document.querySelectorAll('.step-card').forEach(function (card) {
      var btn = card.querySelector('.step-go');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-step'), 10);
      card.addEventListener('click', function () { open(idx); });
      btn.addEventListener('click', function (e) { e.stopPropagation(); open(idx); });
    });
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  })();

  // Плита институтов: описание раскрывается по клику
  (function () {
    var grid = document.getElementById('slab-grid');
    if (!grid) return;
    var cells = Array.prototype.slice.call(grid.querySelectorAll('.slab-cell'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.slab-panel'));
    if (!cells.length || !panels.length) return;
    /* Уже 1024px высоту блока описаний задаёт только открытый текст (styles.css, «Мобильный проход
       21.09.2026»): остальные выведены из потока. Чтобы плита не дёргалась при смене колонки,
       высота переезжает от старого значения к новому, после перехода инлайн-значение снимается. */
    var box = document.querySelector('.slab-panels');
    var narrow = window.matchMedia('(max-width:1023px)');
    var still = window.matchMedia('(prefers-reduced-motion:reduce)');
    var current = -1, hTimer = 0;
    function apply(i) {
      var glide = box && current !== -1 && current !== i && narrow.matches && !still.matches;
      var h0 = glide ? box.getBoundingClientRect().height : 0;
      cells.forEach(function (c, n) {
        c.classList.toggle('is-open', n === i);
        c.setAttribute('aria-expanded', String(n === i));
      });
      panels.forEach(function (pl, n) { pl.classList.toggle('is-open', n === i); });
      current = i;
      if (!glide) return;
      clearTimeout(hTimer);
      box.style.height = '';
      var h1 = box.getBoundingClientRect().height;
      if (Math.abs(h1 - h0) < 1) return;
      box.style.height = h0 + 'px';
      void box.offsetHeight;
      box.style.height = h1 + 'px';
      hTimer = setTimeout(function () { box.style.height = ''; }, 480);
    }

    var collapse = document.getElementById('slab-collapse');
    var closeBtn = document.querySelector('.slab-close');

    function openIt() { if (collapse) collapse.classList.remove('is-closed'); }

    // текст меняется вслед за колонкой; закрыть можно крестиком, открыть – кликом по колонке
    cells.forEach(function (c, i) {
      c.addEventListener('mouseenter', function () { apply(i); });
      c.addEventListener('click', function () { apply(i); openIt(); });
      c.addEventListener('focus', function () { apply(i); openIt(); });
    });
    if (closeBtn) closeBtn.addEventListener('click', function () {
      if (collapse) collapse.classList.add('is-closed');
    });
    apply(1);
  })();
  movingPlate('inst-wrap', '.row-bg', '.soft-row', -6, -6);

  // Подчёркивание в списке языков: ширина по видимому сейчас слову
  Array.prototype.slice.call(document.querySelectorAll('.lang-list')).forEach(function (wrap) {
    var bar = wrap.querySelector('.lang-bg');
    var items = Array.prototype.slice.call(wrap.querySelectorAll('.lang-chip:not(.lang-chip--accent)'));
    if (!bar || !items.length) return;
    var PADX = 4, PADY = -3, active = 0, activeHover = false, lastCol = false, flyT = null;

    function place(i, hover) {
      var item = items[i];
      var word = item.querySelector(hover ? '.ls-b' : '.ls-a') || item;
      var wr = wrap.getBoundingClientRect();
      var ir = item.getBoundingClientRect();
      var rr = word.getBoundingClientRect();
      var col = Math.round(ir.left - wr.left) > 4;

      function apply() {
        bar.style.left = (ir.left - wr.left - PADX) + 'px';
        bar.style.top = (ir.top - wr.top - PADY) + 'px';
        bar.style.width = (rr.width + PADX * 2) + 'px';
        bar.style.height = (ir.height + PADY * 2) + 'px';
      }

      if (col !== lastCol && wrap.classList.contains('is-ready')) {
        // другая колонка – гасим, мгновенно переносим, зажигаем: без полёта через всю ширину
        clearTimeout(flyT);
        bar.classList.add('is-jump');
        flyT = setTimeout(function () {
          bar.classList.add('no-anim');
          apply();
          void bar.offsetHeight;
          bar.classList.remove('no-anim');
          bar.classList.remove('is-jump');
        }, 160);
      } else {
        apply();
      }
      lastCol = col;
      active = i; activeHover = hover;
    }

    items.forEach(function (el, i) {
      el.addEventListener('mouseenter', function () { place(i, true); });
      el.addEventListener('mouseleave', function () { place(i, false); });
    });
    window.addEventListener('resize', function () { place(active, activeHover); }, { passive: true });

    function init() { wrap.classList.add('is-ready'); place(0, false); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
    else window.addEventListener('load', init);
    setTimeout(init, 1200);
  });

  // Карточки шагов проявляются по очереди – один раз за загрузку страницы
  (function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.rise'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      items.forEach(function (el) { el.classList.add('rise-done'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) {
          if (el.classList.contains('is-in')) return;
          el.classList.remove('rise-done');
          void el.offsetWidth;                       // перезапуск анимации
          el.classList.add('is-in');
          el.addEventListener('animationend', function () {
            el.classList.add('rise-done');
          }, { once: true });
          io.unobserve(el);                          // показываем только один раз
        }
      });
    }, { threshold: [0, 0.2], rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  // Пункты меню: помечаем те, над которыми уже был курсор, чтобы возврат шёл снизу
  Array.prototype.slice.call(document.querySelectorAll('header .navlink')).forEach(function (a) {
    a.addEventListener('mouseenter', function () { a.classList.add('was-hovered'); });
  });

  // Ссылки на юридические тексты раскрывают соответствующий аккордеон
  (function () {
    function openHash(hash) {
      if (hash !== '#polityka-prywatnosci' && hash !== '#regulamin') return;
      var d = document.querySelector(hash);
      if (d && d.tagName === 'DETAILS') d.open = true;
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (a) openHash(a.getAttribute('href'));
    });
    window.addEventListener('hashchange', function () { openHash(location.hash); });
    openHash(location.hash);
  })();

  // Логотип в футере: подгоняем кегль так, чтобы слово занимало всю ширину
  (function () {
    var box = document.querySelector('.footer-mark');
    if (!box) return;
    var word = box.querySelector('.logo');
    /* на телефоне (колонки подвала в один столбец, уже 640px) слово стоит вертикально вдоль правого края –
       см. «Футер на телефоне» в styles.css: там оно занимает высоту подвала, а не ширину окна */
    var upright = window.matchMedia('(max-width:639px)');
    function fit() {
      box.style.setProperty('--fm-size', '100px');
      var size;
      if (upright.matches) {
        var foot = document.getElementById('stopka');
        var len = word.offsetWidth;                 /* слово повёрнуто: rect дал бы его толщину, а не длину */
        if (!len || !foot) return;
        /* по 12px от верхнего и нижнего края; не крупнее 0.8 ширины окна – иначе на узком экране
           буквы заняли бы больше половины подвала */
        size = Math.min((100 * (foot.clientHeight - 24) / len) * 0.955 - 0.04, foot.clientWidth * 0.8);
        box.style.setProperty('--fm-size', size.toFixed(2) + 'px');
        return;
      }
      var w = word.getBoundingClientRect().width;
      if (!w) return;
      var cs = getComputedStyle(box);
      var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      size = (100 * avail / w) * 0.955 - 0.04;
      box.style.setProperty('--fm-size', size.toFixed(2) + 'px');
      drop(size);
    }
    /* сдвигаем слово вниз так, чтобы его низ ушёл за край страницы на 0.22em */
    function drop(size) {
      box.style.setProperty('--fm-drop', '0px');
      var footer = document.getElementById('stopka');
      if (!footer) return;
      var d = footer.getBoundingClientRect().bottom
            - word.getBoundingClientRect().bottom + size * 0.22;
      box.style.setProperty('--fm-drop', d.toFixed(2) + 'px');
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    fit();

  })();

  // Перебор символов разных алфавитов на логотипах (шапка и футер)
  (function () {
    var pools = ['A\u0391\u0102\u00c5\u039b','p\u0440\u03c0\u03c1\u03c6','o\u043e\u03a9\u03b8\u00f8\u03c3','s\u0441\u0161\u03a3\u00a7\u015f','t\u0442\u03c4\u0166\u0163\u0167','i\u0456\u0131\u00ef\u00ee','l\u0142\u013a\u013c\u0399\u2310','o\u043e\u00f8\u03b8\u0398\u014d','*\u2733\u2736\u273b\uff0a'];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function ease(t){ return 1 - Math.pow(1 - t, 3); }

    function attach(box, back) {
      if (!box) return;
      var cells = Array.prototype.slice.call(box.querySelectorAll('b'));
      if (!cells.length) return;
      var orig = cells.map(function (c) { return c.textContent; });
      var raf = null;

      function run(duration, target) {
        cancelAnimationFrame(raf);
        var t0 = performance.now();
        var lastSwap = cells.map(function () { return 0; });
        var live = cells.map(function () { return true; });
        (function step(now) {
          var done = true;
          cells.forEach(function (c, i) {
            if (!live[i]) return;
            var p = Math.min(1, (now - t0) / duration);
            var e = ease(p);
            if (p >= 1) { c.textContent = target[i]; live[i] = false; return; }
            done = false;
            var gap = 30 + 120 * e;
            if (now - lastSwap[i] >= gap) {
              lastSwap[i] = now;
              var pool = pools[i] || orig[i];
              var ch, guard = 0;
              do { ch = pool.charAt(Math.floor(Math.random() * pool.length)); }
              while (ch === c.textContent && ++guard < 4);
              c.textContent = ch;
            }
          });
          if (!done) raf = requestAnimationFrame(step);
        })(t0);
      }

      function altSet() {
        return cells.map(function (c, i) {
          var pool = (pools[i] || orig[i]).slice(1);
          return pool.charAt(Math.floor(Math.random() * pool.length)) || orig[i];
        });
      }

      // наведение – приходит к новому набору символов
      // без перебора: символы сразу встают в новую форму
      function set(target){ cells.forEach(function (c, i) { c.textContent = target[i]; }); }
      box.addEventListener('mouseenter', function () { set(altSet()); });
      // в шапке символы возвращаются к обычным, в футере остаются
      if (back) {
        // --- залипание: после ухода курсора символы держатся HOLD мс ---
        var HOLD = 330, hold = null;
        var reset = function () {
          clearTimeout(hold);
          hold = setTimeout(function () { set(orig); }, HOLD);
        };
        box.addEventListener('mouseenter', function () { clearTimeout(hold); });
        box.addEventListener('mouseleave', reset);
        box.addEventListener('pointerleave', reset);
        box.addEventListener('pointercancel', reset);
        box.addEventListener('blur', reset);
      }
    }

    attach(document.querySelector('.footer-mark'), false);
    attach(document.querySelector('header .logo-brand'), true);
  })();


  // Логотип светлеет, когда оказывается над тёмным блоком
  (function () {
    var logo = document.querySelector('header .logo-brand');
    var links = Array.prototype.slice.call(
      document.querySelectorAll('header .navlink, header .lang-switch'));
    if (!logo) return;
    var segs = Array.prototype.slice.call(document.querySelectorAll('header .hdr-glass'));
    var row = document.querySelector('header .hdr-row');
    var darks = Array.prototype.slice.call(
      document.querySelectorAll('.slab, section.bg-ink, .footer-tone'));
    if (!darks.length) return;
    var ticking = false;
    function check() {
      ticking = false;
      function overDark(el) {
        var r = el.getBoundingClientRect();
        /* в режиме бургера шапка уезжает вверх при прокрутке вниз (html.hdr-away): фон под ней считаем
           по её месту «дома», иначе, возвращаясь, она на треть секунды показывала бы не тот цвет */
        var ty = 0;
        try { ty = new DOMMatrixReadOnly(getComputedStyle(header).transform).m42 || 0; } catch (e) {}
        var top = r.top - ty, bottom = r.bottom - ty;
        return darks.some(function (d0) {
          var d = d0.getBoundingClientRect();
          return d.top < bottom && d.bottom > top && d.left < r.right && d.right > r.left;
        });
      }
      /* Плашка шапки одна на весь ряд, поэтому решение принимаем один раз по ряду:
         иначе части инвертировались бы порознь и плашка расслаивалась бы на куски. */
      var dark = overDark(row || logo);
      if (row) row.classList.toggle('on-dark', dark);
      logo.classList.toggle('on-dark', dark);
      links.forEach(function (a) { a.classList.toggle('on-dark', dark); });
      segs.forEach(function (s) { s.classList.toggle('on-dark', dark); });
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
  })();

  // Клик по логотипу: на главной – плавно наверх без перезагрузки,
  // с подстраницы – обычный переход на главную (своей языковой версии)
  Array.prototype.slice.call(document.querySelectorAll('[data-home]')).forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var home = el.getAttribute('href') || '/';
      if (location.pathname === home) {
        e.preventDefault();
        if (location.hash) history.replaceState(null, '', home);
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }
      // иначе браузер сам переходит по href без preventDefault
    });
  });

  // Появление строк с выездом справа – повторяется при каждом новом прокруте
  (function () {
    var all = Array.prototype.slice.call(document.querySelectorAll('.slide-in'));
    if (!all.length) return;
    // слова внутри .slide-group появляются вместе – следим за группой, а не за каждым словом
    var items = all.filter(function (el) { return !el.closest('.slide-group'); })
      .concat(Array.prototype.slice.call(document.querySelectorAll('.slide-group')));
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      all.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    function words(t) {
      return t.classList.contains('slide-group')
        ? Array.prototype.slice.call(t.querySelectorAll('.slide-in')) : [t];
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          words(e.target).forEach(function (w) { w.classList.add('is-in'); });
        } else if (e.intersectionRatio === 0) {
          // ушло из вида полностью – сбрасываем, чтобы проиграть заново
          words(e.target).forEach(function (w) { w.classList.remove('is-in'); });
        }
      });
    }, { threshold: [0, 0.35], rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  // Блок 24/7: живой статус и часы по варшавскому времени
  (function () {
    var ws = document.getElementById('ws');
    if (!ws) return;
    var stateEl = ws.querySelector('.ws-state');
    var hmEl = ws.querySelector('.ws-hm'), secEl = ws.querySelector('.ws-sec');
    var msgEl = ws.querySelector('.ws-msg');
    var rows = Array.prototype.slice.call(ws.querySelectorAll('.ws-hours li'));
    var OPEN = 7 * 60, CLOSE = 21 * 60;

    function warsaw() {
      var out = {};
      try {
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Warsaw', hour12: false, weekday: 'short',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).formatToParts(new Date()).forEach(function (p) { out[p.type] = p.value; });
      } catch (e) {
        var d = new Date();
        out = { weekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
                year: String(d.getFullYear()), month: String(d.getMonth() + 1), day: String(d.getDate()),
                hour: ('0' + d.getHours()).slice(-2), minute: ('0' + d.getMinutes()).slice(-2),
                second: ('0' + d.getSeconds()).slice(-2) };
      }
      var wd = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[out.weekday];
      var h = parseInt(out.hour, 10) % 24;
      return { wd: wd, h: h, m: parseInt(out.minute, 10), s: parseInt(out.second, 10),
               y: parseInt(out.year, 10), mo: parseInt(out.month, 10), d: parseInt(out.day, 10),
               clock: ('0' + h).slice(-2) + ':' + out.minute + ':' + out.second };
    }

    // смещение Варшавы от UTC и признак летнего времени
    function warsawOffset(date) {
      try {
        var name = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Warsaw', timeZoneName: 'shortOffset'
        }).formatToParts(date).filter(function (p) { return p.type === 'timeZoneName'; })[0];
        var m = name && /GMT([+-]\d{1,2})/.exec(name.value);
        if (m) return parseInt(m[1], 10);
      } catch (e) {}
      // запасной путь: сравниваем локальную дату с датой в Варшаве
      var loc = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
      var utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      return Math.round((loc - utc) / 3600000);
    }

    var offEl = ws.querySelector('.ws-tz-off'), dstEl = ws.querySelector('.ws-tz-dst');
    var dateEl = ws.querySelector('.ws-date');
    var PL_MONTHS = L.months;
    function paintDate() {
      if (!dateEl) return;
      var o = {};
      try {
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw',
          day: '2-digit', month: '2-digit', year: 'numeric' })
          .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      } catch (e) {
        var d = new Date();
        o = { day: ('0' + d.getDate()).slice(-2),
              month: ('0' + (d.getMonth() + 1)).slice(-2), year: String(d.getFullYear()) };
      }
      dateEl.textContent = o.day + '-' + PL_MONTHS[parseInt(o.month, 10) - 1] + '-' + o.year;
    }
    function paintTz() {
      var now = new Date();
      var off = warsawOffset(now);
      var winter = warsawOffset(new Date(now.getFullYear(), 0, 15));
      var summer = off > winter;
      if (offEl) offEl.textContent = 'UTC+' + off;
      if (dstEl) dstEl.textContent = summer ? L.summer : L.winter;
    }

    function tick() {
      var t = warsaw();
      var mins = t.h * 60 + t.m;
      // отвечаем каждый день 7–21, в праздники тоже; в выходные и праздники не работают урядЫ –
      // статус «работаем», но сообщение предупреждает, что документы уйдут в ближайший рабочий день
      var holiday = !!holidays(t.y)[t.mo + '-' + t.d];
      var weekday = t.wd >= 1 && t.wd <= 5 && !holiday;
      var open = mins >= OPEN && mins < CLOSE;
      var state, msg;
      if (open) {
        state = L.open;
        msg = !weekday ? L.msgOff : mins >= CLOSE - 60 ? L.msgOpenLate : L.msgOpen;
      } else {
        state = holiday ? L.holiday : L.closed;
        msg = mins < OPEN ? L.msgToday : L.msgTomorrow;
      }

      ws.classList.toggle('is-open', open);
      ws.classList.toggle('is-closed', !open);
      if (stateEl) stateEl.textContent = state;
      if (msgEl) msgEl.textContent = msg;
      paintTz();
      paintDate();
      var parts = t.clock.split(':');
      if (hmEl) hmEl.textContent = parts[0] + ':' + parts[1];
      if (secEl) secEl.textContent = parts[2];
      rows.forEach(function (li, n) {
        /* data-now (30.09.2026, /kontakt/): always – строка горит всегда, weekday – только в рабочий день; без него – как раньше */
        var mode = li.getAttribute('data-now');
        var now = mode === 'always' ? true : mode === 'weekday' ? weekday : (n === 0 && weekday) || (n === 1 && !weekday);
        li.classList.toggle('is-now', now);
      });
    }

    tick();
    setInterval(tick, 1000);

    // Часы работы: раскрываются при наведении, прячутся через 18 сек после ухода курсора
    (function () {
      var box = ws.querySelector('.ws-clockbox');
      if (!box) return;
      if (window.matchMedia('(hover:none)').matches) { box.classList.add('is-open'); return; }
      var HIDE_AFTER = 2700, timer = null;
      function open() { clearTimeout(timer); box.classList.add('is-open'); }
      function closeLater() {
        clearTimeout(timer);
        timer = setTimeout(function () { box.classList.remove('is-open'); }, HIDE_AFTER);
      }
      box.addEventListener('mouseenter', open);
      box.addEventListener('mouseleave', closeLater);
      box.addEventListener('focus', open);
      box.addEventListener('blur', closeLater);

      // заголовок «24/7. Wyślij dokument…» раскрывает график так же, как сами часы
      var heading = document.getElementById('zawsze');
      if (heading) {
        heading.addEventListener('mouseenter', open);
        heading.addEventListener('mouseleave', closeLater);
      }

      // первый раз график показывается сам – когда часы прокручены в кадр
      if (!('IntersectionObserver' in window)) return;
      var SHOW_DELAY = 900;     // пауза после появления в кадре
      var HOLD_FIRST = 2700;    // сколько держим открытым в первый раз
      var shown = false, intro = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || shown) return;
          shown = true;
          io.disconnect();
          intro = setTimeout(function () {
            if (box.matches(':hover')) return;
            box.classList.add('is-open');
            setTimeout(function () {
              if (!box.matches(':hover')) box.classList.remove('is-open');
            }, HOLD_FIRST);
          }, SHOW_DELAY);
        });
      }, { threshold: 0.6 });
      io.observe(box);
    })();
  })();

  // Календарь польских выходных: красный кружок + подсказка при наведении.
  // С атрибутом data-book (страница контактов) он же – запись на встречу: рабочий день →
  // окно «утро · обед · вечер» → готовое сообщение в WhatsApp (идея с sakib.design, без стороннего виджета)
  (function () {
    var cal = document.getElementById('cal');
    if (!cal) return;
    var grid = cal.querySelector('.cal-grid');
    var title = cal.querySelector('.cal-title');
    var tip = cal.querySelector('.cal-tip');
    var prev = cal.querySelector('.cal-btn.is-prev');
    var next = cal.querySelector('.cal-btn.is-next');
    if (!grid || !title) return;

    var MONTHS = L.months;
    var WD = L.wd;

    // easter() и holidays() – общие с блоком часов, объявлены в начале файла

    // «сегодня» по варшавскому времени, а не по часам посетителя
    function todayWarsaw() {
      try {
        var o = {};
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw',
          year: 'numeric', month: '2-digit', day: '2-digit' })
          .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
        return { y: +o.year, m: +o.month, d: +o.day };
      } catch (err) {
        var n = new Date();
        return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
      }
    }

    // --- запись на встречу ---
    var BOOK = cal.hasAttribute('data-book') && L.book;
    var WA = 'https://wa.me/48507588155';
    // окна встреч по Варшаве, пн–сб: утро · обед · вечер (подписи – L.book.parts); вс и праздники – записи нет.
    // Точного времени посетитель не выбирает (так решил Грег 21.09.2026) – час внутри окна подтверждается в ответе
    // 03.10.2026 Грег: «9-11 13-15 18-20 укажи это время на сайте» – было 9–10 · 13–15 · 19–20
    var PARTS = [[9 * 60, 11 * 60], [13 * 60, 15 * 60], [18 * 60, 20 * 60]];
    var LEAD = 120;                     // сегодня – не раньше чем через 2 часа
    var PART_MIN = 30;                  // …и чтобы после этого от окна осталось хотя бы полчаса
    var SAT_PART = 1;                   // суббота: открыто одно окно – обеденное
    var HORIZON = 90;                   // на сколько дней вперёд открыта запись
    var sel = null;
    var part = null;                    // индекс в PARTS / L.book.parts; окно заранее не выбрано

    // часы окна – всегда по Варшаве: встреча личная, у ul. Kruczej (выбор часового пояса снят 21.09.2026,
    // само выпадающее меню сохранено в docs/dropdown-menu.md)
    function partRange(n) { return fmtTime(PARTS[n][0]) + '–' + fmtTime(PARTS[n][1]); }
    function warsawMins() {
      try {
        var o = {};
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour: '2-digit',
          minute: '2-digit', hourCycle: 'h23' })
          .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
        return (+o.hour) * 60 + (+o.minute);
      } catch (err) {
        var n = new Date();
        return n.getHours() * 60 + n.getMinutes();
      }
    }

    // доступные окна дня – индексы в PARTS; wd: 0 – понедельник … 6 – воскресенье
    function slotsFor(y, m, d, wd) {
      if (wd > 5) return [];                          // воскресенье – записи нет
      var edge = y === now.y && m === now.m && d === now.d ? warsawMins() + LEAD + PART_MIN : 0;
      var out = [];
      PARTS.forEach(function (p, n) {
        if (wd === 5 && n !== SAT_PART) return;        // в субботу – только обеденное окно (Грег, 21.09.2026)
        if (p[1] >= edge) out.push(n);
      });
      return out;
    }

    function canBook(y, m, d, wd, holiday) {
      if (!BOOK || holiday) return false;
      var diff = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.y, now.m - 1, now.d)) / 864e5);
      if (diff < 0 || diff > HORIZON) return false;
      return wd <= 5;                                 // сегодня нажимается, даже когда окна уже прошли: они будут серыми, без выбора
    }

    function fmtTime(t) { return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
    function fmtDate(o) {
      var dt = new Date(o.y, o.m - 1, o.d);
      try {
        return new Intl.DateTimeFormat(document.documentElement.lang || 'pl',
          { weekday: 'long', day: 'numeric', month: 'long' }).format(dt);   // день недели полностью: «wtorek, 29 września»
      } catch (err) {
        return o.d + '.' + ('0' + o.m).slice(-2);
      }
    }

    var bookEl, slotsEl, dateEl, goEl, goText, noteEl2;
    if (BOOK) {
      bookEl = document.createElement('div');
      bookEl.className = 'cal-book';
      var IC = '<svg class="cal-opt-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">';
      // параметры: только место – строка: встреча личная, у ul. Kruczej (вариант «Telefon» Грег убрал 21.09.2026).
      // Переключателя «Rano · Południe · Wieczór» здесь больше нет (Грег, 21.09.2026: «дублирование») –
      // время дня выбирают один раз, в окнах под календарём, которые появляются после выбора даты
      bookEl.innerHTML =
        '<div class="cal-opts">' +
          '<div class="cal-opt cal-place" role="group" aria-label="' + L.book.placeL + '">' +
            IC + '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>' +
            '<span class="cal-place-name">' + L.book.place + '</span></div>' +
        '</div>' +
        '<p class="cal-book-hint">' + L.book.hint + '</p>' +
        '<div class="cal-slots-wrap"><div>' +
          '<p class="cal-slots-head"><span class="cal-slots-date"></span>' +
          '<span class="cal-slots-tz">' + L.book.tz + '</span></p>' +
          '<div class="cal-slots" role="group" aria-label="' + L.book.pick + '"></div>' +
          '<a class="cal-go btn btn--pop" target="_blank" rel="noopener" hidden><span class="cal-go-text"></span>' +
            '<span class="btn-mark" aria-hidden="true"><span><svg viewBox="0 0 24 24" class="btn-chev"><path d="M8 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg></span></span></a>' +
          '<p class="cal-book-note">' + L.book.note + '</p>' +
        '</div></div>';
      var noteEl = cal.querySelector('.cal-note');
      var bookSlot = cal.querySelector('.cal-book-slot');
      if (bookSlot) bookSlot.appendChild(bookEl);
      else noteEl.parentNode.insertBefore(bookEl, noteEl);
      slotsEl = bookEl.querySelector('.cal-slots');
      dateEl = bookEl.querySelector('.cal-slots-date');
      goEl = bookEl.querySelector('.cal-go');
      goText = bookEl.querySelector('.cal-go-text');
      noteEl2 = bookEl.querySelector('.cal-book-note');

      // время дня выбирают строки окон под календарём
      slotsEl.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.cal-slot') : null;
        if (!b || b.disabled) return;
        part = +b.getAttribute('data-n');
        paintSlots();
      });

      // параметры встречи переезжают в свою зону – после того как все обработчики уже навешаны
      var optsSlot = cal.querySelector('.cal-opts-slot');
      if (optsSlot) optsSlot.appendChild(bookEl.querySelector('.cal-opts'));
    }

    function paintSlots() {
      if (!BOOK) return;
      bookEl.classList.toggle('is-open', !!sel);
      if (!sel) return;
      // окна выбранного дня
      var list = slotsFor(sel.y, sel.m, sel.d, (new Date(sel.y, sel.m - 1, sel.d).getDay() + 6) % 7);
      if (list.indexOf(part) === -1) part = null;     // в этот день такого окна нет (суббота) или оно уже прошло
      var date = fmtDate(sel);
      dateEl.textContent = date;
      noteEl2.textContent = list.length ? L.book.note : L.book.late;
      var html = '';
      PARTS.forEach(function (p, n) {
        html += '<button type="button" class="cal-slot' + (n === part ? ' is-on' : '') +
          '" data-n="' + n + '" aria-pressed="' + (n === part) + '"' + (list.indexOf(n) === -1 ? ' disabled' : '') + '>' +
          '<span class="cal-slot-name">' + L.book.parts[n] + '</span>' +
          '<span class="cal-slot-time">' + partRange(n) + '</span></button>';
      });
      var focused = slotsEl.contains(document.activeElement);
      slotsEl.innerHTML = html;
      if (focused && part !== null) slotsEl.children[part].focus();   // кнопки пересозданы – вернуть фокус
      if (part === null) { goEl.hidden = true; return; }
      goText.textContent = L.book.cta + ' – ' + date + ', ';
      var span = document.createElement('span');     // часы окна не рвутся по тире при переносе подписи
      span.className = 'cal-go-time';
      span.textContent = partRange(part);
      goText.appendChild(span);
      var text = L.book.msg.replace('{date}', date)
        .replace('{part}', L.book.parts[part].toLowerCase()).replace('{time}', partRange(part));
      goEl.href = WA + '?text=' + encodeURIComponent(text);
      goEl.hidden = false;
    }

    var now = todayWarsaw();
    var view = { y: now.y, m: now.m };

    function hideTip() { tip.classList.remove('is-on'); }
    function showTip(el) {
      if (!tip) return;
      tip.textContent = el.getAttribute('data-name');
      tip.style.left = '0px';
      var half = tip.offsetWidth / 2;                  // держим подсказку внутри блока календаря
      var cr = cal.getBoundingClientRect(), er = el.getBoundingClientRect();
      var x = er.left - cr.left + er.width / 2;
      tip.style.left = Math.max(half + 2, Math.min(cal.clientWidth - half - 2, x)) + 'px';
      tip.style.top = (er.top - cr.top - 8) + 'px';
      tip.classList.add('is-on');
    }

    // В режиме записи пустых ячеек нет: хвост прошлого и начало следующего месяца видны
    // и работают так же, как дни текущего (как в сетке Cal.com у sakib.design)
    function render() {
      var y = view.y, m = view.m;
      title.textContent = MONTHS[m - 1] + ' ' + y;
      var first = new Date(y, m - 1, 1);
      var blanks = (first.getDay() + 6) % 7;          // неделя с понедельника
      var days = new Date(y, m, 0).getDate();
      var tail = BOOK ? (7 - (blanks + days) % 7) % 7 : 0;
      var html = '';
      WD.forEach(function (w) { html += '<span class="cal-wd">' + w + '</span>'; });
      for (var n = -blanks; n < days + tail; n++) {
        var out = n < 0 || n >= days;
        if (out && !BOOK) { html += '<span class="cal-cell"></span>'; continue; }
        var dt = new Date(y, m - 1, n + 1);           // Date сам переносит день в соседний месяц
        var cy = dt.getFullYear(), cm = dt.getMonth() + 1, d = dt.getDate();
        var wd = (dt.getDay() + 6) % 7;
        var cls = 'cal-cell';
        if (out) cls += ' is-out';
        if (wd > 4) cls += ' is-weekend';
        if (cy === now.y && cm === now.m && d === now.d) cls += ' is-today';
        if (BOOK && cy * 10000 + cm * 100 + d < now.y * 10000 + now.m * 100 + now.d) cls += ' is-past';
        var name = holidays(cy)[cm + '-' + d];
        var on = sel && sel.y === cy && sel.m === cm && sel.d === d;
        html += '<span class="' + cls + '">' + (name
          ? '<button type="button" class="cal-hol" data-name="' + name + '" aria-label="' + d + ' ' +
            MONTHS[cm - 1].toLowerCase() + ' – ' + name + '">' + d + '</button>'
          : canBook(cy, cm, d, wd, name)
          ? '<button type="button" class="cal-day' + (on ? ' is-on' : '') + '" data-y="' + cy +
            '" data-m="' + cm + '" data-d="' + d + '" aria-pressed="' + !!on + '">' + d + '</button>'
          : d) + '</span>';
      }
      grid.innerHTML = html;
      hideTip();
    }

    grid.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('.cal-hol') : null;
      if (t) showTip(t);
    });
    grid.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest('.cal-hol')) hideTip();
    });
    grid.addEventListener('focusin', function (e) {
      if (e.target.classList.contains('cal-hol')) showTip(e.target);
    });
    grid.addEventListener('focusout', hideTip);
    grid.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.cal-hol') : null;
      if (t) showTip(t);                              // тап на телефоне
      var day = e.target.closest ? e.target.closest('.cal-day') : null;
      if (!day) return;
      var pick = { y: +day.getAttribute('data-y'), m: +day.getAttribute('data-m'), d: +day.getAttribute('data-d') };
      // повторный тап по выбранному дню снимает выбор
      sel = (sel && sel.y === pick.y && sel.m === pick.m && sel.d === pick.d) ? null : pick;
      render();
      paintSlots();
      var back = grid.querySelector('.cal-day.is-on');  // render() пересоздал кнопки – вернуть фокус
      if (back) back.focus();
    });

    function shift(step) {
      var m = view.m + step, y = view.y;
      if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
      view = { y: y, m: m };
      render();
    }
    if (prev) prev.addEventListener('click', function () { shift(-1); });
    if (next) next.addEventListener('click', function () { shift(1); });

    render();
  })();

  // Заголовок «Tłumaczenia / przysięgłe / konsularne»: чёрная плашка едет за курсором
  (function () {
    var head = document.getElementById('plate-head');
    if (!head) return;
    var bg = head.querySelector('.plate-bg');
    // плашка ходит только по «przysięgłe» и «konsularne»; «Tłumaczenia» не участвует
    var words = Array.prototype.slice.call(head.querySelectorAll('.pw-hot'));
    if (!bg || !words.length) return;
    var HOME = 0; // по умолчанию плашка на «przysięgłe»
    var active = HOME;

    function moveTo(i) {
      var w = words[i];
      var hr = head.getBoundingClientRect();
      var wr = w.getBoundingClientRect();
      bg.style.left = (wr.left - hr.left) + 'px';
      bg.style.top = (wr.top - hr.top) + 'px';
      bg.style.width = wr.width + 'px';
      bg.style.height = wr.height + 'px';
      words.forEach(function (el, n) { el.classList.toggle('is-on', n === i); });
      active = i;
    }

    function init() {
      head.classList.add('is-ready');
      moveTo(HOME);
    }

    // плашка остаётся на последнем наведённом слове – без возврата
    words.forEach(function (w, i) {
      w.addEventListener('mouseenter', function () { moveTo(i); });
    });
    window.addEventListener('resize', function () { moveTo(active); }, { passive: true });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
    else window.addEventListener('load', init);
    setTimeout(init, 1200); // страховка, если шрифты не догрузились
  })();

  // Окно с подробным описанием в блоке «Dla kogo tłumaczymy»
  (function () {
    var wrap = document.getElementById('tl-wrap');
    var pop = document.getElementById('tl-pop');
    var data = document.getElementById('tl-data');
    if (!wrap || !pop || !data) return;

    var titleEl = pop.querySelector('.tl-pop-title');
    var bodyEl = pop.querySelector('.tl-pop-body');
    var closeBtn = pop.querySelector('.tl-close');
    var grid = wrap.querySelector('.grid');
    var cells = Array.prototype.slice.call(wrap.querySelectorAll('.tl-cell'));
    var items = Array.prototype.slice.call(data.children);
    var current = -1;

    // окно чуть шире таблицы и заходит на то, что под ней
    function place() {
      var wr = wrap.getBoundingClientRect();
      var gr = grid.getBoundingClientRect();
      var pad = window.innerWidth < 640 ? 6 : 12;
      pop.style.left = (-pad) + 'px';
      pop.style.top = (gr.top - wr.top - pad) + 'px';
      pop.style.width = (wr.width + pad * 2) + 'px';
      pop.style.minHeight = (gr.height + pad * 2 + 18) + 'px';
    }

    function open(i) {
      var src = items[i];
      if (!src) return;
      titleEl.textContent = src.getAttribute('data-title');
      bodyEl.innerHTML = src.innerHTML;
      pop.hidden = false;
      place();
      requestAnimationFrame(function () { pop.classList.add('is-open'); });
      cells.forEach(function (c, n) { c.setAttribute('aria-expanded', String(n === i)); });
      current = i;
    }

    function close() {
      current = -1;
      pop.classList.remove('is-open');
      cells.forEach(function (c) { c.setAttribute('aria-expanded', 'false'); });
      setTimeout(function () { if (!pop.classList.contains('is-open')) pop.hidden = true; }, 300);
    }

    // окно открывается только по клику; наведение оставляет мягкую плашку
    cells.forEach(function (cell, i) {
      cell.addEventListener('click', function () {
        if (current === i) close(); else open(i);
      });
    });

    closeBtn.addEventListener('click', close);

    document.addEventListener('click', function (e) {
      if (current !== -1 && !wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current !== -1) {
        var i = current; close();
        if (cells[i]) cells[i].focus();
      }
    });
    window.addEventListener('resize', function () { if (current !== -1) place(); }, { passive: true });
  })();

  // Мобильное меню (12.09.2026, по аудиту; переделано 21.09.2026): Escape и нажатие мимо закрывают панель,
  // страница под ней не прокручивается, бургер складывается в крестик, подпись кнопки меняется
  // на «закрыть» (текст берётся из data-close-label – свой в каждом языке), фокус переходит в панель
  // и возвращается на бургер при закрытии с клавиатуры.
  // Состояние одно: aria-expanded на бургере + html.menu-open. Показывает и прячет панель CSS
  // (#mobile-nav в styles.css) – класс hidden из разметки больше ни на что не влияет: раньше панель
  // открывалась снятием hidden, а на 1024–1149px её всё равно гасил .lg:hidden, и бургер там молчал.
  (function () {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('mobile-nav');
    if (!burger || !nav) return;
    var root = document.documentElement;
    var labelOpen = burger.getAttribute('aria-label') || 'Menu';
    var labelClose = burger.getAttribute('data-close-label') || labelOpen;
    /* невидимая подложка под шапкой: нажатие мимо панели закрывает меню и не достаётся ссылке,
       которая оказалась под пальцем на странице */
    var shade = document.createElement('div');
    shade.className = 'mn-backdrop';
    shade.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shade);
    function isOpen() { return burger.getAttribute('aria-expanded') === 'true'; }
    /* iOS: overflow:hidden на body страницу держит не всегда – тянуть её под открытым меню не даём.
       Внутри панели жест оставляем, только если ей самой есть что прокручивать (низкий экран): иначе
       он ушёл бы на страницу. Слушатель не пассивный, поэтому живёт только пока меню открыто */
    function holdPage(e) {
      if (!nav.contains(e.target) || nav.scrollHeight <= nav.clientHeight + 1) e.preventDefault();
    }
    /* Единая плашка (21.09.2026): панель не отдельная – вниз растёт сам стеклянный слой ряда шапки
       (.hdr-row::before / ::after в styles.css), а на сколько – говорит --mn-h: высота панели на этот момент.
       Панель скрыта через visibility, в потоке остаётся, поэтому её высоту можно снять до открытия. */
    var head = document.getElementById('top');
    /* высота – дробная (getBoundingClientRect): по целому offsetHeight стекло кончалось на долю пикселя выше края
       панели, и на Retina внизу проступала линия в 1px (стенд docs/menu-desk/, 30.09.2026) */
    function fitPlate() { if (head) head.style.setProperty('--mn-h', nav.getBoundingClientRect().height + 'px'); }
    function setOpen(open, focusBurger, focusFirst) {
      if (open === isOpen()) return;
      if (open) fitPlate();
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? labelClose : labelOpen);
      root.classList.toggle('menu-open', open);
      if (open) {
        nav.scrollTop = 0;
        document.addEventListener('touchmove', holdPage, { passive: false });
        /* фокус в панель – только при открытии с клавиатуры: после касания рамка фокуса
           на первом пункте выглядела как выделенный пункт меню */
        var first = focusFirst && nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else {
        document.removeEventListener('touchmove', holdPage, { passive: false });
        if (focusBurger) burger.focus();
      }
    }
    /* detail === 0 – click пришёл от Enter / пробела, а не от пальца или мыши */
    burger.addEventListener('click', function (e) { setOpen(!isOpen(), false, e.detail === 0); });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    /* закрываем по click, а не по pointerdown: иначе подложка исчезала бы раньше click,
       и тот приходил бы в элемент страницы под пальцем */
    shade.addEventListener('click', function () { setOpen(false); });
    /* нажатие по самой плашке меню – мимо ссылок, кнопок и полей – тоже закрывает меню (Грег, 30.09.2026);
       выделение текста мышью меню не закрывает */
    nav.addEventListener('click', function (e) {
      if (!isOpen() || e.target.closest('a, button, input, select, textarea, label, [role="button"]')) return;
      var sel = window.getSelection && window.getSelection();
      if (sel && !sel.isCollapsed) return;
      setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { e.preventDefault(); setOpen(false, true); }
    });
    /* нажатие в ряду шапки мимо бургера (логотип, «Zamów wycenę») – меню закрывается, панель wyceny откроется сама */
    document.addEventListener('pointerdown', function (e) {
      /* языки в ряду шапки (компьютер) – меню не закрываем на pointerdown: иначе они пропали бы до click, и язык бы не сменился */
      if (isOpen() && e.target !== shade && !nav.contains(e.target) && !burger.contains(e.target) && !(e.target.closest && e.target.closest('.mn-langs, .mnd-plain'))) setOpen(false);
    });
    /* окно перешло порог 1150px – у меню другая раскладка (с 30.09.2026 меню есть и на компьютере), закрываем */
    var wide = window.matchMedia('(min-width:1150px)');
    (wide.addEventListener ? wide.addEventListener('change', onWide) : wide.addListener(onWide));
    function onWide() { if (isOpen()) setOpen(false); }
    /* поворот телефона, смена ширины окна, адресная строка Safari – высота панели меняется, плашка за ней */
    window.addEventListener('resize', function () { if (isOpen()) fitPlate(); }, { passive: true });

    /* Меню компьютера (30.09.2026; стенд docs/menu-desk/, вариант 126, все языки). От 1150px в панели другая раскладка:
       колонка связи (WhatsApp, Telegram – «napisz do nas» строчными при наведении, Грег 30.09.2026), крупный номер с часами и жёлтая полоса
       «Ekspresowa wycena» с чёрной створкой (по кругу три строки; при наведении створка уходит и открывает
       «Otwórz formularz wyceny»). Элементы собираются здесь из тех же ссылок и видны только от 1150px (styles.css, .mnd-*);
       уже 1150px меню прежнее. Меню открывается и наведением на шапку – с задержкой и не при быстром пролёте мыши. */
    (function () {
      var inn = nav.querySelector('.mn-in'), list = nav.querySelector('.mn-list'), cta = nav.querySelector('.mn-cta');
      if (!inn || !list || !cta) return;
      var L = {
        pl: { hint:'napisz do nas', hours:'Codziennie 7:00–21:00', title:'Ekspresowa wycena', go:'Otwórz formularz wyceny',
              car:['Wysyłasz zdjęcie 24/7', 'Odpisujemy codziennie od 7:00 do 21:00', 'Zwykle w 15 minut'] },
        uk: { hint:'напишіть нам', hours:'Щодня 7:00–21:00', title:'Експрес-оцінка', go:'Відкрити форму оцінки',
              car:['Надсилаєте фото 24/7', 'Відповідаємо щодня з 7:00 до 21:00', 'Зазвичай за 15 хвилин'] },
        ru: { hint:'напишите нам', hours:'Ежедневно 7:00–21:00', title:'Экспресс-расчёт', go:'Открыть форму расчёта',
              car:['Присылаете фото 24/7', 'Отвечаем ежедневно с 7:00 до 21:00', 'Обычно за 15 минут'] },
        en: { hint:'message us', hours:'Daily 7:00–21:00', title:'Express quote', go:'Open the quote form',
              car:['Send a photo 24/7', 'We reply daily 7:00–21:00', 'Usually within 15 minutes'] }
      };
      var T = L[(root.lang || 'pl').slice(0, 2)] || L.pl;
      var MARK = '<span class="cta-mark" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg></span>';
      function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }
      function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
      var wa = cta.querySelector('a[href*="wa.me"]'), tg = cta.querySelector('a[href*="t.me"]'),
          tel = cta.querySelector('a[href^="tel:"]'), main = cta.querySelector('.cta-btn--main');
      /* пункты + колонка связи; уже 1150px обёртка .mnd-grid – display:contents и ничего не меняет */
      var grid = el('div', 'mnd-grid'); list.parentNode.insertBefore(grid, list); grid.appendChild(list);
      var rail = el('div', 'mnd-rail'); grid.appendChild(rail);
      [wa, tg].forEach(function (a) {
        if (!a) return;
        var r = el('a', ''); r.href = a.getAttribute('href'); r.target = '_blank'; r.rel = 'noopener';
        /* облачко «печатает…»: три точки, через 0,9 с – подпись (Грег, 30.09.2026) */
        r.innerHTML = '<span>' + esc(a.textContent.trim()) + '</span><span class="mnd-hint"><i></i><i></i><i></i><em>' + esc(T.hint) + '</em></span>';
        (function (hn) {
          var th = 0, on = function () { clearTimeout(th); hn.classList.remove('done'); th = setTimeout(function () { hn.classList.add('done'); }, 900); },
            off = function () { clearTimeout(th); hn.classList.remove('done'); };
          r.addEventListener('mouseenter', on); r.addEventListener('focus', on); r.addEventListener('mouseleave', off); r.addEventListener('blur', off);
        })(r.querySelector('.mnd-hint'));
        r.addEventListener('click', function () { setOpen(false); }); rail.appendChild(r);
      });
      if (tel) {
        var num = el('div', 'mnd-num'), ta = el('a', ''); ta.href = tel.getAttribute('href');
        /* код страны мелко, основа – сам номер (Грег, 30.09.2026) */
        var tt = tel.textContent.trim(), cc = /^(\+\d{1,3})\s*(.+)$/.exec(tt);
        if (cc) { ta.appendChild(el('small', 'mnd-cc', esc(cc[1]))); ta.appendChild(document.createTextNode(cc[2])); } else ta.textContent = tt;
        if (tel.getAttribute('aria-label')) ta.setAttribute('aria-label', tel.getAttribute('aria-label'));
        num.appendChild(ta); num.appendChild(el('span', '', esc(T.hours))); inn.insertBefore(num, cta);
      }
      var floor = null, cur = null, title = null;
      if (main) {
        floor = el('a', 'mnd-floor'); floor.href = main.getAttribute('href');
        if (main.hasAttribute('data-quote')) floor.setAttribute('data-quote', '');   /* панель wyceny привяжется ниже, как ко всем [data-quote] */
        floor.setAttribute('aria-label', T.title + ' – ' + T.go);
        floor.innerHTML = '<span class="mnd-t">' + esc(T.title) + '</span><span class="mnd-go" aria-hidden="true">' + esc(T.go) + MARK + '</span>' +
          '<span class="mnd-cur" aria-hidden="true"><span class="mnd-car">' + T.car.map(function (t, i) { return '<span' + (i ? '' : ' class="on"') + '>' + esc(t) + '</span>'; }).join('') + '</span>' + MARK + '</span>';
        floor.addEventListener('click', function () { setOpen(false); });
        inn.appendChild(floor); cur = floor.querySelector('.mnd-cur'); title = floor.querySelector('.mnd-t');
      }
      var desk = window.matchMedia('(min-width:1150px)');
      /* колонка связи – шириной со строку языков; створка – левее второй колонки пунктов на ширину слова «Kontakt»,
         но не уже надписи на охре + 40px с каждой стороны; надпись – по центру зоны (Грег, 30.09.2026) */
      function fit() {
        if (!desk.matches) return;
        var ls = head.querySelectorAll('.mn-langs .mn-lang'), l = Infinity, r = -Infinity;   /* языки от 1150px – в ряду шапки */
        Array.prototype.forEach.call(ls, function (a) { var b = a.getBoundingClientRect(); if (b.width) { l = Math.min(l, b.left); r = Math.max(r, b.right); } });
        if (r > l) nav.style.setProperty('--mnd-w', Math.ceil(r - l) + 'px');
        if (floor && title) {
          var f = floor.getBoundingClientRect(); if (!f.width) return;
          var k = list.querySelector('.mn-link:nth-child(6)'), kl = 0;
          if (k) { var rg = document.createRange(); rg.selectNodeContents(k); var kr = rg.getBoundingClientRect(); kl = kr.left - kr.width - f.left; }
          var tr = document.createRange(); tr.selectNodeContents(title);   /* ширина самой надписи: блок надписи занимает всю зону */
          floor.style.setProperty('--cl', Math.round(Math.max(tr.getBoundingClientRect().width + 80, kl)) + 'px');
          var g = floor.querySelector('.mnd-go').getBoundingClientRect();   /* створка влево: правый край встаёт в 36px левее «Otwórz formularz wyceny» */
          if (g.width) floor.style.setProperty('--sl', Math.round(f.right - g.left + 36) + 'px');
        }
      }
      /* языки – этажом выше: от 1150px строка языков стоит в ряду шапки слева от крестика (видна при открытом меню, styles.css),
         уже 1150px – первой строкой в панели, как было (Грег, 01.10.2026) */
      var langs = nav.querySelector('.mn-langs'), lseg = head && head.querySelector('.hdr-seg--menu');
      function placeLangs() { if (!langs || !lseg) return;
        if (desk.matches) { if (langs.parentNode !== lseg) lseg.appendChild(langs); }
        else if (langs.parentNode !== inn) inn.insertBefore(langs, inn.firstChild); }
      placeLangs(); (desk.addEventListener ? desk.addEventListener('change', placeLangs) : desk.addListener(placeLangs));
      /* ползунок «Papier» – инструмент Грега (03.10.2026): слева от языков в ряду шапки, виден при открытом меню и только
         на локальном сайте или после ?plain=… (window.AP_PLAIN в начале файла). Включён = бумага есть; нажатие перезагружает страницу */
      if (window.AP_PLAIN && window.AP_PLAIN.ui && lseg) {
        var pl = el('button', 'mnd-plain', '<span>Papier</span><i aria-hidden="true"></i>');
        pl.type = 'button'; pl.setAttribute('role', 'switch'); pl.setAttribute('aria-checked', String(!window.AP_PLAIN.on));
        pl.title = 'Фактуры, обводки и пометки карандашом: ' + (window.AP_PLAIN.on ? 'выключены' : 'включены');
        pl.addEventListener('click', function (e) { e.stopPropagation(); window.AP_PLAIN.set(!window.AP_PLAIN.on); });
        lseg.insertBefore(pl, lseg.firstChild);
      }
      fit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
      window.addEventListener('resize', fit, { passive: true });
      burger.addEventListener('click', fit, true);   /* до открытия (fitPlate меряет уже новую раскладку) */
      /* Растровый переход охры в чёрную створку (стенд docs/menu-desk/, вариант 190; Грег, 01.10.2026). Створка в зоне перехода
         прозрачна (styles.css), чёрное там рисует SVG с маской-растром – в дырках просвечивает сама охра кнопки, шва нет.
         Растр как в печати: доля охры c = 0…1, c ≥ .5 – охра с чёрными ромбиками-дырками, c < .5 – ромбики охры на чёрном;
         сплошная охра у края – одним прямоугольником маски. Ширина --hr – до 190px и до начала самой длинной строки на створке.
         Наведение: створка уезжает влево, растр едет впереди неё и с 0,22 с за 0,62 с заливается в чёрный; уход – растр
         вырастает за 0,36 с и створка уходит вправо мягким краем */
      if (cur) (function () {
        var NS = 'http://www.w3.org/2000/svg', RMAX = 190, P = 10, W = 0, H = 0, R = RMAX, E = RMAX, full = true, raf = 0, t1 = 0;
        var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
        var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'mnd-ht'); svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = '<defs><mask id="mnd-ht-m" maskUnits="userSpaceOnUse" x="-2" y="-2"><rect x="-2" y="-2" fill="#fff"/><path fill="#000"/><path fill="#fff"/></mask></defs>' +
          '<rect class="mnd-ht-ink" x="0" y="0" mask="url(#mnd-ht-m)"/>';
        cur.insertBefore(svg, cur.firstChild);
        var mk = svg.querySelector('mask'), mr = mk.querySelector('rect'), ps = mk.querySelectorAll('path'), ink = svg.querySelector('.mnd-ht-ink');
        function ramp(v) { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); }
        function size() {
          var r = cur.getBoundingClientRect(); if (!r.width) return false; W = r.width; H = Math.ceil(r.height);
          var car = cur.querySelector('.mnd-car'), mw = 0;
          if (car) Array.prototype.forEach.call(car.children, function (x) { mw = Math.max(mw, x.scrollWidth); });
          var free = car ? car.getBoundingClientRect().right - r.left - mw - 24 : RMAX;
          R = Math.round(Math.max(70, Math.min(RMAX, free))); if (full) E = R;
          var X = R + 24; floor.style.setProperty('--hr', R + 'px');
          svg.setAttribute('width', X); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + X + ' ' + H);
          [mk, mr].forEach(function (e) { e.setAttribute('width', X + 4); e.setAttribute('height', H + 4); });
          ink.setAttribute('width', X); ink.setAttribute('height', H); return true;
        }
        function dia(x, y, s) { return 'M' + x + ' ' + (y - s).toFixed(2) + 'L' + (x + s).toFixed(2) + ' ' + y + 'L' + x + ' ' + (y + s).toFixed(2) + 'L' + (x - s).toFixed(2) + ' ' + y + 'Z'; }
        function draw() {
          if (!W && !size()) return;
          var cov = function (x) { return E > 1 ? ramp((E - x) / R) : 0; }, X = R + 24, o = '', k = '', solid = -1, i, j, x, y, c;
          for (i = 0; i * P <= X + P; i++) if (cov(i * P) >= .5) solid = i * P + P / 2;
          if (solid > 0) o = 'M-2 -2H' + solid + 'V' + (H + 2) + 'H-2Z';
          for (j = 0; j * P < H + P; j++) for (i = 0; i * P <= X + P; i++) { x = i * P; y = j * P; c = cov(x); if (c > .01 && c < .5) o += dia(x, y, P * Math.sqrt(c / 2)); }
          for (j = 0; j * P < H + P; j++) for (i = 0; i * P <= X; i++) { x = (i + .5) * P; y = (j + .5) * P; c = cov(x); if (c > .3 && c < .995) k += dia(x, y, Math.min(P / 2, P * Math.sqrt((1 - c) / 2))); }
          ps[0].setAttribute('d', o); ps[1].setAttribute('d', k);
        }
        function set(v) { cancelAnimationFrame(raf); E = v; full = E >= R; draw(); }
        function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
        function run(to, dur) {
          if (calm.matches) { set(to); return; }
          cancelAnimationFrame(raf); var from = E, t0 = performance.now();
          (function step() { var t = Math.min(1, (performance.now() - t0) / dur); E = from + (to - from) * ease(t); full = E >= R; draw(); if (t < 1) raf = requestAnimationFrame(step); })();
        }
        function refit() { if (size()) draw(); }
        /* сдвиг створки – .7s cubic-bezier(.6,0,.2,1): трогается медленно, идёт быстро; заливка к концу сдвига */
        function on() { clearTimeout(t1); t1 = setTimeout(function () { run(0, 620); }, calm.matches ? 0 : 220); }
        function off() { clearTimeout(t1); run(R, 360); }
        floor.addEventListener('mouseenter', on); floor.addEventListener('focus', on);
        floor.addEventListener('mouseleave', off); floor.addEventListener('blur', off);
        /* меню закрыли нажатием по полосе – mouseleave не пришёл: при следующем открытии растр снова на месте */
        new MutationObserver(function () { if (root.classList.contains('menu-open')) setTimeout(function () { if (!floor.matches(':hover')) { clearTimeout(t1); full = true; E = R; } refit(); }, 40); })
          .observe(root, { attributes: true, attributeFilter: ['class'] });
        window.addEventListener('resize', refit, { passive: true });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
        refit();
      })();
      /* строки на створке сменяются каждые 2,6 с, только пока меню открыто */
      if (cur) {
        var lines = cur.querySelectorAll('.mnd-car span'), k = 0;
        setInterval(function () {
          if (!root.classList.contains('menu-open') || !desk.matches || lines.length < 2) return;
          var a = lines[k]; k = (k + 1) % lines.length; var b = lines[k];
          a.classList.remove('on'); a.classList.add('out'); b.classList.remove('out'); b.classList.add('on');
          setTimeout(function () { a.classList.remove('out'); }, 520);
        }, 2600);
      }
      /* открытие наведением (компьютер с мышью): курсор задержался на шапке ~0,2 с и не пролетает быстро (к вкладкам
         браузера мышь идёт через шапку); закрывается только нажатием */
      var fine = window.matchMedia('(min-width:1150px) and (hover:hover) and (pointer:fine)');
      var row = head && head.querySelector('.hdr-row');
      if (row) {
        var tOpen = 0, last = null, fast = false;
        var hoverAt = 0;   /* когда меню открыто наведением */
        /* armed – наведение ещё может открыть меню: взводится входом мыши в шапку, гасится любым открытием или закрытием,
           пока мышь в шапке (иначе после закрытия крестиком резкое движение мыши и остановка открывали меню снова) */
        var armed = false;
        var plan = function () { if (!armed) return; clearTimeout(tOpen); tOpen = setTimeout(function () {
          if (armed && fine.matches && !fast && !isOpen() && !root.classList.contains('qd-open') && row.matches(':hover')) { armed = false; fit(); setOpen(true); hoverAt = Date.now(); } }, 220); };
        new MutationObserver(function () { if (isOpen()) armed = false; })   /* классы не пишет – зацикливания нет */
          .observe(root, { attributes: true, attributeFilter: ['class'] });
        burger.addEventListener('click', function () { armed = false; clearTimeout(tOpen); });
        /* наведение и нажатие не спорят (Грег, 30.09.2026): меню только что раскрылось наведением, а человек по привычке нажимает
           бургер или плашку – в ближайшие 1,5 с это нажатие меню не закрывает (перехват на шапке раньше обработчиков бургера
           и документа). Позже нажатие закрывает, как обычно */
        var fresh = function () { return isOpen() && Date.now() - hoverAt < 1500; };
        head.addEventListener('click', function (e) {
          if (fresh() && burger.contains(e.target)) { e.preventDefault(); e.stopPropagation(); }
        }, true);
        head.addEventListener('pointerdown', function (e) {
          if (fresh() && row.contains(e.target) && !e.target.closest('a')) e.stopPropagation();
        }, true);
        /* нажатие по закрытой плашке (мимо логотипа и бургера) раскрывает меню – как бургер; на планшете у пилюли своё
           действие (к началу страницы), поэтому только от 1150px */
        /* нажатие по открытой плашке её закрывает: документ закрывает меню уже на pointerdown, и click того же нажатия раскрывал
           его снова – меню мигало и оставалось открытым. Запоминаем, было ли меню открыто в момент нажатия (Грег, 01.10.2026) */
        var downOpen = false;
        row.addEventListener('pointerdown', function () { downOpen = isOpen(); }, true);
        row.addEventListener('click', function (e) {
          if (!desk.matches || isOpen() || downOpen || e.target.closest('a, button')) return;
          fit(); setOpen(true);
        });
        row.addEventListener('mouseenter', function () { armed = !isOpen(); fast = false; last = null; plan(); });
        row.addEventListener('mousemove', function (e) {
          var now = Date.now();
          if (last) { fast = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(1, now - last.t) > 1.1; if (fast) plan(); }
          last = { x:e.clientX, y:e.clientY, t:now };
        });
        row.addEventListener('mouseleave', function () { clearTimeout(tOpen); armed = false; });
        /* закрывается нажатием (крестик, мимо меню, по плашке, Escape) и само – через 2,2 с после того, как мышь ушла и с плашки,
           и с меню (#mobile-nav внутри шапки); вернулась раньше – меню остаётся (Грег, 30.09.2026; до этого 0,4–0,8 с, потом только
           нажатием). Не сворачивается, пока открыта панель wyceny или фокус с клавиатуры внутри меню */
        var tClose = 0;
        head.addEventListener('mouseleave', function () {
          clearTimeout(tClose); if (!fine.matches || !isOpen()) return;
          tClose = setTimeout(function () {
            var ae = document.activeElement, kb = ae && nav.contains(ae) && ae.matches(':focus-visible');
            if (isOpen() && !head.matches(':hover') && !root.classList.contains('qd-open') && !kb) setOpen(false);
          }, 2200);   /* было 3,2 с – Грег, 30.09.2026: «2.2» */
        });
        head.addEventListener('mouseenter', function () { clearTimeout(tClose); });
      }
    })();
  })();

  // Плавное раскрытие юридических блоков
  document.querySelectorAll('.ws-legal-item').forEach(function (d) {
    var sum = d.querySelector('summary');
    if (!sum) return;
    if (d.open) d.classList.add('is-open');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        d.classList.remove('is-open');
        var wrap = d.querySelector('.legal-wrap');
        var done = function () { d.open = false; };
        if (wrap) {
          var t = setTimeout(done, 900);
          wrap.addEventListener('transitionend', function h(ev) {
            if (ev.propertyName !== 'grid-template-rows') return;
            wrap.removeEventListener('transitionend', h); clearTimeout(t); done();
          });
        } else done();
      } else {
        d.open = true;
        requestAnimationFrame(function () { d.classList.add('is-open'); });
      }
    });
  });

  // Ссылки на <details> (Polityka / Regulamin) – раскрывать при переходе по якорю
  function openTarget() {
    var id = location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') { el.open = true; requestAnimationFrame(function(){ el.classList.add('is-open'); }); }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el && el.tagName === 'DETAILS') { el.open = true; requestAnimationFrame(function(){ el.classList.add('is-open'); }); }
    });
  });
  window.addEventListener('hashchange', openTarget);
  openTarget();

  /* Галочки у прочитанных вопросов FAQ (вариант 51 стенда docs/czern; Грег, 04.10.2026: «классно… я бы сделал 6 разных, с минимальным
     отличием и потом бы перенёс на все страницы сайта… поправляй и на сайт»). Раскрыл вопрос – слева от него мелком ставится галочка
     (рисуется 0,4 с) и остаётся, когда вопрос свёрнут: в списке видно, что уже прочитано. Вопрос, раскрытый при загрузке, отмечен сразу.
     Шесть рисунков галочки одной руки – TICKS: начало, перегиб короткого штриха, излом, перегиб длинного, конец (доли кегля 18px);
     отличия малые: длина короткого штриха, раствор, наклон, прогиб длинного. Соседним вопросам достаются разные (TICK_ORDER).
     Место, размер и цвет – .faq-tick в styles.css (на светлом – карандаш rgb(177,80,31), на чёрном – охра; от 1100px).
     Пока только PL (как все правки вида); в режиме «без бумаги» галочек нет. Числа – общие с docs/czern/v51.js. */
  (function () {
    var rootEl = document.documentElement;
    if (/^\/(ua|ru|en)\//.test(location.pathname) || rootEl.classList.contains('plain')) return;
    var list = document.querySelectorAll('#faq details');
    if (!list.length) return;
    rootEl.setAttribute('data-faq-ticks', '');
    var NS = 'http://www.w3.org/2000/svg', SZ = 18, PAD = 6;
    var TICKS = [
      [0, .5, .14, .66, .34, .9, .58, .3, 1.05, -.18],
      [.06, .56, .16, .7, .33, .9, .62, .36, 1.1, -.22],
      [-.02, .46, .12, .64, .36, .88, .66, .44, 1.12, -.06],
      [.04, .44, .14, .66, .32, .92, .5, .34, .92, -.26],
      [0, .52, .15, .7, .35, .9, .74, .62, 1.04, -.2],
      [-.04, .4, .1, .62, .36, .92, .56, .22, 1, -.1]
    ], TICK_ORDER = [0, 3, 1, 4, 2, 5];
    function defs() {
      if (document.getElementById('faq-tick-f')) return;
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.style.position = 'absolute';
      /* мелок: край смещён по шуму, штрих прорежен зерном – те же числа, что у пера crayon в assets/papier.js */
      s.innerHTML = '<filter id="faq-tick-f" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="17" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.9 1.3" numOctaves="3" seed="23" result="g"/>' +
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.2 0 0 0 -1.25" result="gm"/>' +
        '<feComposite in="d" in2="gm" operator="in"/></filter>';
      document.body.appendChild(s);
    }
    function tick(det, i, live) {
      var sum = det.querySelector('summary'), h3 = sum && sum.querySelector('h3');
      if (!h3 || sum.querySelector('.faq-tick')) return;
      defs();
      var t = TICKS[TICK_ORDER[i % 6]], p = function (k) { return (t[k] * SZ + PAD).toFixed(1); };
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('class', 'faq-tick' + (live ? '' : ' is-in')); s.setAttribute('viewBox', '0 0 34 30'); s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<g filter="url(#faq-tick-f)"><path pathLength="1" d="M' + p(0) + ' ' + p(1) + 'Q' + p(2) + ' ' + p(3) + ' ' + p(4) + ' ' + p(5) +
        'Q' + p(6) + ' ' + p(7) + ' ' + p(8) + ' ' + p(9) + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>';
      sum.appendChild(s);
      s.style.top = (h3.offsetTop + 1) + 'px';   /* summary – position:relative (styles.css); галочка стоит по первой строке вопроса */
      if (live) { s.getBoundingClientRect(); s.setAttribute('class', 'faq-tick is-in'); }
    }
    Array.prototype.forEach.call(list, function (det, i) {
      if (det.open) tick(det, i, false);
      det.addEventListener('toggle', function () { if (det.open) tick(det, i, true); });
    });
  })();

  // Валидация формы + мягкое сообщение вместо браузерного alert.
  // Форма живёт либо на странице (/cennik/), либо во всплывающей панели – отсюда scope.
  /* Сжатие фото на стороне клиента – до отправки формы.
     Длинная сторона 2200 px: лист A4 получается ~190 dpi, печати и мелкий текст читаются.
     Файлы меньше 0,9 MB и всё, что не картинка (PDF), не трогаем. */
  var IMG_MAX_SIDE   = 2200;
  var IMG_QUALITY    = 0.82;
  var IMG_SKIP_BELOW = 900 * 1024;

  function shrinkImage(file){
    if (!/^image\//.test(file.type) || file.size < IMG_SKIP_BELOW) return Promise.resolve(file);
    return new Promise(function(resolve){
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, h = img.naturalHeight;
        var k = Math.min(1, IMG_MAX_SIDE / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);   /* браузер сам учитывает EXIF-поворот */
        c.toBlob(function(blob){
          if (!blob || blob.size >= file.size) return resolve(file);   /* стало не меньше – шлём оригинал */
          var name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', IMG_QUALITY);
      };
      /* не декодировалось (HEIC в Chrome на компьютере и т.п.) – шлём как есть */
      img.onerror = function(){ URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  /* Язык формы заявки (28.09.2026): по lang страницы – uk/ru/en, иначе польский. Разметка панели – assets/wycena[-uk|-ru|-en].html
     (языковые копии собирает docs/wycena-i18n.py), тексты сообщений – здесь. Значения полей в письме остаются польскими,
     язык клиента уходит полем «jezyk». */
  var QD_LANG = (function () {
    var l = (document.documentElement.getAttribute('lang') || 'pl').toLowerCase().slice(0, 2);
    return l === 'uk' || l === 'ru' || l === 'en' ? l : 'pl';
  })();
  window.QD_LANG = QD_LANG;
  var QD_TX = {
    pl: { none: 'Nie wybrano plików', pf: ['zdjęcie', 'zdjęcia', 'zdjęć'], pd: ['plik', 'pliki', 'plików'], file: 'PLIK',
          sendN: 'Wyślij {n} do wyceny', send: 'Wyślij do wyceny', nEmail: 'e-mail', nPhone: 'numer', and: ' i ', need: 'Podaj {x}, aby wysłać',
          del: 'Usuń {x}', addMore: 'Dodaj kolejne zdjęcie', addFirst: 'Dodaj zdjęcia lub skan', prep: 'Przygotowujemy zdjęcia…',
          big: 'Plik „{x}” jest za duży ({s}). Zrób zdjęcie telefonem albo zapisz skan jako mniejszy plik – do 20 MB – i dodaj go jeszcze raz.',
          home: '/', pol: 'Otwórz Politykę Prywatności na stronie głównej',
          eFile: 'Dodaj zdjęcie – bez niego nie policzymy ceny.', eMailBad: 'Sprawdź adres e-mail.', eMail: 'Podaj e-mail – na niego wyślemy wycenę.',
          ePhone: 'Podaj numer – zadzwonimy, jeśli coś będzie niejasne.', sFile: 'Dodaj zdjęcie dokumentu – bez niego nie policzymy ceny.',
          sMail: 'Podaj adres e-mail – na niego wyślemy wycenę.', sPhone: 'Podaj numer telefonu – zadzwonimy, jeśli coś będzie niejasne.',
          miss: 'Uzupełnij imię, telefon i wybierz usługę.', busy: 'Chwila – jeszcze przygotowujemy zdjęcia.', sending: 'Wysyłamy…', sent: '✓ Wysłane',
          offline: 'Brak internetu – spróbuj, gdy wróci zasięg.', fail: 'Nie udało się wysłać.',
          failFull: 'Nie udało się wysłać. Spróbuj jeszcze raz albo zadzwoń: +48 507 588 155.',
          total: 'Pliki razem ważą {s}, a za jednym razem przyjmiemy do 25 MB. Wyślij teraz część, a resztę osobno tym samym formularzem.' },
    uk: { none: 'Файли не вибрано', pf: ['фото', 'фото', 'фото'], pd: ['файл', 'файли', 'файлів'], file: 'ФАЙЛ',
          sendN: 'Надіслати {n} на оцінку', send: 'Надіслати на оцінку', nEmail: 'e-mail', nPhone: 'номер', and: ' і ', need: 'Вкажіть {x}, щоб надіслати',
          del: 'Видалити {x}', addMore: 'Додайте ще фото', addFirst: 'Додайте фото або скан', prep: 'Готуємо фото…',
          big: 'Файл «{x}» завеликий ({s}). Сфотографуйте документ телефоном або збережіть скан у меншому розмірі – до 20 МБ – і додайте його ще раз.',
          home: '/ua/', pol: 'Відкрити політику конфіденційності на головній сторінці',
          eFile: 'Додайте фото – без нього ми не порахуємо ціну.', eMailBad: 'Перевірте адресу e-mail.', eMail: 'Вкажіть e-mail – на нього надішлемо оцінку.',
          ePhone: 'Вкажіть номер – зателефонуємо, якщо щось буде незрозуміло.', sFile: 'Додайте фото документа – без нього ми не порахуємо ціну.',
          sMail: 'Вкажіть адресу e-mail – на неї надішлемо оцінку.', sPhone: 'Вкажіть номер телефону – зателефонуємо, якщо щось буде незрозуміло.',
          miss: 'Заповніть ім’я, телефон і оберіть послугу.', busy: 'Хвилинку – ще готуємо фото.', sending: 'Надсилаємо…', sent: '✓ Надіслано',
          offline: 'Немає інтернету – спробуйте, коли з’явиться зв’язок.', fail: 'Не вдалося надіслати.',
          failFull: 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте: +48 507 588 155.',
          total: 'Файли разом важать {s}, а за один раз ми приймаємо до 25 МБ. Надішліть частину зараз, а решту окремо через цю ж форму.' },
    ru: { none: 'Файлы не выбраны', pf: ['фото', 'фото', 'фото'], pd: ['файл', 'файла', 'файлов'], file: 'ФАЙЛ',
          sendN: 'Отправить {n} на расчёт', send: 'Отправить на расчёт', nEmail: 'e-mail', nPhone: 'номер', and: ' и ', need: 'Укажите {x}, чтобы отправить',
          del: 'Удалить {x}', addMore: 'Добавьте ещё фото', addFirst: 'Добавьте фото или скан', prep: 'Готовим фото…',
          big: 'Файл «{x}» слишком большой ({s}). Сфотографируйте документ телефоном или сохраните скан в файл поменьше – до 20 МБ – и добавьте его ещё раз.',
          home: '/ru/', pol: 'Открыть политику конфиденциальности на главной странице',
          eFile: 'Добавьте фото – без него мы не посчитаем цену.', eMailBad: 'Проверьте адрес e-mail.', eMail: 'Укажите e-mail – на него пришлём расчёт.',
          ePhone: 'Укажите номер – позвоним, если что-то будет непонятно.', sFile: 'Добавьте фото документа – без него мы не посчитаем цену.',
          sMail: 'Укажите адрес e-mail – на него пришлём расчёт.', sPhone: 'Укажите номер телефона – позвоним, если что-то будет непонятно.',
          miss: 'Заполните имя, телефон и выберите услугу.', busy: 'Секунду – ещё готовим фото.', sending: 'Отправляем…', sent: '✓ Отправлено',
          offline: 'Нет интернета – попробуйте, когда появится связь.', fail: 'Не удалось отправить.',
          failFull: 'Не удалось отправить. Попробуйте ещё раз или позвоните: +48 507 588 155.',
          total: 'Файлы вместе весят {s}, а за один раз мы принимаем до 25 МБ. Отправьте часть сейчас, а остальное отдельно через эту же форму.' },
    en: { none: 'No files selected', pf: ['photo', 'photos', 'photos'], pd: ['file', 'files', 'files'], file: 'FILE',
          sendN: 'Send {n} for a quote', send: 'Send for a quote', nEmail: 'e-mail', nPhone: 'phone number', and: ' and ', need: 'Enter your {x} to send',
          del: 'Remove {x}', addMore: 'Add another photo', addFirst: 'Add photos or a scan', prep: 'Preparing your photos…',
          big: 'The file “{x}” is too large ({s}). Take a photo with your phone or save the scan as a smaller file (up to 20 MB) and add it again.',
          home: '/en/', pol: 'Open the Privacy Policy on the home page',
          eFile: 'Add a photo – we can’t price the document without it.', eMailBad: 'Please check the e-mail address.', eMail: 'Enter your e-mail – we’ll send the quote there.',
          ePhone: 'Enter your number – we’ll call if anything is unclear.', sFile: 'Add a photo of the document – we can’t price it without one.',
          sMail: 'Enter your e-mail address – we’ll send the quote there.', sPhone: 'Enter your phone number – we’ll call if anything is unclear.',
          miss: 'Please enter your name and phone number, and choose a service.', busy: 'One moment – we’re still preparing your photos.', sending: 'Sending…', sent: '✓ Sent',
          offline: 'No internet connection – try again when you’re back online.', fail: 'Sending failed.',
          failFull: 'Sending failed. Please try again or call +48 507 588 155.',
          total: 'Your files add up to {s}, and we can take up to 25 MB at a time. Send some of them now and the rest separately using the same form.' }
  };
  function qt(k) { var d = QD_TX[QD_LANG]; return d && d[k] != null ? d[k] : QD_TX.pl[k]; }
  /* числа: pl – 1 · 2–4, 22–24… · остальное; uk/ru – 1, 21, 31… · 2–4, 22–24… · остальное (11–14 – «много»); en – 1 · остальное */
  function qdPlural(n, forms) {
    var d = n % 10, h = n % 100, few = d >= 2 && d <= 4 && (h < 12 || h > 14);
    if (QD_LANG === 'en') return forms[n === 1 ? 0 : 2];
    if (QD_LANG === 'pl') return forms[n === 1 ? 0 : (few ? 1 : 2)];
    return forms[d === 1 && h !== 11 ? 0 : (few ? 1 : 2)];
  }

  window.initQuoteForm = function (scope) {
    var root = scope || document;
    var form = root.querySelector('form#quote-form, form.quote-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';

    var MAX_FILE = 20 * 1024 * 1024;   /* на один файл */
    var MAX_TOTAL = 25 * 1024 * 1024;  /* на заявку: Apps Script принимает до ~50 MB тела, base64 добавляет треть (01.10.2026) */
    var status = form.querySelector('[role="status"]');
    var inp    = form.querySelector('[name="file"]');
    var drop   = form.querySelector('.qd-drop');
    var list   = form.querySelector('.qd-files');
    var btn    = form.querySelector('[type="submit"]');
    var picked = [];                    /* File[] – то, что реально уйдёт */

    /* цвет – классами, а не инлайном: в панели фон белый, во встроенных формах тёмный */
    function say(text, ok) {
      if (!status) return;
      status.textContent = text;
      status.classList.remove('hidden');
      status.classList.toggle('is-ok', !!ok);
      status.classList.toggle('is-err', !ok);
    }
    function hush() { if (status) { status.textContent = ''; status.classList.add('hidden'); } }
    /* крестик на плашке ошибки прячет сообщение */
    var statusClose = form.querySelector('.qd-status-close');
    if (statusClose) statusClose.addEventListener('click', hush);
    function fmt(b) {                          /* «24,3 MB», по-украински и по-русски «24,3 МБ», по-английски «24.3 MB» */
      var cyr = QD_LANG === 'uk' || QD_LANG === 'ru', mb = (b / 1048576).toFixed(1);
      if (QD_LANG !== 'en') mb = mb.replace('.', ',');
      return b < 1048576 ? Math.round(b / 1024) + (cyr ? ' КБ' : ' KB') : mb + (cyr ? ' МБ' : ' MB');
    }

    /* ---- файлы: накапливаем, сжимаем, подставляем обратно в input ---- */
    function syncInput() {
      var dt = new DataTransfer();
      picked.forEach(function (f) { dt.items.add(f); });
      inp.files = dt.files;             /* FormData(form) увидит именно этот набор */
      if (drop) drop.classList.toggle('is-filled', picked.length > 0);
      var name = form.querySelector('.file-name');
      if (name && !list) name.textContent = picked.length ? plural(picked.length, true) : qt('none');
    }
    function plural(n, docs) { return n + ' ' + qdPlural(n, qt(docs ? 'pd' : 'pf')); }   /* «2 zdjęcia», «5 фото», «3 files» */
    function onlyDocs() { return picked.length && picked.every(function (f) { return !/^image\//.test(f.type); }); }
    /* кнопка со счётчиком: «Wyślij 2 zdjęcia do wyceny»; во встроенных формах .qd-submit-txt нет */
    function updateBtn() {
      var t = btn && btn.querySelector('.qd-submit-txt'); if (!t) return;
      t.textContent = picked.length ? qt('sendN').replace('{n}', plural(picked.length, onlyDocs())) : qt('send');
    }
    /* подсказки панели (17.09.2026): ошибка под полем, «Podaj numer, aby wysłać» под кнопкой */
    var phoneEl = form.querySelector('[name="phone"]');
    function fieldErr(key, text) {
      var el = form.querySelector('[data-err="' + key + '"]'); if (!el) return;
      el.textContent = text || ''; el.hidden = !text;
      /* скринридер должен прочитать ошибку вместе с полем, поэтому связываем их явно */
      var fld = form.querySelector('[name="' + key + '"]'); if (!fld) return;
      if (!el.id) el.id = 'err-' + key + (form.id ? '-' + form.id : '');
      if (text) { fld.setAttribute('aria-describedby', el.id); fld.setAttribute('aria-invalid', 'true'); }
      else { fld.removeAttribute('aria-describedby'); fld.removeAttribute('aria-invalid'); }
    }
    var emailEl = form.querySelector('[name="email"]');
    /* адрес считаем заполненным, когда он похож на адрес: иначе подсказка гасла бы на «anna@» */
    function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim()); }
    function needPhone() { return phoneEl && phoneEl.required && !phoneEl.value.trim(); }
    function needEmail() { return emailEl && emailEl.required && !emailOk(emailEl.value); }
    function updateNeed() {
      var el = form.querySelector('.qd-need'); if (!el) return;
      var miss = [];
      if (needEmail()) miss.push(qt('nEmail'));
      if (needPhone()) miss.push(qt('nPhone'));
      var bad = (phoneEl && phoneEl.classList.contains('is-invalid')) || (emailEl && emailEl.classList.contains('is-invalid'));
      el.textContent = miss.length ? qt('need').replace('{x}', miss.join(qt('and'))) : '';
      el.hidden = !(picked.length && miss.length) || bad;
    }
    /* польский номер читается тройками: 433 288 313, с кодом +48 433 288 313 (19.09.2026) */
    function fmtPhone(raw) {
      var plus = /^\s*\+/.test(raw), digits = raw.replace(/\D/g, '');
      var cc = '';
      if (plus) { cc = digits.slice(0, 2); digits = digits.slice(2); }
      else if (digits.length > 9 && digits.slice(0, 2) === '48') { cc = '48'; digits = digits.slice(2); plus = true; }
      if (digits.length > 9) return raw;                    // не польский формат – не трогаем
      var groups = digits.replace(/(\d{3})(?=\d)/g, '$1 ');
      return (plus ? '+' + cc + (groups ? ' ' : '') : '') + groups;
    }
    if (phoneEl) phoneEl.addEventListener('input', function () {
      var atEnd = phoneEl.selectionStart === phoneEl.value.length;
      var next = fmtPhone(phoneEl.value);
      if (next !== phoneEl.value) {
        phoneEl.value = next;
        if (atEnd) phoneEl.setSelectionRange(next.length, next.length);
      }
      if (phoneEl.value.trim()) fieldErr('phone', ''); updateNeed();
    });
    if (emailEl) emailEl.addEventListener('input', function () {
      if (emailOk(emailEl.value)) fieldErr('email', ''); updateNeed();
    });
    /* миниатюры 72px с крестиком, подпись «2 zdjęcia» */
    function render() {
      if (!list) return;
      list.innerHTML = '';
      picked.forEach(function (f, i) {
        var li = document.createElement('li');
        /* HEIC с айфона браузер не рисует – вместо битой картинки ставим плашку с форматом (18.09.2026) */
        var ext = (f.name.split('.').pop() || '').toUpperCase();
        var isHeic = /heic|heif/i.test(f.type) || /^(HEIC|HEIF)$/.test(ext);
        function asDoc(label) { li.classList.add('is-doc'); li.title = f.name; li.dataset.kind = label; }
        if (isHeic) { asDoc(ext === 'HEIF' ? 'HEIF' : 'HEIC'); }
        else if (/^image\//.test(f.type)) {
          var img = document.createElement('img'); img.alt = f.name;
          img.src = URL.createObjectURL(f); img.onload = function () { URL.revokeObjectURL(img.src); };
          img.onerror = function () { URL.revokeObjectURL(img.src); img.remove(); asDoc(ext || 'IMG'); };
          li.appendChild(img);
        } else { asDoc(ext === 'PDF' ? 'PDF' : (ext || qt('file'))); }
        var x = document.createElement('button'); x.type = 'button'; x.className = 'qd-file-x';
        x.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg>';
        x.setAttribute('aria-label', qt('del').replace('{x}', f.name));
        x.addEventListener('click', function () { picked.splice(i, 1); syncInput(); render(); });
        li.appendChild(x); list.appendChild(li);
      });
      var cap = form.querySelector('.qd-files-cap'); if (cap) cap.textContent = picked.length ? plural(picked.length, onlyDocs()) : '';
      var zoneTxt = form.querySelector('.qd-drop-btn');
      if (zoneTxt) zoneTxt.textContent = picked.length ? qt('addMore') : qt('addFirst');
      if (picked.length) fieldErr('file', '');
      updateBtn(); updateNeed();
    }
    function addFiles(files) {
      var arr = Array.prototype.slice.call(files || []);
      if (!arr.length || !inp) return;
      if (drop) drop.classList.add('is-busy');
      say(qt('prep'), true);
      Promise.all(arr.map(shrinkImage)).catch(function () { return []; }).then(function (out) {
        var tooBig = null;
        out.forEach(function (f) {
          if (f.size > MAX_FILE) { tooBig = f; return; }
          var dup = picked.some(function (p) { return p.name === f.name && p.size === f.size; });
          if (!dup) picked.push(f);
        });
        if (drop) drop.classList.remove('is-busy');
        syncInput(); render();
        /* на телефоне после фото подводим к полю телефона, без focus – клавиатура не выскакивает */
        if (out.length && window.matchMedia('(max-width:1023px)').matches) {
          var acc = form.querySelector('.qd-acc--static');
          if (acc) acc.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (tooBig) say(qt('big').replace('{x}', tooBig.name).replace('{s}', fmt(tooBig.size)), false);   /* документы – только через форму */
        else hush();
      });
    }
    if (inp) inp.addEventListener('change', function () { addFiles(inp.files); });

    /* «Polityka Prywatności»: раскрываем тут же, текст берём с главной один раз */
    var polBtn = form.querySelector('[data-policy]'), polBox = form.querySelector('.qd-policy');
    if (polBtn && polBox) polBtn.addEventListener('click', function () {
      var open = polBox.hidden;
      polBox.hidden = !open;
      polBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open || polBox.dataset.loaded) return;
      polBox.dataset.loaded = '1';
      fetch(qt('home')).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var src = doc.querySelector('#polityka-prywatnosci .legal-wrap');
        if (!src) throw new Error('brak treści');
        polBox.innerHTML = src.innerHTML;
      }).catch(function () {
        polBox.innerHTML = '<p><a href="' + qt('home') + '#polityka-prywatnosci">' + qt('pol') + '</a></p>';
      });
    });

    /* «Wolę odpowiedź mailem» и «Kilka słów o sprawie» – раскрывашки как переключатель языка:
       кнопка остаётся на месте, aria-expanded переворачивает стрелку, повторный клик сворачивает */
    function toggler(btn, box) {
      if (!btn || !box) return;
      btn.addEventListener('click', function () {
        var open = box.hidden;
        box.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        var field = box.querySelector('input, textarea');
        if (open && field) field.focus();
      });
    }
    toggler(form.querySelector('[data-show-msg]'), form.querySelector('.qd-msg'));

    /* drag & drop на зону; файл, брошенный мимо, не должен открыться вместо страницы */
    if (drop) {
      /* ловит весь блок .qd-photo: с фотографиями плашка включает сетку миниатюр, бросать можно и на них.
         Класс is-over по-прежнему на самой зоне – на него завязаны стили */
      var dropArea = drop.closest('.qd-photo') || drop;
      ['dragenter', 'dragover'].forEach(function (ev) { dropArea.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { dropArea.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
      dropArea.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });
      /* мерцание уголков: включается наведением, а выключается в конце цикла анимации –
         там уголки уже в исходном положении, и остановка получается без рывка.
         Таймер страхует случай, когда событие цикла не пришло (псевдоэлемент сменился) */
      if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        var liveOff = false, liveTimer = 0;
        var liveStop = function () { liveOff = false; clearTimeout(liveTimer); drop.classList.remove('is-live'); };
        drop.addEventListener('mouseenter', function () { liveOff = false; clearTimeout(liveTimer); drop.classList.add('is-live'); });
        drop.addEventListener('mouseleave', function () { liveOff = true; clearTimeout(liveTimer); liveTimer = setTimeout(liveStop, 2600); });
        dropArea.addEventListener('animationiteration', function (e) { if (liveOff && /^qd-corners/.test(e.animationName)) liveStop(); });
      }
    }
    if (!document.body.dataset.dropGuard) {
      document.body.dataset.dropGuard = '1';
      document.addEventListener('dragover', function (e) { e.preventDefault(); });
      document.addEventListener('drop', function (e) { e.preventDefault(); });
    }

    var retry = form.querySelector('[data-retry]');
    if (retry) retry.addEventListener('click', function () { form.requestSubmit ? form.requestSubmit() : btn.click(); });

    /* ---- отправка: XHR с прогрессом, «Dziękujemy» внутри панели ---- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]'), phone = form.querySelector('[name="phone"]');
      var service = form.querySelector('[name="service"]');
      var need = function (f) { return f && f.required; };
      var missing = (need(name) && !name.value.trim()) || (need(phone) && !phone.value.trim()) ||
                    (need(service) && !service.value) || (need(inp) && !picked.length);
      var email = form.querySelector('[name="email"]');
      var noPhone = need(phone) && !phone.value.trim(), noFile = need(inp) && !picked.length;
      var noEmail = need(email) && !emailOk(email.value);
      if (noEmail) missing = true;
      var noOther = (need(name) && !name.value.trim()) || (need(service) && !service.value);
      /* после неудачной отправки поле остаётся помеченным, пока в нём не появится годное значение:
         иначе метка гасла на первом же символе, когда вводить ещё нечего было проверять */
      var mark = function (f) {
        if (!f || f.classList.contains('is-invalid')) return;
        f.classList.add('is-invalid');
        var ok = f === email ? function () { return emailOk(f.value); } : function () { return !!f.value.trim(); };
        f.addEventListener('input', function watch() {
          if (!ok()) return;
          f.classList.remove('is-invalid');
          fieldErr(f.name, '');
          f.removeEventListener('input', watch);
          updateNeed();
        });
      };
      var panel = !!btn.querySelector('.qd-submit-txt');
      /* панель: ошибки под полями, прокрутка к первому пустому, кнопка качнётся */
      if (panel && !noOther && (noFile || noPhone || noEmail)) {
        hush();
        fieldErr('file', noFile ? qt('eFile') : '');
        fieldErr('email', noEmail ? (email.value.trim() ? qt('eMailBad') : qt('eMail')) : '');
        fieldErr('phone', noPhone ? qt('ePhone') : '');
        if (noPhone) mark(phone);
        if (noEmail) mark(email);
        updateNeed();
        /* прокрутка к первому незаполненному – в порядке полей: фото → e-mail → telefon */
        var target = noFile ? form.querySelector('.qd-photo')
                   : (noEmail ? form.querySelector('.qd-email') : form.querySelector('[name="phone"]'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.classList.remove('is-shake'); void btn.offsetWidth; btn.classList.add('is-shake');
        return;
      }
      if (!noOther) {
        if (noFile && (noPhone || noEmail)) { say(form.dataset.msgRequired, false); mark(noEmail ? email : phone); return; }
        if (noFile)  { say(qt('sFile'), false); return; }
        if (noEmail) { say(email.value.trim() ? qt('eMailBad') : qt('sMail'), false); mark(email); email.focus(); return; }
        if (noPhone) { say(qt('sPhone'), false); mark(phone); phone.focus(); return; }
      }
      if (missing) { say(form.dataset.msgRequired || qt('miss'), false); return; }
      if (drop && drop.classList.contains('is-busy')) { say(qt('busy'), false); return; }
      var totalBytes = picked.reduce(function (s, f) { return s + f.size; }, 0);
      if (totalBytes > MAX_TOTAL) { say(qt('total').replace('{s}', fmt(totalBytes)), false); return; }

      btn.disabled = true;
      var txt = btn.querySelector('.qd-submit-txt'), txt0 = txt ? txt.textContent : '';
      if (txt) txt.textContent = qt('sending'); else say(qt('sending'), true);   /* в панели статус – в самой кнопке */
      var failBox = form.querySelector('.qd-fail'), slow = form.querySelector('.qd-slow');
      if (failBox) failBox.hidden = true;
      var slowT = slow ? setTimeout(function () { slow.hidden = false; }, 15000) : 0;
      function stopSlow() { clearTimeout(slowT); if (slow) slow.hidden = true; }

      /* Google Apps Script (01.10.2026, docs/forma-apps-script/): тело – JSON строкой text/plain, файлы в base64.
         Слушатель upload.onprogress здесь нельзя: с ним браузер шлёт предзапрос CORS, а Apps Script на него не отвечает –
         поэтому полоса в кнопке идёт по времени (до 90 %), а не по байтам. Ответ сайту – {ok:true}, иначе ошибка */
      var gas = /^https:\/\/script\.google\.com\//.test(form.action), tick = 0;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', form.action);
      xhr.setRequestHeader('Accept', 'application/json');   /* Formspree/Web3Forms: ответ JSON, без редиректа */
      if (!gas) xhr.upload.onprogress = function (ev) {
        if (!ev.lengthComputable) return;
        var pc = Math.round(ev.loaded / ev.total * 100);
        btn.style.setProperty('--p', pc + '%');
        if (txt) txt.textContent = qt('sending') + ' ' + pc + '%';
      };
      xhr.onload = function () {
        var ok = xhr.status >= 200 && xhr.status < 300;
        if (ok && gas) { try { ok = JSON.parse(xhr.responseText).ok === true; } catch (er) { ok = false; } }
        if (ok) {
          stopSlow(); clearInterval(tick);
          if (gas) btn.style.setProperty('--p', '100%');
          if (window.gtag) gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXX/XXXXXXXX' });   /* только после успеха */
          if (txt) { txt.textContent = qt('sent'); setTimeout(showDone, 500); } else showDone();
        } else fail();
      };
      function showDone() {
          form.classList.add('is-sent');                      /* CSS прячет поля, показывает .qd-done */
          var head = form.parentElement.querySelector('.qd-formhead--light'); if (head) head.hidden = true;
          var em = form.querySelector('.qd-done-email'); if (em && email) em.textContent = email.value.trim();
          var ph = form.querySelector('.qd-done-phone'); if (ph && phone) ph.textContent = phone.value.trim();
          var done = form.querySelector('.qd-done'); if (done) { done.hidden = false; done.focus && done.focus(); }
          hush();
      }
      xhr.onerror = fail; xhr.ontimeout = fail; xhr.timeout = gas ? 180000 : 60000;   /* Apps Script ещё кладёт файлы на Drive и шлёт письмо */
      function fail() {
        stopSlow(); clearInterval(tick);
        btn.disabled = false; btn.style.removeProperty('--p'); if (txt) txt.textContent = txt0;
        if (failBox) {                                        /* панель: сообщение и два действия под кнопкой */
          failBox.querySelector('.qd-fail-msg').textContent = navigator.onLine === false
            ? qt('offline') : qt('fail');
          failBox.hidden = false; hush(); return;
        }
        say(qt('failFull'), false);   /* документы – только через форму (Грег, 24.09.2026) */
      }
      /* откуда заявка: страница с метками utm_* и внешний источник – приходят в письме отдельными полями (аналитика 27.09.2026) */
      var fd = new FormData(form);
      fd.append('strona', location.pathname + location.search);
      fd.append('jezyk', QD_LANG);   /* на каком языке отвечать клиенту */
      if (document.referrer && document.referrer.indexOf(location.origin) !== 0) fd.append('skad', document.referrer.split('?')[0]);
      if (!gas) { xhr.send(fd); return; }
      var fields = {}, files = [];
      fd.forEach(function (v, k) {
        if (typeof v === 'string') fields[k] = fields[k] ? fields[k] + ', ' + v : v;   /* несколько значений одного поля – через запятую */
        else if (v && v.size) files.push(v);                                         /* пустой input (страница без фото) – не файл */
      });
      Promise.all(files.map(function (f) {
        return new Promise(function (res, rej) {
          var r = new FileReader();
          r.onload = function () { var s = String(r.result); res({ name: f.name, type: f.type, data: s.slice(s.indexOf(',') + 1) }); };
          r.onerror = function () { rej(r.error); };
          r.readAsDataURL(f);
        });
      })).then(function (list) {
        var t0 = Date.now(), tau = Math.max(2500, totalBytes / 1048576 * 1500);   /* ~1 MB за 1,5 с: на телефоне в дороге медленнее */
        tick = setInterval(function () { btn.style.setProperty('--p', (90 * (1 - Math.exp(-(Date.now() - t0) / tau))).toFixed(1) + '%'); }, 200);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
        xhr.send(JSON.stringify({ fields: fields, files: list }));
      }, fail);
    });
  };
  window.initQuoteForm(document);
})();

  /* --- price count-up on hover --- */
  (function(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var DUR = 620;          // длительность накрутки, мс
    var FROM = 0.15;        // старт = 15% от цены
    /* свои стартовые числа для основных цен (Грег, 02.10.2026); остальные – с 15% */
    var START = { 260:23, 120:14, 550:31, 90:6 };
    function startOf(target){ return START[target] != null ? START[target] : Math.round(target * FROM); }
    document.querySelectorAll('.price-hit').forEach(function(box){
      var el = box.querySelector('.price-num');
      if (!el) return;
      if (box.closest('.cn-v3')) return;   /* прайс /cennik/ вида 116: цифры статичны, накрутка – только при раскрытии строки (блок «Прайс /cennik/ (.cn-v3)» ниже) */
      /* курсор ловим на всей строке прайса, а не только на самой цене */
      var hit = box.closest('li, .flex') || box;
      var target = parseInt(el.dataset.price, 10);
      var raf = null;
      function fmt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
      el.style.minWidth = el.getBoundingClientRect().width + 'px';
      hit.addEventListener('mouseenter', function(){
        if (raf) cancelAnimationFrame(raf);
        var start = performance.now(), from = startOf(target);
        (function tick(now){
          var t = Math.min((now - start) / DUR, 1);
          var e = t * t * t;                         // easeInCubic: вначале медленно, к концу разгон (Грег, 02.10.2026)
          el.textContent = fmt(Math.round(from + (target - from) * e));
          if (t < 1) raf = requestAnimationFrame(tick); else el.textContent = fmt(target);
        })(start);
      });
      hit.addEventListener('mouseleave', function(){
        if (raf) cancelAnimationFrame(raf);
        el.textContent = fmt(target);
      });
    });
    /* столбец Go Tabular (.gt): строки нет – курсор ловим на цифре и её подписи справа */
    document.querySelectorAll('.gt .gt-n').forEach(function(el){
      var target = parseInt(el.textContent.replace(/\D/g, ''), 10);
      if (!target) return;
      var raf = null;
      function run(){
        if (raf) cancelAnimationFrame(raf);
        var start = performance.now(), from = startOf(target);
        (function tick(now){
          var t = Math.min((now - start) / DUR, 1);
          var e = t * t * t;                         // easeInCubic, как у прайса выше
          el.textContent = Math.round(from + (target - from) * e);
          if (t < 1) raf = requestAnimationFrame(tick); else el.textContent = target;
        })(start);
      }
      function stop(){ if (raf) cancelAnimationFrame(raf); el.textContent = target; }
      el._gtRun = run;
      var pair = [el, el.nextElementSibling].filter(Boolean);
      function inPair(n){ return pair.some(function(p){ return n && p.contains(n); }); }
      pair.forEach(function(n){
        n.style.cursor = 'default';
        /* переход цифра ↔ подпись – та же строка, заново не крутим */
        n.addEventListener('mouseenter', function(e){ if (!inPair(e.relatedTarget)) run(); });
        n.addEventListener('mouseleave', function(e){ if (!inPair(e.relatedTarget)) stop(); });
      });
    });
    /* Вставной блок .gt--cn (hero /cennik/ и /apostille/): изредка сама накручивается одна цена – 260 или 550,
       по очереди, раз в 14–26 с; только пока блок на экране, вкладка открыта и курсор не над блоком (01.10.2026) */
    document.querySelectorAll('.gt--cn').forEach(function(box){
      var nums = [].filter.call(box.querySelectorAll('.gt-n'), function(n){ return /^(260|550)$/.test(n.textContent.trim()); });
      if (!nums.length) return;
      var seen = false, over = false, i = 0, timer = null;
      box.addEventListener('mouseenter', function(){ over = true; });
      box.addEventListener('mouseleave', function(){ over = false; });
      function next(){
        clearTimeout(timer);
        timer = setTimeout(function(){
          if (seen && !over && !document.hidden){ nums[i % nums.length]._gtRun(); i++; }
          next();
        }, 14000 + Math.random() * 12000);
      }
      if ('IntersectionObserver' in window){
        new IntersectionObserver(function(es){ seen = es[0].isIntersecting; }).observe(box);
      } else seen = true;
      next();
    });
  })();

  /* --- Прайс /cennik/ (.cn-v3, вид 116 со стенда docs/ceny-gt, 02.10.2026) ---------------------------
     Строка прайса (li.xh) – кнопка: нажатие или Enter / пробел раскрывает и сворачивает её (.open), открытые остаются
     открытыми; первая строка группы раскрыта в разметке. Ссылки внутри строки («Zamów wycenę» – [data-quote], «jak to
     działa») работают как ссылки, строку не переключают. Цена накручивается только в момент раскрытия – те же стартовые
     числа и ease-in, что у накрутки выше; в остальное время цифры статичны. «Odbiór i wysyłka» – <details> с /kontakt/:
     при раскрытии накручивается сумма в окончании (.cg106). .xready (через 0,6 с) включает плавную смену кегля цены –
     строка, раскрытая сразу, не растёт на глазах. */
  (function(){
    var sec = document.querySelector('#ceny.cn-v3');
    if (!sec) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var START = { 260:23, 120:14, 550:31, 90:6 };
    function fmt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
    function countUp(n){
      if (!n || reduce) return;
      var to = parseInt(n.dataset.price, 10); if (!to) return;
      var from = START[to] != null ? START[to] : Math.round(to * .15), s0 = performance.now();
      /* своё стартовое число – data-from у .price-num; оно может быть больше итога, тогда число идёт вниз:
         скидка «−10 %» накручивается от 60 до 10 (Грег, 04.10.2026: «сделай накрутку вниз от 60% до 10%») */
      if (n.dataset.from != null && !isNaN(parseInt(n.dataset.from, 10))) from = parseInt(n.dataset.from, 10);
      if (n._raf) cancelAnimationFrame(n._raf);
      clearTimeout(n._end);
      (function tick(now){
        var t = Math.max(0, Math.min((now - s0) / 620, 1));   /* метка кадра бывает раньше s0 – без нуля число уходило ниже стартового */
        n.textContent = fmt(Math.round(from + (to - from) * t * t * t));
        if (t < 1) n._raf = requestAnimationFrame(tick);
      })(s0);
      /* в фоновой вкладке кадры не идут – цена всё равно встаёт на итоговую */
      n._end = setTimeout(function(){ cancelAnimationFrame(n._raf); n.textContent = fmt(to); }, 700);
    }
    sec.querySelectorAll('.cn-list li.xh').forEach(function(li){
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-expanded', li.classList.contains('open') ? 'true' : 'false');
      function toggle(){
        var open = !li.classList.contains('open');
        li.classList.toggle('open', open); li.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) countUp(li.querySelector('.tcell .price-num'));
      }
      li.addEventListener('click', function(e){ if (e.target.closest('a')) return; toggle(); });
      li.addEventListener('keydown', function(e){
        if (e.target !== li || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault(); toggle();
      });
    });
    sec.querySelectorAll('.cg105 details').forEach(function(x){
      x.addEventListener('toggle', function(){ if (x.open) countUp(x.querySelector('.cg106 .price-num')); });
    });
    setTimeout(function(){ sec.classList.add('xready'); }, 600);
  })();

  /* --- Логотип: отобранные начертания ------------------------------------
     FORMS[0] – исходное написание, дальше отобранные варианты (номера – из
     logo-preview.html, где перебираются все 640 000 сочетаний; полные наборы
     знаков по буквам описаны в logo-glyphs.md рядом с этим файлом).
     Наведение на логотип в шапке переключает слово на следующий вариант,
     увод курсора возвращает исходное. Добавить вариант – дописать строку.
     Вручную: LOGO_GLYPHS.show(n) · .next() · .start() · .stop(). */
  window.LOGO_GLYPHS = (function () {
    /* Жёлтый знак только в двух вариантах: ✦ и ✱ (решение 06.09.2026),
       ✻ и ✳ убраны – буквенные начертания остались прежними. */
    var FORMS = [
      'Apostilo✦',   /* исходное  */
      'ApΩštiło✱',   /* № 10 028  */
      'AρΩşτıło✦',   /* № 94 627  */
      'ÅpoΣτiƖø✱',   /* № 324 583 */
      'Åρσštıłō✦',   /* № 434 147 */
      'ΛpΩΣτıƖΘ✱'    /* № 492 694 */
    ];
    var sel = '.logo-brand', step = 0, timer = null;

    function items(){
      var box = document.querySelector(sel);
      return box ? box.querySelectorAll('b') : [];
    }
    function show(k){
      var n = FORMS.length;
      var chars = Array.from(FORMS[((k % n) + n) % n]);
      var b = items();
      for (var i = 0; i < b.length && i < chars.length; i++) b[i].textContent = chars[i];
    }
    function reset(){ step = 0; show(0); }
    function next(){ step = FORMS.length > 1 ? (step % (FORMS.length - 1)) + 1 : 0; show(step); }

    /* подмена по наведению: каждое новое наведение – следующий вариант */
    function hover(opts){
      opts = opts || {};
      var box = document.querySelector(opts.sel || sel);
      if (!box) return;
      box.addEventListener('mouseenter', next);
      box.addEventListener('focus', next);
      box.addEventListener('mouseleave', function(){ show(0); });
      box.addEventListener('blur', function(){ show(0); });
    }
    /* автосмена по таймеру – по умолчанию выключена */
    function start(opts){
      opts = opts || {};
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      if (opts.sel) sel = opts.sel;
      stop();
      timer = setInterval(next, opts.every || 3200);
    }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } reset(); }

    return { forms: FORMS, show: show, next: next, reset: reset,
             hover: hover, start: start, stop: stop };
  })();
  /* включено: подмена при наведении на логотип в шапке */
  LOGO_GLYPHS.hover();

  /* --- логотип в футере: смена начертания при наведении и движении мыши,
         при уводе курсора остаётся последнее начертание.
         Контейнер .footer-mark не ловит события (pointer-events:none),
         поэтому положение курсора считаем сами по document. --- */
  (function(){
    var box = document.querySelector('.logo-footer');
    if (!box || !window.LOGO_GLYPHS) return;
    var zone = document.getElementById('stopka') || box;
    var FORMS = LOGO_GLYPHS.forms, step = 0, last = 0, inside = false, GAP = 969;
    function paint(){
      var chars = Array.from(FORMS[step]);
      var b = box.querySelectorAll('b');
      for (var i = 0; i < b.length && i < chars.length; i++) b[i].textContent = chars[i];
    }
    function next(){
      step = FORMS.length > 1 ? (step % (FORMS.length - 1)) + 1 : 0;
      paint();
    }
    var timer = null;
    function startCycle(){ if (!timer) timer = setInterval(next, GAP); }
    function stopCycle(){ if (timer) { clearInterval(timer); timer = null; } }

    /* зона срабатывания – весь футер, а не только сам логотип */
    document.addEventListener('mousemove', function(e){
      var r = zone.getBoundingClientRect();
      var hit = e.clientX >= r.left && e.clientX <= r.right &&
                e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!hit) {                                    /* увод – начертание остаётся */
        if (inside) { inside = false; stopCycle(); }
        return;
      }
      if (!inside) { inside = true; next(); startCycle(); }
    }, { passive: true });
    /* курсор мог уйти за окно, не пройдя через логотип */
    document.addEventListener('mouseleave', function(){ inside = false; stopCycle(); });
  })();


  /* Предвыбор услуги в форме при переходе из тематического блока */
  (function(){
    var sel = document.getElementById('service');
    if(!sel) return;
    document.querySelectorAll('a[href="#wycena"][data-service]').forEach(function(a){
      a.addEventListener('click', function(){
        var v = a.getAttribute('data-service');
        if([].some.call(sel.options, function(o){ return o.value === v; })){
          sel.value = v;
          sel.dispatchEvent(new Event('change', { bubbles:true }));
        }
      });
    });
  })();

  /* /cennik/ v2: линия под заголовком группы заливается жёлтым по мере прокрутки блока,
     а после полной заливки жёлтый уходит слева направо.
     --p – правая кромка (0..1): 0 – верх списка на 85% высоты окна, 1 – низ списка там же.
     --q – левая кромка (0..1): начинает расти, когда линию прошло 70% высоты списка,
     и доходит до 1 на оставшихся 30% (но не быстрее, чем за 20% высоты окна). */
  (function(){
    var lists = document.querySelectorAll('.cn-v2 .cn-list, .cn-v2 .cn-plain');
    if(!lists.length) return;
    var ticking = false;
    function clamp(v){ return Math.min(Math.max(v, 0), 1); }
    function apply(){
      ticking = false;
      var vh = window.innerHeight, line = vh * 0.85;
      lists.forEach(function(ul){
        var r = ul.getBoundingClientRect();
        var p = clamp((line - r.top) / r.height);
        var span = Math.max(r.height * 0.3, vh * 0.2);
        var q = clamp((line - (r.top + r.height * 0.7)) / span);
        ul.style.setProperty('--p', p.toFixed(3));
        ul.style.setProperty('--q', q.toFixed(3));
      });
    }
    function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(apply); } }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    apply();
  })();

  /* Krok po kroku – шаги стопкой карточек (01.10.2026, вариант 39 со стенда docs/kroki/). Только .kt-steps[data-kroki]
     (польские страницы). Стоит ДО панели wyceny: кнопка «Otwórz formularz wyceny» и ссылки на форму внутри шагов получают
     data-quote-обработчик панели вместе со всеми. Исходный список остаётся в разметке (без JS виден он), при сборке скрыт.
     Смена шагов – по шагу (Грег: «нелинейная прокрутка – карточка должна побыть в центре»): x – непрерывная позиция прокрутки
     0…M, k = floor(x) – текущий слайд. Стили – .kk-* в конце styles.css.
     Индикатор – точки в пилюле, как у галерей apple.com (Грег, 04.10.2026: «реализуй по такому же принципу и у нас на сайте», кнопка повтора
     рядом с пилюлей не нужна): точка на каждый слайд, включая слайд заявки; у текущего слайда точка вытянута в полоску, и полоска
     заполняется, пока его читают (доля x − k); заполнилась – слайд сменился, полоска снова стала точкой, вытянулась следующая.
     Раньше были N равных отрезков под карточкой (отрезок слайда i заполнялся, пока читаешь i−1). */
  (function(){
    var blocks = document.querySelectorAll('.kt-steps[data-kroki]');
    if (!blocks.length) return;
    var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg>';
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function el(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
    /* название шага парой начертаний: первое слово жирное, остальное тонким курсивом */
    function pair(html){ var m = html.match(/^(\S+?)(?:\s|&nbsp;)+([\s\S]*)$/); return m ? '<b>' + m[1] + '</b> <i>' + m[2] + '</i>' : '<b>' + html + '</b>'; }

    Array.prototype.forEach.call(blocks, function(box){
      var list = box.querySelector('ol.kt-steps-list'); if (!list) return;
      var steps = Array.prototype.map.call(list.children, function(li){
        var b = li.querySelector('b'), c = li.cloneNode(true), cb = c.querySelector('b'); if (cb) cb.remove();
        return { t:b ? b.innerHTML.trim().replace(/\.$/, '') : '', tt:b ? b.textContent.trim().replace(/\.$/, '') : '', x:c.innerHTML.trim() };
      });
      var N = steps.length, M = N + 1;   /* M – шаги и слайд заявки */
      var root = el('div', 'kk'), pin = el('div', 'kk-pin'), st = el('div', 'kk-st'), nav = el('div', 'kk-nav'), seg = el('ol', 'kk-dots');
      var cs = steps.map(function(s, i){
        return el('article', 'kk-c', '<div class="kk-in"><p class="kk-t">' + pair(s.t) + '</p><p class="kk-x">' + s.x + '</p></div><span class="kk-wm" aria-hidden="true">' + (i + 1) + '</span>');
      });
      var cta = el('article', 'kk-c kk-cta bg-terra', '<div class="kk-in"><p class="kk-t"><b>Prześlij</b> <i>zdjęcia dokumentu</i></p>' +
        '<p class="kk-x">Od 7:00 do 21:00 cenę końcową i&nbsp;termin poznasz zwykle w&nbsp;15&nbsp;minut. Wycena jest bezpłatna i&nbsp;do niczego nie zobowiązuje.</p>' +
        '<p class="kk-btn"><a href="/cennik/#wycena" data-quote class="cta-btn cta-btn--main">Otwórz formularz wyceny<span class="cta-mark" aria-hidden="true">' + CHEV + '</span></a></p></div>');
      cs.push(cta);
      cs.forEach(function(c, i){ c.style.zIndex = String(100 - i); st.appendChild(c); });
      /* точки – у всех слайдов 0…N, последняя – слайд заявки */
      var names = steps.map(function(s){ return s.tt; }).concat('Prześlij zdjęcia');
      var ls = []; for (var j = 0; j <= N; j++) (function(i){
        var li = el('li', '', '<button type="button"><span class="bar"><i></i></span></button>'); li._i = i;
        li.firstChild.setAttribute('aria-label', names[i]); seg.appendChild(li); ls.push(li);
      })(j);
      var ln = el('p', 'kk-ln', '<button type="button" class="dn">Pokaż wszystkie kroki' + CHEV + '</button><button type="button">Pomiń' + CHEV + '</button>');
      nav.appendChild(seg); nav.appendChild(ln);
      pin.appendChild(st); pin.appendChild(nav); root.appendChild(pin);
      var all = el('ol', 'kk-all'), back = el('p', 'kk-back', '<button type="button">Pokaż po jednym' + CHEV + '</button>');
      steps.forEach(function(s){ all.appendChild(el('li', '', '<b>' + s.t + '.</b> ' + s.x)); });
      all.hidden = true; back.hidden = true;
      list.parentNode.insertBefore(root, list.nextSibling); root.parentNode.insertBefore(all, root.nextSibling); all.parentNode.insertBefore(back, all.nextSibling);
      box.classList.add('kk-on');

      var dist = 0, top0 = 110, cur = -1;
      function size(){
        var h = 0; cs.forEach(function(c){ c.style.height = ''; h = Math.max(h, c.offsetHeight); });
        cs.forEach(function(c){ c.style.height = h + 'px'; });
        st.style.height = (h + 24) + 'px';   /* +24 – края стопки под карточкой */
        var cl = cs[0].offsetLeft, cw = cs[0].offsetWidth, pad = parseFloat(getComputedStyle(cs[0]).paddingLeft) || 0;
        nav.style.marginLeft = (cl + pad) + 'px'; nav.style.width = (cw - 2 * pad) + 'px';   /* полоса – по ширине текста карточки */
        /* пока блок стоит – по центру окна; от 1150px не выше шапки (она не прячется, кончается на ~108px) */
        top0 = Math.max(window.innerWidth >= 1150 ? 124 : 16, Math.round((window.innerHeight - pin.offsetHeight) / 2)); pin.style.top = top0 + 'px';
        dist = M * window.innerHeight * .55;   /* по 55 % окна прокрутки на слайд, на слайде заявки тоже можно задержаться */
        root.style.height = (pin.offsetHeight + dist) + 'px';
      }
      function prog(){ return dist ? clamp((top0 - root.getBoundingClientRect().top) / dist, 0, 1) : 0; }
      function upd(){
        if (root.style.display === 'none') return;
        var x = prog() * M, k = Math.min(M - 1, Math.floor(x));
        ls.forEach(function(li){ li.firstChild.firstChild.firstChild.style.setProperty('--f', clamp(x - li._i, 0, 1).toFixed(3)); });
        if (k === cur) return; cur = k;
        cs.forEach(function(c, i){ var dd = i - k; c.style.setProperty('--d', dd);
          c.classList.toggle('is-cur', dd === 0); c.classList.toggle('is-past', dd < 0); c.classList.toggle('is-next', dd > 0); c.classList.toggle('is-deep', dd > 3); });
        ls.forEach(function(li){ li.classList.toggle('on', li._i === k); li.classList.toggle('done', li._i < k);
          if (li._i === k) li.firstChild.setAttribute('aria-current', 'step'); else li.firstChild.removeAttribute('aria-current'); });
      }
      function go(i){
        var t = root.getBoundingClientRect().top + window.scrollY;
        var y = i >= M ? t + root.offsetHeight - window.innerHeight * .35 : t - top0 + dist * (i + .02) / M;
        window.scrollTo({ top:y, behavior:calm ? 'auto' : 'smooth' });
      }
      /* нажатие на карточку – следующий слайд; на слайде заявки – панель wyceny; ссылки и кнопки внутри работают сами */
      cs.forEach(function(c, i){ c.addEventListener('click', function(e){
        if (e.target.closest('a, button')) return;
        if (i === N && cur === N) { cta.querySelector('[data-quote]').click(); return; }
        go(i === cur ? i + 1 : i);
      }); });
      ls.forEach(function(li){ li.firstChild.addEventListener('click', function(){ go(li._i); }); });
      function showAll(on){
        root.style.display = on ? 'none' : ''; all.hidden = !on; back.hidden = !on;
        if (!on) { size(); cur = -1; upd(); }
        var t = (on ? all : root).getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 1150 ? 140 : 90);
        window.scrollTo({ top:Math.max(0, t), behavior:'auto' });
      }
      ln.children[0].addEventListener('click', function(){ showAll(true); });
      ln.children[1].addEventListener('click', function(){ go(M); });
      back.firstChild.addEventListener('click', function(){ showAll(false); });

      var ticking = false;
      function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(function(){ ticking = false; upd(); }); } }
      window.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', function(){ if (root.style.display !== 'none') { size(); upd(); } });
      size(); upd();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (root.style.display !== 'none') { size(); upd(); } });
    });
  })();

  /* Панель «Ekspresowa wycena». Разметка панели лежит одним файлом – /assets/wycena.html –
     и подгружается при первом нажатии на [data-quote]. Открывается на всех страницах,
     в том числе там, где та же форма уже стоит в секции #wycena (главная, /cennik/). */
  (function(){
    var QL = window.QD_LANG || 'pl';   /* язык панели – по lang страницы (28.09.2026), копии wycena-uk/ru/en собирает docs/wycena-i18n.py */
    var FRAG = '/assets/wycena' + (QL === 'pl' ? '' : '-' + QL) + '.html?v=20261004-4';   /* формат ГГГГММДД-N; поднимать вместе с версиями styles.css и app.js в HTML */
    var qd = null, last = null, loading = null;

    /* id внутри панели дублировали бы форму на /cennik/ и главной – добавляем суффикс */
    function uniq(){
      qd.querySelectorAll('[id]').forEach(function(el){
        var old = el.id;
        if (!document.getElementById(old) || document.getElementById(old) === el) return;
        el.id = old + '-qd';
        qd.querySelectorAll('[for="' + old + '"]').forEach(function(l){ l.setAttribute('for', el.id); });
        qd.querySelectorAll('[aria-labelledby="' + old + '"]').forEach(function(l){ l.setAttribute('aria-labelledby', el.id); });
      });
    }
    function bind(){
      uniq();
      /* наблюдатель за .slide-in отработал до вставки панели – показываем заголовок сразу */
      qd.querySelectorAll('.slide-in').forEach(function(el){ el.classList.add('is-in'); });
      qd.querySelectorAll('[data-close]').forEach(function(el){ el.addEventListener('click', close); });
      if (window.initQuoteForm) window.initQuoteForm(qd);
      /* полоса нарастающего размытия у верхней кромки: в покое она высотой с поле колонки и ничего
         не задевает, а по мере прокрутки вырастает ещё на 56px – размытие получается длинным и мягким,
         но заголовок, пока панель не прокручена, остаётся резким */
      var sc = qd.querySelector('.qd-scroll'), tb = qd.querySelector('.qd-topblur');
      if (sc && tb) {
        var tbRaf = 0;
        sc.addEventListener('scroll', function(){
          if (tbRaf) return;
          tbRaf = requestAnimationFrame(function(){ tbRaf = 0; qd.style.setProperty('--qd-tb', Math.min(sc.scrollTop, 56) + 'px'); });
        }, { passive:true });
      }
      /* Шапка панели на телефоне и планшете (.qd-mhead, уже 1024px) стоит вне области прокрутки и потому «закреплена».
         На телефоне она сразу компактная – одна строка «Ekspresowa wycena Dokumentu» (решает CSS по ширине и высоте окна);
         первая версия сжимала её скриптом при прокрутке, Грег по снимку с iPhone попросил: «давай сразу в телефонах
         такая плашка будет» (21.09.2026) – скрипт для этого больше не нужен. */
      var shell = qd.querySelector('.qd-shell');
      /* Панель закрывается движением пальца вниз (21.09.2026, Грег: «в телефоне всплывающую форму убрать пальцем вниз?»).
         Лист выезжает снизу – стянуть его обратно вниз привычно по системным листам iOS и Android.
         Тянуть можно: за шапку панели – всегда; за саму форму – только когда она прокручена в самый верх
         (иначе это обычная прокрутка формы). Жест должен быть вниз и почти вертикальным; поле «Kilka słów» (textarea)
         не трогаем – у него своя прокрутка. Лист идёт за пальцем без перехода, подложка светлеет; отпустили дальше
         28% высоты панели или резким движением – закрываем обычным close(), иначе лист возвращается на место.
         События – touch*, поэтому мышь и десктоп не затронуты; форма при закрытии не сбрасывается. */
      var wrap = qd.querySelector('.qd-wrap'), back = qd.querySelector('.qd-backdrop');
      if (wrap && shell && sc) {
        var gY = 0, gX = 0, gDy = 0, gT = 0, gH = 0, gDrag = false, gDecided = false, gHead = false, gSkip = false;
        var gReset = function () {
          wrap.style.transition = ''; wrap.style.transform = '';
          if (back) { back.style.transition = ''; back.style.opacity = ''; }
        };
        qd.addEventListener('touchstart', function (e) {
          gDrag = false; gDecided = false; gDy = 0;
          gSkip = e.touches.length !== 1 || !qd.classList.contains('is-open');
          if (gSkip) return;
          var tg = e.target, t = e.touches[0];
          gSkip = !!(tg.closest && tg.closest('textarea, .qd-close'));
          gHead = !!(tg.closest && tg.closest('.qd-mhead'));
          gY = t.clientY; gX = t.clientX; gT = Date.now(); gH = shell.offsetHeight || 1;
        }, { passive:true });
        qd.addEventListener('touchmove', function (e) {
          if (gSkip || e.touches.length !== 1) return;
          var t = e.touches[0], mx = t.clientX - gX, my = t.clientY - gY;
          if (!gDecided) {
            if (Math.abs(my) < 6 && Math.abs(mx) < 6) return;
            gDecided = true;
            gDrag = my > 0 && Math.abs(my) > Math.abs(mx) * 1.2 && (gHead || sc.scrollTop <= 0);
            if (gDrag) { wrap.style.transition = 'none'; if (back) back.style.transition = 'none'; }
          }
          if (!gDrag) return;
          if (e.cancelable) e.preventDefault();          /* иначе iOS тянет резинку прокрутки вместо листа */
          gDy = Math.max(0, my);
          wrap.style.transform = 'translateY(' + gDy + 'px)';
          if (back) back.style.opacity = String(Math.max(0, 1 - gDy / (gH * 1.1)));
        }, { passive:false });
        var gEnd = function () {
          if (!gDrag) return;
          gDrag = false;
          var speed = gDy / Math.max(1, Date.now() - gT);          /* px / мс */
          var shut = gDy > gH * 0.28 || (gDy > 60 && speed > 0.55);
          /* инлайн-стили снимаем в том же такте: переход продолжится с места, где лист отпустили, –
             к translateY(100%) при закрытии или обратно к нулю */
          gReset();
          if (shut) close();
        };
        qd.addEventListener('touchend', gEnd);
        qd.addEventListener('touchcancel', gEnd);
      }
    }
    function load(){
      if (qd) return Promise.resolve(qd);
      if (loading) return loading;
      loading = fetch(FRAG).then(function(r){
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + FRAG);
        return r.text();
      }).then(function(html){
        var box = document.createElement('div');
        box.innerHTML = html;
        qd = box.firstElementChild;
        document.body.appendChild(qd);
        /* «Apostille na: Oryginał · Tłumaczenie · Oba · Nie wiem» (.qd-ap, 27.09.2026) – только на страницах про Apostille;
           на остальных fieldset остаётся hidden, и его радио в письмо не попадают */
        var apSet = qd.querySelector('.qd-ap');
        /* 30.09.2026: и на подстраницах /apostille/…/ (akt-urodzenia, pelnomocnictwo, KRK, gdzie) – их FAQ просят отметить вариант */
        if (apSet && /^\/(?:(?:ua|ru|en)\/)?apostille(?:-bez-przyjazdu|\/[a-z-]+)?\/$/.test(location.pathname)) {
          apSet.hidden = false;
          /* 28.09.2026: на страницах Apostille в выборе перевода вместо «Zwykłe» – «Nie potrzebuję» (Apostille без перевода),
             пример в поле «Kilka słów» – документ за границу */
          var zw = qd.querySelector('.qd-kind:not(.qd-ap) input[value="Zwykłe"]');
          if (zw) { zw.value = 'Nie potrzebuję'; if (zw.nextElementSibling) zw.nextElementSibling.textContent = 'Nie potrzebuję'; }
          var msgF = qd.querySelector('#message');
          if (msgF) msgF.placeholder = 'Np. akt urodzenia do Włoch,\npotrzebny do końca miesiąca';
        }
        /* 30.09.2026: страница может задать свой пример в «Kilka słów» (data-qd-ph на <main>, перевод строки – &#10;)
           и не требовать фото (data-qd-nofile – /apostille/zaswiadczenie-o-niekaralnosci/: справки ещё нет, фотографировать нечего;
           тогда поле «Kilka słów» сразу открыто – в нём клиент пишет, куда и на когда нужна справка) */
        var pgMain = document.querySelector('body > main');
        var pgPh = pgMain && pgMain.getAttribute('data-qd-ph');
        var msgP = qd.querySelector('#message');
        if (pgPh && msgP) msgP.placeholder = pgPh;
        if (pgMain && pgMain.hasAttribute('data-qd-nofile')) {
          var fIn = qd.querySelector('input[type="file"]');
          if (fIn) fIn.required = false;
          var mBtn = qd.querySelector('[data-show-msg]'), mBox = qd.querySelector('.qd-msg');
          if (mBtn && mBox) { mBox.hidden = false; mBtn.setAttribute('aria-expanded', 'true'); }
          /* заголовок панели «Sfotografuj telefonem…» здесь не к месту – клиенту ещё нечего фотографировать */
          var fhA = qd.querySelector('.qd-fh-a'), fhB = qd.querySelector('.qd-fh-b');
          if (fhA && fhB) { fhA.textContent = 'Napisz, dokąd'; fhB.textContent = 'i\u00a0na kiedy potrzebujesz dokumentu'; }
          /* 04.10.2026 (аналитика 02.10, Ф13): фото здесь не просили – экран после отправки не говорит «zdjęcia dotarły»,
             а обещает то же, что страница: wniosek i pełnomocnictwo do podpisania. Страница только PL */
          var dH = qd.querySelector('.qd-done .qd-formhead'), dS = qd.querySelector('.qd-done .qd-formsub'), dSafe = qd.querySelector('.qd-done .qd-safe');
          if (dH) dH.textContent = 'Dziękujemy, wiadomość dotarła.';
          if (dS) dS.innerHTML = 'Cenę końcową, termin oraz wniosek i\u00a0pełnomocnictwo do podpisania wyślemy na <b class="qd-done-email"></b> zwykle w\u00a0ciągu 15\u00a0minut, codziennie 7:00–21:00. Płacisz dopiero wtedy, gdy zaakceptujesz wycenę.';
          if (dSafe) dSafe.hidden = true;
        }
        bind();
        return qd;
      }).catch(function(err){
        /* file:// или ошибка сети – уводим на страницу с формой, чтобы кнопка не молчала */
        console.error('Wycena: nie udało się wczytać ' + FRAG, err);
        loading = null;
        /* уже на /cennik/ – не уводим: #wycena снова открыл бы панель, и ошибка пошла бы по кругу */
        if (location.pathname !== '/cennik/') window.location.href = '/cennik/#wycena';
      });
      return loading;
    }
    function open(){
      load().then(function(){
        if (!qd) return;                   /* фрагмент не загрузился – load() уже увёл на /cennik/ */
        last = document.activeElement;
        qd.hidden = false;
        /* на десктопе страницу не блокируем: колесо над панелью крутит её содержимое,
           а мимо панели – сам сайт. На телефонах и тач-устройствах панель занимает
           почти весь экран, поэтому прокрутку страницы под ней запираем (21.09.2026) */
        if (window.matchMedia('(max-width:639px), (hover:none)').matches) {
          document.body.style.overflow = 'hidden';
        }
        /* пока панель на экране, пункт меню держим нажатым: класс qd-open
           оставляет его плашку видимой независимо от курсора (20.09.2026) */
        document.documentElement.classList.add('qd-open');
        /* кадр на применение hidden=false, плюс страховка таймером: в фоновой вкладке
           requestAnimationFrame не срабатывает, и панель осталась бы за нижним краем */
        requestAnimationFrame(function(){ qd.classList.add('is-open'); });
        setTimeout(function(){ qd.classList.add('is-open'); }, 60);
        var c = qd.querySelector('.qd-close'); if(c) c.focus();
      });
    }
    function close(){
      if (!qd) return;
      qd.classList.remove('is-open');
      document.body.style.overflow = '';   /* страховка: панель раньше блокировала прокрутку */
      document.documentElement.classList.remove('qd-open');
      setTimeout(function(){ if(!qd.classList.contains('is-open')) qd.hidden = true; }, 500);
      if (last && last.focus) last.focus();
    }

    document.querySelectorAll('[data-quote]').forEach(function(b){
      b.addEventListener('click', function(e){ e.preventDefault(); open(); });
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && qd && !qd.hidden) close();
    });
    /* Адрес с #wycena сразу открывает панель – ссылка для постов и описания профиля ведёт прямо к фото
       (аналитика 26.09.2026: …/tlumaczenia-przysiegle/?utm_source=instagram&utm_medium=bio#wycena).
       Хэш после открытия снимаем, чтобы повторный переход по той же ссылке снова открыл панель. */
    function byHash(){
      if (location.hash !== '#wycena') return;
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      open();
    }
    window.addEventListener('hashchange', byHash);
    byHash();
  })();




  /* Подвал закреплён внизу окна, страница проезжает над ним: main получает нижний запас
     ровно в высоту подвала, иначе открыть его прокруткой было бы нечем. */
  (function(){
    var foot = document.getElementById('stopka');
    var main = document.querySelector('body > main');
    if (!foot || !main) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var off = false;   /* подвал в обычном потоке – запас под main не нужен */
    function fit(){
      /* в потоке: на телефоне (в CSS – @media max-width:639px) и когда подвал выше окна –
         телефон в горизонтали, низкое окно: закреплённый, он не показал бы свои заголовки.
         96px – место под шапку; высота подвала от режима не зависит, так что класс не «мигает» */
      var tall = foot.offsetHeight > window.innerHeight - 96;
      off = window.matchMedia('(max-width:639px)').matches || tall;
      foot.classList.toggle('is-flow', tall);
      main.style.marginBottom = off ? '' : foot.offsetHeight + 'px';
      reveal();
    }
    /* Подвал лежит под страницей (fixed, z-index:0). При «резиновой» прокрутке выше начала страницы
       (трекпад macOS, iOS) контент уезжает вниз, и над шапкой проступал верх подвала с навигацией.
       Поэтому подвал виден только тогда, когда до конца main остаётся меньше экрана (21.09.2026). */
    function reveal(){
      var far = main.getBoundingClientRect().bottom > window.innerHeight + 240;
      foot.style.visibility = (!off && far) ? 'hidden' : '';
    }
    window.addEventListener('resize', fit);
    window.addEventListener('scroll', reveal, { passive:true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit();
  })();

  /* Плавающее меню прайса (.cn-dock) – отдельный элемент: клон кнопок-якорей, который
     появляется при прокрутке внизу окна и останавливается над подвалом. Сами якоря в потоке
     живут своей жизнью и никак не меняются. */
  (function(){
    var nav = document.querySelector('.cn-v2 .cn-nav');
    if(!nav) return;
    /* ниже этого блока («Ceny końcowe – nie doliczamy VAT…») плавающее меню уже не нужно */
    var navEnd = document.querySelector('.cn-v2 .cn-foot') || document.querySelector('.cn-v2 .cn-nav--end');
    var sections = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')).map(function(a){
      return document.getElementById(a.getAttribute('href').slice(1));
    });
    if(!sections.filter(Boolean).length) return;

    var dock = nav.cloneNode(true);
    dock.className = 'cn-dock';
    dock.removeAttribute('id');
    dock.setAttribute('aria-label', 'Sekcje cennika – menu przy krawędzi okna');
    document.body.appendChild(dock);

    var links = Array.prototype.slice.call(dock.querySelectorAll('a[href^="#"]'));
    var map = links.map(function(a, i){ return { a:a, sec:sections[i] }; })
                   .filter(function(x){ return x.sec; });

    /* подвал закреплён внизу (шторка), поэтому нижнюю границу берём по концу <main> */
    var main = document.querySelector('body > main');
    var GAP = 24;      /* зазор до нижнего края окна */
    var FOOT = 63;     /* зазор до края контента – такой же, как у боковой стрелки «наверх» */
    var EARLY = 0.10;  /* показываем на 10% высоты окна раньше, чем якоря уйдут за верх */
    var wideQ = window.matchMedia ? window.matchMedia('(min-width:1150px)') : null;
    var ticking = false;

    function apply(){
      ticking = false;
      var vh = window.innerHeight;
      var on = nav.getBoundingClientRect().top <= GAP + vh * EARLY;
      /* дошли до сноски внизу прайса – плавающее меню больше не нужно */
      if (on && navEnd && navEnd.getBoundingClientRect().top < vh) on = false;
      dock.classList.toggle('is-on', on);

      var h = dock.offsetHeight;
      /* от 1150px плитка стоит слева, а справа – кнопка «Ekspresowa wycena» (.m-dock: 68px высотой, 18px от низа окна):
         середины на одной линии (Грег, 03.10.2026) */
      var top = vh - (wideQ && wideQ.matches ? 18 + (68 - h) / 2 : GAP) - h;
      if (main) {
        var max = main.getBoundingClientRect().bottom - FOOT - h;
        if (max < top) top = max;
      }
      dock.style.top = top + 'px';
      dock.style.bottom = 'auto';

      /* подсветка раздела, который сейчас на экране */
      var line = vh * 0.35, cur = null;
      map.forEach(function(x){
        var r = x.sec.getBoundingClientRect();
        if(r.top <= line && r.bottom > line) cur = x.sec;
      });
      /* подсвечиваем только в доке; список-якоря в потоке остаётся нейтральным */
      map.forEach(function(x){ x.a.classList.toggle('is-here', x.sec === cur); });
    }
    function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(apply); } }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    apply();
  })();

  /* Заголовки .h2-swap (cennik, apostille): начертания частей h2-a/h2-b меняются местами,
     когда верх заголовка поднимается выше 55% высоты окна; ниже этой линии – возвращаются */
  (function(){
    var hs = document.querySelectorAll('.h2-swap');
    if(!hs.length) return;
    var ticking = false;
    function apply(){
      ticking = false;
      var line = window.innerHeight * 0.55;
      hs.forEach(function(h){ h.classList.toggle('is-swap', h.getBoundingClientRect().top < line); });
    }
    function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(apply); } }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    apply();
  })();

  /* /apostille-bez-przyjazdu/: #sad-<город> открывает нужный суд в песочной плашке (24.09.2026) */
  (function(){
    function openSad(){
      var h = location.hash; if (h.indexOf('#sad-') !== 0) return;
      var d = document.getElementById(h.slice(1)); if (d && d.tagName === 'DETAILS') d.open = true;
    }
    window.addEventListener('hashchange', openSad); openSad();
  })();

  /* Сравнение на /apostille-bez-przyjazdu/: круг на стыке (от 1024px), сегмент «Jadę sam / Zlecam» и свайп (уже 1024px) */
  (function(){
    document.querySelectorAll('[data-cmp]').forEach(function(box){
      box.classList.add('is-js');
      var arrow = box.querySelector('.cmp-arrow'), side = box.querySelector('.cmp-new');
      /* телефон/планшет: переключатель-сегмент «Jadę sam / Zlecam» над сторонами (виден только уже 1024px) */
      var seg = document.createElement('div'); seg.className = 'cmp-seg'; seg.setAttribute('role', 'tablist');
      seg.innerHTML = '<button type="button" role="tab" data-v="old">Jadę sam</button><button type="button" role="tab" data-v="new">Zlecam</button>';
      box.insertBefore(seg, box.firstChild);
      var btns = seg.querySelectorAll('button');
      function set(s){ box.dataset.s = s;
        for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-selected', btns[i].dataset.v === s ? 'true' : 'false'); }
      for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', function(){ set(this.dataset.v); });
      set(box.dataset.s || 'old');
      arrow.setAttribute('role', 'button'); arrow.setAttribute('tabindex', '0');
      arrow.removeAttribute('aria-hidden'); arrow.setAttribute('aria-label', 'Porównaj z drugą stroną');
      arrow.addEventListener('click', function(){ set(box.dataset.s === 'old' ? 'new' : 'old'); });
      arrow.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); arrow.click(); } });
      var x0 = null, y0 = 0;
      box.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive:true });
      box.addEventListener('touchend', function(e){
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;   /* вертикальная прокрутка – не трогаем */
        set(dx < 0 ? 'new' : 'old');
      }, { passive:true });
    });
  })();

  /* Образец перевода «po polsku» (.pp) в hero /tlumaczenia-przysiegle/ и /ukrainski/ (25.09.2026, идея 4 стенда docs/typografia/).
     1) .pp--side от 1024px стоит в пустой правой колонке первого экрана: левый край – правый край текста слева (h1, лид,
        ссылка, кнопки) плюс зазор 4% окна (40–64px); кегль – не больше 34px (от 1280px – 48px) и не больше ширины / 8.4
        («Dyplom ukończenia» = 8.15em – две строки максимум), не меньше 22px; верх – подпись самого высокого оригинала
        волоском связки на середине зазора между h1 и лидом (без лида – верх h1 + 4px). Уже 1024px всё задаёт CSS.
     2) Пары меняются раз в 3,5 с тем же выталкиванием снизу вверх, что слово на плашке главной (переходы – в styles.css,
        включает класс .is-live); строка, текст которой не меняется, стоит на месте. Пауза при наведении – только там,
        где есть мышь (hover:hover); prefers-reduced-motion – стоит первая пара.
     Всё в try: ошибка здесь не должна остановить остальной app.js. */
  (function(){
    function mq(q){ try { return window.matchMedia(q).matches; } catch (e) { return false; } }
    function textRight(el){
      if (!el) return 0;
      var mx = 0, rg = document.createRange(); rg.selectNodeContents(el);
      var rs = rg.getClientRects();
      for (var i = 0; i < rs.length; i++) if (rs[i].width > 0) mx = Math.max(mx, rs[i].right);
      return mx;
    }
    function side(box){
      var cont = box.parentElement, h1 = cont && cont.querySelector('h1');
      if (!h1) return;
      var lead = h1.nextElementSibling && h1.nextElementSibling.tagName === 'P' ? h1.nextElementSibling : null;
      var more = cont.querySelector('.hero-more'), btns = cont.querySelector('.cta-btns');
      /* отступ строк документа и перевода (26.09.2026, Грег: «под плашками, правее, после po polsku»): начало волоска
         после «po polsku» в первом слое связки – от левого края блока; на всех ширинах */
      function ind(){
        var hl = box.querySelector('.pp-con .pp-l .pp-hl');
        if (!hl) return 0;
        var v = Math.round(hl.getBoundingClientRect().left - box.getBoundingClientRect().left);
        if (v > 0) box.style.setProperty('--pp-ind', v + 'px');
        return v > 0 ? v : 0;
      }
      function lay(){
        try {
          var iw = ind();
          if (!mq('(min-width:1024px)')) return;
          var cr = cont.getBoundingClientRect(), pr = parseFloat(getComputedStyle(cont).paddingRight) || 0;
          var right = Math.max(textRight(h1), textRight(lead), textRight(more), textRight(btns));
          var gap = Math.max(40, Math.min(64, window.innerWidth * 0.04));
          var x = right - cr.left + gap, w = cr.width - pr - x;
          /* кегль меньше (Грег: «спорит с главным заголовком, а это просто украшение»): до 26px, от 1280px – до 30px;
             ширина строк – за вычетом отступа */
          var fs = Math.max(20, Math.min(mq('(min-width:1280px)') ? 30 : 26, Math.floor((w - iw) / 8.4)));
          box.style.setProperty('--pp-x', x + 'px');
          box.style.setProperty('--pp-side-fs', fs + 'px');
          /* верх (26.09.2026): волосок связки «po polsku» – на уровне середины зазора между h1 и лидом слева:
             оригинал стоит рядом с h1, перевод – рядом с лидом. Края текста – по рамкам строк (range), без интерлиньяжа;
             высоты слоёв меряются уже при новом кегле и ширине. Без лида – по старому: у верха h1. */
          var y = h1.getBoundingClientRect().top - cr.top + 4;
          var con = box.querySelector('.pp-con');
          if (lead && con) {
            var rg = document.createRange(), hr, lr;
            rg.selectNodeContents(h1); hr = rg.getClientRects();
            rg.selectNodeContents(lead); lr = rg.getClientRects();
            var hb = 0, lt = Infinity;
            for (var i = 0; i < hr.length; i++) if (hr[i].height > 0) hb = Math.max(hb, hr[i].bottom);
            for (i = 0; i < lr.length; i++) if (lr[i].height > 0) lt = Math.min(lt, lr[i].top);
            if (hb > 0 && lt < Infinity) {
              var br = box.getBoundingClientRect(), cn = con.getBoundingClientRect();
              var off = cn.top + cn.height / 2 - br.top;              /* волосок от верха блока */
              y = (hb + lt) / 2 - cr.top - off;
            }
          }
          box.style.setProperty('--pp-y', Math.max(0, y) + 'px');
        } catch (e) {}
      }
      lay();
      window.addEventListener('resize', lay, { passive:true });
      try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(lay, function(){}); } catch (e) {}
    }
    function rotate(box){
      var rows = [], cells = box.querySelectorAll('.pp-cell');
      for (var i = 0; i < cells.length; i++) rows.push(cells[i].querySelectorAll('.pp-l'));
      var n = rows.length ? rows[0].length : 0;
      if (n < 2 || mq('(prefers-reduced-motion:reduce)')) return;
      for (i = 0; i < rows.length; i++) if (rows[i].length !== n) return;   /* слоёв в строках поровну – иначе не крутим */
      var cur = 0, paused = false;
      for (i = 0; i < n; i++) if (rows[0][i].classList.contains('is-on')) { cur = i; break; }
      function tick(){
        if (paused) return;
        try {
          var nx = (cur + 1) % n, r, k;
          box.classList.add('is-live');
          for (r = 0; r < rows.length; r++) for (k = 0; k < n; k++) rows[r][k].classList.remove('is-out');
          void box.offsetWidth;   /* ушедший слой встаёт вниз без движения – следующий раз он выйдет снизу, а не сверху */
          for (r = 0; r < rows.length; r++) {
            var a = rows[r][cur], b = rows[r][nx];
            a.classList.remove('is-on');
            if (a.textContent === b.textContent) {            /* текст строки тот же – без движения */
              b.style.transition = 'none'; b.classList.add('is-on'); void b.offsetWidth; b.style.transition = '';
            } else {
              a.classList.add('is-out'); b.classList.add('is-on');
            }
          }
          cur = nx;
        } catch (e) {}
      }
      if (mq('(hover:hover)')) {
        box.addEventListener('mouseenter', function(){ paused = true; });
        box.addEventListener('mouseleave', function(){ paused = false; });
      }
      setInterval(tick, 3500);
    }
    try {
      var boxes = document.querySelectorAll('.pp');
      for (var i = 0; i < boxes.length; i++) {
        try { if (boxes[i].classList.contains('pp--side')) side(boxes[i]); } catch (e) {}
        try { rotate(boxes[i]); } catch (e) {}
      }
    } catch (e) {}
  })();

  /* /apostille-bez-przyjazdu/ #czas – маршрут (Грег, 25.09.2026: идея 7 со стенда docs/typografia/, «встроить в сайт»).
     Схема – в разметке страницы (.rt-map), стили – .rt-* в styles.css. Здесь:
     1) у каждой остановки два слоя: узкий .rt-c (в потоке) и обычный .rt-w (поверх, по центру). Мерим, во сколько раз
        обычный шире, – по этому числу слои растягиваются так, что в каждом кадре перехода они одной ширины;
     2) мышь: отрезок под курсором раскрывается (is-live на схеме, is-on на его частях), под линейкой вместо итога –
        текст отрезка из списка .route-legs. Между словами и по пустым местам карточки отрезок держится, гаснет –
        когда курсор ушёл с карточки. Прокрутка под неподвижной мышью ничего не включает;
     3) появление: нитка один раз прорисовывается сверху вниз, остановки по пути на миг раскрываются (без reduced motion). */
  (function(){
    var card = document.querySelector('.route--map'), map = card && card.querySelector('.rt-map');
    if (!map) return;
    var foot = card.querySelector('.route-foot');
    var mouse = window.matchMedia('(hover:hover) and (pointer:fine)');
    var still = window.matchMedia('(prefers-reduced-motion:reduce)');
    var slice = Array.prototype.slice;

    /* 1. два слоя у остановки; точка (у MSZ) остаётся снаружи слоёв */
    var stops = slice.call(map.querySelectorAll('.rt-st'));
    stops.forEach(function(st){
      var text = '';
      slice.call(st.childNodes).forEach(function(n){ if (n.nodeType === 3) { text += n.nodeValue; st.removeChild(n); } });
      var x = document.createElement('span'), c = document.createElement('span'), w = document.createElement('span');
      x.className = 'rt-x'; c.className = 'rt-c'; w.className = 'rt-w';
      c.textContent = w.textContent = text.trim();
      x.appendChild(c); x.appendChild(w); st.appendChild(x);
    });
    function measure(){
      stops.forEach(function(st){
        var a = st.querySelector('.rt-c').offsetWidth, b = st.querySelector('.rt-w').offsetWidth;   /* без transform */
        if (!a || !b) return;
        st.style.setProperty('--rt-r', (b / a).toFixed(4));
        st.style.setProperty('--rt-k', (a / b).toFixed(4));
        st.style.setProperty('--rt-dx', ((b - a) / 2).toFixed(1) + 'px');
        /* обычная ширина не влезает в колонку (iPhone 320 – «Klauzula Apostille») – слово не раскрывается, иначе
           заденет повёрнутую подпись; до 16px на оба края уходит в межколоночный зазор */
        var dot = st.querySelector('.rt-dot');
        st.classList.toggle('is-tight', b + (dot ? dot.offsetWidth * 2 : 0) - st.clientWidth > 16);
      });
    }
    measure();
    if (document.fonts && document.fonts.load) {
      Promise.all(['300 40px "Fira Sans"', '600 40px "Fira Sans"', '300 40px "Fira Sans Condensed"', '600 40px "Fira Sans Condensed"']
        .map(function(f){ return document.fonts.load(f); })).then(measure, measure);
    }
    var rs = 0;
    window.addEventListener('resize', function(){ clearTimeout(rs); rs = setTimeout(measure, 150); }, { passive:true });

    /* порядок кусочков нитки: --i – по всему маршруту (появление), --o – внутри отрезка (наведение) */
    var count = {};
    slice.call(map.querySelectorAll('.rt-ln')).forEach(function(ln, i){
      var host = ln.closest('[data-leg]'), leg = host ? host.getAttribute('data-leg') : '0';
      count[leg] = count[leg] || 0;
      ln.style.setProperty('--i', i);
      ln.style.setProperty('--o', count[leg]++);
    });

    /* 2. подписи отрезков – из списка для чтецов (текст в одном месте); только там, где есть мышь:
       клетка итога растёт по самой длинной подписи */
    var caps = [], parts = slice.call(map.querySelectorAll('[data-leg]')), on = '';
    function buildCaps(){
      if (caps.length || !foot) return;
      slice.call(card.querySelectorAll('.route-legs > li')).forEach(function(li, i){
        var k = li.querySelector('.route-k'), n = li.querySelector('.route-n'), t = li.querySelector('.route-t');
        if (!k || !n || !t) return;
        var p = document.createElement('p'), b = document.createElement('b');
        p.className = 'rt-cap'; p.setAttribute('aria-hidden', 'true'); p.setAttribute('data-leg', String(i + 1));
        b.textContent = k.textContent.trim() + ': ' + n.textContent.trim() + '.';
        p.appendChild(b); p.appendChild(document.createTextNode(' ' + t.textContent.trim()));
        foot.appendChild(p); caps.push(p);
      });
    }
    var walk = [];
    function stopWalk(){
      walk.forEach(clearTimeout); walk = [];
      stops.forEach(function(st){ st.classList.remove('is-pass'); });
    }
    function set(leg){
      if (leg === on) return;
      on = leg;
      if (leg) stopWalk();
      map.classList.toggle('is-live', !!leg);
      parts.forEach(function(el){ el.classList.toggle('is-on', !!leg && el.getAttribute('data-leg') === leg); });
      if (foot) foot.classList.toggle('is-leg', !!leg && caps.length > 0);
      caps.forEach(function(p){ p.classList.toggle('is-on', p.getAttribute('data-leg') === leg); });
    }
    if (mouse.matches) buildCaps();
    function onMouse(){ if (mouse.matches) buildCaps(); else set(''); }
    if (mouse.addEventListener) mouse.addEventListener('change', onMouse); else if (mouse.addListener) mouse.addListener(onMouse);

    var lx = null, ly = null, off = 0;
    card.addEventListener('pointermove', function(e){
      if (e.pointerType !== 'mouse' || !mouse.matches) return;
      if (e.clientX === lx && e.clientY === ly) return;
      lx = e.clientX; ly = e.clientY;
      clearTimeout(off);
      var t = e.target.closest ? e.target.closest('[data-leg]') : null;
      /* повёрнутые подписи – не цели: по пути из колонки в колонку курсор их пересекает */
      if (t && map.contains(t) && !t.classList.contains('rt-rot')) set(t.getAttribute('data-leg'));
    });
    card.addEventListener('pointerleave', function(e){
      if (e.pointerType !== 'mouse') return;
      clearTimeout(off);
      off = setTimeout(function(){ set(''); }, 160);
    });

    /* 3. появление: нитка прорисовывается по ходу маршрута (кусочек за кусочком через 80 мс), точка – когда путь
       дошёл до MSZ; каждая остановка на 0,4 с раскрывается, когда до неё доходит нитка, – эффект наведения
       показывает себя сам, и на телефоне тоже */
    if (!still.matches && 'IntersectionObserver' in window) {
      /* нитка прячется, только когда карточка подъезжает к окну: наблюдатель сработал – значит, прорисовка точно
         будет (headless-снимки стенда с виртуальным временем его не вызывают – там нитка просто видна) */
      var near = new IntersectionObserver(function(entries){
        if (!entries.some(function(en){ return en.isIntersecting; })) return;
        near.disconnect();
        if (!map.classList.contains('rt-go')) map.classList.add('rt-pre');
      }, { rootMargin:'30% 0px 30% 0px' });
      var io = new IntersectionObserver(function(entries){
        if (!entries.some(function(en){ return en.isIntersecting; })) return;
        io.disconnect(); near.disconnect();
        map.classList.add('rt-pre');
        void map.offsetWidth;
        map.classList.add('rt-go');
        setTimeout(function(){ map.classList.remove('rt-pre', 'rt-go'); }, 1700);
        if (on) return;
        var ln = slice.call(map.querySelectorAll('.rt-ln'));
        stops.forEach(function(st){
          /* номер кусочка нитки прямо над остановкой: его прорисовка почти кончилась – путь дошёл */
          var above = 0;
          ln.forEach(function(l, i){ if (l.compareDocumentPosition(st) & Node.DOCUMENT_POSITION_FOLLOWING) above = i; });
          var at = above * 80 + 280;
          walk.push(setTimeout(function(){ st.classList.add('is-pass'); }, at));
          walk.push(setTimeout(function(){ st.classList.remove('is-pass'); }, at + 400));
        });
      }, { threshold:0.2 });
      near.observe(map); io.observe(map);
    }
  })();

/* --- #jezyki на /tlumaczenia-przysiegle/: код языка раскрывается в самоназвание (Грег, 26.09.2026) ---
   Мышь: наведение (или фокус) на ячейке – класс .is-w на ней (код гаснет, CSS) и «табло» на её слове (flipIn / flipOut).
   Тач: ячейки раскрываются по очереди, пока сетка проходит через экран, до и после – ни одна.
   Табло (Грег, 26.09.2026, стенд docs/jezyki-ruch/): буквы самоназвания серым перебирают алфавит своего языка и встают
   на место слева направо, уходят с конца. Перебор идёт в копии букв (.lng-ov) ровно на местах настоящих (замер Range по
   каждой букве; лигатурные пары fi, fl, ff… держатся вместе); копия сложилась – убирается, остаётся живое слово.
   --lng-dd / --lng-ws: на сколько при раскрытии отъезжает влево жёлтая точка и вправо слово (пара «точка + слово» по центру).
   Фон: вместе с раскрытием «A» гаснет и за сеткой наплывом встаёт ответ на языке клиента – «Tak.», «Так.», «Yes.», «Oui.»…
   (Грег, 30.09.2026, вариант 1 «Yes» стенда docs/jezyki-fon/; раньше – код языка Pl, Ua… со срезом 36 % по краю окна,
   ещё раньше – буква языка Ł Ї Ы & ß). Заголовок говорит «Twój język w parze z polskim» – фон отвечает; см. layout.
   «pozostałe języki» – вместо «?» лента других языков (вариант 5 «Лента» того же стенда), см. placeMore. */
(function () {
  var grid = document.querySelector('.lng-grid');
  if (!grid || !window.requestAnimationFrame) return;
  var cells = [].slice.call(grid.querySelectorAll('.lng-cell')).filter(function (c) { return c.querySelector('.lng-w') || c.hasAttribute('data-g'); });
  if (!cells.length) return;
  var mouse = window.matchMedia('(hover:hover) and (pointer:fine)');
  var cur = -1;
  var sec = grid.closest ? grid.closest('.lng') : null, ghost = sec ? sec.querySelector('.lng-ghost') : null;
  var FONT = "900 100px 'Fira Sans'", FONT_I = "italic 300 100px 'Fira Sans'", layers = [], front = 0, em = {}, geo = null;
  /* ответ за сеткой: «Так.» на языке клиента (Грег, 30.09.2026: «из 1 реализуй для всех», вариант 1 «Yes» стенда docs/jezyki-fon/) */
  var YES = { Pl: 'Tak.', Ua: 'Так.', Ru: 'Да.', En: 'Yes.', De: 'Ja.', It: 'Sì.', Fr: 'Oui.', Es: 'Sí.', Nl: 'Ja.' };
  if (ghost) layers = [0, 1].map(function () {
    var s = document.createElement('span');
    s.className = 'lng-g'; s.setAttribute('aria-hidden', 'true');
    sec.insertBefore(s, ghost.nextSibling);
    return s;
  });

  /* замер ответов в em (Грег, 30.09.2026: «для Yes и других точка идёт в обрезку края страницы на 36% и подравняй по
     высоте»): po – где начинается точка (DOM: ширина слова без точки тем же начертанием и трекингом, что у слоя), чернила
     точки и первой буквы – canvas (одна буква – трекинг не мешает), cap – высота прописной H.
     cut – от начала слова до линии среза: 36 % чернил точки – за краем окна; left – насколько первая буква выступает влево */
  var CUT = .36;
  function measure() {
    if (!ghost) return;
    var ctx = document.createElement('canvas').getContext('2d'), s = document.createElement('span');
    if (!ctx) return;
    ctx.font = FONT;
    s.className = 'lng-g'; s.style.fontSize = '100px';
    sec.appendChild(s);
    var dot = ctx.measureText('.'), dl = dot.actualBoundingBoxLeft / 100, dw = (dot.actualBoundingBoxLeft + dot.actualBoundingBoxRight) / 100;
    em.cap = ctx.measureText('H').actualBoundingBoxAscent / 100;
    Object.keys(YES).forEach(function (g) {
      var t = YES[g];
      s.textContent = t.slice(0, -1);
      var po = s.getBoundingClientRect().width / 100;
      em[g] = { cut: po - dl + (1 - CUT) * dw, left: Math.max(0, ctx.measureText(Array.from(t)[0]).actualBoundingBoxLeft / 100) };
    });
    sec.removeChild(s);
  }
  /* Все ответы – одним кеглем, верх прописных на одной высоте (Грег: «подравняй по высоте»): прописные – от 16px под
     заголовком до низа секции (базовая линия «A»), как было у кодов; слово привязано к правому краю окна – край режет точку,
     36 % её чернил за краем. Самые длинные («Tak.», «Так.», «Yes.», «Oui.») не заходят левее сетки – если им не хватает
     ширины, кегль всех слов меньше и верх ниже. Хвосты «Д» уходят под секцию на следующий блок (Грег, 30.09.2026: «большие
     буквы могут заходить на следующий блок, это лучше, чем срезать их другим блоком» – по вертикали .lng не режет, см.
     styles.css). Телефон – так же, но по высоте сетки: низ – по низу сетки, верх – не выше её верха. */
  function layout() {
    if (!ghost || !em.cap) return;
    var sr = sec.getBoundingClientRect(), wr = grid.parentNode.getBoundingClientRect(), h2 = sec.querySelector('h2');
    var W = sec.clientWidth, H = sec.clientHeight, phone = W < 640, L = wr.left - sr.left, fs = Infinity;
    var base = phone ? wr.bottom - sr.top - 4 : H;
    var top = phone ? wr.top - sr.top + 4 : (h2 ? h2.getBoundingClientRect().bottom - sr.top + 16 : wr.top - sr.top);
    Object.keys(YES).forEach(function (g) { if (em[g]) fs = Math.min(fs, (W - L) / (em[g].cut + em[g].left)); });
    geo = { edge: W, base: base, top: top, phone: phone, fs: Math.min(fs, (base - top) / em.cap) };
    if (cur >= 0) place(layers[front], cells[cur].getAttribute('data-g'));
  }
  /* «pozostałe języki» (Грег, 30.09.2026: «Języki – behind the grid из 5 реализуй на сайте эффект только для клетки
     pozostałe języki»; потом: «серые в фоне сделай пошире и они не заходят на первый столбец. Можно их чуть хаотичнее
     разбросать»): за сеткой вместо «?» – самоназвания других языков, жирный через один со светлым курсивом (пара начертаний
     заголовка), без движения и без обреза. Поле – от второго столбца сетки до края окна (над PL и IT пусто); по высоте –
     как ответ «Yes.» за сеткой (Грег: «ещё более широко и крупнее, чтобы все вместе они были примерно таким же размером,
     как Yes»): по высоте – не больше прописных ответа. Место по высоте (Грег: «повыше, чтобы были на границе первой и
     второй строки, большая часть в первой строке»): первая строка слов стоит на линии между первым и вторым рядом сетки,
     70 % её прописных – над линией, в первом ряду, остальные строки – ниже. На телефоне ответ мелкий – там поле во всю
     высоту сетки, последняя строка – на её низу. Слова идут строками по 1–3 – берётся раскладка с самым крупным кеглем, строки
     разводятся до 1,3 кегля, пока хватает высоты; в строке место раздаётся вразнобой
     (веса из RND), поэтому слова не стоят столбиком, а строка с двумя словами тянется почти на всё поле. Соседние строки
     начинаются разным начертанием (шахматка). Греческий и вьетнамский куски шрифта (fonts.css) грузятся при первом
     показе – тогда лента встаёт заново. */
  var MORE = [['Português', 'pt'], ['Čeština', 'cs'], ['Ελληνικά', 'el'], ['Türkçe', 'tr'],
              ['Tiếng Việt', 'vi'], ['Lietuvių', 'lt'], ['Română', 'ro'], ['Slovenčina', 'sk']];
  var RND = [.9, .08, .55, .3, 1, .42, .04, .78, .22, .66, .14, .95, .36, .6], GAP = .45;
  function placeMore(el) {
    if (!el.classList.contains('lng-g--more')) {
      el.classList.add('lng-g--more');
      el.innerHTML = MORE.map(function (m) { return '<span class="lng-mw" lang="' + m[1] + '"><b>' + m[0] + '</b><i>' + m[0] + '</i></span>'; }).join('');
      if (document.fonts && document.fonts.load) {
        var txt = el.textContent;
        Promise.all([FONT, FONT_I].map(function (f) { return document.fonts.load(f, txt).catch(function () {}); }))
          .then(function () { if (cur >= 0 && cells[cur].getAttribute('data-g') === '?' && layers[front] === el) placeMore(el); });
      }
    }
    if (!geo) return;
    var ws = [].slice.call(el.children), sr = sec.getBoundingClientRect(), wr = grid.parentNode.getBoundingClientRect();
    var c2 = cells[1] ? cells[1].getBoundingClientRect().left : wr.left;   /* второй столбец: UA – вторая клетка и на телефоне */
    var L = c2 - sr.left, A = geo.edge - L, cap = em.cap;
    var room = geo.phone ? geo.base - geo.top : geo.fs * cap;     /* высота прописных ответа */
    /* ширина каждого слова обоими начертаниями, в em (на время замера видны оба) */
    ws.forEach(function (s) { s.className = 'lng-mw'; });
    el.style.fontSize = '100px';
    var wb = ws.map(function (s) { return s.firstChild.getBoundingClientRect().width / 100; });
    var wi = ws.map(function (s) { return s.lastChild.getBoundingClientRect().width / 100; });
    var best = null;
    [1, 2, 3].forEach(function (k) {
      var rows = [], i, r;
      for (i = 0; i < ws.length; i += k) rows.push(ws.slice(i, i + k).map(function (s, j) { return i + j; }));
      /* шахматка: жирное – когда (строка + место) чётное; при двух в строке нечётные строки переставлены – начинаются курсивом */
      var lay = rows.map(function (row, ri) {
        var ord = k % 2 === 0 && ri % 2 ? row.slice().reverse() : row;
        return ord.map(function (n, j) { var b = (ri * (k % 2 ? k : 0) + j + (k % 2 === 0 && ri % 2 ? 1 : 0)) % 2 === 0;
          return { n: n, b: b, w: b ? wb[n] : wi[n] }; });
      });
      var wide = 0;
      lay.forEach(function (row) { wide = Math.max(wide, row.reduce(function (a, u) { return a + u.w; }, 0) + GAP * (row.length - 1)); });
      var fs = Math.min(A * .98 / wide, room / (rows.length - 1 + cap));
      if (!best || fs > best.fs * 1.02) best = { fs: fs, lay: lay };
    });
    var fs = best.fs, n = best.lay.length, pitch = n > 1 ? Math.min(fs * 1.3, (room - cap * fs) / (n - 1)) : 0;
    var line = cells[0].getBoundingClientRect().bottom - sr.top;  /* линия между первым и вторым рядом сетки */
    var b0 = geo.phone ? geo.base - (n - 1) * pitch : line + .3 * cap * fs;   /* базовая линия первой строки */
    el.style.fontSize = fs.toFixed(2) + 'px';
    best.lay.forEach(function (row, ri) {
      var free = A - fs * (row.reduce(function (a, u) { return a + u.w; }, 0) + GAP * (row.length - 1));
      var wt = [], sum = 0, x = 0;
      for (var j = 0; j <= row.length; j++) { wt.push(RND[(ri * 5 + j * 3) % RND.length]); sum += wt[j]; }
      row.forEach(function (u, j) {
        x += free * wt[j] / sum + (j ? GAP * fs : 0);
        var s = ws[u.n];
        s.className = 'lng-mw ' + (u.b ? 'is-b' : 'is-i');
        s.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (b0 + ri * pitch - .835 * fs).toFixed(1) + 'px)';
        x += u.w * fs;
      });
    });
    el.style.width = A.toFixed(1) + 'px';
    el.style.transform = 'translate(' + L.toFixed(1) + 'px,0)';   /* строки – от верха секции */
  }
  function place(el, g) {
    if (g === '?') { placeMore(el); return; }
    if (el.classList.contains('lng-g--more')) { el.classList.remove('lng-g--more'); el.style.width = ''; }
    el.textContent = YES[g] || '';
    var m = em[g];
    if (!m || !geo || !(geo.fs > 0)) return;
    el.style.fontSize = geo.fs.toFixed(1) + 'px';                /* при line-height:1 базовая линия Fira – 0,835em от верха */
    el.style.transform = 'translate(' + (geo.edge - m.cut * geo.fs).toFixed(1) + 'px,' + (geo.base - .835 * geo.fs).toFixed(1) + 'px)';
  }
  /* ---- табло ---- */
  var calm = window.matchMedia('(prefers-reduced-motion:reduce)');
  var ABC = {   /* алфавит языка (строчные) и его особые буквы – их в переборе чаще, по ним язык и узнаётся */
    pl: ['aąbcćdeęfghijklłmnńoóprsśtuwyzźż', 'ąćęłńóśźż'],
    uk: ['абвгґдеєжзиіїйклмнопрстуфхцчшщьюя', 'ґєії'],
    ru: ['абвгдеёжзийклмнопрстуфхцчшщъыьэюя', 'ёъыэ'],
    en: ['abcdefghijklmnopqrstuvwxyz', ''],
    de: ['abcdefghijklmnopqrstuvwxyzäöüß', 'äöüß'],
    it: ['abcdefghilmnopqrstuvzàèéìòù', 'àèéìòù'],
    fr: ['abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûüÿ', 'àâçéèêëîïôœù'],
    es: ['abcdefghijklmnñopqrstuvwxyzáéíóúü', 'ñáéíóú'],
    nl: ['abcdefghijklmnopqrstuvwxyzĳéëïö', 'ĳéëö']
  }, abcs = {};
  function caps(a) {                                             /* прописные; ß → SS – не одна буква, не берём */
    return a.map(function (ch) { return ch.toUpperCase(); }).filter(function (ch) { return ch.length === 1; });
  }
  function abc(lang) {
    if (!abcs[lang]) {
      var s = ABC[lang] || ABC.en, L = Array.from(s[0]), S = Array.from(s[1]);
      abcs[lang] = { L: L, U: caps(L), SL: S, SU: caps(S) };
    }
    return abcs[lang];
  }
  function pick(ab, ch, prev) {                                  /* того же регистра, не прежняя и не итоговая */
    var up = ch !== ch.toLowerCase(), all = up ? ab.U : ab.L, sp = up ? ab.SU : ab.SL, r;
    for (var n = 0; n < 8; n++) {
      var src = sp.length && Math.random() < .45 ? sp : all;
      r = src[Math.floor(Math.random() * src.length)];
      if (r !== prev && r !== ch) break;
    }
    return r;
  }
  function flipStop(w) {
    var r = w._flip;
    if (!r) return;
    w._flip = null;
    cancelAnimationFrame(r.raf);
    if (r.ov.parentNode) r.ov.parentNode.removeChild(r.ov);
    w.classList.remove('is-flip');
  }
  function flipBuild(w) {
    var wr = w.getBoundingClientRect(), rg = document.createRange(), us = [];
    var ov = document.createElement('span');
    ov.className = 'lng-ov'; ov.setAttribute('aria-hidden', 'true');
    [].forEach.call(w.childNodes, function (n) {
      if (n.nodeType !== 3) return;
      var re = /ff[il]|f[fijlt]|[\s\S]/gu, m;
      while ((m = re.exec(n.data))) {
        rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        var b = rg.getBoundingClientRect(), s = document.createElement('span');
        s.textContent = m[0];
        s.style.left = (b.left - wr.left) + 'px'; s.style.top = (b.top - wr.top) + 'px'; s.style.width = b.width + 'px';
        s.style.height = s.style.lineHeight = b.height + 'px';
        ov.appendChild(s);
        us.push({ ch: m[0], el: s });
      }
    });
    w.appendChild(ov);
    w.classList.add('is-flip');
    return (w._flip = { us: us, ov: ov, raf: 0 });
  }
  function flipIn(c) {                                           /* буквы встают слева направо за ~0,5 с */
    var w = c.querySelector('.lng-w');
    if (!w) return;
    flipStop(w);
    w.classList.add('is-on');
    if (calm.matches) return;
    var ab = abc(w.getAttribute('lang')), r = flipBuild(w), t0 = performance.now();
    r.us.forEach(function (u, i) {
      u.at = 110 + i * 48; u.ok = false; u.next = t0 + Math.random() * 50;
      u.el.className = 'lng-x'; u.el.textContent = pick(ab, u.ch);
    });
    (function frame(now) {
      if (w._flip !== r) return;
      var left = 0;
      r.us.forEach(function (u) {
        if (u.ok) return;
        if (now - t0 >= u.at) { u.ok = true; u.el.className = ''; u.el.textContent = u.ch; }
        else { left++; if (now >= u.next) { u.next = now + 50; u.el.textContent = pick(ab, u.ch, u.el.textContent); } }
      });
      if (left) r.raf = requestAnimationFrame(frame); else flipStop(w);
    })(t0);
  }
  function flipOut(c) {                                          /* уходят с конца: мелькнула чужая буква – и нет её */
    var w = c.querySelector('.lng-w'), code = c.querySelector('.lng-code');
    if (code) code.style.setProperty('--lng-back', '0ms');
    if (!w || !w.classList.contains('is-on')) return;
    if (calm.matches) { flipStop(w); w.classList.remove('is-on'); return; }
    var ab = abc(w.getAttribute('lang')), r = w._flip;
    if (r) cancelAnimationFrame(r.raf); else r = flipBuild(w);
    var t0 = performance.now(), n = r.us.length;
    /* жёлтая точка едет обратно к коду, только когда ушла первая буква (Грег, 26.09.2026: «точка при возврате не может
       опережать букву У») – раньше она стартовала сразу и проезжала поверх ещё видимого начала слова; +40 мс – запас
       на кадр: буквы гаснут в requestAnimationFrame, а задержка перехода идёт по часам CSS */
    if (code) code.style.setProperty('--lng-back', ((n - 1) * 22 + 90 + 40) + 'ms');
    r.us.forEach(function (u, i) { u.at = (n - 1 - i) * 22; u.end = u.at + 90; u.gone = false; u.next = 0; });
    (function frame(now) {
      if (w._flip !== r) return;
      var left = 0, t = now - t0;
      r.us.forEach(function (u) {
        if (u.gone) return;
        if (t >= u.end) { u.gone = true; u.el.style.visibility = 'hidden'; return; }
        left++;
        if (t >= u.at && now >= u.next) { u.next = now + 45; u.el.className = 'lng-x'; u.el.textContent = pick(ab, u.ch, u.el.textContent); }
      });
      if (left) r.raf = requestAnimationFrame(frame);
      else { flipStop(w); w.classList.remove('is-on'); }
    })(t0);
  }

  function show(i) {
    if (i === cur) return;
    if (cur >= 0) flipOut(cells[cur]);
    cur = i;
    cells.forEach(function (c, k) { c.classList.toggle('is-w', k === i); });
    if (i >= 0) flipIn(cells[i]);
    if (!ghost) return;
    var g = i >= 0 ? cells[i].getAttribute('data-g') : null;
    layers[front].classList.remove('is-on');
    if (!g) { sec.classList.remove('is-g'); return; }
    front = 1 - front;
    place(layers[front], g);
    layers[front].classList.add('is-on');
    sec.classList.add('is-g');
  }

  grid.addEventListener('mouseover', function (e) {
    if (!mouse.matches) return;
    var c = e.target.closest ? e.target.closest('.lng-cell') : null;
    show(c ? cells.indexOf(c) : -1);
  });
  grid.addEventListener('mouseleave', function () { if (mouse.matches) show(-1); });
  cells.forEach(function (c, k) {
    c.addEventListener('focusin', function () { show(k); });
    c.addEventListener('focusout', function () { show(-1); });
  });

  /* тач: от «верх сетки на 85 % экрана» до «низ сетки на 25 %» – около 85px прокрутки на язык */
  var ticking = false;
  function onScroll() {
    if (ticking || mouse.matches) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var r = grid.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * .85 - r.top) / (r.height + vh * .6);
      show(p < 0 || p >= 1 ? -1 : Math.min(cells.length - 1, Math.floor(p * cells.length)));
    });
  }
  function fit() {
    cells.forEach(function (c) {
      var code = c.querySelector('.lng-code'), w = c.querySelector('.lng-w');
      if (!code || !w) return;                                   /* клетка «pozostałe języki» – без кода */
      var dot = getComputedStyle(code, '::before');
      var dw = parseFloat(dot.width) || 0, gap = parseFloat(dot.marginRight) || 0;
      if (!dw) return;                                           /* ячейка без точки */
      var cr = code.getBoundingClientRect(), ce = c.getBoundingClientRect(), ww = w.getBoundingClientRect().width + 2;
      /* точка + отступ + слово – парой по центру ячейки; слово при сдвиге не выходит за ячейку */
      var s = Math.max(0, Math.min((dw + gap) / 2, (ce.width - ww) / 2 - 2));
      var x = Math.max(ce.left + 2, ce.left + ce.width / 2 - ww / 2 + s - gap - dw);   /* левый край точки при наведении */
      w.style.setProperty('--lng-ws', Math.round(s) + 'px');
      code.style.setProperty('--lng-dd', Math.max(0, Math.round(cr.left - gap - dw - x)) + 'px');
    });
  }
  function init() { measure(); layout(); fit(); }
  if (document.fonts && document.fonts.load) {
    var letters = 'A' + Object.keys(YES).map(function (g) { return YES[g]; }).join('');
    document.fonts.load(FONT, letters).then(function () { return document.fonts.ready; }).then(init, init);
  } else init();
  window.addEventListener('resize', function () { requestAnimationFrame(function () { layout(); fit(); }); });
  /* догрузился кусок шрифта (кириллица, греческий…) – замер ответов заново: иначе срез точки считается по запасному шрифту */
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { measure(); layout(); });
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* --- Кнопка «Zamów wycenę» внизу экрана на телефоне (.m-dock; Грег, 26.09.2026: «вот это давай») ---
   Уже 1150px (27.09.2026: и на планшете – там в шапке нет кнопки заявки). Видна с первого экрана, пока главная кнопка hero
   не в окне (нет её – после полэкрана); на /cennik/ уступает плавающим якорям прайса (.cn-dock). Прячется,
   пока на экране видна другая главная кнопка страницы (.cta-btn--main в <main>) – двух одинаковых рядом не бывает, –
   у конца контента (подвал – шторка, ориентир – низ <main>; от 1150px там не прячется, а встаёт над подвалом), при открытом меню и панели заявки.
   Текст и адрес берутся у кнопки заявки в шапке (.navlink--plate) – на ua/ru/en кнопка сама на своём языке;
   нажатие передаётся ей, панель заявки открывает её обработчик. Стрелка «наверх» встаёт над доком (событие mdock). */
(function () {
  var plate = document.querySelector('header .navlink--plate');
  var main = document.querySelector('body > main');
  if (!plate || !main || !window.matchMedia) return;
  var phone = window.matchMedia('all');   /* на любой ширине: с 30.09.2026 и на компьютере в шапке нет кнопки заявки (меню 126) – Грег: «жёлтая справа внизу» */
  var root = document.documentElement;
  var label = (plate.textContent || '').trim();
  var chev = '<span class="cta-mark" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg></span>';
  var dock = document.createElement('div');
  dock.className = 'm-dock';
  dock.innerHTML = '<a class="cta-btn cta-btn--main" href="' + plate.getAttribute('href') + '"></a>';
  var a = dock.firstChild;
  /* от 1150px у дока параметры плашки шапки и подпись жёлтой полосы меню «Ekspresowa wycena» (Грег, 03.10.2026): две подписи,
     какую показать – решает styles.css (.md-s / .md-l); нет полосы меню – одна прежняя */
  var floorT = document.querySelector('#mobile-nav .mnd-floor .mnd-t'), wide = floorT ? (floorT.textContent || '').trim() : '';
  ['md-s', 'md-l'].forEach(function (c, i) { var s = document.createElement('span'); s.className = c; s.textContent = i && wide ? wide : label; a.appendChild(s); });
  a.insertAdjacentHTML('beforeend', chev);
  a.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (plate.hasAttribute('data-quote')) { e.preventDefault(); plate.click(); }
  });
  document.body.appendChild(dock);
  /* свечение вокруг кнопки (от 1150px, только на страницах со светом лампы – styles.css); отдельным слоем, а не внутри дока:
     mix-blend-mode из слоя с z-index на страницу не действует */
  var glow = document.createElement('div'); glow.className = 'm-dock-glow'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow);
  /* стекло под кнопкой (от 1150px): охра дока ложится на него умножением – насыщенная и при этом прозрачная, как плашка шапки;
     тоже отдельным слоем – внутри слоя с умножением backdrop-filter страницу не видит. Ширину кнопки ему передаёт apply() */
  var glass = document.createElement('div'); glass.className = 'm-dock-glass'; glass.setAttribute('aria-hidden', 'true'); document.body.appendChild(glass);
  /* белый свет под тёмной кнопкой в покое – как под плашкой меню; при наведении его сменяет охра .m-dock-glow (Грег, 03.10.2026) */
  var lamp = document.createElement('div'); lamp.className = 'm-dock-lamp'; lamp.setAttribute('aria-hidden', 'true'); document.body.appendChild(lamp);

  var mains = [].slice.call(main.querySelectorAll('.cta-btn--main, .gt-btn, .tl-go-go'));   /* .gt-btn – кнопка заявки в плитах цен, .tl-go-go – во фразе-часах #jak-to-dziala */
  var first = mains[0] || null;
  var darks = [].slice.call(document.querySelectorAll('.slab, section.bg-ink'));   /* без .footer-tone: подвал закреплён под страницей, его рамка всегда у низа окна */
  var cn = document.querySelector('.cn-dock');   /* /cennik/: плавающие якоря прайса внизу окна (от 640px) – уже 1150px, пока они видны, док не показываем */
  var deskQ = window.matchMedia('(min-width:1150px)');
  if (cn && window.MutationObserver) new MutationObserver(req).observe(cn, { attributes: true, attributeFilter: ['class'] });
  var on = false, ticking = false, dockW = -1, dockLift = 0;
  function seen(el) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;   /* скрытые (display:none) не считаются */
    /* 04.10.2026 (аналитика 02.10, К1): кнопка карточки «Krok po kroku», лежащей под стопкой, и кнопка под стеклом шапки
       глазу не видны, а раньше считались видимыми – кнопка заявки пропадала на 3–4 экрана. Видимой считаем кнопку,
       у которой в окне хотя бы половина высоты (Н5 аналитики переводов: 19px кнопки hero у низа окна гасили док) */
    if (el.closest('.kk-c') && !el.closest('.kk-c.is-cur')) return false;
    var r = el.getBoundingClientRect(), top = window.innerWidth >= 1150 ? 110 : 0;
    return r.width > 0 && r.bottom - r.height / 2 > top && r.top + r.height / 2 < window.innerHeight;
  }
  function apply() {
    ticking = false;
    var vh = window.innerHeight, show = phone.matches;
    if (show && (root.classList.contains('menu-open') || root.classList.contains('qd-open'))) show = false;
    /* от 1150px якоря стоят слева, кнопка – справа, друг другу не мешают (Грег, 03.10.2026); уже – обе по центру, док уступает */
    if (show && cn && !deskQ.matches && cn.classList.contains('is-on') && getComputedStyle(cn).display !== 'none') show = false;   /* position:fixed – offsetParent всегда null */
    if (show) show = first ? !seen(first) : window.scrollY > vh * 0.5;   /* с первого экрана, пока кнопки hero не в окне (Грег, 27.09.2026) */
    if (show && mains.some(seen)) show = false;
    /* конец контента (подвал – шторка, ориентир – низ <main>). Уже 1150px кнопка там прячется, как раньше. От 1150px –
       не исчезает, а остаётся на странице (Грег, 03.10.2026: «в конце сайта перед футером не исчезает, а фиксируется на
       странице»): встаёт над низом <main> и уезжает вверх вместе с ним, пока открывается подвал.
       Подъём --dock-lift – на док, стекло и свечение (styles.css) */
    var mb = main.getBoundingClientRect().bottom;
    if (show && !deskQ.matches && mb < vh + 40) show = false;
    /* где встаёт (Грег: «положение кнопки при зацепе должно быть красивым, пропорциональным»): не вплотную к подвалу, а в 63px
       над краем контента – тот же зазор, что у стрелки «наверх» и якорей прайса, и столько же у кнопки справа до края окна
       на 1440 (правый край плашки меню): в углу страницы она стоит с равными полями. 18px – её обычный отступ от низа окна */
    var lift = deskQ.matches ? Math.max(0, Math.round(vh - mb + 63 - 18)) : 0;
    if (lift !== dockLift) { dockLift = lift; [dock, glass, glow, lamp].forEach(function (e) { e.style.setProperty('--dock-lift', lift + 'px'); }); }
    /* от 1150px (styles.css): стекло и свечение – по ширине кнопки (--dock-w); над тёмным блоком (те же, что у шапки)
       кнопка – как тёмная плашка меню (охра 78 % с размытием), свечение – осветлением. Место дока – «дома», без выезда */
    if (show) {
      var dr = dock.getBoundingClientRect(), db = vh - (parseFloat(getComputedStyle(dock).bottom) || 0), dt = db - dr.height;
      if (dr.width !== dockW) { dockW = dr.width; [glass, glow, lamp].forEach(function (e) { e.style.setProperty('--dock-w', dockW + 'px'); }); }
      dock.classList.toggle('on-dark', darks.some(function (d0) {
        var d = d0.getBoundingClientRect();
        return d.top < db && d.bottom > dt && d.left < dr.right && d.right > dr.left;
      }));
    }
    if (show !== on) {
      on = show;
      dock.classList.toggle('is-on', on);
      root.classList.toggle('mdock-on', on);
      try { window.dispatchEvent(new Event('mdock')); } catch (e) {}
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  /* меню и панель заявки меняют класс у <html> – следим за ним */
  if (window.MutationObserver) new MutationObserver(req).observe(root, { attributes: true, attributeFilter: ['class'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(req);   /* шрифт подписи догрузился – ширина кнопки для стекла (--dock-w) заново */
  apply();
})();

/* Фраза-часы в конце #jak-to-dziala на /tlumaczenia-przysiegle/ (PL, 27.09.2026, стенд docs/jak-cta/ – вариант 10).
   «Jest 14:32. [Zamów wycenę] teraz, a cenę i termin dostaniesz e-mailem, zwykle w 15 minut.» – часы посетителя (с 28.09 без «do 14:47»).
   Рабочее окно – по Варшаве, codziennie 7:00–21:00 (в праздники тоже, как .ws-msg выше). За 15 минут до закрытия –
   «zwykle jeszcze dziś». Ночью фраза кончается на «e-mailem», а когда ответим – в подписи: «Jutro rano – odpowiadamy od 7:00»
   (7:00 варшавского времени в часах посетителя). DOM трогаем только при смене текста – иначе сбрасывается выделение. */
(function () {
  var p = document.querySelector('.tl-go-now');
  if (!p) return;
  var clock = p.querySelector('.tl-go-clock'), nowEl = p.querySelector('[data-now]'), whenEl = p.querySelector('[data-when]');
  var note = document.querySelector('.tl-go-note[data-note]');
  var OPEN = 7 * 60, CLOSE = 21 * 60, NB = '\u00a0', DAY_NOTE = note ? note.innerHTML : '';
  function waw(t) {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour12: false, hour: '2-digit', minute: '2-digit' })
        .formatToParts(t).forEach(function (x) { o[x.type] = x.value; });
      return { h: parseInt(o.hour, 10) % 24, m: parseInt(o.minute, 10) };
    } catch (e) { return { h: t.getHours(), m: t.getMinutes() }; }
  }
  function hm(t) { return t.getHours() + ':' + ('0' + t.getMinutes()).slice(-2); }
  function mid(t) { return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime(); }
  function set(el, html) { if (el && el._h !== html) { el.innerHTML = html; el._h = html; } }
  function tick() {
    var n = new Date(), t = new Date(n.getTime() - n.getSeconds() * 1000 - n.getMilliseconds());
    var w = waw(t), wm = w.h * 60 + w.m;
    if (nowEl.textContent !== hm(t)) nowEl.textContent = hm(t);
    if (wm >= OPEN && wm < CLOSE) {
      set(whenEl, wm + 15 > CLOSE ? ', zwykle jeszcze' + NB + 'dziś' : ', zwykle w' + NB + '15' + NB + 'minut');
      set(note, DAY_NOTE);
    } else {
      /* ближайшие 7:00 по Варшаве; в ночь перевода часов поправляем по факту */
      var at = new Date(t.getTime() + ((OPEN - wm + 1440) % 1440) * 60000);
      var h = waw(at).h; if (h !== 7) at = new Date(at.getTime() + (7 - h) * 3600000);
      var day = Math.round((mid(at) - mid(t)) / 864e5) <= 0 ? 'Dziś' : 'Jutro';
      if (at.getHours() >= 5 && at.getHours() < 12) day += NB + 'rano';
      set(whenEl, '');
      set(note, day + ' – odpowiadamy od' + NB + '<span class="tl-go-t">' + hm(at) + '</span>.');
    }
  }
  clock.hidden = false;
  tick();
  setInterval(tick, 10000);
})();

/* Почта без открытого адреса в коде (28.09.2026): роботы-сборщики читают HTML и не видят адрес.
   В разметке: data-mail="имя|домен"; у ссылки ставим mailto, текст – в элементах [data-mail-t]
   или в самом элементе. Без JS остаётся запасной текст «apostilo [at] gmail.com». */
(function () {
  document.querySelectorAll('[data-mail]').forEach(function (el) {
    var addr = el.getAttribute('data-mail').split('|').join('@');
    if (el.tagName === 'A') el.href = 'mailto:' + addr;
    var slots = el.querySelectorAll('[data-mail-t]');
    if (slots.length) slots.forEach(function (s) { s.textContent = addr; });
    else el.textContent = addr;
  });
})();

/* Выбор суда по городу (.sad-pick, /apostille/pelnomocnictwo/#ktory-sad, 29.09.2026): показывает карточку выбранного
   суда и строку «что дальше» – для Варшавы своя, для остальных городов общая.
   01.10.2026 (владелица: «делаем все три»): до выбора – подсказка (.sad-pick-empty, видна от 1024px); города без своего
   окружного суда – опции с data-sad-to="<суд>": открывают карточку того суда и строку над ней (.sad-pick-via);
   ссылка сразу на город – #sad-<город> (#sad-krakow, #sad-gdynia): выбирает город и прокручивает к плашке. */
(function () {
  var box = document.querySelector('[data-sad-pick]'); if (!box) return;
  var sel = box.querySelector('select');
  var cards = box.querySelectorAll('.so-card[data-sad]'), next = box.querySelectorAll('[data-sad-next]');
  var empty = box.querySelector('.sad-pick-empty'), via = box.querySelector('.sad-pick-via');
  function show() {
    var opt = sel.options[sel.selectedIndex], v = sel.value;
    var court = (opt && opt.getAttribute('data-sad-to')) || v;
    cards.forEach(function (c) { c.hidden = c.getAttribute('data-sad') !== court; });
    next.forEach(function (p) { p.hidden = !v || (p.getAttribute('data-sad-next') === 'waw') !== (court === 'warszawa'); });
    if (empty) empty.hidden = !!v;
    if (via) {
      var alias = !!(opt && opt.getAttribute('data-sad-to'));
      via.hidden = !alias;
      if (alias) {
        var town = opt.textContent.split(' → ')[0];
        via.textContent = court === 'warszawa'
          ? town + ' należy do jednego z\u00a0warszawskich sądów okręgowych.'
          : town + ' nie ma własnego Sądu Okręgowego. Podpis notariusza z\u00a0tego miasta poświadcza:';
      }
    }
  }
  function fromHash() {
    var m = /^#sad-([a-z-]+)$/.exec(location.hash); if (!m) return false;
    if (!sel.querySelector('option[value="' + m[1] + '"]')) return false;
    sel.value = m[1]; show();
    box.scrollIntoView({ block: 'start' });
    return true;
  }
  sel.addEventListener('change', show);
  window.addEventListener('hashchange', fromHash);
  if (!fromHash()) show();
})();

(function () {
  // Логотип: плавно уменьшается пропорционально прокрутке (1.36 → 1.00 на первых 160px)
  var header = document.getElementById('top');
  var LOGO_MAX = 1.36, LOGO_MIN = 1, LOGO_RANGE = 160;
  var logoTicking = false, logoLast = null;
  function applyLogoScale() {
    logoTicking = false;
    var p = Math.min(Math.max(window.scrollY, 0) / LOGO_RANGE, 1);
    p = p * p * (3 - 2 * p); // сглаживание на концах – без рывка в начале и в конце
    var s = (LOGO_MAX - (LOGO_MAX - LOGO_MIN) * p).toFixed(4);
    if (s !== logoLast) { header.style.setProperty('--logo-scale', s); logoLast = s; }
  }
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
    var foot = document.getElementById('stopka');
    var GAP = 63;                       // зазор между стрелкой и футером
    function check(){
      btn.classList.toggle('is-live', window.scrollY > window.innerHeight * 0.6);
      // стрелка упирается в футер и не заходит на него
      var base = window.matchMedia('(max-width:640px)').matches ? 100 : 64;
      var bottom = base;
      if (foot) {
        var top = foot.getBoundingClientRect().top;
        var limit = window.innerHeight - top + GAP;
        if (limit > bottom) bottom = limit;
      }
      btn.style.bottom = bottom + 'px';
    }
    window.addEventListener('scroll', check, { passive:true });
    window.addEventListener('resize', check);
    check();
    btn.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  })();


  // Переключатель языка в шапке (пока только метка, сайт не переводится)
  (function () {
    var btn = document.getElementById('lang-switch');
    if (!btn) return;
    var label = btn.querySelector('.ls-now');
    var opts = Array.prototype.slice.call(document.querySelectorAll('#lang-pop .lang-opt'));

    function setLang(name, from) {
      btn.classList.add('is-changing');
      setTimeout(function () {
        Array.prototype.slice.call(label.querySelectorAll('.nl-a, .nl-b'))
          .forEach(function (n) { n.textContent = name; });
        btn.classList.remove('is-changing');
      }, 170);
      opts.forEach(function (o) { o.classList.toggle('is-current', o === from); });
    }

    /* закрыть список и не открывать снова, пока курсор не уйдёт и не вернётся */
    function close() {
      var wrap = btn.closest('.lang-wrap');
      if (!wrap) return;
      wrap.classList.add('is-picked');
      wrap.addEventListener('mouseleave', function once(){
        wrap.classList.remove('is-picked');
        wrap.removeEventListener('mouseleave', once);
      });
    }

    /* та же страница в другой языковой версии: /ua/kontakt/ ↔ /kontakt/ ↔ /en/kontakt/ */
    var LANG_DIRS = ['ua', 'ru', 'en'];
    function samePageIn(code) {
      var parts = location.pathname.split('/').filter(Boolean);
      if (parts.length && LANG_DIRS.indexOf(parts[0]) !== -1) parts.shift();
      if (code !== 'pl') parts.unshift(code);
      return '/' + parts.join('/') + (parts.length ? '/' : '') + location.hash;
    }
    function goTo(o) {
      var code = o.getAttribute('data-lang');
      var already = o.classList.contains('is-current');
      setLang(o.textContent.trim(), o);
      close();
      if (code && !already) location.href = samePageIn(code);
    }
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        goTo(o);
        if (document.activeElement) document.activeElement.blur();
      });
    });
    /* клик по самому переключателю – следующий язык по кругу */
    btn.addEventListener('click', function () {
      var cur = opts.filter(function (o) { return o.classList.contains('is-current'); })[0];
      var i = cur ? opts.indexOf(cur) : -1;
      goTo(opts[(i + 1) % opts.length]);
      btn.blur();
    });
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
    function apply(i) {
      cells.forEach(function (c, n) {
        c.classList.toggle('is-open', n === i);
        c.setAttribute('aria-expanded', String(n === i));
      });
      panels.forEach(function (pl, n) { pl.classList.toggle('is-open', n === i); });
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
    function fit() {
      box.style.setProperty('--fm-size', '100px');
      var w = word.getBoundingClientRect().width;
      if (!w) return;
      var cs = getComputedStyle(box);
      var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var size = (100 * avail / w) * 0.955 - 0.04;
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
    var darks = Array.prototype.slice.call(
      document.querySelectorAll('.slab, section.bg-ink, .footer-tone'));
    if (!darks.length) return;
    var ticking = false;
    function check() {
      ticking = false;
      function overDark(el) {
        var r = el.getBoundingClientRect();
        return darks.some(function (d0) {
          var d = d0.getBoundingClientRect();
          return d.top < r.bottom && d.bottom > r.top && d.left < r.right && d.right > r.left;
        });
      }
      logo.classList.toggle('on-dark', overDark(logo));
      links.forEach(function (a) { a.classList.toggle('on-dark', overDark(a)); });
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
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).formatToParts(new Date()).forEach(function (p) { out[p.type] = p.value; });
      } catch (e) {
        var d = new Date();
        out = { weekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
                hour: ('0' + d.getHours()).slice(-2), minute: ('0' + d.getMinutes()).slice(-2),
                second: ('0' + d.getSeconds()).slice(-2) };
      }
      var wd = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[out.weekday];
      var h = parseInt(out.hour, 10) % 24;
      return { wd: wd, h: h, m: parseInt(out.minute, 10), s: parseInt(out.second, 10),
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
    var PL_MONTHS = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
                     'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
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
      if (dstEl) dstEl.textContent = summer ? 'czas letni' : 'czas zimowy';
    }

    function tick() {
      var t = warsaw();
      var mins = t.h * 60 + t.m;
      var weekday = t.wd >= 1 && t.wd <= 5;
      var open = weekday && mins >= OPEN && mins < CLOSE;
      var state, msg;

      if (open) {
        state = 'Teraz pracujemy';
        msg = mins >= CLOSE - 60
          ? 'Zdążymy dziś – piszemy zwykle w ciągu 15 minut.'
          : 'Odpowiadamy zwykle w ciągu 15 minut.';
      } else if (weekday && mins < OPEN) {
        state = 'Poza godzinami';
        msg = 'Napisz teraz – odpowiemy dziś od 7:00.';
      } else if (t.wd >= 1 && t.wd <= 4) {
        state = 'Poza godzinami';
        msg = 'Napisz teraz – odpowiemy jutro od 7:00.';
      } else if (t.wd === 5) {
        state = 'Poza godzinami';
        msg = 'Napisz teraz – w sobotę pracujemy po uzgodnieniu, najpóźniej odpiszemy w poniedziałek od 7:00.';
      } else if (t.wd === 6) {
        state = 'Sobota – po uzgodnieniu';
        msg = 'Napisz, a potwierdzimy termin. Standardowo wracamy w poniedziałek od 7:00.';
      } else {
        state = 'Niedziela – nieczynne';
        msg = 'Zgłoszenie przyjmiemy teraz, odpowiemy w poniedziałek od 7:00.';
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
        var now = (n === 0 && weekday) || (n === 1 && t.wd === 6) || (n === 2 && t.wd === 0);
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

  // Календарь польских выходных: красный кружок + подсказка при наведении
  (function () {
    var cal = document.getElementById('cal');
    if (!cal) return;
    var grid = cal.querySelector('.cal-grid');
    var title = cal.querySelector('.cal-title');
    var tip = cal.querySelector('.cal-tip');
    var prev = cal.querySelector('.cal-btn.is-prev');
    var next = cal.querySelector('.cal-btn.is-next');
    if (!grid || !title) return;

    var MONTHS = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
                  'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
    var WD = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];

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

    var cache = {};
    function holidays(y) {
      if (cache[y]) return cache[y];
      var map = {};
      function put(mo, da, name) { map[mo + '-' + da] = name; }
      function putDate(d, name) { put(d.getMonth() + 1, d.getDate(), name); }
      put(1, 1, 'Nowy Rok');
      put(1, 6, 'Święto Trzech Króli');
      put(5, 1, 'Święto Pracy');
      put(5, 3, 'Święto Konstytucji 3 Maja');
      put(8, 15, 'Wniebowzięcie NMP · Święto Wojska Polskiego');
      put(11, 1, 'Wszystkich Świętych');
      put(11, 11, 'Narodowe Święto Niepodległości');
      put(12, 25, 'Boże Narodzenie – pierwszy dzień');
      put(12, 26, 'Boże Narodzenie – drugi dzień');
      var e = easter(y);
      putDate(e, 'Wielkanoc');
      putDate(new Date(y, e.getMonth(), e.getDate() + 1), 'Poniedziałek Wielkanocny');
      putDate(new Date(y, e.getMonth(), e.getDate() + 49), 'Zielone Świątki');
      putDate(new Date(y, e.getMonth(), e.getDate() + 60), 'Boże Ciało');
      cache[y] = map;
      return map;
    }

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

    var now = todayWarsaw();
    var view = { y: now.y, m: now.m };

    function hideTip() { tip.classList.remove('is-on'); }
    function showTip(el) {
      if (!tip) return;
      tip.textContent = el.getAttribute('data-name');
      tip.style.left = '0px';
      var half = tip.offsetWidth / 2;                  // держим подсказку внутри колонки
      var x = el.offsetLeft + el.offsetWidth / 2;
      tip.style.left = Math.max(half + 2, Math.min(cal.clientWidth - half - 2, x)) + 'px';
      tip.style.top = (el.offsetTop - 8) + 'px';
      tip.classList.add('is-on');
    }

    function render() {
      var y = view.y, m = view.m;
      title.textContent = MONTHS[m - 1] + ' ' + y;
      var hol = holidays(y);
      var first = new Date(y, m - 1, 1);
      var blanks = (first.getDay() + 6) % 7;          // неделя с понедельника
      var days = new Date(y, m, 0).getDate();
      var html = '';
      WD.forEach(function (w) { html += '<span class="cal-wd">' + w + '</span>'; });
      for (var b = 0; b < blanks; b++) html += '<span class="cal-cell"></span>';
      for (var d = 1; d <= days; d++) {
        var wd = (new Date(y, m - 1, d).getDay() + 6) % 7;
        var cls = 'cal-cell';
        if (wd > 4) cls += ' is-weekend';
        if (y === now.y && m === now.m && d === now.d) cls += ' is-today';
        var name = hol[m + '-' + d];
        html += '<span class="' + cls + '">' + (name
          ? '<button type="button" class="cal-hol" data-name="' + name + '" aria-label="' + d + ' ' +
            MONTHS[m - 1].toLowerCase() + ' – ' + name + '">' + d + '</button>'
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

  // Мобильное меню
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mobile-nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('hidden') === false;
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.add('hidden');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

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

  // Валидация формы + мягкое сообщение вместо браузерного alert
  var form = document.getElementById('quote-form');
  var status = document.getElementById('form-status');

  function say(text, ok) {
    status.textContent = text;
    status.classList.remove('hidden');
    status.style.color = ok ? '#EFB01F' : '#FFFFFF';
  }

  if (form) form.addEventListener('submit', function (e) {   // формы нет на подстраницах
    var name = document.getElementById('name');
    var phone = document.getElementById('phone');
    var service = document.getElementById('service');
    var consent = document.getElementById('consent');
    var file = document.getElementById('file');

    if (!name.value.trim() || !phone.value.trim() || !service.value) {
      e.preventDefault();
      say('Uzupełnij imię, telefon i wybierz usługę.', false);
      return;
    }
    if (!consent.checked) {
      e.preventDefault();
      say('Potrzebujemy zgody na przetwarzanie danych, żeby przygotować wycenę.', false);
      return;
    }
    for (var i = 0; i < file.files.length; i++) {
      if (file.files[i].size > 10 * 1024 * 1024) {
        e.preventDefault();
        say('Plik "' + file.files[i].name + '" jest większy niż 10 MB. Wyślij go proszę na WhatsApp.', false);
        return;
      }
    }
    say('Wysyłamy…', true);
    // Здесь можно повесить событие конверсии Google Ads:
    // if (window.gtag) gtag('event','conversion',{send_to:'AW-XXXXXXXXX/XXXXXXXX'});
  });
})();

  /* --- price count-up on hover --- */
  (function(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var DUR = 320;          // длительность накрутки, мс
    var FROM = 0.55;        // старт = 55% от цены
    document.querySelectorAll('.price-hit').forEach(function(hit){
      var el = hit.querySelector('.price-num');
      if (!el) return;
      var target = parseInt(el.dataset.price, 10);
      var raf = null;
      el.style.minWidth = el.getBoundingClientRect().width + 'px';
      hit.addEventListener('mouseenter', function(){
        if (raf) cancelAnimationFrame(raf);
        var start = performance.now(), from = Math.round(target * FROM);
        (function tick(now){
          var t = Math.min((now - start) / DUR, 1);
          var e = 1 - Math.pow(1 - t, 3);            // easeOutCubic
          el.textContent = Math.round(from + (target - from) * e);
          if (t < 1) raf = requestAnimationFrame(tick); else el.textContent = target;
        })(start);
      });
      hit.addEventListener('mouseleave', function(){
        if (raf) cancelAnimationFrame(raf);
        el.textContent = target;
      });
    });
  })();

  /* --- podpis wybranych plików --- */
  (function(){
    var inp = document.getElementById('file'), out = document.getElementById('file-name');
    if (!inp || !out) return;
    inp.addEventListener('change', function(){
      var n = inp.files.length;
      if (!n) { out.textContent = 'Nie wybrano plików'; return; }
      out.textContent = n === 1 ? inp.files[0].name
        : n + (n < 5 ? ' wybrane pliki' : ' wybranych plików');
    });
  })();

  /* --- Логотип: отобранные начертания ------------------------------------
     FORMS[0] – исходное написание, дальше отобранные варианты (номера – из
     logo-preview.html, где перебираются все 640 000 сочетаний; полные наборы
     знаков по буквам описаны в logo-glyphs.md рядом с этим файлом).
     Наведение на логотип в шапке переключает слово на следующий вариант,
     увод курсора возвращает исходное. Добавить вариант – дописать строку.
     Вручную: LOGO_GLYPHS.show(n) · .next() · .start() · .stop(). */
  window.LOGO_GLYPHS = (function () {
    var FORMS = [
      'Apostilo✦',   /* исходное  */
      'ApΩštiło✻',   /* № 10 028  */
      'AρΩşτıło✳',   /* № 94 627  */
      'ÅpoΣτiƖø✻',   /* № 324 583 */
      'Åρσštıłō✳',   /* № 434 147 */
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

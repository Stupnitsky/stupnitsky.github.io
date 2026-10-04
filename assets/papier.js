/* assets/papier.js – бумага на /apostille/ (PL), вариант 51 стенда docs/papier/ (Грег, 03.10.2026: «51 реализуй на сайт»);
   с 03.10 и на /tlumaczenia-przysiegle/ (Грег: «перенеси на страницу Tłumaczenia фактуры плашкам») – там без пометок (data-papier).
   Работает, только если у <html> класс papier (стоит в разметке страницы; «pp» занят образцом «po polsku»). Без скачиваемых картинок фактуры: плитки рисуются
   в браузере (canvas → blob:, в CSP img-src есть blob: и data:), один раз, по одной в свободное время после загрузки.
   1) Фактура: страница (main, body) – облачность, зерно, редкие ворсинки; серые плашки (кроме ссылок и кнопок) – верже 5px
      с местами приглушёнными полосками и зерном офсета. Плитки – в переменных --papier-page / --papier-plate / --papier-veil, стили – в styles.css.
   2) Свет лампы – два fixed-слоя .papier-lamp / .papier-vig (стили в styles.css).
   3) Рваный край на трети контура крупных серых плашек (маска своего размера + светлый ободок), пересчёт при смене размера.
   4) Пометки карандашом (только от 1100px): обводка «260 zł razem z opłatą skarbową», «Apostille» у Ministerstwa, «Ważne» у абзаца
      о копиях с подчёркиванием, «Wszystko jasne!» в плашке с вопросом. Файлы надписей – assets/img/papier/*.svg.
   Код генераторов – копия docs/papier/paper.js и pen.js (менять там и здесь вместе). */
(function(){
  var doc = document, html = doc.documentElement;
  /* papier – вся бумага светлой страницы; papier-czern – чёрная страница /kontakt/ (свет лампы там – CSS): фактура чёрного фона, верже
     на жёлтой и серой плашках, свет по разделам (функция czern ниже). В режиме «без бумаги» (html.plain ставит app.js, он идёт раньше) – ничего. */
  var FULL = html.classList.contains('papier'), CZERN = !FULL && html.classList.contains('papier-czern') && !html.classList.contains('plain');
  if (!FULL && !CZERN) return;
  /* на стенде docs/papier/ (кадр в iframe) бумагу рисуют сами варианты – сайтовая не нужна */
  try { if (window.top !== window && /\/docs\/papier\//.test(window.parent.location.pathname)) return; } catch (e) {}
  var win = window, NS = 'http://www.w3.org/2000/svg', IMG = '/assets/img/papier/';
  var INK = '31,33,32';
  function rng(seed){ var s = (seed * 2654435761) >>> 0 || 1; return function(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  /* замкнутый по краям value-noise: сетка n×n, x,y в долях плитки 0…1 */
  function vnoise(R, n){
    var g = new Float32Array(n * n); for (var i = 0; i < g.length; i++) g[i] = R();
    return function(u, v){
      var x = u * n, y = v * n, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      var x0 = ((xi % n) + n) % n, y0 = ((yi % n) + n) % n, x1 = (x0 + 1) % n, y1 = (y0 + 1) % n;
      var a = g[y0 * n + x0], b = g[y0 * n + x1], c = g[y1 * n + x0], d = g[y1 * n + x1];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  }
  function rangeR(R, r){ return r[0] + (r[1] - r[0]) * R(); }
  function logR(R, r){ return r[0] * Math.pow(r[1] / r[0], R()); }

  function mass(cx, R, N, S, o){
    var im = cx.createImageData(N, N), a = im.data;
    var oct = [];
    if (o.cloud) [[S / 120, .55], [S / 40, .3], [S / 14, .15]].forEach(function(p){ oct.push({ f:vnoise(R, Math.max(2, Math.round(p[0]))), w:p[1] }); });
    var th = o.tooth ? vnoise(R, Math.max(8, Math.round(S / 2.2))) : null, th2 = o.tooth ? vnoise(R, Math.max(8, Math.round(S / 6))) : null;
    var d = 1 / N * 1.5;
    /* grainMix – точки разного размера и тона: порог по гладкому шуму с ячейкой ~1.6, 2.6 и 4 пикселя устройства, плюс мелочь по пикселю */
    var gm = o.grainMix ? [vnoise(R, Math.round(N / 1.6)), vnoise(R, Math.round(N / 2.6)), vnoise(R, Math.round(N / 4))] : null;
    function spk(x){ var e = Math.abs(x - .5) - .2; return e > 0 ? (x > .5 ? 1 : -1) * e / .3 : 0; }
    /* пятна тона – крупные мягкие перепады (как неровная масса на постере), волна – пологий рельеф листа с боковым светом */
    var mo = o.mottle ? [[o.mottleCells || 3, .65], [(o.mottleCells || 3) * 3, .35]].map(function(p){ return { f:vnoise(R, p[0]), w:p[1] }; }) : null;
    var sn1 = o.soft ? Math.max(2, Math.round(S / 300)) : 0, sh1 = o.soft ? vnoise(R, sn1) : null, sh2 = o.soft ? vnoise(R, sn1 * 3) : null, se = 24 / S, sk = 1 / (se * sn1 * 1.4);
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var u = x / N, v = y / N, val = 0;
      if (mo) val += ((mo[0].w * mo[0].f(u, v) + mo[1].w * mo[1].f(u, v)) - .5) * 3 * o.mottle;
      if (sh1) { var s0 = sh1(u, v) + .35 * sh2(u, v), s1 = sh1(u + se, v + se * 1.4) + .35 * sh2(u + se, v + se * 1.4); val += (s0 - s1) * sk * o.soft; }
      if (o.cloud) { var c = 0; for (var k = 0; k < oct.length; k++) c += oct[k].w * oct[k].f(u, v); val += (c - .5) * 3.2 * o.cloud; }
      if (o.grain && !gm) val += (R() - .5) * 2 * o.grain;
      if (gm) val += o.grain * ((R() - .5) * .9 + spk(gm[0](u, v)) * 1.1 + spk(gm[1](u, v)) * .9 + spk(gm[2](u, v)) * .7);
      if (th) { var h0 = th(u, v) + .5 * th2(u, v), h1 = th(u + d, v + d) + .5 * th2(u + d, v + d); val += (h0 - h1) * 9 * o.tooth; }
      var i = (y * N + x) * 4;
      if (val > 0) { a[i] = a[i + 1] = a[i + 2] = 255; a[i + 3] = Math.min(255, val * 255); }
      else { a[i] = 31; a[i + 1] = 33; a[i + 2] = 32; a[i + 3] = Math.min(255, -val * 255); }
    }
    cx.putImageData(im, 0, 0);
  }

  /* тёплые и холодные пятна: сверху на массу, обычным наложением */
  function tint(win, cx, R, N, t){
    var cv = win.document.createElement('canvas'); cv.width = cv.height = N;
    var tc = cv.getContext('2d'), im = tc.createImageData(N, N), a = im.data, f = vnoise(R, 3), g = vnoise(R, 7);
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var c = (.7 * f(x / N, y / N) + .3 * g(x / N, y / N) - .5) * 3, i = (y * N + x) * 4;
      if (c > 0) { a[i] = 196; a[i + 1] = 150; a[i + 2] = 70; } else { a[i] = 96; a[i + 1] = 116; a[i + 2] = 134; }
      a[i + 3] = Math.min(255, Math.abs(c) * t * 255);
    }
    tc.putImageData(im, 0, 0); cx.drawImage(cv, 0, 0);
  }

  function fibers(cx, R, S, f){
    var n = f.n || 600;
    for (var i = 0; i < n; i++) {
      var x = R() * S, y = R() * S, L = logR(R, f.len || [3, 20]);
      var ang = f.dir == null ? R() * Math.PI : f.dir + (R() - .5) * (f.spread || .4);
      var cs = Math.cos(ang), sn = Math.sin(ang), curl = (R() - .5) * (f.curl == null ? .6 : f.curl) * L;
      var x0 = x - cs * L / 2, y0 = y - sn * L / 2, x2 = x + cs * L / 2, y2 = y + sn * L / 2;
      var qx = x - sn * curl, qy = y + cs * curl;
      var w = rangeR(R, f.w || [.35, .7]), col;
      if (f.colors) col = f.colors[Math.floor(R() * f.colors.length)];
      else if (R() < (f.share == null ? .5 : f.share)) col = 'rgba(255,255,255,' + rangeR(R, f.light || [.25, .5]).toFixed(3) + ')';
      else col = 'rgba(' + INK + ',' + rangeR(R, f.dark || [.05, .12]).toFixed(3) + ')';
      var br = R() < (f.branch == null ? .25 : f.branch);
      var bt = .3 + R() * .4, bx = (1 - bt) * (1 - bt) * x0 + 2 * (1 - bt) * bt * qx + bt * bt * x2, by = (1 - bt) * (1 - bt) * y0 + 2 * (1 - bt) * bt * qy + bt * bt * y2;
      var ba = ang + (R() < .5 ? 1 : -1) * (.4 + R() * .6), bl = L * (.15 + R() * .25);
      var m = L / 2 + Math.abs(curl) + 2;
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
        var px = x + ox * S, py = y + oy * S;
        if (px + m < 0 || px - m > S || py + m < 0 || py - m > S) continue;
        cx.save(); cx.translate(ox * S, oy * S);
        if (f.relief) {   /* тень и блик – волокно лежит на поверхности */
          stroke(cx, x0 + .6, y0 + .6, qx + .6, qy + .6, x2 + .6, y2 + .6, w * 1.1, 'rgba(' + INK + ',' + (f.relief * .9).toFixed(3) + ')');
          stroke(cx, x0 - .5, y0 - .5, qx - .5, qy - .5, x2 - .5, y2 - .5, w, 'rgba(255,255,255,' + (f.relief * 2.2).toFixed(3) + ')');
        }
        stroke(cx, x0, y0, qx, qy, x2, y2, w, col);
        if (br) { cx.beginPath(); cx.moveTo(bx, by); cx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl); cx.lineWidth = w * .6; cx.strokeStyle = col; cx.stroke(); }
        cx.restore();
      }
    }
  }
  function stroke(cx, x0, y0, qx, qy, x2, y2, w, col){
    cx.beginPath(); cx.moveTo(x0, y0); cx.quadraticCurveTo(qx, qy, x2, y2); cx.lineWidth = w; cx.strokeStyle = col; cx.lineCap = 'round'; cx.stroke();
  }
  function specks(cx, R, S, sp){
    for (var i = 0; i < sp.n; i++) {
      var x = R() * S, y = R() * S, r = rangeR(R, sp.r || [.4, 1.2]), a = rangeR(R, sp.a || [.08, .25]);
      cx.fillStyle = (sp.color || 'rgba(' + INK + ',1)').replace(/,1\)$/, ',' + a.toFixed(3) + ')');
      cx.beginPath(); cx.ellipse(x, y, r, r * (.5 + R() * .5), R() * Math.PI, 0, Math.PI * 2); cx.fill();
    }
  }
  function laid(cx, R, S, l){
    for (var y = 0; y < S; y += l.step) {
      cx.beginPath(); cx.moveTo(0, y + .5);
      for (var x = 0; x <= S; x += 16) cx.lineTo(x, y + .5 + (R() - .5) * .25);
      var k = l.w || 1;   /* l.w – множитель толщины полосок (15: 1.36) */
      cx.lineWidth = .6 * k; cx.strokeStyle = 'rgba(' + INK + ',' + l.a + ')'; cx.stroke();
      cx.beginPath(); cx.moveTo(0, y + .5 + .8 * k); cx.lineTo(S, y + .5 + .8 * k); cx.lineWidth = .5 * k; cx.strokeStyle = 'rgba(255,255,255,' + (l.a * 2.5) + ')'; cx.stroke();
    }
  }

  /* вуаль: плитка цвета фона (rgb) с прозрачностью по крупному шуму – пятнами приглушает то, что под ней (полоски, зерно).
     o: { seed, size, a (макс. прозрачность), rgb:'229,229,225', cells (крупность пятен), lo, hi (пороги 0…1) } */
  function veil(win, o, cb){
    var S = o.size || 1370, N = S, cv = win.document.createElement('canvas'); cv.width = cv.height = N;
    var cx = cv.getContext('2d'), R = rng(o.seed || 3), f = vnoise(R, o.cells || 4), g = vnoise(R, (o.cells || 4) * 3), h = vnoise(R, (o.cells || 4) * 9);
    var im = cx.createImageData(N, N), d = im.data, c = (o.rgb || '229,229,225').split(',').map(Number), lo = o.lo == null ? .42 : o.lo, hi = o.hi == null ? .62 : o.hi;
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var u = x / N, v = y / N, n = .6 * f(u, v) + .28 * g(u, v) + .12 * h(u, v), t = Math.max(0, Math.min(1, (n - lo) / (hi - lo))), i = (y * N + x) * 4;
      t = t * t * (3 - 2 * t);
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = t * (o.a || .8) * 255;
    }
    cx.putImageData(im, 0, 0);
    cv.toBlob(function(b){ cb(win.URL.createObjectURL(b), S); }, 'image/png');
  }

  /* плитка: o как в paper.js; cb(url, size) */
  function paper(o, cb){
    var S = o.size || 512, dpr = Math.min(2, Math.max(1, Math.round(win.devicePixelRatio || 1))), N = S * dpr;
    var cv = doc.createElement('canvas'); cv.width = cv.height = N;
    var cx = cv.getContext('2d'), R = rng(o.seed || 7);
    if (o.cloud || o.grain || o.tooth || o.mottle || o.soft) mass(cx, R, N, S, o);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (o.laid) laid(cx, R, S, o.laid);
    (o.fibers || []).forEach(function(f){ fibers(cx, R, S, f); });
    if (o.specks) specks(cx, R, S, o.specks);
    cv.toBlob(function(b){ cb(win.URL.createObjectURL(b), S); }, 'image/png');
  }
  var FINE = { len:[3, 22], w:[.3, .6], dark:[.07, .16], light:[.3, .55], share:.55, curl:.7 };
  function fine(n){ var o = { n:n }; for (var k in FINE) o[k] = FINE[k]; return o; }
  function later(fn){ (win.requestIdleCallback || function(f){ return setTimeout(f, 60); })(fn, { timeout:1500 }); }

  /* ---------- 1. фактура ---------- */
  function mark(){
    Array.prototype.forEach.call(doc.querySelectorAll('main, main *'), function(el){
      var c = win.getComputedStyle(el).backgroundColor;
      if (c === 'rgb(241, 241, 239)') el.classList.add('papier-page');
      else if (c === 'rgb(229, 229, 225)' && !/^(A|BUTTON)$/.test(el.tagName)) el.classList.add('papier-sand');
    });
  }
  function textures(){
    later(function(){ paper({ seed:31, cloud:.03, grain:.02, fibers:[fine(120)] }, function(u){ html.style.setProperty('--papier-page', 'url(' + u + ')');
      later(function(){ paper({ seed:151, size:510, cloud:.02, grain:.05, laid:{ step:5, a:.022, w:1.21 }, fibers:[fine(40)] }, function(u2){
        later(function(){ veil(win, { seed:251, size:1370, a:.85, cells:9 }, function(v){
          html.style.setProperty('--papier-plate', 'url(' + u2 + ')'); html.style.setProperty('--papier-veil', 'url(' + v + ')'); html.classList.add('papier-ready'); }); }); }); }); }); });
  }

  /* ---------- чёрная страница /kontakt/ (класс papier-czern) – вариант 29 стенда docs/czern/ (Грег, 03.10.2026: «реализуй на сайт 29,
     а на серой плашке как и везде добавь фактуру») ----------
     1) Плашки: жёлтая #odbior и серая «Gdzie» – то же верже, что серые плашки других страниц (--papier-plate), вуаль своя: охристая
        (--papier-veil-y) и серая (--papier-veil). От 1024px фон жёлтой рисуют лист и корешок под линией отрыва – корешку отдаём сдвиг
        плитки (--ob-perf-y), чтобы линии продолжали лист; плашка меняет высоту (раскрываются способы доставки) – пересчёт.
     2) Чёрный фон – один фон на <main> (секции прозрачные – рисунок идёт через всю страницу без стыков), слои сверху вниз: редкие охристые
        и белые вкрапления, редкие светлые ворсинки, матовое зерно, вуаль, линии верже. Числа – из docs/czern/v29.js, менять вместе.
     3) Свет по разделам: раздел за пределами окна стоит в полутьме и «включается» каждый раз, когда входит в окно (верх выше 78 % его высоты).
     4) Пометка карандашом (вариант 32 стенда, Грег: «32 реализуй»; от 1100px): под кнопками первого экрана белым карандашом от руки
        «zacznij od zdjęcia» и стрелка к «Zamów wycenę» – функция czernNotes ниже (ей нужны штрихи, объявленные дальше в файле).
        Вариант 36 (Грег: «36 на сайт»): в лиде #odbior белым мелком подчёркнуто «Skan gotowego dokumentu dostajesz od ręki» – czernSkan.
     Стили – html.papier-czern в styles.css. */
  /* зерно чёрной бумаги: светлые точки белые, тёмные – чёрные (чернильные на #1F2120 не видны), с мягкими сгустками в 2–4 пикселя.
     Копия JC.cz.grain из docs/czern/lib.js (свой генератор случайности – рисунок тот же, что на стенде). */
  function rng2(seed){ var s = seed >>> 0; return function(){ s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function grainBW(o, cb){
    var dpr = Math.min(2, win.devicePixelRatio || 1), n = Math.round(o.size * dpr), c = doc.createElement('canvas'); c.width = c.height = n;
    var x = c.getContext('2d'), im = x.createImageData(n, n), R = rng2(o.seed), p = im.data;
    var m1 = vnoise(R, Math.round(n / 2.2)), m2 = vnoise(R, Math.round(n / 4.5));
    for (var y = 0; y < n; y++) for (var xx = 0; xx < n; xx++) {
      var i = (y * n + xx) * 4, v = R() - .5, e = (m1(xx / n, y / n) - .5) * .9 + (m2(xx / n, y / n) - .5) * .6; v = v * .62 + e * .42;
      var t = Math.min(1, Math.abs(v) * 2);
      if (v > 0) { p[i] = p[i + 1] = p[i + 2] = 255; p[i + 3] = Math.round(t * o.w * 255); }
      else { p[i] = p[i + 1] = p[i + 2] = 0; p[i + 3] = Math.round(t * o.k * 255); }
    }
    x.putImageData(im, 0, 0); c.toBlob(function(b){ cb(win.URL.createObjectURL(b), o.size); }, 'image/png');
  }
  function czern(){
    /* 1) плашки */
    later(function(){ paper({ seed:151, size:510, cloud:.02, grain:.05, laid:{ step:5, a:.022, w:1.21 }, fibers:[fine(40)] }, function(u){
      later(function(){ veil(win, { seed:253, size:1370, a:.85, cells:9, rgb:'239,176,31' }, function(vy){
        later(function(){ veil(win, { seed:251, size:1370, a:.85, cells:9 }, function(vs){
          html.style.setProperty('--papier-plate', 'url(' + u + ')'); html.style.setProperty('--papier-veil-y', 'url(' + vy + ')');
          html.style.setProperty('--papier-veil', 'url(' + vs + ')'); html.classList.add('papier-ready');
          later(page); }); }); }); }); }); });
    var plate = doc.querySelector('.ob-plate--lift'), strip = doc.querySelector('.ob-strip--perf');
    if (plate && strip) {
      var fit = function(){ var o = strip.getBoundingClientRect().top + 8 - plate.getBoundingClientRect().top; strip.style.setProperty('--ob-perf-y', (-o).toFixed(2) + 'px'); };
      fit(); if (win.ResizeObserver) new win.ResizeObserver(fit).observe(plate); else win.addEventListener('resize', fit);
    }
    /* 2) чёрный фон: шесть плиток по очереди, в свободное время; готовы все – одним списком в --papier-czern */
    function page(){
      var L = [], jobs = [
        function(cb){ paper({ seed:222, size:1024, specks:{ n:8, r:[.5, 1.6], a:[.25, .6], color:'rgba(239,176,31,1)' } }, cb); },
        function(cb){ paper({ seed:223, size:840, specks:{ n:5, r:[.4, 1.2], a:[.1, .3], color:'rgba(255,255,255,1)' } }, cb); },
        function(cb){ paper({ seed:152, size:1024, fibers:[{ n:82, len:[3, 26], w:[.35, .7], light:[.024, .052], share:1, curl:.8 }] }, cb); },
        function(cb){ grainBW({ size:256, seed:141, w:.014, k:.052 }, cb); },
        function(cb){ veil(win, { seed:163, size:1370, a:.8, rgb:INK, cells:4, lo:.26, hi:.8 }, cb); },
        function(cb){ paper({ seed:162, size:510, laid:{ step:5, a:.012, w:1.21 } }, cb); }];
      (function next(i){
        if (i === jobs.length) { html.style.setProperty('--papier-czern', L.map(function(l){ return 'url(' + l[0] + ')'; }).join(','));
          html.style.setProperty('--papier-czern-s', L.map(function(l){ return l[1] + 'px ' + l[1] + 'px'; }).join(',')); html.classList.add('papier-czern-ready'); later(stopka); return; }
        later(function(){ jobs[i](function(u, sz){ L[i] = [u, sz]; next(i + 1); }); });
      })(0);
    }
    /* 2а) охристый подвал – бумага (Грег, 04.10.2026: «задать фактуру и несколько ворсинок и пятнышек для футера»). Фактура – та же, что у жёлтой
       плашки (--papier-plate под охристой вуалью --papier-veil-y, уже готовы), поверх неё две редкие плитки: ворсинки с тёмными пятнышками
       (1024px) и светлые пятнышки с парой светлых ворсинок (840px) – размеры разные, чтобы узор не повторялся в такт. В окне подвала
       (≈530px высоты) на 1440 это около дюжины ворсинок и десятка пятнышек. Стили – html.papier-stopka-ready в styles.css. */
    function stopka(){
      later(function(){ paper({ seed:311, size:1024, fibers:[{ n:22, len:[4, 30], w:[.4, .85], dark:[.14, .3], light:[.3, .55], share:.3, curl:.8 }],
          specks:{ n:9, r:[.5, 1.8], a:[.25, .6] } }, function(a){
        later(function(){ paper({ seed:312, size:840, fibers:[{ n:6, len:[5, 24], w:[.35, .7], light:[.35, .6], share:1, curl:.8 }],
            specks:{ n:6, r:[.4, 1.3], a:[.35, .65], color:'rgba(255,255,255,1)' } }, function(b){
          html.style.setProperty('--papier-stopka', 'url(' + a + '),url(' + b + ')'); html.classList.add('papier-stopka-ready'); }); }); }); });
    }
    /* 3) свет по разделам. Грег, 04.10.2026: «при повторном выезде включи данный эффект» – свет включается каждый раз, когда раздел снова входит
       в окно, а не один раз: раздел зажигается (is-lit), когда его верх поднялся выше 78 % высоты окна (или он входит сверху при прокрутке назад),
       и гаснет, только когда целиком ушёл за край окна – на глазах ничего не тухнет. Раздел, который при загрузке уже на экране (или выше),
       сразу горит – иначе он мигнул бы. */
    if (win.IntersectionObserver) {
      var ioOn = new win.IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) e.target.classList.add('is-lit'); }); },
        { rootMargin:'0px 0px -22% 0px', threshold:0 });
      var ioOff = new win.IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) e.target.classList.remove('is-lit'); }); }, { threshold:0 });
      Array.prototype.slice.call(doc.querySelectorAll('main > section'), 1).forEach(function(sec){
        var r = sec.getBoundingClientRect();
        if (r.top < win.innerHeight * .78 && r.bottom > 0) sec.classList.add('is-lit');
        sec.classList.add('pg-dim'); ioOn.observe(sec); ioOff.observe(sec); });
    }
    /* 4) пометка карандашом: после шрифтов (от них зависит место кнопки), заново – при смене ширины окна */
    (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(function(){ setTimeout(czernNotes, 150); });
    var rt = 0, lw = win.innerWidth;
    win.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ if (win.innerWidth !== lw) { lw = win.innerWidth; czernNotes(); } }, 250); });
    win.addEventListener('load', function(){ setTimeout(czernNotes, 300); });
    /* 6) отрывная полоса с мессенджерами в конце «Gdzie»: после шрифтов (от них зависит ширина слов), заново – при смене ширины окна */
    (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(function(){ setTimeout(czernPasek, 200); });
    var pt = 0, pw = win.innerWidth;
    win.addEventListener('resize', function(){ clearTimeout(pt); pt = setTimeout(function(){ if (win.innerWidth !== pw) { pw = win.innerWidth; czernPasek(); } }, 250); });
    /* 5) живой свет лампы */
    czernLamp();
  }
  /* Живой свет лампы – варианты 55–57 стенда docs/czern/ вместе (Грег, 04.10.2026: «55 56 57 объедини в один, только на разных интервалах
     поставь и с различной очерёдностью»). Свет – слой body::before (styles.css, html.papier-swiatlo), скрипт только меняет его переменные.
     У каждого движения свой круг со случайной паузой; круги разной длины и идут независимо, поэтому порядок событий всё время другой:
       дышит    – раз в 7–11 с пятно за 1,4 с становится чуть шире или уже (96–108 %);
       качается – раз в 11–17 с за 1,6 с уходит влево или вправо (до 3 % ширины окна от середины);
       мигает   – раз в 19–29 с слабеет на 16 % на 0,15 с, в среднем каждый четвёртый раз – дважды подряд.
     Первое событие каждого круга – раньше (от половины нижней границы), чтобы страница не стояла полминуты. При prefers-reduced-motion
     свет стоит. В кадре стенда варианты 55–57 показывают движения по одному и гасят общее атрибутом data-lamp="off" у <html>. */
  function czernLamp(){
    if (!html.classList.contains('papier-swiatlo') || win.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    function every(a, b, fn){
      (function loop(first){ setTimeout(function(){ if (html.getAttribute('data-lamp') !== 'off') fn(); loop(false); },
        ((first ? a / 2 : a) + Math.random() * (b - a)) * 1000); })(true);
    }
    function set(k, v){ html.style.setProperty(k, v); }
    function dip(){ set('--lamp-o', '.84'); setTimeout(function(){ set('--lamp-o', '1'); }, 150); }
    every(7, 11, function(){ set('--lamp-s', (.96 + Math.random() * .12).toFixed(3)); });
    every(11, 17, function(){ set('--lamp-x', ((Math.random() * 2 - 1) * 3).toFixed(2) + 'vw'); });
    every(19, 29, function(){ dip(); if (Math.random() < .25) setTimeout(dip, 380); });
  }
  /* «zacznij od zdjęcia» под кнопками первого экрана /kontakt/: надпись – assets/img/papier/kontakt-zacznij-od-zdjecia.svg (контуры Liu Jian Mao Cao,
     белый карандаш по чёрной бумаге: docs/papier/hand/v84-make_svg.py → docs/czern/hand/make_white.py; нарисована в 48px, стоит в 27px, −3°),
     левый край – на 62 % ширины жёлтой кнопки, верх – на 30px ниже ряда кнопок; от надписи дуга-стрелка к низу кнопки (белый карандаш 1.5px).
     Всё лежит в колонке первого экрана (она position:relative) и едет вместе с ней. */
  function czernNotes(){
    Array.prototype.forEach.call(doc.querySelectorAll('.papier-note'), function(e){ e.remove(); });
    if (!win.matchMedia('(min-width:1100px)').matches) return;
    defs(); czernSkan(); czernDzien(); czernFaq();
    var btn = doc.querySelector('main > section .hero-cta .cta-btn--main'), host = btn && btn.closest('section > div'); if (!host) return;
    var B = box(btn), hb = box(host), k = 27 / 48, w = 338.8 * k, h = 69.4 * k, x = B.x + B.w * .62, y = B.y + B.h + 30;
    var im = doc.createElement('img'); im.src = IMG + 'kontakt-zacznij-od-zdjecia.svg'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.className = 'papier-note';
    im.width = Math.round(w); im.height = Math.round(h);
    im.style.cssText = 'left:' + (x - hb.x).toFixed(1) + 'px;top:' + (y - hb.y).toFixed(1) + 'px;transform:rotate(-3deg);transform-origin:0 100%;opacity:.95';
    host.appendChild(im);
    penStroke(arrow([x - 8, y + h * .5], [B.x + B.w * .34, B.y + B.h + 7], -16, rng(321)), 'pencil', 'rgba(236,236,231,.9)', 1.5, host);
  }
  /* Белый мелок в #odbior (вариант 36 стенда docs/czern, Грег 03.10.2026: «в 36 белым подчёркиваем», «36 на сайт»): в лиде раздела
     «Jak przekazać i odebrać dokument» фраза «Skan gotowego dokumentu dostajesz od ręki» подчёркнута одной линией – перо crayon 2.4px, белый
     тот же, что у карандаша выше; у последней строки вылет 24px с уходом вниз. Линия лежит в колонке раздела (она position:relative) –
     едет вместе с ней и стоит в полутьме, пока раздел не «включился». Числа – из docs/czern/v36.js, менять вместе. */
  function czernSkan(){
    var host = doc.querySelector('#odbior > div'), r = host && find(doc, host, 'Skan gotowego dokumentu dostajesz od ręki'); if (!r) return;
    var L = lines(r), R = rng(361), ds = [];
    L.forEach(function(l, i){ var last = i === L.length - 1, y = l.y + l.h * .97, x0 = l.x - 3, x1 = l.x + l.w + (last ? 24 : 3), q = [];
      for (var j = 0; j <= 7; j++) { var t = j / 7; q.push([x0 + (x1 - x0) * t, y + 1.2 - 2 * t + Math.sin(t * 3 + R()) * 1 + (last && j === 7 ? 4 : 0)]); }
      ds.push('M' + q.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L')); });
    penStroke(ds, 'crayon', 'rgba(236,236,231,.9)', 2.4, host).classList.add('papier-note--skan');
  }
  /* «wybierz dzień» под календарём (вариант 37 стенда docs/czern; Грег, 03.10.2026: «37 поменяй место подписи и подчеркни слово, без стрелки
     и на сайт сразу!» – место показал красной линией на снимке): белым карандашом от руки, под календарём, правый край надписи – по правому
     краю сетки дней, линия подчёркивания – на 44px ниже блока календаря, от −10px до +10px ширины надписи, с подъёмом к концу, как и сама
     надпись (−2°); стрелки нет. Надпись – assets/img/papier/kontakt-wybierz-dzien.svg (48px → 26px). Календарь выглядит справкой, а дни –
     кнопки: пометка говорит, что день нужно нажать; после выбора дня она уходит. Лежит внутри #cal (он position:relative) – едет с календарём
     и стоит в полутьме вместе с разделом; пересчёт – при смене ширины окна и размера календаря (в месяце бывает 5 и 6 строк). */
  var dzienOff = false, dzienOn = false;
  function czernDzien(){
    Array.prototype.forEach.call(doc.querySelectorAll('.papier-note--dzien'), function(e){ e.remove(); });
    var cal = doc.getElementById('cal'), grid = cal && cal.querySelector('.cal-grid');
    if (!grid || dzienOff || !win.matchMedia('(min-width:1100px)').matches) return;
    if (!dzienOn) { dzienOn = true;
      grid.addEventListener('click', function(e){ if (e.target.closest && e.target.closest('.cal-day')) { dzienOff = true; czernDzien(); } });
      if (win.ResizeObserver) { var t = 0; new win.ResizeObserver(function(){ clearTimeout(t); t = setTimeout(czernDzien, 120); }).observe(cal); } }
    defs();
    var C = box(cal), G = box(grid), k = 26 / 48, w = 266.6 * k, h = 57.3 * k, x = G.x + G.w - w, yl = C.y + C.h + 44, y = yl - h * .8;
    var im = doc.createElement('img'); im.src = IMG + 'kontakt-wybierz-dzien.svg'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.className = 'papier-note papier-note--dzien';
    im.width = Math.round(w); im.height = Math.round(h);
    im.style.cssText = 'left:' + (x - C.x).toFixed(1) + 'px;top:' + (y - C.y).toFixed(1) + 'px;transform:rotate(-2deg);transform-origin:0 100%;opacity:.95';
    cal.appendChild(im);
    var R = rng(371), x0 = x - 10, x1 = x + w + 10, q = [];
    for (var j = 0; j <= 7; j++) { var u = j / 7; q.push([x0 + (x1 - x0) * u, yl + 2.5 - 6 * u + Math.sin(u * 3 + R()) * .9]); }
    var sv = penStroke(['M' + q.map(function(pt){ return pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); }).join('L')], 'pencil', 'rgba(236,236,231,.9)', 1.6, cal);
    sv.classList.add('papier-note--dzien');
    /* у штриха поле 40px под фильтр: на 1100–1130px оно выходило за правый край окна и давало горизонтальную прокрутку – лишнее поле справа срезаем */
    var cut = sv.getBoundingClientRect().right - (html.clientWidth - 2);
    if (cut > 0) { var vw = Math.max(1, +sv.getAttribute('width') - cut); sv.setAttribute('width', vw); sv.setAttribute('viewBox', '0 0 ' + vw + ' ' + sv.getAttribute('height')); }
  }
  /* «da się zdalnie» у первого вопроса FAQ (вариант 46 стенда docs/czern; Грег, 03.10.2026: «46 da się zdalnie реализуй на сайт» – текст выбран
     из списка вместо «to częste»): у вопроса «Czy muszę przyjeżdżać do Warszawy osobiście?» белым карандашом от руки ответ в два слова и
     короткая стрелка к вопросу. Надпись – assets/img/papier/kontakt-da-sie-zdalnie.svg (48px → 26px, −4°), в 40px за концом вопроса,
     стрелка – карандаш 1.4px. Лежит внутри строки вопроса (summary, ей ставится position:relative) – едет с ней и стоит в полутьме вместе
     с разделом; не входит до значка раскрытия – пометки нет. Вопрос и ответ FAQ не менялись (JSON-LD прежний). */
  function czernFaq(){
    var sm = doc.querySelector('#faq details > summary'), h3 = sm && sm.querySelector('h3'); if (!h3) return;
    var rg = doc.createRange(); rg.selectNodeContents(h3); var l = lines(rg)[0]; if (!l) return;
    var S = box(sm), ch = sm.querySelector('.chev'), k = 26 / 48, w = 258.7 * k, h = 58.9 * k, x = l.x + l.w + 40, y = l.y + l.h * .5 - h * .58;
    if (x + w > (ch ? box(ch).x : S.x + S.w) - 24) return;
    sm.style.position = 'relative';
    var im = doc.createElement('img'); im.src = IMG + 'kontakt-da-sie-zdalnie.svg'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.className = 'papier-note papier-note--faq';
    im.width = Math.round(w); im.height = Math.round(h);
    im.style.cssText = 'left:' + (x - S.x).toFixed(1) + 'px;top:' + (y - S.y).toFixed(1) + 'px;transform:rotate(-4deg);transform-origin:0 100%;opacity:.95';
    sm.appendChild(im);
    penStroke(arrow([x - 5, y + h * .62], [l.x + l.w + 9, l.y + l.h * .6], 5, rng(461), 8), 'pencil', 'rgba(236,236,231,.9)', 1.4, sm).classList.add('papier-note--faq');
  }
  /* Отрывная полоса «молнией» с мессенджерами в конце «Gdzie» (вариант 61 стенда docs/czern; Грег, 04.10.2026: «на сайт»). Вместо белых кнопок
     WhatsApp / Telegram в блоке .gdz-cta (слоган слева остаётся) – статичная вскрытая отрывная лента в чёрной бумаге, как у картонной коробки:
     – под чёрной бумагой охра подвала (--c-ochre с бумагой --papier-veil-y / --papier-plate), на ней слова набором меню (26px / 700): «WhatsApp»,
       «Telegram» и «Zadzwoń» (ссылка и подпись для чтеца – с кнопки первого экрана). У мессенджеров сразу за словом облачко меню с тремя точками:
       по наведению (и фокусу) всплывает, точки подпрыгивают по одному разу, через 1 с облачко гаснет до следующего наведения. Видимые расстояния
       (их задал Грег): от слова до облачка 18px, от облачка до следующего слова 26px;
     – перфорация – высеченные просечки: штрих 11px на линии отрыва + усик 3,2 × 3,6px наружу, шаг 20px; на неоторванной части (правее сгиба, до края
       окна) они видны тёмной прорезью со светлой кромкой;
     – край оторванной части – то, что остаётся от тех же просечек: ровно по штриху, скос по усику, короткая рваная перемычка к следующему штриху
       (у каждой свой ход и длина, у части – серые волокна бумаги); язычок – оторванная полоса с ответной формой краёв, отогнут на −11° вокруг
       точки сгиба на 62 % высоты; охра кончается на линии сгиба; тень чёрной бумаги идёт по контуру окна.
     Ничего не движется и не привязано к прокрутке. Кнопки остаются в разметке: уже 1100px, без скрипта и в режиме «без бумаги» работают они;
     от 1100px полоса заменяет весь ряд кнопок. Стили – .pasek* в styles.css. Числа – из docs/czern/v61.js и v60.js, менять вместе. */
  function czernPasek(){
    var cta = doc.querySelector('#gdzie .gdz-cta'); if (!cta) return;
    var old = cta.querySelector('.pasek'); if (old) old.remove(); cta.classList.remove('pasek-on');
    var btns = cta.querySelector('.cta-btns'); if (!btns || !win.matchMedia('(min-width:1100px)').matches) return;
    var links = Array.prototype.filter.call(btns.querySelectorAll('a'), function(a){ return /wa\.me|t\.me/.test(a.getAttribute('href')); }); if (!links.length) return;
    var tel = doc.querySelector('main .hero-cta a[href^="tel:"]'); if (tel) links.push(tel);
    /* 44 > зазора 2.5rem у .gdz-cta: шире – полоса переносится под слоган */
    var avail = cta.clientWidth - cta.firstElementChild.offsetWidth - 44; if (avail < 400) return;
    var W = Math.round(Math.min(780, avail)), H = 64, pad = 12, st = 20, rc = 22, OY = H * .62, R = rng2(611), x;
    var DASH0 = 4, DASH1 = 15, TX = 18.2, TY = 3.6, X0 = rc + st * .6;   /* просечка: штрих от X+4 до X+15 на линии, усик до (X+18.2, ∓3.6) */
    function f(n){ return n.toFixed(1); }
    function j(a){ return (R() - .5) * a; }
    function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
    function row(){ return links.map(function(a){ var href = a.getAttribute('href'), isTel = /^tel:/.test(href), al = a.getAttribute('aria-label');
      return '<a class="pasek-a" href="' + esc(href) + '"' + (isTel ? '' : ' target="_blank" rel="noopener"') + (al ? ' aria-label="' + esc(al) + '"' : '') + '><span>' + esc(a.textContent.trim()) + '</span>' +
        (isTel ? '' : '<span class="pasek-hint" aria-hidden="true"><span class="pasek-bub"><i></i><i></i><i></i></span></span>') + '</a>'; }).join(''); }
    var w = doc.createElement('div'); w.className = 'pasek'; w.style.cssText = 'width:' + W + 'px;height:' + H + 'px';
    cta.classList.add('pasek-on'); cta.insertBefore(w, btns);
    function need(pl){ var m = doc.createElement('div'); m.className = 'pasek-paper'; m.style.cssText = 'position:static;display:inline-flex;visibility:hidden;padding-left:' + pl + 'px';
      m.innerHTML = row(); w.appendChild(m); var n = m.offsetWidth; m.remove(); return n - pad + 14; }
    var pl = 34, nd = need(pad + pl);
    if (nd > W - 44) { w.classList.add('pasek-tight'); pl = 24; nd = need(pad + pl); }   /* тесно: поля ряда меньше */
    var F = Math.round(Math.min(W - 44, Math.max(W * .84, nd))), XR = F + 24;
    var HW = Math.round(W + pad * 2 + Math.max(0, html.clientWidth - w.getBoundingClientRect().right - pad));   /* просечки – до правого края окна */
    /* край окна по одной просечке: по штриху до X+15, скос по усику, рваная перемычка к началу следующего штриха (рвётся по-разному) */
    function notch(X, y, out){
      var a = [X + DASH1, y], p = [X + TX, y + out * TY], end = X + st + DASH0, ex = end - R() * R() * 4.2, kind = R(), mid;
      if (kind < .3) mid = [];
      else if (kind < .65) mid = [[p[0] + (ex - p[0]) * (.35 + j(.2)), y + out * (TY * (.72 + j(.3)))]];
      else mid = [[p[0] + (ex - p[0]) * (.3 + j(.15)), y + out * (TY * (.5 + j(.3)))], [p[0] + (ex - p[0]) * (.68 + j(.15)), y + out * (TY * (.34 + j(.3)))]];
      var torn = [p].concat(mid, [[ex, y]]), fib = R() < .26 ? 0 : .13 + R() * .24;
      return { pts:[a].concat(torn, [[end, y]]), torn:torn, a:fib, w:.8 + R() * .7 };
    }
    var Xs = []; for (x = X0; x + st + DASH0 < XR + 6; x += st) Xs.push(x);
    var topN = Xs.map(function(X){ return notch(X, 0, -1); }), botN = Xs.map(function(X){ return notch(X, H, 1); });
    function seg(pts, ox, oy){ return pts.map(function(q){ return 'L' + f(ox + q[0]) + ' ' + f(oy + q[1]); }).join(''); }
    var P = 'M' + f(pad + rc) + ' ' + pad + topN.map(function(n){ return seg(n.pts, pad, pad); }).join('') + 'L' + f(pad + XR + 6) + ' ' + pad + 'L' + f(pad + XR + 6) + ' ' + f(pad + H) +
      botN.slice().reverse().map(function(n){ return seg(n.pts.slice().reverse(), pad, pad); }).join('') +
      'L' + f(pad + rc) + ' ' + f(pad + H) + 'A' + rc + ' ' + rc + ' 0 0 1 ' + pad + ' ' + f(pad + H - rc) + 'L' + pad + ' ' + f(pad + rc) + 'A' + rc + ' ' + rc + ' 0 0 1 ' + f(pad + rc) + ' ' + pad + 'Z';
    var T = topN.concat(botN).filter(function(n){ return n.a; }).map(function(n){
      return '<path d="M' + n.torn.map(function(q){ return f(pad + q[0]) + ' ' + f(pad + q[1]); }).join('L') + '" stroke-opacity="' + n.a.toFixed(2) + '" stroke-width="' + n.w.toFixed(2) + '"/>'; }).join('');
    /* язычок – та же полоса, перевёрнутая через сгиб (u = F − x): на местах просечек – маленькие треугольные язычки наружу */
    function tab(X, y, out){
      var a = F - X - st - DASH0 + R() * R() * 4.2, p = F - X - TX, c = F - X - DASH1, kind = R(), mid;
      if (kind < .3) mid = [];
      else if (kind < .65) mid = [[a + (p - a) * (.6 + j(.2)), y + out * (TY * (.7 + j(.3)))]];
      else mid = [[a + (p - a) * (.34 + j(.15)), y + out * (TY * (.34 + j(.3)))], [a + (p - a) * (.7 + j(.15)), y + out * (TY * (.55 + j(.3)))]];
      return [[F - X - st - DASH0, y], [a, y]].concat(mid, [[p, y + out * TY], [c, y]]);
    }
    var fxs = Xs.filter(function(X){ return F - X - st - DASH0 > 3 && F - X - DASH1 < F - rc - 4; }).sort(function(a, b2){ return b2 - a; });
    var Q = 'M0 8' + fxs.map(function(X){ return seg(tab(X, 0, -1), 0, 8); }).join('') + 'L' + f(F - rc) + ' 8A' + rc + ' ' + rc + ' 0 0 1 ' + F + ' ' + f(8 + rc) + 'L' + F + ' ' + f(8 + H - rc) +
      'A' + rc + ' ' + rc + ' 0 0 1 ' + f(F - rc) + ' ' + f(8 + H) + fxs.slice().reverse().map(function(X){ return seg(tab(X, H, 1).reverse(), 0, 8); }).join('') + 'L0 ' + f(8 + H) + 'Z';
    var S = '';
    for (x = X0; pad + x + TX < HW; x += st) { S += 'M' + f(pad + x + DASH0) + ' ' + pad + 'h' + (DASH1 - DASH0) + 'l' + f(TX - DASH1) + ' ' + f(-TY); S += 'M' + f(pad + x + DASH0) + ' ' + f(pad + H) + 'h' + (DASH1 - DASH0) + 'l' + f(TX - DASH1) + ' ' + f(TY); }
    var DW = XR + pad * 2 + 8, DH = H + pad * 2, TW = W + pad * 2;
    w.innerHTML =
      '<div class="pasek-slits" aria-hidden="true" style="left:' + (-pad) + 'px;top:' + (-pad) + 'px;width:' + HW + 'px;height:' + DH + 'px"><svg class="pasek-rim" style="left:0;top:0" width="' + HW + '" height="' + DH + '" viewBox="0 0 ' + HW + ' ' + DH + '">' +
        '<path d="' + S + '" fill="none" stroke="rgba(255,255,255,.17)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1.3)"/>' +
        '<path d="' + S + '" fill="none" stroke="rgba(0,0,0,.85)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<div class="pasek-doc" style="left:' + (-pad) + 'px;top:' + (-pad) + 'px;width:' + DW + 'px;height:' + DH + 'px;clip-path:path(\'' + P + '\')">' +
        '<div class="pasek-paper" role="group" aria-label="Napisz lub zadzwoń" style="padding-left:' + (pad + pl) + 'px">' + row() +
          '<svg class="pasek-ish" aria-hidden="true" width="' + DW + '" height="' + DH + '" viewBox="0 0 ' + DW + ' ' + DH + '"><defs><filter id="pasek-b" x="-4%" y="-40%" width="108%" height="180%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>' +
            '<path d="' + P + '" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="3.4" filter="url(#pasek-b)" transform="translate(.6 1.4)"/></svg></div></div>' +
      '<div class="pasek-edgew" aria-hidden="true" style="left:' + (-pad - 20) + 'px;top:' + (-pad - 20) + 'px;width:' + (TW + 40) + 'px;height:' + (DH + 40) + 'px">' +
        '<svg class="pasek-rim" style="left:20px;top:20px" width="' + TW + '" height="' + DH + '" viewBox="0 0 ' + TW + ' ' + DH + '">' +
          '<defs><filter id="pasek-f" x="-2%" y="-14%" width="104%" height="128%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>' +
          '<path d="' + P + '" fill="none" stroke="rgba(236,236,231,.24)" stroke-width="1" stroke-linejoin="round"/>' +
          '<g filter="url(#pasek-f)" fill="none" stroke="#C9C7BE" stroke-linejoin="round" stroke-linecap="round">' + T + '</g></svg></div>' +
      '<div class="pasek-flapw" aria-hidden="true" style="top:0;height:' + H + 'px"><div class="pasek-flap" style="width:' + F + 'px;clip-path:path(\'' + Q + '\')"></div><i class="pasek-fold"></i></div>';
    var paperEl = w.querySelector('.pasek-paper'), fl = w.querySelector('.pasek-flapw'), ew = w.querySelector('.pasek-edgew'), flap = w.querySelector('.pasek-flap');
    grainBW({ size:192, seed:612, w:.05, k:.2 }, function(u){ flap.style.backgroundImage = 'linear-gradient(270deg,rgba(0,0,0,.2),rgba(0,0,0,0) 40%),url(' + u + ')'; });
    /* облачка: по наведению и фокусу – на 1 с (три точки пробегают один раз), потом гаснет до следующего наведения */
    Array.prototype.forEach.call(w.querySelectorAll('.pasek-a'), function(a){ var hn = a.querySelector('.pasek-hint'), th = 0; if (!hn) return;
      function on(){ clearTimeout(th); hn.classList.add('on'); th = setTimeout(function(){ hn.classList.remove('on'); }, 1000); }
      function off(){ clearTimeout(th); hn.classList.remove('on'); }
      a.addEventListener('mouseenter', on); a.addEventListener('focus', on); a.addEventListener('mouseleave', off); a.addEventListener('blur', off); });
    /* сгиб на F, язычок −11°; охра и кромка кончаются на линии сгиба; просечки видны только правее неё */
    var deg = -11, t = Math.tan(-deg * Math.PI / 180), xf = function(y){ return F - 3 + t * (y - OY) + .7; };
    paperEl.style.clipPath = 'polygon(0 0,' + f(pad + xf(-pad)) + 'px 0,' + f(pad + xf(H + pad)) + 'px ' + DH + 'px,0 ' + DH + 'px)';
    ew.style.clipPath = 'polygon(0 0,' + f(20 + pad + xf(-pad - 20)) + 'px 0,' + f(20 + pad + xf(H + pad + 20)) + 'px 100%,0 100%)';
    /* язычок выходит за полосу не больше чем на 34px и не дальше 8px от края окна (на 1280 поле страницы 32px – иначе появлялась горизонтальная прокрутка) */
    var room = Math.max(0, Math.min(34, html.clientWidth - w.getBoundingClientRect().right - 8));
    fl.style.left = f(F - 3) + 'px'; fl.style.width = f(Math.max(10, Math.min(F - 5, W - F + room))) + 'px'; fl.style.transform = 'rotate(' + deg + 'deg)';
    w.querySelector('.pasek-slits').style.clipPath = 'polygon(' + f(pad + xf(-pad) - 2) + 'px 0,100% 0,100% 100%,' + f(pad + xf(H + pad) - 2) + 'px 100%)';
  }

  /* ---------- 2. свет лампы ---------- */
  function lamp(){ ['papier-lamp', 'papier-vig'].forEach(function(c){ var o = doc.createElement('div'); o.className = c; o.setAttribute('aria-hidden', 'true'); doc.body.appendChild(o); }); }

  /* ---------- 3. рваный край на трети контура ---------- */
  function tear(pl, seed){
    var old = pl.querySelector(':scope > .papier-rim'); if (old) old.remove();
    var cs = win.getComputedStyle(pl), rad = parseFloat(cs.borderTopLeftRadius) || 0, W = pl.offsetWidth, H = pl.offsetHeight;
    if (rad < 20 || W < 300 || !H) return;
    var R = rng(seed), pts = [], step = 1.5, per = 2 * (W + H) + 8 * rad;
    function vn1(c){ var n = Math.max(3, Math.round(per / c)), g = []; for (var i = 0; i < n; i++) g.push(R());
      return function(t){ var x = (t / per) * n, i = Math.floor(x), f = x - i; f = f * f * (3 - 2 * f); return g[((i % n) + n) % n] * (1 - f) + g[(((i + 1) % n) + n) % n] * f; }; }
    var n40 = vn1(40), n12 = vn1(12), n4 = vn1(4);
    function dev(t){ return .3 + .6 * n40(t) + .4 * n12(t) + .3 * n4(t) + (R() - .5) * .3; }
    var gate = vn1(260), gs = []; for (var q0 = 0; q0 < per; q0 += 4) gs.push(gate(q0)); gs.sort(function(a, b){ return a - b; });
    var th = gs[Math.floor(gs.length * .67)];
    function gk(t){ var x = Math.max(0, Math.min(1, (gate(t) - th) / .05)); return x * x * (3 - 2 * x); }
    var segs = [[rad, 0, W - rad, 0, 0, 1], [W, rad, W, H - rad, -1, 0], [W - rad, H, rad, H, 0, -1], [0, H - rad, 0, rad, 1, 0]], cs2 = [[W - rad, rad, -Math.PI / 2], [W - rad, H - rad, 0], [rad, H - rad, Math.PI / 2], [rad, rad, Math.PI]], t = 0;
    function cb(x, y, nx, ny){ var k = gk(t), o = k * Math.max(.3, Math.min(1.5, dev(t))); pts.push([x + nx * o, y + ny * o, nx, ny, k]); t += step; }
    for (var s = 0; s < 4; s++) {
      var g = segs[s], L = Math.hypot(g[2] - g[0], g[3] - g[1]), q;
      for (q = 0; q < L; q += step) cb(g[0] + (g[2] - g[0]) * q / L, g[1] + (g[3] - g[1]) * q / L, g[4], g[5]);
      var c = cs2[s], A = Math.PI / 2 * rad;
      for (q = 0; q < A; q += step) { var a = c[2] + q / rad; cb(c[0] + Math.cos(a) * rad, c[1] + Math.sin(a) * rad, -Math.cos(a), -Math.sin(a)); }
    }
    var dPath = 'M' + pts.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z';
    var url = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="' + NS + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><path d="' + dPath + '" fill="#000"/></svg>') + '")';
    pl.style.webkitMaskImage = url; pl.style.maskImage = url; pl.style.webkitMaskSize = '100% 100%'; pl.style.maskSize = '100% 100%';
    pl.style.webkitMaskRepeat = 'no-repeat'; pl.style.maskRepeat = 'no-repeat';
    if (cs.position === 'static') pl.style.position = 'relative';
    var rim = doc.createElementNS(NS, 'svg'); rim.setAttribute('aria-hidden', 'true'); rim.setAttribute('class', 'papier-rim'); rim.setAttribute('width', W); rim.setAttribute('height', H);
    var parts = [], cur = null;
    pts.forEach(function(p){ if (p[4] > .03) { if (!cur) parts.push(cur = []); cur.push(p); } else cur = null; });
    rim.innerHTML = parts.filter(function(sg){ return sg.length > 2; }).map(function(sg){
      var a = 'M' + sg.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L');
      var b = 'M' + sg.map(function(p){ return (p[0] + p[2] * .8).toFixed(1) + ' ' + (p[1] + p[3] * .8).toFixed(1); }).join('L');
      return '<path d="' + a + '" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2.2" stroke-linecap="round"/>' +
             '<path d="' + b + '" fill="none" stroke="rgba(31,33,32,.07)" stroke-width="1.2" stroke-linecap="round"/>';
    }).join('');
    pl.insertBefore(rim, pl.firstChild);
  }
  function tearAll(){ var n = 0; Array.prototype.forEach.call(doc.querySelectorAll('.papier-sand'), function(pl){ tear(pl, 501 + n++); }); }

  /* ---------- 4. пометки карандашом ---------- */
  /* фраза → Range: текст узлов под root склеивается, пробелы/&nbsp; сводятся к одному */
  function find(d, root, phrase){
    if (typeof root === 'string') root = d.querySelector(root);
    if (!root) return null;
    /* сравнение без пробелов вовсе: фраза находится и через <br> (Ministerstwo<br>Spraw…), и через &nbsp; */
    var w = d.createTreeWalker(root, 4), txt = '', map = [], n, ph = phrase.replace(/[\s ]+/g, '');
    while ((n = w.nextNode())) { for (var i = 0; i < n.data.length; i++) { if (/[\s ]/.test(n.data[i])) continue; txt += n.data[i]; map.push([n, i]); } }
    var at = txt.indexOf(ph);
    if (at < 0) return null;
    var e = at + ph.length - 1, r = d.createRange();
    r.setStart(map[at][0], map[at][1]); r.setEnd(map[e][0], map[e][1] + 1); return r;
  }
  /* прямоугольники строк в координатах документа (куски одной строки сливаются) */
  function lines(r){
    var win = r.startContainer.ownerDocument.defaultView, out = [];
    Array.prototype.forEach.call(r.getClientRects(), function(b){
      if (b.width < 1) return;
      var last = out[out.length - 1], y = b.top + win.scrollY, x = b.left + win.scrollX;
      if (last && Math.abs(last.y - y) < b.height / 2) { var x1 = Math.max(last.x + last.w, x + b.width); last.x = Math.min(last.x, x); last.w = x1 - last.x; last.h = Math.max(last.h, b.height); }
      else out.push({ x:x, y:y, w:b.width, h:b.height });
    });
    return out;
  }
  function box(el){ var win = el.ownerDocument.defaultView, b = el.getBoundingClientRect(); return { x:b.left + win.scrollX, y:b.top + win.scrollY, w:b.width, h:b.height }; }
  /* гладкий путь через точки (Catmull-Rom → кривые Безье) */
  function smooth(p){
    var s = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      s += 'C' + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + ' ' + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + ' ' + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
    }
    return s;
  }
  /* формы (координаты документа) */
  function loop(r, R, o){   /* овал от руки: начинается слева сверху, делает виток с перехлёстом, чуть уходит наружу */
    /* для длинной строки – суперэллипс (почти прямоугольник со скруглениями), чтобы овал не резал соседние слова.
       o (необязательно): turn – доля витка (0.86 – не замыкается), px/py – поля вокруг, rot – наклон в радианах, e – форма */
    o = o || {};
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2, rx = r.w / 2 + (o.px == null ? 14 : o.px) + R() * 4, ry = r.h / 2 + (o.py == null ? 7 : o.py) + R() * 3, rot = (R() - .5) * .05;
    if (o.rot != null) rot = o.rot;
    var e = o.e || Math.min(1, Math.max(.45, 2.2 * r.h / r.w)), sp = function(c){ return (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), e); };
    var a0 = Math.PI * (1.08 + (R() - .5) * .12), tr = 1.1 + R() * .06, n = 44, p = [];
    if (o.turn) tr = o.turn;
    var turn = -Math.PI * 2 * tr;
    for (var i = 0; i <= n; i++) { var t = i / n, a = a0 + turn * t, k = 1 + .03 * Math.sin(a * 2 + 1.3) + .06 * t;
      var x = sp(Math.cos(a)) * rx * k, y = sp(Math.sin(a)) * ry * k; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
    return [smooth(p)];
  }
  function arrow(a, b, bend, R, hs){   /* дуга от a к b с изгибом и наконечником из двух коротких штрихов (копия pen.js, hs – длина усов) */
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
    var c = [mx - dy / L * bend, my + dx / L * bend], p = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, u = 1 - t; p.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0] + (R() - .5) * .8, u * u * a[1] + 2 * u * t * c[1] + t * t * b[1] + (R() - .5) * .8]); }
    var ex = b[0] - c[0], ey = b[1] - c[1], el = Math.sqrt(ex * ex + ey * ey); ex /= el; ey /= el;
    var h = hs || 13, s1 = [b[0] - ex * h + ey * h * .55, b[1] - ey * h - ex * h * .55], s2 = [b[0] - ex * h - ey * h * .5, b[1] - ey * h + ex * h * .5];
    return [smooth(p), 'M' + s1[0].toFixed(1) + ' ' + s1[1].toFixed(1) + 'Q' + ((s1[0] + b[0]) / 2 + 1).toFixed(1) + ' ' + ((s1[1] + b[1]) / 2).toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) +
      'Q' + ((s2[0] + b[0]) / 2).toFixed(1) + ' ' + ((s2[1] + b[1]) / 2 + 1).toFixed(1) + ' ' + s2[0].toFixed(1) + ' ' + s2[1].toFixed(1)];
  }
  function defs(){
    if (doc.getElementById('papier-pen-defs')) return;
    var s = doc.createElementNS(NS, 'svg'); s.id = 'papier-pen-defs'; s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.style.position = 'absolute';
    s.innerHTML =
      '<filter id="papier-pencil" filterUnits="userSpaceOnUse" x="-40" y="-40" width="3000" height="800">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="11" result="g"/>' +
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -0.85" result="gm"/>' +
        '<feComposite in="d" in2="gm" operator="in"/></filter>' +
      '<filter id="papier-crayon" filterUnits="userSpaceOnUse" x="-40" y="-40" width="3000" height="800">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="17" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.9 1.3" numOctaves="3" seed="23" result="g"/>' +
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.2 0 0 0 -1.25" result="gm"/>' +
        '<feComposite in="d" in2="gm" operator="in"/></filter>';
    doc.body.appendChild(s);
  }
  /* штрих (не путать со stroke() волокон на canvas выше): svg в своих координатах (фильтр считается от 0), пути сдвинуты внутренней группой */
  function penStroke(ds, kind, color, width, host){
    var pad = 40, xs = [], ys = [];
    ds.join(' ').replace(/-?\d+(\.\d+)?/g, function(m){ (xs.length === ys.length ? xs : ys).push(+m); return m; });
    var x0 = Math.min.apply(null, xs) - pad, y0 = Math.min.apply(null, ys) - pad, w = Math.max.apply(null, xs) - x0 + pad, h = Math.max.apply(null, ys) - y0 + pad;
    var s = doc.createElementNS(NS, 'svg'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'papier-note');
    s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var hb = host ? box(host) : { x:0, y:0 };
    s.style.left = (x0 - hb.x) + 'px'; s.style.top = (y0 - hb.y) + 'px';
    s.innerHTML = '<g filter="url(#papier-' + kind + ')"><g transform="translate(' + (-x0) + ' ' + (-y0) + ')">' + ds.map(function(dd){
      return '<path d="' + dd + '" fill="none" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round"/>'; }).join('') + '</g></g>';
    (host || doc.body).appendChild(s); return s;
  }
  function img(file, x, y, w, h, rot, origin){
    var i = doc.createElement('img'); i.src = IMG + file; i.alt = ''; i.setAttribute('aria-hidden', 'true'); i.className = 'papier-note';
    i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.left = x + 'px'; i.style.top = y + 'px';
    i.style.transform = 'rotate(' + rot + 'deg)'; if (origin) i.style.transformOrigin = origin;
    doc.body.appendChild(i);
  }
  /* дырка дырокола (вариант 61 стенда) и скоба степлера (вариант 63) – копии из docs/papier/v61.js и v63.js */
  function punchHole(d, x, y, D, seed){
    var NS = 'http://www.w3.org/2000/svg', R = rng(seed), S = Math.ceil(D + 12), c = S / 2, r = D / 2, id = 'v61h' + seed, pts = [], i;
    for (i = 0; i < 56; i++) { var a = i / 56 * 2 * Math.PI, rr = r + (R() - .5) * .45 + .22 * Math.sin(a * 3 + seed); pts.push([c + Math.cos(a) * rr, c + Math.sin(a) * rr]); }
    function path(k, dy){ return 'M' + pts.map(function(p){ return (c + (p[0] - c) * k).toFixed(2) + ' ' + (c + (p[1] - c) * k + (dy || 0)).toFixed(2); }).join('L') + 'Z'; }
    var dp = path(1), sh = D * .17;
    /* волокна: 3–4 коротких белых волоска от кромки внутрь */
    var fib = '';
    for (i = 0; i < 4; i++) { var fa = R() * 2 * Math.PI, fl = .8 + R() * 1.6, fx = c + Math.cos(fa) * r, fy = c + Math.sin(fa) * r;
      fib += 'M' + fx.toFixed(2) + ' ' + fy.toFixed(2) + 'l' + (-Math.cos(fa + (R() - .5)) * fl).toFixed(2) + ' ' + (-Math.sin(fa + (R() - .5)) * fl).toFixed(2); }
    var s = d.createElementNS(NS, 'svg'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', S); s.setAttribute('height', S); s.setAttribute('viewBox', '0 0 ' + S + ' ' + S);
    s.setAttribute('class', 'papier-note papier-hole');
    s.style.cssText = 'position:absolute;z-index:44;pointer-events:none;overflow:visible;left:' + (x - c).toFixed(1) + 'px;top:' + (y - c).toFixed(1) + 'px';
    s.innerHTML = '<defs>' +
      '<radialGradient id="' + id + 'f" cx="50%" cy="64%" r="62%"><stop offset="0" stop-color="#3A3D3C"/><stop offset="1" stop-color="#252827"/></radialGradient>' +
      '<clipPath id="' + id + 'c"><path d="' + dp + '"/></clipPath>' +
      '<filter id="' + id + 'b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + (D * .07).toFixed(2) + '"/></filter>' +
      '<filter id="' + id + 'p" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7"/></filter>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient>' +
      '</defs>' +
      /* вдавленное кольцо на бумаге вокруг (пробойник прижимает лист) и белая кромка среза */
      '<path d="' + path(1 + 2.4 / r) + '" fill="none" stroke="#1F2120" stroke-opacity=".09" stroke-width="1.3" filter="url(#' + id + 'p)"/>' +
      '<path d="' + path(1 + .7 / r) + '" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/>' +
      /* просвет: графит, тень от верхней кромки внутрь, светлая стенка внизу */
      '<g clip-path="url(#' + id + 'c)">' +
        '<rect width="' + S + '" height="' + S + '" fill="url(#' + id + 'f)"/>' +
        '<path fill-rule="evenodd" fill="#000" fill-opacity=".72" filter="url(#' + id + 'b)" d="M-6 -6H' + (S + 6) + 'V' + (S + 6) + 'H-6Z' + path(1, sh) + '"/>' +
        '<path d="' + dp + '" fill="none" stroke="url(#' + id + 'w)" stroke-width="2"/>' +
      '</g>' +
      '<path d="' + fib + '" stroke="#fff" stroke-opacity=".55" stroke-width=".5" stroke-linecap="round" fill="none"/>';
    doc.body.appendChild(s); return s;
  }
  function staple(d, pl, x, y, L, deg, seed){
    var NS = 'http://www.w3.org/2000/svg', R = rng(seed), S = Math.ceil(L + 18), c = S / 2, w = 3, id = 'v63s' + seed, x0 = c - L / 2, x1 = c + L / 2;
    var s = d.createElementNS(NS, 'svg'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', S); s.setAttribute('height', S); s.setAttribute('viewBox', '0 0 ' + S + ' ' + S);
    s.setAttribute('class', 'papier-note papier-staple');
    s.style.cssText = 'position:absolute;z-index:3;pointer-events:none;overflow:visible;left:' + (x - c).toFixed(1) + 'px;top:' + (y - c).toFixed(1) + 'px';
    var bend = (R() - .5) * .5;   /* скоба чуть погнута – середина на долю пикселя в сторону */
    var crown = 'M' + (x0 + w / 2) + ' ' + (c - w / 2) + 'Q' + c + ' ' + (c - w / 2 + bend) + ' ' + (x1 - w / 2) + ' ' + (c - w / 2) + 'A' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + (x1 - w / 2) + ' ' + (c + w / 2) +
      'Q' + c + ' ' + (c + w / 2 + bend) + ' ' + (x0 + w / 2) + ' ' + (c + w / 2) + 'A' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + (x0 + w / 2) + ' ' + (c - w / 2) + 'Z';
    s.innerHTML = '<defs>' +
      /* металл поперёк проволоки: тёмный край – яркая полоса – серая середина – тёмный край */
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B605E"/><stop offset=".26" stop-color="#C9CDCB"/><stop offset=".4" stop-color="#F1F3F2"/>' +
        '<stop offset=".62" stop-color="#A0A5A3"/><stop offset="1" stop-color="#4E5351"/></linearGradient>' +
      /* концы темнее: проволока загибается вниз, в бумагу */
      '<linearGradient id="' + id + 'e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1F2120" stop-opacity=".45"/><stop offset=".09" stop-color="#1F2120" stop-opacity="0"/>' +
        '<stop offset=".91" stop-color="#1F2120" stop-opacity="0"/><stop offset="1" stop-color="#1F2120" stop-opacity=".45"/></linearGradient>' +
      '<filter id="' + id + 'b" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation=".9"/></filter>' +
      '<filter id="' + id + 'd" x="-30%" y="-100%" width="160%" height="300%"><feDropShadow dx=".35" dy=".8" stdDeviation=".45" flood-color="#1F2120" flood-opacity=".42"/></filter>' +
      '</defs>' +
      /* тень (в координатах страницы – свет сверху), поэтому поворот – только у внутренней группы */
      '<g filter="url(#' + id + 'd)"><g transform="rotate(' + deg + ' ' + c + ' ' + c + ')">' +
        /* вдавленная бумага вдоль скобы: мягкая тень и светлый край */
        '<rect x="' + (x0 - 1.5) + '" y="' + (c - w / 2 - 1.2) + '" width="' + (L + 3) + '" height="' + (w + 2.4) + '" rx="2" fill="#1F2120" fill-opacity=".12" filter="url(#' + id + 'b)"/>' +
        /* проколы под концами */
        '<ellipse cx="' + (x0 + .6) + '" cy="' + c + '" rx="1.7" ry="1.35" fill="#1F2120" fill-opacity=".55"/>' +
        '<ellipse cx="' + (x1 - .6) + '" cy="' + c + '" rx="1.7" ry="1.35" fill="#1F2120" fill-opacity=".55"/>' +
        '<path d="' + crown + '" fill="url(#' + id + 'm)"/>' +
        '<path d="' + crown + '" fill="url(#' + id + 'e)"/>' +
        /* блик вдоль */
        '<path d="M' + (x0 + 3.5) + ' ' + (c - w * .2) + 'Q' + c + ' ' + (c - w * .2 + bend) + ' ' + (x1 - 3.5) + ' ' + (c - w * .2) + '" stroke="#fff" stroke-opacity=".8" stroke-width=".5" fill="none" stroke-linecap="round"/>' +
      '</g></g>';
    pl.appendChild(s); return s;
  }
  function notes(){
    Array.prototype.forEach.call(doc.querySelectorAll('.papier-note'), function(e){ e.remove(); });
    if (!win.matchMedia('(min-width:1100px)').matches) return;
    defs();
    /* пометки ниже – только для /apostille/ (data-papier="apostille"); на других страницах с бумагой (/tlumaczenia-przysiegle/ – data-papier="tlumaczenia") пока только фактура, свет и край */
    if ((html.getAttribute('data-papier') || 'apostille') !== 'apostille') return;
    /* «Apostille» у «Ministerstwo» (плашка #urzedy) – файл с обводкой, слово стоит там же, где на стенде */
    var r = find(doc, '#urzedy', 'Ministerstwo');
    if (r) { var L = lines(r)[0], w = 114, h = 52, ks = w / 132.8, dyo = 7.71 * ks;
      img('apostille-liu-loop.svg', L.x + L.w + 78, L.y + L.h / 2 - h * .6 + 5 - dyo, 144.4 * ks, 69.7 * ks, -4, '6px ' + (h * .7 + dyo) + 'px'); }
    /* «Ważne» вертикально у абзаца о копиях (#dokumenty) и подчёркивание на вылет */
    var r3 = find(doc, '#dokumenty', 'MSZ nie nadaje Apostille na kserokopiach');
    if (r3) { var p3 = r3.startContainer.parentElement.closest('p') || r3.startContainer.parentElement, b3 = box(p3), ww = 84, hh = 32;
      var cx3 = b3.x - 18 - hh / 2, cy3 = b3.y + ww / 2 + 4, th = -78 * Math.PI / 180;
      img('wazne-liu.svg', cx3 - ww / 2, cy3 - hh / 2, ww, hh, -78);
      var Ru = rng(493), up = [];
      for (var q = 0; q <= 10; q++) { var t = q / 10, lx = 40 - 120 * t, ly = 12 + 1.2 * Math.sin(t * 2.4) + 6 * t * t + (Ru() - .5) * .8;
        up.push([cx3 + lx * Math.cos(th) - ly * Math.sin(th), cy3 + lx * Math.sin(th) + ly * Math.cos(th)]); }
      penStroke(['M' + up.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L')], 'crayon', 'rgba(172,42,26,.88)', 1.9); }
    /* «Wszystko jasne!» в плашке с вопросом (#z-tlumaczeniem) */
    var rq = find(doc, '#z-tlumaczeniem', 'tłumaczenie czy oba?');
    if (rq) { var Lq = lines(rq), Lz = Lq[Lq.length - 1], wj = 158, hj = Math.round(wj * 60.7 / 210.4);
      img('wszystko-jasne-liu.svg', Lz.x + Lz.w + 110, Lz.y + Lz.h - hj * .62 + 6, wj, hj, -5); }
    /* «to częsty temat, sprawdź» у вопроса «Apostille na oryginale czy na kopii?» (#faq-kopia) – вариант 87 стенда (Грег, 03.10.2026: «87 реализуй,
       только вместо птички стрелочку влево»): справа от вопроса надпись графитом «to częsty temat, sprawdź», как пометка учителя на полях (стрелку Грег убрал).
       Живёт внутри <summary> (position:relative) – едет вместе с вопросом, когда открывают вопросы выше. */
    var sm = doc.querySelector('#faq-kopia > summary'), hq = sm && sm.querySelector('h3'), rk = hq && find(doc, hq, 'Apostille na oryginale czy na kopii?');
    if (rk) { if (win.getComputedStyle(sm).position === 'static') sm.style.position = 'relative';
      /* 03.10 Грег: «убрать стрелку и увеличить слово на 24%» – только надпись, 20 → 24.8px, сразу за вопросом */
      var Lk = lines(rk)[0], sb = box(sm), x2 = Lk.x + Lk.w + 22 - 8, sc = 20 / 26 * 1.24, wn = 268.3 * sc, hn = 43.6 * sc, bn = 25.03 * sc;   /* 03.10 Грег: «to częsty temat, sprawdź» */
      var ni = doc.createElement('img'); ni.src = IMG + 'czesty-temat.svg'; ni.alt = ''; ni.setAttribute('aria-hidden', 'true'); ni.className = 'papier-note';
      ni.style.cssText = 'opacity:.88;width:' + wn.toFixed(1) + 'px;height:' + hn.toFixed(1) + 'px;left:' + (x2 + 8 - sb.x).toFixed(1) + 'px;top:' + (Lk.y + Lk.h * .79 + 2 - bn - sb.y).toFixed(1) + 'px;transform:rotate(-4deg);transform-origin:50% ' + bn.toFixed(1) + 'px';
      sm.appendChild(ni); }
    /* 61 (Грег, 03.10.2026: «61 напротив Masz dokument z Ukrainy?»; позже стрелками на снимке – с поля на саму плашку):
       две дырки дырокола на левом поле плашки .ua-hop, посередине между её краем и текстом – лист из папки дела */
    var ua = doc.querySelector('.ua-hop');
    if (ua) { var ub = box(ua), uq = ua.querySelector('.ua-hop-q') || ua.firstElementChild, upad = uq ? box(uq).x - ub.x : 48;
      var D = Math.max(12, Math.min(22, upad * .46)), hx = ub.x + upad / 2, ucy = ub.y + ub.h * .5, ug = Math.min(150, ub.h * .21);
      punchHole(doc, hx, ucy - ug, D, 611); punchHole(doc, hx, ucy + ug, D, 612); }
    /* 63 (Грег, 03.10.2026) – скобы степлера на левом и правом краю плашки #urzedy: левая выше середины, правая ниже */
    var gp = doc.querySelector('#urzedy .gdz');
    if (gp) { if (win.getComputedStyle(gp).position === 'static') gp.style.position = 'relative';
      var gk = gp.querySelector('.ap3-cell .slab-kicker') || gp.querySelector('.ap3-cell'), gkx = 40;
      if (gk) gkx = gk.getBoundingClientRect().left - gp.getBoundingClientRect().left;
      var GW = gp.offsetWidth, GH = gp.offsetHeight, gex = Math.max(14, Math.min(24, gkx / 2));
      staple(doc, gp, gex, GH / 2 - 46, 30, 87, 631); staple(doc, gp, GW - gex, GH / 2 + 38, 30, 94, 632); }
    /* обводка «260 zł razem z opłatą skarbową» в первом экране */
    var r2 = find(doc, 'main section', '260 zł razem z opłatą skarbową');
    if (r2) penStroke(loop(lines(r2)[0], rng(27)), 'pencil', 'rgb(177,80,31)', 2);
  }

  /* общие функции – для assets/papier-extra.js (варианты 59, 62, 68, 69 стенда, собранные docs/papier/build-extra.py) */
  win.PAPIER = { rng:rng, find:find, lines:lines, box:box, paper:paper, fine:FINE, went:0,
    stroke:function(ds, kind, o){ defs(); return penStroke(ds, kind, (o && o.color) || 'rgba(31,33,32,.85)', (o && o.width) || 2); } };
  function start(){
    if (CZERN) { czern(); return; }
    mark(); lamp(); textures();
    var go = function(){ tearAll(); notes(); win.PAPIER.went++; if (win.PAPIER_EXTRA) win.PAPIER_EXTRA(win.PAPIER.went); };
    (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(function(){ setTimeout(go, 150); });
    var rt = 0, lw = win.innerWidth;
    win.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ if (win.innerWidth !== lw) { lw = win.innerWidth; go(); } }, 250); });
    win.addEventListener('load', function(){ setTimeout(go, 300); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})();

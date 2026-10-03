/* assets/papier-extra-tl.js – СОБРАНО docs/papier/build-extra.py из вариантов стенда docs/papier-tl (v3.js, v8.js, v13.js, v17.js, v19.js, v20.js). Руками не править:
   менять варианты на стенде и пересобирать. Только страница html.papier[data-papier="tlumaczenia"], после assets/papier.js. */
(function(){
  var html = document.documentElement;
  if (!html.classList.contains('papier') || (html.getAttribute('data-papier') || 'apostille') !== 'tlumaczenia') return;
  try { if (window.top !== window && /\/docs\/papier(-tl)?\//.test(window.parent.location.pathname)) return; } catch (e) {}
  var P = window.PAPIER; if (!P) return;
  /* JC – прокладка: бумагу уже кладёт papier.js (JC.v[51] – пустышка), штрихи рисует его penStroke */
  var JC = { v:{ 51:{ apply:function(){} } }, STATIC:true,
    pen:{ rng:P.rng, find:P.find, lines:P.lines, box:P.box, stroke:function(d, ds, kind, o){ P.stroke(ds, kind, o); return { show:function(){}, el:null }; } },
    paper:function(win, o, cb){ P.paper(o, cb); }, pp:{ F:{ fine:P.fine } } };
/* ---------- вариант 3 (docs/papier-tl/v3.js) ---------- */
/* 3. Подчёркивание в «Definicja» (03.10.2026). С 03.10 по Грегу – одинарное, без слова «to ważne» (описание ниже – прежнее). В #przysiegle-czy-zwykle, правая колонка, после run-in «Którego potrzebujesz?» –
   фраза «Urzędy, sądy, banki i uczelnie przyjmują tylko tłumaczenie przysięgłe» (ответ всего блока; жирной фразы именно об этом
   на странице нет – жирный только run-in перед ней). Каждая её строка подчёркнута дважды красным мелком (pp-crayon,
   rgba(172,42,26,.88)): прямой штрих с лёгким подъёмом и возвратный ниже и короче. Строка, которая доходит до края колонки
   (на компьютере фраза переносится после «przyjmują»), подчёркнута на вылет – штрих уходит за колонку на правое поле
   и кончается рывком вверх; там же, сразу за ним, графитом «to ważne» – hand/v3-to-wazne.svg (docs/papier/hand/v84-make_svg.py,
   26px → 24px; ż собрана; файл 98.8×33, базовая линия 25.03). Если фраза в одну строку – вылет вправо с уходом вниз,
   в просвет между строками. Поле справа от колонки: 1440 – ~277px, 1280 – ~177px; меньше 155px – надписи нет, только линии.
   От 1100px. */
JC.v[3] = { en:'Underlined definition', name:'Подчёркивание в «Definicja»', at:'#jezyki .lng-note',
  cap:'В разделе «Tłumaczenie Przysięgłe czy zwykłe» фраза «Urzędy, sądy, banki i uczelnie przyjmują tylko tłumaczenie przysięgłe» подчёркнута красным мелком одной линией, первая строка – на вылет, за край колонки (03.10: одинарная линия, без слова на поле). Польза: из двух колонок определений выделен ответ, ради которого человек сюда пришёл: для urzędu, sądu и banku нужен именно присяжный перевод.',
  css:'',
  apply:function(d, b, win){
    setTimeout(function(){
      (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function(){
        if (win.innerWidth < 1100) return;
        var P = JC.pen, sec = d.querySelector('#przysiegle-czy-zwykle'); if (!sec) return;
        var r = P.find(d, sec, 'Urzędy, sądy, banki i uczelnie przyjmują tylko tłumaczenie przysięgłe'); if (!r) return;
        var p = r.startContainer.parentElement.closest('p') || r.startContainer.parentElement, pb = P.box(p), colR = pb.x + pb.w;
        var Ls = P.lines(r); if (!Ls.length) return;
        var R = P.rng(303), iw = win.innerWidth;
        function smooth(q){ var s = 'M' + q[0][0].toFixed(1) + ' ' + q[0][1].toFixed(1);
          for (var i = 0; i < q.length - 1; i++) { var a0 = q[i - 1] || q[i], b0 = q[i], c0 = q[i + 1], e0 = q[i + 2] || c0;
            s += 'C' + (b0[0] + (c0[0] - a0[0]) / 6).toFixed(1) + ' ' + (b0[1] + (c0[1] - a0[1]) / 6).toFixed(1) + ' ' + (c0[0] - (e0[0] - b0[0]) / 6).toFixed(1) + ' ' + (c0[1] - (e0[1] - b0[1]) / 6).toFixed(1) + ' ' + c0[0].toFixed(1) + ' ' + c0[1].toFixed(1); }
          return s; }
        /* какая строка улетает: первая, если фраза перенесена (она дошла до края колонки), иначе единственная */
        var fly = 0, wrapped = Ls.length > 1, ds = [];
        Ls.forEach(function(L, k){
          var y1 = L.y + L.h * .95, x0 = L.x - 3 - R() * 3, x1 = L.x + L.w + 4, isFly = k === fly, tail = 0, n = 10, q = [], q2 = [];
          /* 03.10 Грег: «уменьши вылет» – линия уходит за конец фразы на 30px (было – до края колонки + 34px, около 130px) */
          if (isFly) { x1 = Math.min(L.x + L.w + 30, iw - 14); tail = wrapped ? -2.5 : 5; }
          var xp = isFly ? L.x + L.w + 4 : x1;   /* до конца фразы – ровный штрих с подъёмом, дальше – вылет */
          for (var i = 0; i <= n; i++) { var t = i / n, x = x0 + (xp - x0) * t; q.push([x, y1 + 1.2 - 2.6 * t + Math.sin(t * 3 + R() * 2) * .7]); }
          if (isFly) { var m = 5, yE = q[q.length - 1][1];
            for (i = 1; i <= m; i++) { var u = i / m; q.push([xp + (x1 - xp) * u, yE + tail * u * u + (R() - .5) * .5]); } }
          ds.push(smooth(q));
          /* 03.10 Грег: «одинарное подчёркивание, без слова» – второго, возвратного штриха нет */
        });
        var st = P.stroke(d, ds, 'crayon', { color:'rgba(172,42,26,.88)', width:2.1 });
        st.show(true);
        /* надпись «to ważne» на поле снята (03.10, Грег) */
      });
    }, 1200);
  } };

/* ---------- вариант 8 (docs/papier-tl/v8.js) ---------- */
/* 8. Растровое «90» за ценой в плашке #cena, 03.10.2026 (Грег: «для страницы Tłumaczenia добавь 12 идей, можно пометки и что-то новое»).
   Как растровая «260» в 68 на /apostille/ (Грег: «отлично»): за чёрной «90» столбца Go Tabular – огромная «90» точками графита,
   как цена в газетной печати: Fira Sans 800, точки rgba(46,49,48,.24) по сетке 7px под углом 45°, размер точки – по покрытию глифа
   и плавному шуму (ячейки ~80 и ~26px), под подписями столбца (.gt-l, 1125 / −10%) точек нет, у края этой зоны точки мельчают.
   Отличие от 68: на /apostille/ цифры выходили за карточку сами, здесь столбец целиком внутри плашки – поэтому растровая «90»
   крупнее (кегль подбирается: 1,6–2,3 чёрной) и стоит так, чтобы её левый край был чуть левее чёрной «90», а ~14% ширины уходило
   за правый край плашки – край режет «0» (canvas обрезан по плашке, сверху ещё маска рваного края сайта). По высоте – ниже
   чёрной: верх растра на трети высоты чёрных цифр. Под абзацы слева не заходит (не левее колонки текста + 20px).
   Слой – canvas внутри плашки, z-index −1 (под листами, цифрами и текстом), плашке – isolation. Только от 1100px. */
JC.v[8] = { en:'Halftone 90', name:'Растровое «90»', at:'#cena',
  cap:'За чёрной «90» в плашке «Ile kosztuje Tłumaczenie Przysięgłe» – огромная «90» растровыми точками графита, как цена в газете, точки то крупнее, то мельче. Это эхо главной цены, как «260» на /apostille/ (Грег: «отлично»), но здесь растр вдвое крупнее чёрной цифры и сползает вправо вниз: правый край плашки срезает «0», поэтому цифра выглядит больше листа. Под подписями столбца точек нет, под абзацы слева растр не заходит.',
  css:'', apply:function(d, b, win){
    function v8build(){
      if (win.innerWidth < 1100) return;
      var card = d.querySelector('#cena .gt-card'); if (!card || card.querySelector('.v8-ht')) return;
      var n0 = card.querySelector('.gt--tl .gt-n'); if (!n0) return;
      var fsD = parseFloat(win.getComputedStyle(n0).fontSize) || 200;
      var cr = card.getBoundingClientRect(), CW = cr.width, CH = cr.height, nb = n0.getBoundingClientRect();
      /* сами знаки «90»: .gt-n – блок шириной колонки, текст прижат вправо, поэтому левый край знаков – по Range */
      var rg = d.createRange(); rg.selectNodeContents(n0); var gr = rg.getBoundingClientRect(); if (!gr.width) gr = nb;
      var bL = gr.left - cr.left, bW = gr.width;
      /* верх и высота чёрных цифр: середина – на .4375 кегля от верха строки (line-height .9), высота .695 кегля (как в 68) */
      var bH = .695 * fsD, bTop = nb.top - cr.top + .4375 * fsD - bH / 2;
      /* кегль растра: левый край на 4% ширины чёрной «90» левее неё, ~14% ширины растра – за правым краем плашки */
      var x0 = bL - .04 * bW, s = Math.max(1.6, Math.min(2.3, (CW - x0) / (.86 * bW))), fs = Math.round(fsD * s), fam = '800 ' + fs + 'px "Fira Sans"';
      /* маска глифа в 1×: покрытие для каждой точки растра */
      var m = d.createElement('canvas').getContext('2d'); m.font = fam;
      try { m.letterSpacing = (-.03 * fs).toFixed(1) + 'px'; } catch (e) {}
      var tw = Math.ceil(m.measureText('90').width), pad = 12, w = tw + pad * 2, h = Math.ceil(fs * .74) + pad * 2, base = pad + Math.round(fs * .70);
      var mc = d.createElement('canvas'); mc.width = w; mc.height = h;
      var mx = mc.getContext('2d'); mx.font = fam; try { mx.letterSpacing = (-.03 * fs).toFixed(1) + 'px'; } catch (e) {}
      mx.fillStyle = '#000'; mx.textBaseline = 'alphabetic'; mx.fillText('90', pad, base);
      var A = mx.getImageData(0, 0, w, h).data;
      function cov(x, y){ var sum = 0, X0 = Math.round(x), Y0 = Math.round(y);
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var X = X0 + dx, Y = Y0 + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) sum += A[(Y * w + X) * 4 + 3]; }
        return sum / 9 / 255; }
      /* плавный шум: ячейки ~80px и ~26px – точки то крупнее, то мельче, без регулярного узора */
      var R = JC.pen.rng(80);
      function grid(c){ var nx = Math.ceil(w / c) + 2, ny = Math.ceil(h / c) + 2, g = []; for (var i = 0; i < nx * ny; i++) g.push(R());
        return function(x, y){ var u = x / c, v = y / c, i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
          i = Math.max(0, Math.min(nx - 2, i)); j = Math.max(0, Math.min(ny - 2, j));
          var a = g[j * nx + i], bb = g[j * nx + i + 1], c2 = g[(j + 1) * nx + i], e = g[(j + 1) * nx + i + 1];
          return a + (bb - a) * fx + (c2 - a) * fy + (a - bb - c2 + e) * fx * fy; }; }
      var g1 = grid(80), g2 = grid(26);
      /* место: верх знаков растра (base − .695 кегля) – на трети высоты чёрных цифр */
      var L = x0 - pad, T = bTop + .32 * bH - (base - .695 * fs);
      var tc = card.querySelector('.lg\\:col-span-7'), textR = tc ? tc.getBoundingClientRect().right - cr.left : 0;
      if (textR && L + pad < textR + 20) L = textR + 20 - pad;   /* не под абзацами слева */
      /* видимая часть – до края плашки: canvas кончается на её правом и нижнем краю, точки режутся по нему */
      var vw = Math.min(w, Math.floor(CW - L)), vh = Math.min(h, Math.floor(CH - T));
      if (vw < 40 || vh < 40 || T < 0) return;
      /* под подписями столбца точек нет; у края зоны точки плавно мельчают (12px) */
      var LB = Array.prototype.map.call(card.querySelectorAll('.gt--tl .gt-l, .gt--tl .gt-m b, .gt--tl .gt-m small'), function(el){ var q = el.getBoundingClientRect();
        return { x0:q.left - cr.left - 8, y0:q.top - cr.top - 6, x1:q.right - cr.left + 8, y1:q.bottom - cr.top + 6 }; });
      function clear(px, py){ var f = 1; LB.forEach(function(q){ var dx = Math.max(q.x0 - px, 0, px - q.x1), dy = Math.max(q.y0 - py, 0, py - q.y1), dd = Math.sqrt(dx * dx + dy * dy);
        var t = Math.min(1, dd / 12); f = Math.min(f, t * t * (3 - 2 * t)); }); return f; }
      var k = 2, cv = d.createElement('canvas'); cv.width = vw * k; cv.height = vh * k;
      var cx = cv.getContext('2d'); cx.scale(k, k); cx.fillStyle = 'rgba(46,49,48,.24)';
      var S = 7, ca = Math.cos(Math.PI / 4), sa = Math.sin(Math.PI / 4), D = Math.ceil(Math.hypot(w, h) / S / 2) + 2;
      for (var i = -D; i <= D; i++) for (var j = -D; j <= D; j++) {
        var x = w / 2 + (i * ca - j * sa) * S, y = h / 2 + (i * sa + j * ca) * S;
        if (x < -S || y < -S || x > vw + S || y > vh + S) continue;
        var c = cov(x, y); if (c < .03) continue;
        var t = c * (.38 + .62 * (.7 * g1(x, y) + .3 * g2(x, y))) * clear(L + x, T + y), r = S * .47 * Math.sqrt(t);
        if (r < .35) continue;
        cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
      }
      if (win.getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.style.isolation = 'isolate';
      cv.className = 'v8-ht'; cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:absolute;z-index:-1;pointer-events:none;width:' + vw + 'px;height:' + vh + 'px;left:' + L.toFixed(1) + 'px;top:' + T.toFixed(1) + 'px';
      card.appendChild(cv);
    }
    setTimeout(function(){
      var n0 = d.querySelector('#cena .gt--tl .gt-n'), fsD = n0 ? parseFloat(win.getComputedStyle(n0).fontSize) || 200 : 200;
      (d.fonts && d.fonts.load ? d.fonts.load('800 ' + Math.round(fsD) + 'px "Fira Sans"') : Promise.resolve()).then(v8build, v8build);
    }, 1200);
  } };

/* ---------- вариант 13 (docs/papier-tl/v13.js) ---------- */
/* 13. «w obie strony» у заголовка, 03.10.2026 (Грег: «сделай ещё 25 идей»).
   Сразу за последним словом h1 («…ukraiński, rosyjski, angielski») – красным карандашом от руки «w obie strony» и перед словами
   маленькая двойная стрелка ⇄ тем же карандашом: верхний штрих вправо, нижний влево, наконечники – открытые галочки.
   Надпись – hand/v13-w-obie-strony.svg (docs/papier/hand/make_svg.py, Liu Jian Mao Cao, нарисована в 52px и уменьшена до 27px –
   штрих тонкий, зерно мельче; файл 267.4×66.8, базовая линия 44.06). Стрелка – JC.pen.stroke, перо pencil, 1.4px, тот же красный
   rgba(172,42,26,.88). Всё стоит на одной наклонной линии (−3°): базовая линия надписи на 6px выше базовой линии строки h1 –
   пометка приходится на середину строчных букв заголовка.
   Место: h1 на компьютере в три строки, последняя («rosyjski, angielski») короче второй, а образец «po polsku» справа начинается
   от самой длинной строки + зазор – между «angielski» и образцом остаётся ~240px (1440). Пометка занимает ~195px; правый предел –
   левый край .pp--side минус 14px. Не входит в 27px – 24 и 21px; не входит и так – пометки нет. Только от 1100px. */
JC.v[13] = { en:'“Both ways” by the headline', name:'«w obie strony» у заголовка', at:'main',
  cap:'Сразу за последним словом заголовка («…rosyjski, angielski») – красным карандашом от руки «w obie strony», над словами – двойная стрелка ⇄ тем же карандашом. Польза: одним движением сказано, что переводим и на польский, и с польского. 03.10: надпись крупнее (до 36px), стрелки над ней; на сайте.',
  css:'',
  apply:function(d, b, win){
    setTimeout(function(){
      (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function(){
        if (win.innerWidth < 1100 || d.querySelector('.v13-note')) return;
        var P = JC.pen, h1 = d.querySelector('main h1'); if (!h1) return;
        var r = P.find(d, h1, 'angielski'), ls = r && P.lines(r); if (!ls || !ls.length) return;
        var L = ls[ls.length - 1], end = L.x + L.w, base = L.y + L.h * .779;   /* базовая линия строки: .935 кегля от верха рамки строки (рамка 1.2 кегля) */
        /* правый предел: образец «po polsku» (от 1024px стоит absolute справа от текста), иначе край окна */
        var lim = win.innerWidth - 24, pp = d.querySelector('main .pp--side');
        if (pp && win.getComputedStyle(pp).position === 'absolute') { var pb = P.box(pp); if (pb.x > end && pb.y < L.y + L.h && pb.y + pb.h > L.y) lim = Math.min(lim, pb.x - 14); }
        var W0 = 267.4, H0 = 66.8, B0 = 44.06, FS0 = 52, fs = 0;
        /* 03.10 Грег: «увеличь ещё подпись» и «стрелочки над подписью сделай» – стрелки ⇄ стоят над словами, а не перед ними:
           вся ширина просвета достаётся надписи, кегль – самый крупный из входящих (до 36px, было 27) */
        [36, 33, 30, 27, 24, 21].some(function(f){ if (end + 16 + W0 * f / FS0 <= lim) { fs = f; return true; } return false; });
        if (!fs) return;
        var k = fs / 27, sc = fs / FS0, w = W0 * sc, h = H0 * sc, bl = B0 * sc;
        /* общая наклонная линия пометки: s – вдоль (вправо и чуть вверх, −3°), t – поперёк (вниз); начало – 16px за словом */
        var a = 3 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), Ox = end + 16, Oy = base - 2 + 18;   /* 03.10 Грег: «пониже на 18px» */
        function pt(s, t){ return [Ox + s * ca + t * sa, Oy - s * sa + t * ca]; }
        function f1(n){ return n.toFixed(1); }
        function smooth(q){ var s = 'M' + f1(q[0][0]) + ' ' + f1(q[0][1]);
          for (var i = 0; i < q.length - 1; i++) { var a0 = q[i - 1] || q[i], b0 = q[i], c0 = q[i + 1], e0 = q[i + 2] || c0;
            s += 'C' + f1(b0[0] + (c0[0] - a0[0]) / 6) + ' ' + f1(b0[1] + (c0[1] - a0[1]) / 6) + ' ' + f1(c0[0] - (e0[0] - b0[0]) / 6) + ' ' + f1(c0[1] - (e0[1] - b0[1]) / 6) + ' ' + f1(c0[0]) + ' ' + f1(c0[1]); }
          return s; }
        var R = P.rng(1313);
        function line(s0, s1, t0, bow){ var q = [], n = 6; for (var i = 0; i <= n; i++) { var u = i / n; q.push(pt(s0 + (s1 - s0) * u, t0 + bow * Math.sin(Math.PI * u) + (R() - .5) * .5)); } return smooth(q); }
        /* наконечник – открытая галочка: два коротких штриха сходятся в конце линии; dir = 1 – вправо, −1 – влево */
        function head(s, t, dir){ var tip = pt(s, t), b1 = pt(s - dir * 6.2 * k, t - 3.3 * k), b2 = pt(s - dir * 5.6 * k, t + 3.1 * k);
          return 'M' + f1(b1[0]) + ' ' + f1(b1[1]) + 'L' + f1(tip[0]) + ' ' + f1(tip[1]) + 'L' + f1(b2[0]) + ' ' + f1(b2[1]); }
        /* ⇄: верхний штрих вправо, нижний (чуть сдвинут и длиннее) влево; расстояние между ними ~7px, длина ~30px */
        /* над надписью, по её середине: нижний штрих – на ~.8 кегля над базовой линией (выше выносных b и t), верхний – ещё на 7px·k выше */
        var A = 30 * k, s0 = w / 2 - A / 2, tL = -(fs * .8 + 5), tU = tL - 7.2 * k;
        var ds = [line(s0, s0 + A, tU, -1 * k), head(s0 + A, tU, 1), line(s0 + A + 1.5 * k, s0 + 1.5 * k, tL, .9 * k), head(s0 + 1.5 * k, tL, -1)];
        var st = P.stroke(d, ds, 'pencil', { color:'rgba(172,42,26,.88)', width:1.4 });
        st.show(true);
        /* слова – сразу за «angielski», на наклонной линии; стрелки – над ними */
        var q0 = pt(0, 0);
        if (win.getComputedStyle(d.body).position === 'static') d.body.style.position = 'relative';
        var im = d.createElement('img'); im.className = 'v13-note'; im.src = '/assets/img/papier/v13-w-obie-strony.svg'; im.alt = ''; im.setAttribute('aria-hidden', 'true');
        im.style.cssText = 'position:absolute;z-index:44;pointer-events:none;max-width:none;width:' + f1(w) + 'px;height:' + f1(h) + 'px;left:' + f1(q0[0]) + 'px;top:' + f1(q0[1] - bl) + 'px;transform:rotate(-3deg);transform-origin:0 ' + f1(bl) + 'px';
        d.body.appendChild(im);
      });
    }, 1200);
  } };

/* ---------- вариант 17 (docs/papier-tl/v17.js) ---------- */
/* 17. Что описывает переводчик (неочевидный), 03.10.2026 (Грег: «сделай ещё 25 идей»).
   #przysiegle-czy-zwykle («/ Definicja»), левая колонка: «Tłumacz opisuje w nim wszystko, co widzi: pieczęcie, podpisy, znaki wodne,
   skreślenia». Рядом графитом от руки – две пометки в квадратных скобках, как их пишет сам присяжный переводчик в тексте перевода:
   «[pieczęć okrągła]» и ниже, с отступом, «[podpis nieczytelny]». Это не комментарий к странице, а язык самого документа:
   в присяжном переводе всё, что не текст (печать, подпись, герб, зачёркивание), описывается словами в скобках.
   Надпись – один файл hand/v17-opis-tlumacza.svg (генератор hand/v17-make_svg.py в этой же папке: графит как в v84-make_svg.py,
   строки и «ł» как в v62-make_svg.py, собраны ę ć ą ł; скобки – глифы того же рукописного шрифта; нарисовано в 50px и уменьшено
   до 25px – штрих тонкий; файл 434.4×139.4, базовая линия первой строки 46.25, шаг строк 63).
   Место. Задумано на левом поле у самой фразы, но поле слева на 1440 – 92px, а «[podpis nieczytelny]» в 25px – ~205px:
   – поле слева шире надписи + 40px (окно от ~1770px): пометки на левом поле, правым краем в 24px от текста, первая строка –
     на базовой линии строки «…Tłumacz opisuje w nim wszystko, co widzi:», вторая приходится на строку «pieczęcie, podpisy…»;
   – иначе (1280, 1440): в пустом поле под правой колонкой – левая колонка длиннее на ~7 строк, там свободно ~190px;
     левый край – по левому краю колонки (+2px), верх – в 20px под её последней строкой; поле ниже 100px – пометок нет.
   Подчёркивать «pieczęcie, podpisy» в тексте не стал: в этом же блоке на сайте уже есть красная линия (вариант 3) – две линии
   в одном блоке спорили бы. Наклон −2° от начала первой строки. Только от 1100px. */
JC.v[17] = { en:'Translator’s bracket notes', name:'Что описывает переводчик', at:'#jezyki .lng-note',
  cap:'В блоке «Tłumaczenie Przysięgłe czy zwykłe» графитом от руки – «[pieczęć okrągła]» и ниже «[podpis nieczytelny]», в квадратных скобках. Неочевидный ход: это не комментарий к странице, а язык самого присяжного перевода – именно так, словами в скобках, переводчик описывает в документе печати и подписи, о чём рядом и сказано: «Tłumacz opisuje w nim wszystko, co widzi: pieczęcie, podpisy…». Тот, кто держал в руках перевод, узнаёт эти скобки сразу; кто не держал – видит, из чего набегают знаки на странице. На 1440 поле слева всего 92px, поэтому пометки стоят в пустом поле под правой колонкой, по её левому краю; на широком окне (от ~1770px) – на левом поле у самой фразы.',
  css:'',
  apply:function(d, b, win){
    setTimeout(function(){
      (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function(){
        if (win.innerWidth < 1100 || d.querySelector('.v17-note')) return;
        var P = JC.pen, sec = d.getElementById('przysiegle-czy-zwykle'), cols = sec && sec.querySelector('.ap-cols');
        if (!cols || cols.children.length < 2) return;
        var Lc = cols.children[0], Rc = cols.children[1], lb = P.box(Lc), rb = P.box(Rc);
        var W0 = 434.4, H0 = 139.4, B0 = 46.25, FS0 = 50, fs = 25, sc = fs / FS0, w = W0 * sc, h = H0 * sc, bl = B0 * sc;
        /* низ текста колонки – по последней строке её последнего абзаца */
        function bottom(col){ var ps = col.querySelectorAll('p'); if (!ps.length) return 0;
          var rg = d.createRange(); rg.selectNodeContents(ps[ps.length - 1]); var ls = P.lines(rg), l = ls[ls.length - 1];
          return l ? l.y + l.h : 0; }
        var X = null, Y = null;
        /* 03.10 Грег (широкий экран, пометки стояли на левом поле): «сделай их по правой внизу» – всегда под правой колонкой, левое поле не используется */
        if (false && lb.x >= w + 40) {
          /* широкое окно: левое поле у фразы – первая пометка на базовой линии строки, где начинается фраза */
          var r = P.find(d, Lc, 'Tłumacz opisuje'), pl = r && P.lines(r)[0];
          if (pl) { X = lb.x - 24 - w; Y = pl.y + pl.h * .779 - bl; }
        }
        if (X === null) {
          /* пустое поле под правой колонкой (колонки стоят рядом, левая длиннее) */
          if (rb.x < lb.x + lb.w) return;
          var Lb = bottom(Lc), Rb = bottom(Rc);
          if (!Lb || !Rb || Lb - Rb < 100) return;
          X = rb.x + 2; Y = Rb + 20;
        }
        if (win.getComputedStyle(d.body).position === 'static') d.body.style.position = 'relative';
        var im = d.createElement('img'); im.className = 'v17-note'; im.src = '/assets/img/papier/v17-opis-tlumacza.svg'; im.alt = ''; im.setAttribute('aria-hidden', 'true');
        im.style.cssText = 'position:absolute;z-index:44;pointer-events:none;max-width:none;opacity:.9;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px;left:' + X.toFixed(1) + 'px;top:' + Y.toFixed(1) + 'px;transform:rotate(-2deg);transform-origin:0 ' + bl.toFixed(1) + 'px';
        d.body.appendChild(im);
      });
    }, 1200);
  } };

/* ---------- вариант 19 (docs/papier-tl/v19.js) ---------- */
/* 19. Закладка-язычок «ceny», 03.10.2026 (Грег: «сделай ещё 25 идей»).
   Из правого края окна на уровне плашки цены #cena торчит бумажный язычок-разделитель, как у картонных вкладышей в папке дела:
   сиреневый картон (03.10, Грег: «сделай фиолетового цвета, там было в примерах» – тон анилиновых штампов и лиловой бумаги Impfschein из docs/papier/ref/; было – бледно-мятный) #C7B5E0, внешние (левые) углы скруглены высечкой, верх и низ чуть сходятся, наклон −1,4°. На нём графитом
   от руки «ceny», повёрнуто на 90° (читается снизу вверх, верх букв – к странице): hand/v19-ceny.svg – docs/papier/hand/v84-make_svg.py,
   44px → 28px (крупно нарисовано и уменьшено – штрих тоньше, зерно мельче), multiply – сквозь графит виден картон.
   Фактура – плитка JC.paper (облачность, зерно, редкие ворсинки) в pattern, сверху свет (светлее к верху), светлая кромка высечки
   и волосок контура; тень – мягкая вниз-влево и прижатая у самого картона.
   Место: язычок прижат к правому краю окна (обёртка right:0, overflow:hidden – горизонтальной прокрутки не даёт, 16px картона уходят
   за край), верх – на 40px ниже верха плашки, у кикера и заголовка «Ile kosztuje…». Видимая ширина – 44px при поле ≥ 64px
   (1440: поле 92px, до плашки остаётся 48px); на узком поле (1280: 32px) – 30px, надпись мельче. Высота 128px.
   Кадр – от абзаца карточки второго ряда #dla-kogo (язычок – в середине кадра). Только от 1100px. */
JC.v[19] = { en:'Index tab “ceny”', name:'Закладка-язычок «ceny»', at:'#dla-kogo .ap-doc:nth-child(4) p',
  cap:'Из правого края окна напротив плашки с ценой торчит сиреневый картон (03.10, Грег: «сделай фиолетового цвета, там было в примерах» – тон анилиновых штампов и лиловой бумаги Impfschein из docs/papier/ref/; было – бледно-мятный)ный язычок-разделитель, как в папке дела, на нём графитом от руки «ceny» (повёрнуто на 90°). Польза: при быстрой прокрутке длинной страницы глаз цепляется за закладку и находит место, где цена, – то, ради чего сюда чаще всего возвращаются. Язычок стоит на поле, текста не касается. 03.10: язычок – ссылка на полный прайс /cennik/, при наведении чуть выдвигается.',
  css:'.v19-tab svg{transition:transform .2s ease}.v19-tab:hover svg,.v19-tab:focus-visible svg{transform:translateX(-6px)}' +
      '.v19-tab .v19-hit{pointer-events:auto;cursor:pointer}.v19-tab:focus-visible{outline:2px solid #1F2120;outline-offset:-4px}',
  apply:function(d, b, win){
    setTimeout(function(){
      if (win.innerWidth < 1100) return;
      if (d.querySelector('.v19-tab')) return;
      var NS = 'http://www.w3.org/2000/svg', P = JC.pen, pl = d.querySelector('#cena .gt-card'); if (!pl) return;
      if (win.getComputedStyle(d.body).position === 'static') d.body.style.position = 'relative';
      var pb = P.box(pl), iw = d.documentElement.clientWidth || win.innerWidth, gap = iw - (pb.x + pb.w);
      var vis = Math.max(30, Math.min(44, gap - 20)), TH = 128, HID = 16, TW = vis + HID;   /* видимая ширина, высота, часть за краем окна */
      var PADL = 40, PADT = 22, WW = vis + PADL, HH = TH + PADT + 30;                      /* поля обёртки под тень и наклон */
      /* 03.10 Грег: «19 сделай кликабельной ссылкой» – язычок – ссылка на полный прайс /cennik/: нажимается только сам картон
         (обёртка с полями под тень клики пропускает), при наведении выдвигается на 6px, с клавиатуры – обычная ссылка с подписью */
      var w = d.createElement('a'); w.className = 'v19-tab'; w.href = '/cennik/'; w.setAttribute('aria-label', 'Cennik – wszystkie ceny');
      w.style.cssText = 'position:absolute;z-index:44;pointer-events:none;overflow:hidden;right:0;top:' + (pb.y + 40 - PADT).toFixed(1) + 'px;width:' + WW + 'px;height:' + HH + 'px';
      /* контур язычка (0,0 – левый верхний угол): правый край уходит за окно; внешние углы скруглены, верх и низ чуть сходятся */
      var tab = 'M' + TW + ' 0L12 1.6Q1.8 2.4 1.4 12.4L0 ' + (TH - 13) + 'Q.6 ' + (TH - 2.2) + ' 11 ' + (TH - 1.6) + 'L' + TW + ' ' + (TH - .2) + 'Z';
      /* надпись: файл 95.6×47 (44px), строчные занимают по высоте 6.8…26.8, хвост «y» – до 41; середина по высоте букв – y = 20.
         Точка (47.8, 20) файла встаёт в центр видимой части язычка, поворот −90° (читается снизу вверх). */
      var sc = .64 * Math.min(1, (vis - 6) / 34), cxv = vis / 2 + 1.5, cyv = TH / 2 + 1;
      var s = d.createElementNS(NS, 'svg'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      s.setAttribute('width', WW + HID); s.setAttribute('height', HH); s.setAttribute('viewBox', '0 0 ' + (WW + HID) + ' ' + HH);
      s.style.cssText = 'position:absolute;left:0;top:0;display:block;overflow:visible';
      s.innerHTML = '<defs>' +
        '<clipPath id="v19c"><path d="' + tab + '"/></clipPath>' +
        '<linearGradient id="v19l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".45" stop-color="#fff" stop-opacity=".04"/>' +
          '<stop offset="1" stop-color="#1F2120" stop-opacity=".06"/></linearGradient>' +
        /* у самого края окна картон чуть темнее – уходит под лист */
        '<linearGradient id="v19e" gradientUnits="userSpaceOnUse" x1="' + (vis - 12) + '" y1="0" x2="' + vis + '" y2="0"><stop offset="0" stop-color="#1F2120" stop-opacity="0"/><stop offset="1" stop-color="#1F2120" stop-opacity=".07"/></linearGradient>' +
        '<pattern id="v19t" patternUnits="userSpaceOnUse" width="256" height="256"><image id="v19ti" width="256" height="256"/></pattern>' +
        '<filter id="v19s1" x="-60%" y="-20%" width="220%" height="150%"><feDropShadow dx="-.8" dy="2.4" stdDeviation="2.4" flood-color="#1F2120" flood-opacity=".2"/></filter>' +
        '<filter id="v19s2" x="-30%" y="-10%" width="160%" height="125%"><feDropShadow dx="-.2" dy=".7" stdDeviation=".5" flood-color="#1F2120" flood-opacity=".26"/></filter>' +
        '</defs>' +
        '<g transform="translate(' + PADL + ' ' + PADT + ') rotate(-1.4 ' + TW + ' ' + (TH / 2) + ')">' +
          '<g filter="url(#v19s1)"><g filter="url(#v19s2)">' +
            '<path class="v19-hit" d="' + tab + '" fill="#C7B5E0"/>' +
            /* в группе с клипом заливка повторена: если клип изолирует группу, multiply надписи смешивается с картоном, а не с пустотой */
            '<g clip-path="url(#v19c)">' +
              '<rect width="' + TW + '" height="' + TH + '" fill="#C7B5E0"/>' +
              '<rect id="v19tr" width="' + TW + '" height="' + TH + '" fill="url(#v19t)" opacity="0"/>' +
              '<rect width="' + TW + '" height="' + TH + '" fill="url(#v19l)"/>' +
              '<rect width="' + TW + '" height="' + TH + '" fill="url(#v19e)"/>' +
              /* светлая кромка высечки изнутри */
              '<path d="' + tab + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.2"/>' +
              '<image href="/assets/img/papier/v19-ceny.svg" width="95.6" height="47" style="mix-blend-mode:multiply" opacity=".92" ' +
                'transform="translate(' + cxv.toFixed(2) + ' ' + cyv.toFixed(2) + ') rotate(-90) scale(' + sc.toFixed(3) + ') translate(-47.8 -20)"/>' +
            '</g>' +
            /* волосок контура – картон не теряется на светлой странице */
            '<path d="' + tab + '" fill="none" stroke="#1F2120" stroke-opacity=".16" stroke-width=".6"/>' +
          '</g></g>' +
        '</g>';
      w.appendChild(s); d.body.appendChild(w);
      /* фактура картона: облачность, зерно, редкие ворсинки (плитка JC.paper поверх мятного) */
      if (JC.paper) JC.paper(win, { seed:191, size:256, cloud:.035, grain:.045, fibers:[{ n:26, len:[3, 22], w:[.3, .6], dark:[.07, .16], light:[.3, .55], share:.55, curl:.7 }] }, function(u){
        var im = s.querySelector('#v19ti'), tr = s.querySelector('#v19tr'); if (!im || !tr) return;
        im.setAttribute('href', u); im.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', u); tr.setAttribute('opacity', '1'); });
    }, 1200);
  } };

/* ---------- вариант 20 (docs/papier-tl/v20.js) ---------- */
/* 20. Отрывной край, 03.10.2026 (Грег: «сделай ещё 25 идей»).
   Охристая плашка #zamow-start .bg-terra («Wyślij zdjęcie – wycena w 15 minut») – как талон, оторванный от корешка по перфорации.
   Верхний край – линия отрыва во всю ширину: круглые отверстия ⌀5px через 11px, разрыв прошёл по ним – от отверстий остались
   полукруглые выемки, перемычки между ними порваны неровно (зубцы до ±1px, изредка торчит волокно или вырван кусочек).
   В двух местах (≈17% и ≈69% ширины, 6 и 3 отверстия) разрыв ушёл выше линии: там отверстия целые, над ними – полоска корешка
   с рваным краем. Верхние углы поэтому прямые (линия отрыва идёт от края до края), нижние – прежние, 26px.
   Сделано маской плашки (svg, evenodd: контур + целые отверстия) – сквозь выемки и отверстия видна бумага страницы; линия отрыва
   на 7px ниже прежнего верха (над ней место для корешка), до заголовка остаётся 41px. На изломе перемычек и корешка – светлая
   бумага (охра напечатана по белому листу): тонкие белые штрихи внутри плашки (svg .v20-rim), по круглым вырубкам их нет.
   У плашки своей маски нет (рваный край сайта – только у серых плашек). Кадр – от последнего абзаца левой колонки «Definicja»
   (как у 7). Только от 1100px. */
JC.v[20] = { en:'Tear-off perforation', name:'Отрывной край', at:'#przysiegle-czy-zwykle .ap-cols > div:first-child > p:last-child',
  cap:'Верхний край охристой плашки «Wyślij zdjęcie – wycena w 15 minut» – линия отрыва, как у талона или квитанции: ряд полукруглых выемок от перфорации, перемычки между ними порваны чуть неровно, в двух местах разрыв ушёл выше и отверстия остались целыми; на изломе видна светлая бумага. Верхние углы стали прямыми – линия отрыва идёт от края до края. Польза: плашка с заказом читается как отрывной талон – то, что берут и уносят с собой, поэтому взгляд на ней задерживается, а кнопки воспринимаются как следующий шаг.',
  css:'.v20-rim{position:absolute;left:0;top:0;pointer-events:none}',
  apply:function(d, b, win){
    setTimeout(function(){
      if (win.innerWidth < 1100) return;
      var NS = 'http://www.w3.org/2000/svg', pl = d.querySelector('#zamow-start .bg-terra'); if (!pl || pl.querySelector('.v20-rim')) return;
      var W = pl.offsetWidth, H = pl.offsetHeight, r = parseFloat(win.getComputedStyle(pl).borderBottomLeftRadius) || 26;
      if (W < 400 || H < 120) return;
      var R = JC.pen.rng(201), base = 7, hr = 2.5, pitch = 11;
      var n = Math.floor((W - 2 * (hr + 4)) / pitch), off = (W - n * pitch) / 2;   /* отверстия: off + i·pitch, i = 0…n */
      /* где разрыв ушёл выше линии: два участка */
      var s1 = Math.round(n * .17), s2 = Math.round(n * .69);
      function stub(i){ return (i >= s1 && i < s1 + 6) || (i >= s2 && i < s2 + 3); }
      /* высота корешка над линией – плавный шум по x, от 0,9 до base − hr − 1,2 (над целым отверстием остаётся бумага) */
      var g = []; for (var k = 0; k < 40; k++) g.push(R());
      function sy(x){ var u = x / 17, i = Math.floor(u) % 39, f = u - Math.floor(u); f = f * f * (3 - 2 * f); var v = g[i] * (1 - f) + g[i + 1] * f;
        return Math.max(.9, Math.min(base - hr - 1.2, 2.1 - (v - .5) * 3)); }
      var top = [], rims = [], holes = '', px = 0, py = base + (R() - .5) * 1.2, i, j;
      top.push([px, py]);
      /* рваный участок от текущей точки до (x1, y1): мелкие зубцы, изредка волокно вверх или вырванный кусочек */
      function jag(x1, y1, amp, cap){
        var dx = x1 - px, m = Math.max(1, Math.round(Math.abs(dx) / 1.5)), seg = [[px, py]], odd = R() < .2 ? Math.floor(R() * m) : -1;
        for (var q = 1; q < m; q++) { var t = q / m, e = (R() - .5) * amp;
          if (q === odd) e += (R() < .6 ? -1 : 1) * (.8 + R() * .9);
          /* cap – ниже этой высоты край корешка не опускается (иначе заденет целое отверстие под ним) */
          var p = [px + dx * t + (R() - .5) * .5, Math.max(.3, Math.min(cap || 1e9, py + (y1 - py) * t + e))]; top.push(p); seg.push(p); }
        top.push([x1, y1]); seg.push([x1, y1]); rims.push(seg); px = x1; py = y1;
      }
      /* выемка – нижняя часть отверстия: от левой точки кромки через низ к правой (угол убывает от π − a1 до a2) */
      function notch(cx, d1, d2){
        var a1 = Math.asin(d1 / hr), a2 = Math.asin(d2 / hr), f1 = Math.PI - a1, f2 = a2, K = 9;
        jag(cx + Math.cos(f1) * hr, base + Math.sin(f1) * hr, 1.1);
        for (var q = 1; q <= K; q++) { var f = f1 + (f2 - f1) * q / K; top.push([cx + Math.cos(f) * hr, base + Math.sin(f) * hr]); }
        px = cx + Math.cos(f2) * hr; py = base + Math.sin(f2) * hr;
      }
      for (i = 0; i <= n; i++) {
        var cx = off + i * pitch;
        if (stub(i)) {
          /* корешок: край идёт над отверстием, само отверстие целое */
          if (!stub(i - 1)) jag(cx - pitch * .5 + (R() - .5), sy(cx - pitch * .5), .5);
          jag(cx + pitch * .5 - (stub(i + 1) ? 0 : 1 + R()), sy(cx + pitch * .5), .8, base - hr - .8);
          holes += 'M' + (cx + hr).toFixed(2) + ' ' + base + 'A' + hr + ' ' + hr + ' 0 1 0 ' + (cx - hr).toFixed(2) + ' ' + base + 'A' + hr + ' ' + hr + ' 0 1 0 ' + (cx + hr).toFixed(2) + ' ' + base + 'Z';
        } else notch(cx, (R() - .5) * hr * .9, (R() - .5) * hr * .9);
      }
      jag(W, base + (R() - .5) * 1.2, 1.1);
      var path = 'M' + top.map(function(p){ return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join('L') +
        'L' + W + ' ' + (H - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (W - r) + ' ' + H + 'L' + r + ' ' + H + 'A' + r + ' ' + r + ' 0 0 1 0 ' + (H - r) + 'Z' + holes;
      var svg = '<svg xmlns="' + NS + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><path fill-rule="evenodd" d="' + path + '" fill="#000"/></svg>';
      var url = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
      pl.style.webkitMaskImage = url; pl.style.maskImage = url; pl.style.webkitMaskSize = '100% 100%'; pl.style.maskSize = '100% 100%';
      pl.style.webkitMaskRepeat = 'no-repeat'; pl.style.maskRepeat = 'no-repeat';
      /* верхние углы плашки – прямые: скругление фона убрано, иначе угол линии отрыва остался бы срезанным дугой */
      pl.style.borderTopLeftRadius = '0'; pl.style.borderTopRightRadius = '0';
      /* светлая бумага на изломе: штрих вдоль рваных участков, сдвинут на 0,6px внутрь плашки (снаружи его срезает маска) */
      if (win.getComputedStyle(pl).position === 'static') pl.style.position = 'relative';
      var rim = d.createElementNS(NS, 'svg'); rim.setAttribute('class', 'v20-rim'); rim.setAttribute('aria-hidden', 'true'); rim.setAttribute('focusable', 'false');
      rim.setAttribute('width', W); rim.setAttribute('height', 16); rim.setAttribute('viewBox', '0 0 ' + W + ' 16');
      var rd = rims.filter(function(sg){ return sg.length > 1; }).map(function(sg){ return 'M' + sg.map(function(p){ return p[0].toFixed(2) + ' ' + (p[1] + .6).toFixed(2); }).join('L'); }).join('');
      rim.innerHTML = '<path d="' + rd + '" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + rd + '" transform="translate(0 1.4)" fill="none" stroke="#1F2120" stroke-opacity=".06" stroke-width="1" stroke-linecap="round"/>';
      pl.insertBefore(rim, pl.firstChild);
    }, 1200);
  } };

  var GATE = {3:1100, 8:1100, 13:1100, 17:1100, 19:1100, 20:1100}, ONCE = [], css = '';
  Object.keys(GATE).forEach(function(n){ if (JC.v[n] && JC.v[n].css) css += JC.v[n].css; });
  if (css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  function run(time){
    if (time > 1) Array.prototype.forEach.call(document.querySelectorAll('.v8-ht, .v13-note, .v17-note, .v19-tab, .v20-rim'), function(e){ e.remove(); });
    Object.keys(GATE).forEach(function(n){ if (window.innerWidth >= GATE[n] && JC.v[n]) { if (time > 1 && ONCE.indexOf(+n) >= 0) return; try { JC.v[n].apply(document, document.body, window); } catch (e) {} } });
  }
  window.PAPIER_EXTRA = run;
  if (P.went) run(1);
})();

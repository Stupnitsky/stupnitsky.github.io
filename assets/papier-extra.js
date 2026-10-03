/* assets/papier-extra.js – СОБРАНО docs/papier/build-extra.py из вариантов стенда docs/papier (v59.js, v62.js, v68.js, v69.js, v89.js). Руками не править:
   менять варианты на стенде и пересобирать. Только страница html.papier[data-papier="apostille"], после assets/papier.js. */
(function(){
  var html = document.documentElement;
  if (!html.classList.contains('papier') || (html.getAttribute('data-papier') || 'apostille') !== 'apostille') return;
  try { if (window.top !== window && /\/docs\/papier(-tl)?\//.test(window.parent.location.pathname)) return; } catch (e) {}
  var P = window.PAPIER; if (!P) return;
  /* JC – прокладка: бумагу уже кладёт papier.js (JC.v[51] – пустышка), штрихи рисует его penStroke */
  var JC = { v:{ 51:{ apply:function(){} } }, STATIC:true,
    pen:{ rng:P.rng, find:P.find, lines:P.lines, box:P.box, stroke:function(d, ds, kind, o){ P.stroke(ds, kind, o); return { show:function(){}, el:null }; } },
    paper:function(win, o, cb){ P.paper(o, cb); }, pp:{ F:{ fine:P.fine } } };
/* ---------- помощник (docs/papier/v88.js) ---------- */
/* 88–90. Растр в блоке цен первого экрана (.gt--cn: 260 / 120 / 550 / 90) – 03.10.2026, Грег: «добавь здесь халфтон, подумай, как лучше».
   Общее – JC.HT в этом файле: точки растра по маске цифр. Маска рисуется на canvas тем же шрифтом, что у цифры (computed font,
   letter-spacing), базовая линия – верх строки текста (Range) + fontBoundingBoxAscent; точки – сетка под 45°, размер точки =
   покрытие глифа × плавный шум (как в 68, который Грег назвал «отлично»). Цифры крутит app.js – растр перерисовывается за ними (JC.HTlive). */
(function(){
  /* растровая копия текста элемента el: { dx, dy (в em), step, color, scale (размер копии), noise, host, z } → canvas */
  JC.HT = function(d, win, el, o){
    o = o || {};
    var tn = el.firstChild; while (tn && tn.nodeType !== 3) tn = tn.nextSibling; if (!tn) return null;
    var cs = win.getComputedStyle(el), fs = parseFloat(cs.fontSize), sc = o.scale || 1;
    var font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + (fs * sc).toFixed(2) + 'px ' + cs.fontFamily;
    var ls = parseFloat(cs.letterSpacing) || 0, txt = tn.data.replace(/\s+/g, '');
    var rg = d.createRange(); rg.selectNodeContents(tn); var tr = rg.getBoundingClientRect(), er = el.getBoundingClientRect();
    var m = d.createElement('canvas').getContext('2d'); m.font = font; try { m.letterSpacing = (ls * sc).toFixed(2) + 'px'; } catch (e) {}
    var tm = m.measureText(txt), asc = tm.fontBoundingBoxAscent || fs * sc * .935, pad = Math.ceil(fs * sc * .12);
    var w = Math.ceil(tm.width + pad * 2), h = Math.ceil((tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent || fs * sc * 1.2) + pad * 2);
    var mc = d.createElement('canvas'); mc.width = w; mc.height = h;
    var mx = mc.getContext('2d'); mx.font = font; try { mx.letterSpacing = (ls * sc).toFixed(2) + 'px'; } catch (e) {}
    mx.fillStyle = '#000'; mx.textBaseline = 'alphabetic';
    /* цифры у сайта табличные (tnum), canvas их не умеет – каждый знак ставим в его клетку из DOM (Range по знаку), по центру клетки */
    var raw = tn.data, pos = 0;
    for (var ci = 0; ci < raw.length; ci++) { var ch = raw[ci]; if (/\s/.test(ch)) continue;
      var r1 = d.createRange(); r1.setStart(tn, ci); r1.setEnd(tn, ci + 1); var cb = r1.getBoundingClientRect();
      var adv = m.measureText(ch).width, cxp = (cb.left - tr.left) * sc + (cb.width * sc - adv) / 2;
      mx.fillText(ch, pad + cxp, pad + asc); pos++; }
    var A = mx.getImageData(0, 0, w, h).data;
    function cov(x, y){ var s = 0, X0 = Math.round(x), Y0 = Math.round(y);
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var X = X0 + dx, Y = Y0 + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) s += A[(Y * w + X) * 4 + 3]; }
      return s / 9 / 255; }
    var R = JC.pen.rng(o.seed || 88);
    function grid(c){ var nx = Math.ceil(w / c) + 2, ny = Math.ceil(h / c) + 2, g = []; for (var i = 0; i < nx * ny; i++) g.push(R());
      return function(x, y){ var u = x / c, v = y / c, i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        i = Math.max(0, Math.min(nx - 2, i)); j = Math.max(0, Math.min(ny - 2, j));
        var a = g[j * nx + i], b = g[j * nx + i + 1], c2 = g[(j + 1) * nx + i], e = g[(j + 1) * nx + i + 1];
        return a + (b - a) * fx + (c2 - a) * fy + (a - b - c2 + e) * fx * fy; }; }
    var g1 = grid(60), g2 = grid(20), nz = o.noise == null ? .6 : o.noise;
    var k = 2, cv = d.createElement('canvas'); cv.width = w * k; cv.height = h * k;
    var cx = cv.getContext('2d'); cx.scale(k, k); cx.fillStyle = o.color || 'rgba(46,49,48,.3)';
    var S = o.step || 5, ca = Math.cos(Math.PI / 4), sa = Math.sin(Math.PI / 4), D = Math.ceil(Math.hypot(w, h) / S / 2) + 2;
    for (var i = -D; i <= D; i++) for (var j = -D; j <= D; j++) {
      var x = w / 2 + (i * ca - j * sa) * S, y = h / 2 + (i * sa + j * ca) * S;
      if (x < -S || y < -S || x > w + S || y > h + S) continue;
      var c = cov(x, y); if (c < .03) continue;
      var t = c * ((1 - nz) + nz * (.7 * g1(x, y) + .3 * g2(x, y))), r = S * .5 * Math.sqrt(t);
      if (r < .3) continue;
      cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
    }
    /* место: левый край текста и базовая линия; копия в scale раз крупнее – растёт от середины текста */
    var host = o.host || el, hr = host.getBoundingClientRect();
    var bx = tr.left - hr.left - pad, by = tr.top - hr.top + (tm.fontBoundingBoxAscent ? 0 : 0) - pad;
    if (sc !== 1) { bx -= (w - 2 * pad - tr.width) / 2; by -= (h - 2 * pad - tr.height) / 2; }
    cv.className = 'v88-ht'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;pointer-events:none;z-index:' + (o.z == null ? -1 : o.z) + ';width:' + w + 'px;height:' + h + 'px;left:' + (bx + (o.dx || 0) * fs).toFixed(1) + 'px;top:' + (by + (o.dy || 0) * fs).toFixed(1) + 'px';
    host.appendChild(cv); return cv;
  };
  /* то же, но перерисовывается, когда app.js крутит цифры (MutationObserver, раз в 60 мс) */
  JC.HTlive = function(d, win, el, o){
    var cv = JC.HT(d, win, el, o), t = 0;
    new win.MutationObserver(function(){ clearTimeout(t); t = setTimeout(function(){ if (cv) cv.remove(); cv = JC.HT(d, win, el, o); }, 60); })
      .observe(el, { characterData:true, childList:true, subtree:true });
  };
  JC.HTrun = function(d, win, fn){
    setTimeout(function(){
      var n0 = d.querySelector('main .gt--cn .gt-n'); if (!n0) return;
      var cs = win.getComputedStyle(n0), f = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      (d.fonts && d.fonts.load ? d.fonts.load(f) : Promise.resolve()).then(fn, fn);
    }, 1100);
  };

  JC.v[88] = { en:'Halftone shadow under prices', name:'Растровая тень цен', at:'main',
    cap:'У каждой цифры первого экрана (260 / 120 / 550 / 90) – растровая тень: копия числа точками графита, сдвинутая вправо-вниз, как второй прогон печати со сбоем приводки. Точки по форме цифр, разного размера. Сплошные чёрные цифры становятся «напечатанными», читаемость та же – тень под ними, над серой полосой.',
    css:'', apply:function(d, b, win){
      JC.v[51].apply(d, b, win);
      JC.HTrun(d, win, function(){
        Array.prototype.forEach.call(d.querySelectorAll('main .gt--cn .gt-n'), function(n, i){ JC.HTlive(d, win, n, { dx:.055, dy:.05, step:5, color:'rgba(46,49,48,.34)', noise:.5, seed:880 + i }); });
      });
    } };
})();

/* ---------- вариант 59 (docs/papier/v59.js) ---------- */
/* 59. Загнутый уголок у плашки #ile-trwa (02.10.2026, Грег: «на базе 51 – фактуры, пару акцентов для настроения»).
   Правый нижний угол плашки «Ile trwa i ile kosztuje» отогнут: сам угол срезан маской (к маске рваного края из 51 добавлен
   clipPath со срезом – край остаётся рваным), на плашке лежит уголок изнанки – светлее, своя фактура.
   03.10 Грег: «попробуй более неровно завернуть уголок». Сгиб не под 45° (по правому краю короче, по нижнему длиннее, ~36°),
   линия сгиба выгнута наружу и чуть дрожит (не прессованный сгиб, а мягкий); уголок – отражение срезанного угла через сгиб,
   но кончик приподнят: к кончику уголок укорочен (ракурс) и чуть провёрнут, края от этого слегка выгнуты; края уголка неровные –
   местами мягкие, местами рваные со светлыми волокнами. Свет по завитку: светлое ребро у сгиба, тень изгиба, к кончику светлее.
   Полоски верже изнанки повернуты так, как их развернул сгиб (угол 2φ от направления сгиба). Тень под уголком растёт к кончику
   (у сгиба – прижатая и резкая, у кончика – мягкая и дальше), вдоль выгнутого сгиба – тень толщины листа на бумагу страницы.
   Размер уголка уменьшается, если уголок или срез задевают текст плашки. */
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  /* плитка изнанки: горизонтальные линии верже через 5px (как у плашки; поворачивает patternTransform), зерно; 255 кратно 5 – без шва */
  function v59tile(win, cb){
    var S = 255, k = 2, cv = win.document.createElement('canvas'); cv.width = cv.height = S * k;
    var cx = cv.getContext('2d'), R = JC.pen.rng(591), im = cx.createImageData(S * k, S * k), a = im.data;
    for (var i = 0; i < a.length; i += 4) { var v = (R() - .5) * .1;
      if (v > 0) { a[i] = a[i + 1] = a[i + 2] = 255; a[i + 3] = v * 255; } else { a[i] = 31; a[i + 1] = 33; a[i + 2] = 32; a[i + 3] = -v * 255; } }
    cx.putImageData(im, 0, 0); cx.setTransform(k, 0, 0, k, 0, 0);
    for (var y = 0; y < S; y += 5) { cx.fillStyle = 'rgba(31,33,32,.035)'; cx.fillRect(0, y, S, .73); cx.fillStyle = 'rgba(255,255,255,.08)'; cx.fillRect(0, y + .97, S, .6); }
    if (cv.toBlob) cv.toBlob(function(b){ cb(win.URL.createObjectURL(b), S); }, 'image/png');
  }
  /* одномерный value-noise по длине len с ячейкой cell, сглаженный */
  function vn(R, len, cell){ var n = Math.max(2, Math.round(len / cell)), g = []; for (var i = 0; i <= n; i++) g.push(R());
    return function(t){ var x = Math.max(0, Math.min(1, t / len)) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; f = f * f * (3 - 2 * f); return g[i] * (1 - f) + g[i + 1] * f; }; }
  function inPoly(x, y, P){ var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
    var a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function dstr(P, close){ return 'M' + P.map(function(p){ return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join('L') + (close ? 'Z' : ''); }

  /* геометрия уголка в координатах плашки (0..W, 0..H) для размера s */
  function geom(W, H, r, s){
    var R = JC.pen.rng(593), sx = s * 1.17, sy = s * .83, P1 = [W, H - sy], P2 = [W - sx, H];
    var L = Math.hypot(sx, sy), ux = -sx / L, uy = sy / L, nx = sy / L, ny = sx / L; /* u – вдоль сгиба от P1 к P2, n – к углу */
    var fold = [], N = Math.max(24, Math.round(L / 1.5)), w1 = vn(R, L, 9), w2 = vn(R, L, 3.5);
    for (var i = 0; i <= N; i++) { var t = i / N, x0 = P1[0] + ux * L * t, y0 = P1[1] + uy * L * t;
      /* выгиб наружу, вершина ближе к правому краю; дрожь до ±0,7px, к концам сходит на нет */
      var o = L * .05 * Math.sin(Math.PI * Math.pow(t, .78)) + ((w1(t * L) - .5) * 1.1 + (w2(t * L) - .5) * .4) * Math.pow(Math.sin(Math.PI * t), .6);
      fold.push([x0 + nx * o, y0 + ny * o, 0]); }
    /* контур срезанного угла: от P2 по нижнему краю, дуга скругления, вверх по правому до P1 */
    var src = [], q;
    for (q = P2[0]; q < W - r; q += 1.5) src.push([q, H]);
    for (q = 0; q < Math.PI / 2 * r; q += 1.5) { var a = Math.PI / 2 - q / r; src.push([W - r + Math.cos(a) * r, H - r + Math.sin(a) * r]); }
    for (q = H - r; q > P1[1]; q -= 1.5) src.push([W, q]);
    src.push([P1[0], P1[1]]);
    var dmax = 0; src.forEach(function(p){ dmax = Math.max(dmax, (p[0] - P1[0]) * nx + (p[1] - P1[1]) * ny); });
    /* отражение через хорду сгиба + подъём кончика: к кончику короче (ракурс) и провёрнут вдоль сгиба */
    var out = src.map(function(p){
      var px = p[0] - P1[0], py = p[1] - P1[1], al = px * ux + py * uy, d = px * nx + py * ny, k = Math.max(0, d / dmax);
      var f = 1 - .14 * Math.pow(k, 1.5), tw = 3.2 * k * k;
      return [P1[0] + ux * (al + tw) - nx * d * f, P1[1] + uy * (al + tw) - ny * d * f, k]; });
    /* неровный край уголка: мягкая волна везде, рваные участки по воротам шума (там глубже и с дрожью) */
    var M = out.length, e1 = vn(R, M, 14), e2 = vn(R, M, 4), gt = vn(R, M, 16), torn = [], gs = [];
    for (i = 0; i < M; i++) gs.push(gt(i)); gs.sort(function(x, y){ return x - y; });
    var th = gs[Math.floor(M * .55)]; /* рваные – ~45% края, остальное мягкое */
    for (i = 1; i < M - 1; i++) { var p = out[i], pa = out[i - 1], pb = out[i + 1], tx = pb[0] - pa[0], ty = pb[1] - pa[1], tl = Math.hypot(tx, ty) || 1;
      var end = Math.min(1, i / 5, (M - 1 - i) / 5), g = Math.max(0, Math.min(1, (gt(i) - th) / .06)), tr = g * g * (3 - 2 * g);
      var off = end * ((e1(i) - .5) * 1.1 + tr * ((e2(i) - .5) * 1.8 + (R() - .5) * .9));
      p[0] += ty / tl * off; p[1] += -tx / tl * off; torn.push(tr); }
    torn.unshift(0); torn.push(0);
    var flap = fold.concat(out.slice(1, -1)); /* P1 → по сгибу → P2 → край → кончик → край → P1 (out начинается у P2 и кончается у P1) */
    var cut = fold.concat([[W, H, 0]]);
    var tip = out.reduce(function(m, p){ return p[2] > m[2] ? p : m; }, out[0]);
    return { s:s, P1:P1, P2:P2, L:L, ux:ux, uy:uy, nx:nx, ny:ny, fold:fold, out:out, torn:torn, flap:flap, cut:cut, tip:tip, dmax:dmax * .86 };
  }

  /* срез угла в маске плашки: в svg-маску рваного края (51) добавляется clipPath по выгнутому сгибу; если маски нет – своя */
  function v59cut(pl, W, H, G, r){
    var mi = pl.style.maskImage || pl.style.webkitMaskImage || '', m = /url\(["']?data:image\/svg\+xml;charset=utf-8,([^"']*)["']?\)/.exec(mi), svg = '';
    var poly = 'M0 0H' + W + 'V' + G.P1[1].toFixed(2) + G.fold.map(function(p){ return 'L' + p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join('') + 'H0Z';
    if (m) { try { svg = decodeURIComponent(m[1]); } catch (e) { svg = ''; } }
    if (svg && svg.indexOf('<path ') > 0) svg = svg.replace('<path ', '<defs><clipPath id="v59c"><path d="' + poly + '"/></clipPath></defs><path clip-path="url(#v59c)" ');
    else svg = '<svg xmlns="' + NS + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs><clipPath id="v59c"><path d="' + poly + '"/></clipPath></defs>' +
      '<rect clip-path="url(#v59c)" width="' + W + '" height="' + H + '" rx="' + r + '" fill="#000"/></svg>';
    var url = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
    pl.style.webkitMaskImage = url; pl.style.maskImage = url; pl.style.webkitMaskSize = '100% 100%'; pl.style.maskSize = '100% 100%';
    pl.style.webkitMaskRepeat = 'no-repeat'; pl.style.maskRepeat = 'no-repeat';
  }

  JC.v[59] = { en:'Dog-eared corner', name:'Загнутый уголок', at:'#ile-trwa',
    cap:'Правый нижний угол плашки «Ile trwa i ile kosztuje» загнут, как у листа, который часто открывали. 03.10 – неровнее: сгиб не под 45° и чуть выгнут, кончик приподнят (уголок к нему короче и провёрнут), края местами мягкие, местами рваные со светлыми волокнами; у сгиба светлое ребро и тень изгиба, полоски верже на изнанке повернуты сгибом, тень под уголком растёт к кончику. Плашка с ценами читается как самая «зачитанная» страница дела – туда возвращаются, чтобы свериться с суммой.',
    css:'', apply:function(d, b, win){
      JC.v[51].apply(d, b, win);
      setTimeout(function(){
        var pl = d.querySelector('#ile-trwa .gt-card') || d.querySelector('#ile-trwa .pp-sand'); if (!pl) return;
        var W = pl.offsetWidth, H = pl.offsetHeight, r = parseFloat(win.getComputedStyle(pl).borderBottomRightRadius) || 26, pr = pl.getBoundingClientRect();
        /* размер: до 70px; если уголок или срез (с полем 6px) задевают текст плашки – меньше, но не меньше 40px */
        var boxes = [];
        Array.prototype.forEach.call(pl.querySelectorAll('.gt-l, .gt-n, .gt-note, .gt-btn, p, h2, button'), function(el){
          var q = el.getBoundingClientRect(); if (q.width && q.height) boxes.push([q.left - pr.left - 6, q.top - pr.top - 6, q.right - pr.left + 6, q.bottom - pr.top + 6]); });
        function hits(G){ var P = G.flap.concat(G.cut), x0 = 1e9, y0 = 1e9;
          P.forEach(function(p){ x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); });
          return boxes.some(function(q){ if (q[2] < x0 || q[3] < y0) return false;
            for (var y = Math.max(q[1], y0); y <= Math.min(q[3], H); y += 3) for (var x = Math.max(q[0], x0); x <= Math.min(q[2], W); x += 3)
              if (inPoly(x, y, G.flap) || inPoly(x, y, G.cut)) return true;
            return false; }); }
        var s = 70, G = geom(W, H, r, s); while (s > 40 && hits(G)) { s -= 2; G = geom(W, H, r, s); }
        v59cut(pl, W, H, G, r);

        /* рамка svg – по уголку, тени и срезу с запасом */
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        G.flap.concat(G.cut).forEach(function(p){ x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
        x0 -= 18; y0 -= 14; x1 += 10; y1 += 18;
        var sv = d.createElementNS(NS, 'svg'); sv.setAttribute('aria-hidden', 'true'); sv.setAttribute('class', 'papier-x59');
        sv.setAttribute('width', (x1 - x0).toFixed(1)); sv.setAttribute('height', (y1 - y0).toFixed(1));
        sv.setAttribute('viewBox', x0.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + (x1 - x0).toFixed(2) + ' ' + (y1 - y0).toFixed(2));
        sv.style.cssText = 'position:absolute;z-index:44;pointer-events:none;overflow:visible;left:' + (pr.left + win.scrollX + x0).toFixed(1) + 'px;top:' + (pr.top + win.scrollY + y0).toFixed(1) + 'px';

        var fd = dstr(G.fold), flapD = dstr(G.flap, true);
        function offs(k){ var n = G.fold.length - 1; return dstr(G.fold.map(function(p, i){ var e = k * Math.min(1, i / 5, (n - i) / 5); return [p[0] + G.nx * e, p[1] + G.ny * e]; })); }
        /* тень под уголком: точки уголка сдвинуты вниз-влево пропорционально подъёму (у сгиба – 0) */
        function shade(dx, dy, pw){ return dstr(G.flap.map(function(p){ var k = Math.pow(p[2], pw); return [p[0] + dx * k, p[1] + dy * k]; }), true); }
        /* свет по завитку – поперёк хорды сгиба: от середины сгиба к кончику */
        var mx = (G.P1[0] + G.P2[0]) / 2, my = (G.P1[1] + G.P2[1]) / 2, ex = mx - G.nx * G.dmax, ey = my - G.ny * G.dmax;
        /* полоски верже на изнанке: горизонталь, отражённая через сгиб, идёт под углом 2φ */
        var ang = 2 * Math.atan2(G.uy, G.ux) * 180 / Math.PI;
        /* рваные участки края – светлые волокна */
        var rims = [], cur = null;
        G.out.forEach(function(p, i){ if (G.torn[i] > .25) { if (!cur) rims.push(cur = []); cur.push(p); } else cur = null; });
        var rimD = rims.filter(function(a){ return a.length > 3; }).map(function(a){ return dstr(a); }).join('');

        sv.innerHTML = '<defs>' +
          '<filter id="v59b1" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".7"/></filter>' +
          '<filter id="v59b2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>' +
          '<filter id="v59b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.6"/></filter>' +
          '<clipPath id="v59fl"><path d="' + flapD + '"/></clipPath>' +
          '<linearGradient id="v59g" gradientUnits="userSpaceOnUse" x1="' + mx.toFixed(2) + '" y1="' + my.toFixed(2) + '" x2="' + ex.toFixed(2) + '" y2="' + ey.toFixed(2) + '">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".1" stop-color="#1F2120" stop-opacity=".08"/>' +
            '<stop offset=".3" stop-color="#1F2120" stop-opacity=".025"/><stop offset=".58" stop-color="#fff" stop-opacity=".04"/>' +
            '<stop offset=".86" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>' +
          '<pattern id="v59t" patternUnits="userSpaceOnUse" width="255" height="255" patternTransform="rotate(' + ang.toFixed(2) + ')"><image id="v59ti" width="255" height="255"/></pattern>' +
        '</defs>' +
        /* тень толщины листа на страницу – вдоль выгнутого сгиба, снаружи */
        '<path d="' + offs(1.6) + '" fill="none" stroke="rgba(31,33,32,.13)" stroke-width="2.6" stroke-linecap="round" filter="url(#v59b1)"/>' +
        '<path d="' + offs(3.4) + '" fill="none" stroke="rgba(31,33,32,.05)" stroke-width="6" stroke-linecap="round" filter="url(#v59b2)"/>' +
        /* тень под уголком на плашку: мягкая (растёт к кончику) + прижатая */
        '<path d="' + shade(-4.2, 7.4, 1.25) + '" fill="rgba(31,33,32,.16)" filter="url(#v59b3)"/>' +
        '<path d="' + shade(-1.2, 2.2, 1) + '" fill="rgba(31,33,32,.2)" filter="url(#v59b1)"/>' +
        /* сам уголок: изнанка, фактура, свет по завитку */
        '<path d="' + flapD + '" fill="#EAEAE6"/>' +
        '<rect id="v59tr" clip-path="url(#v59fl)" x="' + x0.toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + (x1 - x0).toFixed(1) + '" height="' + (y1 - y0).toFixed(1) + '" fill="url(#v59t)" opacity="0"/>' +
        '<path d="' + flapD + '" fill="url(#v59g)"/>' +
        '<g clip-path="url(#v59fl)">' +
          /* тень изгиба вдоль сгиба внутри уголка и светлое ребро на самом сгибе – по той же выгнутой линии */
          '<path d="' + offs(-6.5) + '" fill="none" stroke="rgba(31,33,32,.075)" stroke-width="7" stroke-linecap="round" filter="url(#v59b2)"/>' +
          '<path d="' + offs(-1.2) + '" fill="none" stroke="rgba(255,255,255,.62)" stroke-width="1.7" stroke-linecap="round" filter="url(#v59b1)"/>' +
          /* край уголка: тонкая тень изнутри и волокна на рваных участках */
          '<path d="' + dstr(G.out) + '" fill="none" stroke="rgba(31,33,32,.09)" stroke-width="1.1"/>' +
          (rimD ? '<path d="' + rimD + '" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.9" stroke-linecap="round" stroke-dasharray="7 1.4 3 .9 11 1.6"/>' : '') +
        '</g>' +
        /* кромка сгиба: тонкая тёмная линия, где плашка уходит в изгиб */
        '<path d="' + fd + '" fill="none" stroke="rgba(31,33,32,.12)" stroke-width=".7"/>';
        d.body.appendChild(sv);
        v59tile(win, function(u){ var im = sv.querySelector('#v59ti'), tr = sv.querySelector('#v59tr'); if (!im || !tr) return;
          im.setAttribute('href', u); im.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', u); tr.setAttribute('opacity', '1'); });
      }, 1100);
    } };
})();

/* ---------- вариант 62 (docs/papier/v62.js) ---------- */
/* 62. Стикер-напоминание у абзаца про kserokopie (02.10.2026, Грег: «на базе 51 – пару акцентов для настроения»; неочевидный ход).
   Квадратный охристый стикер (#EFB01F, своя фактура, наклон −4°) справа от абзаца «MSZ nie nadaje Apostille na kserokopiach…»
   в #dokumenty; на нём графитовым карандашом от руки «Nie / kopia!» с чертой (hand/v62-nie-kopia.svg, генератор
   hand/v62-make_svg.py – копия make_svg.py: две строки, черта, графит, просветы цвета охры). «Tylko oryginał!» не вышло:
   в Liu Jian Mao Cao нет «ł». Низ стикера отходит от листа: правый нижний угол чуть приподнят (контур скруглён, блик и тень изгиба),
   под ним мягкая тень, по краю – тонкая тень касания.
   03.10 (Грег: «напиши что-то более интересное, несколько слов основных в столбик»): на стикере столбиком список от руки –
   «ksero» и «wydruk» зачёркнуты, «oryginał» подчёркнут (hand/v62-ksero-wydruk-oryginal.svg; ł собрана в генераторе: l + черточка).
   Стикер 150 → 172px, надпись 108 → 134px; старый файл hand/v62-nie-kopia.svg оставлен.
   03.10, проверка снимком: черты зачёркивания тоньше штриха букв (съедали «e», «r», «y» – «ksero» читалось «kstfo»),
   у «ł» ствол выше на 16% и черточка круче (~56°), короче и плотнее – пологая читалась перекладиной «t» («oryginat»). */
(function(){
  JC.v[62] = { en:'Sticky-note reminder', name:'Стикер «ksero, wydruk – oryginał»', at:'#tlumaczenia',
    cap:'Неочевидный ход: рядом с абзацем «MSZ nie nadaje Apostille na kserokopiach…» – охристый стикер, на котором карандашом от руки столбиком «ksero» и «wydruk» зачёркнуты, а «oryginał» подчёркнут. Так помечают на столе то, о чём нельзя забыть: абзац про то, на чём MSZ не даёт Apostille, сжат в три слова, и самое частое недоразумение видно с одного взгляда. Охра стикера рифмуется с кнопкой заказа. «ł» в рукописном шрифте нет – собрана из вытянутой «l» и крутой черточки от руки (пологая читалась как «t»); черты зачёркивания тоньше букв, чтобы слова под ними читались.',
    css:'', apply:function(d, b, win){
      JC.v[51].apply(d, b, win);
      setTimeout(function(){
        var p = d.getElementById('dyplomy'), P = JC.pen;
        if (!p) { var r0 = P.find(d, '#dokumenty', 'MSZ nie nadaje Apostille na kserokopiach'); if (r0) p = r0.startContainer.parentElement.closest('p'); }
        if (!p) return;
        var pb = P.box(p), wrapEl = p.parentElement, wb = P.box(wrapEl), cr = wb.x + wb.w - (parseFloat(win.getComputedStyle(wrapEl).paddingRight) || 0);
        var S = 172, x = Math.min(pb.x + pb.w + 96, cr - S - 24), y = pb.y - 10;
        if (x < pb.x + pb.w + 24) return;   /* узкое окно: справа от абзаца нет места – стикер не ставим */
        /* обёртка: наклон −4°; внутри – тень под приподнятым углом, контактная тень и сам стикер */
        var w = d.createElement('div'); w.className = 'v62-note'; w.setAttribute('aria-hidden', 'true');
        w.style.cssText = 'position:absolute;z-index:44;pointer-events:none;left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px;width:' + S + 'px;height:' + S + 'px;transform:rotate(-4deg);transform-origin:50% 0';
        var blob = d.createElement('div');   /* тень под отошедшим правым нижним углом: шире и мягче, сдвинута вниз-вправо */
        blob.style.cssText = 'position:absolute;right:4px;bottom:6px;width:62%;height:34%;border-radius:50%;background:rgba(31,33,32,.3);filter:blur(7px);transform:translate(5px,8px) rotate(5deg) skewX(-10deg)';
        var cont = d.createElement('div');   /* контактная тень по контуру (клип стикера её бы срезал – поэтому на обёртке) */
        cont.style.cssText = 'position:absolute;inset:0;filter:drop-shadow(0 .5px .6px rgba(31,33,32,.28)) drop-shadow(0 1.5px 2px rgba(31,33,32,.08))';
        var note = d.createElement('div');
        var clip = "path('M0 0 L" + S + " 0 L" + S + " " + (S - 26) + " C" + (S - .6) + " " + (S - 10) + " " + (S - 7) + " " + (S - 1.5) + " " + (S - 25) + " " + S + " L0 " + S + " Z')";
        /* изгиб у приподнятого угла (315deg: 0% – правый нижний угол): блик на самом краю, тень изгиба, дальше ровно */
        var curl = 'linear-gradient(315deg,rgba(255,255,255,.2) 0%,rgba(255,255,255,.05) 6%,rgba(31,33,32,.09) 12%,rgba(31,33,32,0) 30%)';
        var lift = 'linear-gradient(180deg,rgba(31,33,32,.04) 0,rgba(31,33,32,0) 16%,rgba(255,255,255,0) 70%,rgba(255,255,255,.05) 100%)';
        note.style.cssText = 'position:absolute;inset:0;-webkit-clip-path:' + clip + ';clip-path:' + clip + ';background-color:#EFB01F;background-image:' + curl + ',' + lift;
        /* надпись: графитовый карандаш, multiply – штрих темнеет на охре, как настоящий графит */
        var im = d.createElement('img'); im.src = '/assets/img/papier/v62-ksero-wydruk-oryginal.svg'; im.alt = ''; im.setAttribute('aria-hidden', 'true');
        im.style.cssText = 'position:absolute;left:19px;top:17px;width:134px;height:auto;mix-blend-mode:multiply;transform:rotate(-2deg);transform-origin:0 50%';
        note.appendChild(im); cont.appendChild(note); w.appendChild(blob); w.appendChild(cont); d.body.appendChild(w);
        /* фактура бумаги стикера: облачность, зерно, редкие ворсинки (плитка JC.paper поверх цвета) */
        JC.paper(win, { seed:621, size:300, cloud:.03, grain:.05, fibers:[Object.assign({}, JC.pp.F.fine, { n:30 })] }, function(u, s2){
          note.style.backgroundImage = curl + ',' + lift + ',url(' + u + ')';
          note.style.backgroundSize = '100% 100%,100% 100%,' + s2 + 'px ' + s2 + 'px'; note.style.backgroundRepeat = 'no-repeat,no-repeat,repeat';
        });
      }, 1100);
    } };
})();

/* ---------- вариант 68 (docs/papier/v68.js) ---------- */
/* 68. Растр (02.10.2026, по образцу Грега – фото растром на рваной бумаге). База 51. В плашке #ile-trwa за столбцом цен –
   огромная «260» растровыми точками, как газетная печать: Fira Sans 800 в 1,7 раза крупнее цифр столбца, точки графита
   (rgba(46,49,48,.24)) по сетке 7px под углом 45°, размер точки – по покрытию глифа и плавному шуму (точки разного размера).
   Растровая «260» – эхо первой цены столбца: стоит за чёрной «260», чуть левее и ниже, правый край срезан краем плашки;
   под подписями столбца (.gt-l) точек нет.
   Слой – canvas внутри плашки, z-index −1 (под листами, цифрами и текстом); слева не заходит под абзацы. */
JC.v[68] = { en:'Halftone 260', name:'Растр', at:'#dokumenty .max-w-site > p:last-child',
  cap:'За столбцом цен в «Ile trwa i ile kosztuje» – огромная «260» растровыми точками графита, как цена в газете: точки разного размера, крупнее и мельче по плавному шуму. Это эхо главной цены (Apostille MSZ – 260 zł): стоит за чёрной «260» чуть крупнее и ниже, правый край срезан краем плашки, под подписями столбца точек нет. Взгляд в блоке сразу падает на основную цену, а печатный растр добавляет бумаге настроения.',
  css:'', apply:function(d, b, win){
    JC.v[51].apply(d, b, win);
    function v68build(){
      var card = d.querySelector('#ile-trwa .gt-card'); if (!card || card.querySelector('.v68-ht')) return;
      var n0 = card.querySelector('.gt--ap .gt-n'); if (!n0) return;
      var fsD = parseFloat(win.getComputedStyle(n0).fontSize) || 200, fs = Math.round(fsD * 1.7), fam = '800 ' + fs + 'px "Fira Sans"';
      var cr = card.getBoundingClientRect(), nr = n0.getBoundingClientRect();
      var tc = card.querySelector('.lg\\:col-span-7'), textR = tc ? tc.getBoundingClientRect().right - cr.left : 0;
      /* маска глифа в 1×: покрытие для каждой точки растра */
      var m = d.createElement('canvas').getContext('2d'); m.font = fam;
      try { m.letterSpacing = (-.03 * fs).toFixed(1) + 'px'; } catch (e) {}
      var tw = Math.ceil(m.measureText('260').width), pad = 12, w = tw + pad * 2, h = Math.ceil(fs * .74) + pad * 2, base = pad + Math.round(fs * .70);
      var mc = d.createElement('canvas'); mc.width = w; mc.height = h;
      var mx = mc.getContext('2d'); mx.font = fam; try { mx.letterSpacing = (-.03 * fs).toFixed(1) + 'px'; } catch (e) {}
      mx.fillStyle = '#000'; mx.textBaseline = 'alphabetic'; mx.fillText('260', pad, base);
      var A = mx.getImageData(0, 0, w, h).data;
      function cov(x, y){ var s = 0, X0 = Math.round(x), Y0 = Math.round(y);
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var X = X0 + dx, Y = Y0 + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) s += A[(Y * w + X) * 4 + 3]; }
        return s / 9 / 255; }
      /* плавный шум: ячейки ~80px и ~26px – точки то крупнее, то мельче, без регулярного узора */
      var R = JC.pen.rng(68);
      function grid(c){ var nx = Math.ceil(w / c) + 2, ny = Math.ceil(h / c) + 2, g = []; for (var i = 0; i < nx * ny; i++) g.push(R());
        return function(x, y){ var u = x / c, v = y / c, i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
          i = Math.max(0, Math.min(nx - 2, i)); j = Math.max(0, Math.min(ny - 2, j));
          var a = g[j * nx + i], bb = g[j * nx + i + 1], c2 = g[(j + 1) * nx + i], e = g[(j + 1) * nx + i + 1];
          return a + (bb - a) * fx + (c2 - a) * fy + (a - bb - c2 + e) * fx * fy; }; }
      var g1 = grid(80), g2 = grid(26);
      /* место: середина растровой «260» – на середине чёрной «260» столбца, левее на 5% ширины и ниже на 10% высоты цифры;
         середина цифр по высоте в строке .gt-n (line-height .9) – на .4375 кегля от верха строки */
      var ncx = nr.left + nr.width / 2 - cr.left, ncy = nr.top + .4375 * fsD - cr.top;
      var gcx = pad + tw / 2, gcy = base - .3475 * fs;
      var L = ncx - .05 * tw - gcx, T = ncy + .1 * .695 * fs - gcy;
      if (textR && L + pad < textR + 20) L = textR + 20 - pad;   /* не под абзацами слева */
      /* 03.10 (проверка снимком): под подписями столбца (.gt-l: «Apostille MSZ ,- zł / dokument»…) точек нет – мелкий серый
         текст на растре читался хуже; у края зоны точки плавно мельчают (12px) */
      var LB = Array.prototype.map.call(card.querySelectorAll('.gt--ap .gt-l'), function(el){ var q = el.getBoundingClientRect();
        return { x0:q.left - cr.left - 8, y0:q.top - cr.top - 6, x1:q.right - cr.left + 8, y1:q.bottom - cr.top + 6 }; });
      function clear(px, py){ var f = 1; LB.forEach(function(q){ var dx = Math.max(q.x0 - px, 0, px - q.x1), dy = Math.max(q.y0 - py, 0, py - q.y1), dd = Math.sqrt(dx * dx + dy * dy);
        var t = Math.min(1, dd / 12); f = Math.min(f, t * t * (3 - 2 * t)); }); return f; }
      var k = 2, cv = d.createElement('canvas'); cv.width = w * k; cv.height = h * k;
      var cx = cv.getContext('2d'); cx.scale(k, k); cx.fillStyle = 'rgba(46,49,48,.24)';
      var S = 7, ca = Math.cos(Math.PI / 4), sa = Math.sin(Math.PI / 4), D = Math.ceil(Math.hypot(w, h) / S / 2) + 2;
      for (var i = -D; i <= D; i++) for (var j = -D; j <= D; j++) {
        var x = w / 2 + (i * ca - j * sa) * S, y = h / 2 + (i * sa + j * ca) * S;
        if (x < -S || y < -S || x > w + S || y > h + S) continue;
        var c = cov(x, y); if (c < .03) continue;
        var t = c * (.38 + .62 * (.7 * g1(x, y) + .3 * g2(x, y))) * clear(L + x, T + y), r = S * .47 * Math.sqrt(t);
        if (r < .35) continue;
        cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
      }
      if (win.getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.style.isolation = 'isolate';
      cv.className = 'v68-ht'; cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:absolute;z-index:-1;pointer-events:none;width:' + w + 'px;height:' + h + 'px;left:' + L.toFixed(1) + 'px;top:' + T.toFixed(1) + 'px';
      card.appendChild(cv);
    }
    setTimeout(function(){
      var n0 = d.querySelector('#ile-trwa .gt--ap .gt-n'), fsD = n0 ? parseFloat(win.getComputedStyle(n0).fontSize) || 200 : 200;
      var fam = '800 ' + Math.round(fsD * 1.7) + 'px "Fira Sans"';
      (d.fonts && d.fonts.load ? d.fonts.load(fam) : Promise.resolve()).then(v68build, v68build);
    }, 1000);
  } };

/* ---------- вариант 69 (docs/papier/v69.js) ---------- */
/* 69. Облупленная охра (02.10.2026, по образцу Грега – цифры облупленной охристой краской). База 51.
   В карточке вопроса #pytanie (#z-tlumaczeniem) большой «?» – не серый призрак (5,5% чернил), а охристая краска старого
   указателя: куски краски отлетели (порог по шуму 4 октав – резкий рваный край), по краю скола – белая грунтовка, глубже – бумага
   плашки; у контура знака сколов больше (полоса 4px, свой мелкий шум), под краем краски – тень толщины слоя, тон краски местами
   темнее, мелкие поры. 03.10 по Грегу («чуть уменьшил бы трещины»): сколов меньше и они мельче (площадь ~17% → ~12%),
   кайма грунтовки уже, сколы у контура – полоса 6 → 4px и реже, тень слоя тоньше, пор чуть меньше; рисунок шума прежний. «?» – настоящий span .zap-g (не псевдоэлемент): ему дан сплошной цвет, и svg-фильтр перекрашивает его сам. */
JC.v[69] = { en:'Chipped ochre "?"', name:'Облупленная охра', at:'#z-tlumaczeniem',
  cap:'Большой «?» в карточке вопроса «Co ma mieć Apostille – oryginał, tłumaczenie czy oba?» – не серый призрак, а охристая краска старого указателя: местами отлетела, по краю сколов – белая грунтовка, сквозь них видна бумага плашки. Вопрос, который клиент задаёт там, где сдаёт документ, получает яркий знак-указатель, а облупленная краска добавляет бумаге настроения. 03.10: сколов меньше и они мельче, белая кайма у них уже, у контура знака – реже и тоньше. «?» – тот же знак сайта, перекрашен фильтром, без рисунка.',
  css:'#pytanie .zap-g{color:#EFB01F!important;filter:url(#v69-chip)}',
  apply:function(d, b, win){
    JC.v[51].apply(d, b, win);
    var NS = 'http://www.w3.org/2000/svg';
    if (d.getElementById('v69-defs')) return;
    var df = d.createElementNS(NS, 'svg'); df.id = 'v69-defs'; df.setAttribute('width', '0'); df.setAttribute('height', '0'); df.setAttribute('aria-hidden', 'true'); df.style.position = 'absolute';
    /* краска: сколы там, где шум 4 октав выше .635 (~12% площади; до 03.10 – .61, ~17%): .635–.6625 – белая грунтовка (.7),
       выше – бумага; у контура (полоса 4px) – мелкие сколы своим шумом выше .65; тень слоя – краска со сдвигом (0.6, 0.8) минус краска;
       тон – тёплое потемнение до ~18% крупными пятнами; поры ~4%; весь результат – в форме знака с чуть дрожащим краем */
    df.innerHTML = '<filter id="v69-chip" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="69" result="n"/>' +
      '<feDisplacementMap in="SourceAlpha" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" result="shape"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="23" result="t"/>' +
      '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 25.9" result="paintA"/>' +
      '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 27" result="primA"/>' +
      '<feMorphology in="shape" operator="erode" radius="4" result="inner"/>' +
      '<feComposite in="shape" in2="inner" operator="out" result="band"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="31" result="e"/>' +
      '<feColorMatrix in="e" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  40 0 0 0 -25.5" result="nickA"/>' +
      '<feComposite in="nickA" in2="band" operator="in" result="nicks"/>' +
      '<feComposite in="paintA" in2="nicks" operator="out" result="paintM"/>' +
      '<feComposite in="primA" in2="nicks" operator="out" result="primM"/>' +
      '<feFlood flood-color="#FFFFFF" flood-opacity="0.7" result="w"/>' +
      '<feComposite in="w" in2="primM" operator="in" result="prim"/>' +
      '<feOffset in="paintM" dx="0.6" dy="0.8" result="po"/>' +
      '<feComposite in="po" in2="paintM" operator="out" result="edge"/>' +
      '<feFlood flood-color="#1F2120" flood-opacity="0.24" result="k"/>' +
      '<feComposite in="k" in2="edge" operator="in" result="shadow"/>' +
      '<feFlood flood-color="#EFB01F" result="oc"/>' +
      '<feComposite in="oc" in2="paintM" operator="in" result="paint"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="5" result="tn"/>' +
      '<feColorMatrix in="tn" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.08  1.3 0 0 0 -0.66" result="tone"/>' +
      '<feComposite in="tone" in2="paintM" operator="in" result="toneP"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="13" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -25 0 0 0 17.9" result="pitA"/>' +
      '<feMerge result="all"><feMergeNode in="prim"/><feMergeNode in="shadow"/><feMergeNode in="paint"/><feMergeNode in="toneP"/></feMerge>' +
      '<feComposite in="all" in2="pitA" operator="in" result="pitted"/>' +
      '<feComposite in="pitted" in2="shape" operator="in"/></filter>';
    d.body.appendChild(df);
  } };

/* ---------- вариант 89 (docs/papier/v89.js) ---------- */
/* 89. Растр вместо серых полос (03.10.2026, Грег: «добавь здесь халфтон»). У блока цен первого экрана серые полосы под строками
   (::before у .gt-n и .gt-l) прозрачны, вместо них – поле растровых точек того же тона: плотнее под цифрой, к концу подписи реже,
   плюс плавный шум; края без границы – точки к краям мельчают до нуля. Canvas в .gt-col под строками (isolation – чтобы не уйти под фон). */
JC.v[89] = { en:'Halftone instead of grey bars', name:'Растр вместо полос', at:'main',
  cap:'Серые полосы под ценами первого экрана заменены растром с градиентом: слева, у цифры, плотный серый (точки почти сливаются), к концу подписи точки мельчают и сходят на нет; чётких краёв нет – полоса кончается точками, как подложка в газетном прайсе. На сайте с 03.10. Тон полос прежний, цифры и подписи читаются так же.',
  css:'main .gt--cn .gt-n::before, main .gt--cn .gt-l::before{background:transparent!important}',
  apply:function(d, b, win){
    JC.v[51].apply(d, b, win);
    JC.HTrun(d, win, function(){
      var col = d.querySelector('main .gt--cn .gt-col'); if (!col) return;
      if (win.getComputedStyle(col).position === 'static') col.style.position = 'relative';
      col.style.isolation = 'isolate';
      var cr = col.getBoundingClientRect(), ns = col.querySelectorAll('.gt-n'), ls = col.querySelectorAll('.gt-l'), R = JC.pen.rng(89);
      Array.prototype.forEach.call(ns, function(n, i){
        var l = ls[i]; if (!l) return;
        var nr = n.getBoundingClientRect(), lr = l.getBoundingClientRect(), f = parseFloat(win.getComputedStyle(n).fontSize);
        var x0 = nr.left - 14, x1 = lr.right + 14, y0 = nr.top + f * .07, y1 = nr.bottom - f * .03, w = x1 - x0, h = y1 - y0, xs = nr.right - x0;
        var k = 2, cv = d.createElement('canvas'); cv.width = Math.ceil(w * k); cv.height = Math.ceil(h * k);
        var cx = cv.getContext('2d'); cx.scale(k, k);
        /* 03.10 Грег: «чтобы не было чётких границ у плашек, а просто заканчивались точками» – без обрезки по скруглённому
           прямоугольнику: у верхнего, нижнего и левого края точки мельчают до нуля (полоса 12px, плавно) */
        function ss(e){ e = Math.max(0, Math.min(1, e)); return e * e * (3 - 2 * e); }
        cx.fillStyle = 'rgba(31,33,32,.15)';
        var S = 5, ca = Math.cos(Math.PI / 4), sa = Math.sin(Math.PI / 4), D = Math.ceil(Math.hypot(w, h) / S / 2) + 2, ph = R() * 6.3;
        for (var a = -D; a <= D; a++) for (var bq = -D; bq <= D; bq++) {
          var x = w / 2 + (a * ca - bq * sa) * S, y = h / 2 + (a * sa + bq * ca) * S;
          if (x < -S || y < -S || x > w + S || y > h + S) continue;
          /* 03.10 Грег: «градиент халфтона по плашке: слева плотный серый, и плотность уходит» – слева точки почти сливаются,
             к правому концу полосы сходят на нет (плавно, со слабой волной шума) */
          var u = Math.max(0, Math.min(1, x / w)), g = 1.02 * Math.pow(1 - u, 1.35) * ss(y / 12) * ss((h - y) / 12) * ss(x / 14);
          var t = g * (.88 + .12 * Math.sin(x * .021 + ph) * Math.sin(y * .05 + ph * .7)), r = S * .5 * Math.sqrt(t);
          if (r < .28) continue;
          cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
        }
        cv.className = 'v89-ht'; cv.setAttribute('aria-hidden', 'true');
        cv.style.cssText = 'position:absolute;z-index:-1;pointer-events:none;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px;left:' + (x0 - cr.left).toFixed(1) + 'px;top:' + (y0 - cr.top).toFixed(1) + 'px';
        col.appendChild(cv);
      });
    });
  } };

  var GATE = {59:1100, 62:1100, 68:1280, 69:0, 89:1280}, ONCE = [69], css = '';
  Object.keys(GATE).forEach(function(n){ if (JC.v[n] && JC.v[n].css) css += JC.v[n].css; });
  if (css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  function run(time){
    if (time > 1) Array.prototype.forEach.call(document.querySelectorAll('.papier-x59, .v62-note, .v68-ht, .v89-ht'), function(e){ e.remove(); });
    Object.keys(GATE).forEach(function(n){ if (window.innerWidth >= GATE[n] && JC.v[n]) { if (time > 1 && ONCE.indexOf(+n) >= 0) return; try { JC.v[n].apply(document, document.body, window); } catch (e) {} } });
  }
  window.PAPIER_EXTRA = run;
  if (P.went) run(1);
})();

/* The meadow you can step on, made from a real photo.
   The home page and the survey both use it.
   How it works: the photo is the clean meadow. A second, "trampled" copy is made from it once.
   Each step off the trail lets that trampled copy show through where the boot landed. */
(function () {
  function $(id) { return document.getElementById(id); }
  var cv = $("meadow");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d"), wrap = cv.parentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PHOTO = "images/meadow-photo.jpg";
  var TOP = 0.50;          // where the flowers begin, as a fraction of the photo height
  var PLANTS = 1200;       // how many plants the counter imagines in the flower area

  var IW = 0, IH = 0, gt = 0;                 // photo size, and the y where the flowers begin
  var base, trampled, damage;                 // layers, all the same size as the photo
  var view = { s: 1, x: 0, y: 0, w: 0, h: 0 };
  var steps = 0, lastOk = false, crushedCount = 0, plants = [];
  var growing = [], petals = [], ticking = false, ready = false;

  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rand = rng(11);
  function layer(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // The trail: centre line and half width as fractions of the photo width. t is depth, 0 far away, 1 close.
  function tc(t) { return 0.52 + 0.085 * Math.sin(3.1 * t + 0.5); }
  function tw(t) { return 0.007 + 0.078 * Math.pow(t, 1.35); }
  function py(t) { return gt + t * (IH - gt); }
  function sc(t) { return 0.38 + 0.9 * t; }

  /* ---------- building the two pictures ---------- */
  function makeBase(img) {
    base = layer(IW, IH);
    var g = base.getContext("2d");
    g.drawImage(img, 0, 0);
    try { paintTrail(g); } catch (e) {}
  }

  // A dirt path painted into the photo. Bright flowers along its edges stay in front of it.
  function paintTrail(g) {
    var y0 = Math.floor(gt), h = IH - y0, src = g.getImageData(0, y0, IW, h), d = src.data, r = rng(5);
    // soft lumps used to give the dirt its texture and a ragged edge
    var lumps = [], i, x, y;
    for (i = 0; i < 64 * 64; i++) lumps.push(r());
    function noise(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      function at(a, b) { return lumps[(a & 63) + (b & 63) * 64]; }
      var top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * fx;
      var bot = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * fx;
      return top + (bot - top) * fy;
    }
    for (y = 0; y < h; y++) {
      var t = y / h, cx = tc(t) * IW, half = tw(t) * IW, s = sc(t);
      for (x = Math.max(0, Math.floor(cx - half * 1.7)); x < Math.min(IW, cx + half * 1.7); x++) {
        var ragged = (noise(x / (13 * s), y / (7 * s)) - 0.5) * 0.75 + (noise(x / (4 * s), y / (3 * s)) - 0.5) * 0.3;
        var edge = Math.abs(x - cx) / half + ragged;
        var a = clamp((1.18 - edge) / 0.38, 0, 1) * clamp(t / 0.1, 0, 1);
        if (!a) continue;
        var o = (y * IW + x) * 4, R = d[o], G = d[o + 1], B = d[o + 2];
        var flower = Math.max(R, B) > G * 1.12 && Math.max(R, G, B) > 105;
        if (flower && edge > 0.55) a *= 0.12;
        var n = noise(x / (9 * s), y / (4 * s)) * 0.55 + noise(x / (2.4 * s), y / (1.8 * s)) * 0.45;
        var grit = r() - 0.5, pebble = r() > 0.988 ? 38 : 0;
        var centre = 1 - clamp(edge, 0, 1);
        var light = 0.72 + 0.5 * n + 0.12 * centre + grit * 0.22;
        d[o]     = R + (clamp(150 * light + pebble, 0, 255) - R) * a;
        d[o + 1] = G + (clamp(121 * light + pebble, 0, 255) - G) * a;
        d[o + 2] = B + (clamp(88 * light + pebble, 0, 255) - B) * a;
      }
    }
    g.putImageData(src, 0, y0);
  }

  // The same meadow after being walked on. Real bits of the photo are knocked over,
  // dulled and bruised, and laid across bare soil.
  function makeTrampled() {
    var y0 = Math.floor(gt) - 40, h = IH - y0, r = rng(23), i;
    var dull = layer(IW, h), dg = dull.getContext("2d");   // bruised copy of the flowers to cut pieces from
    dg.drawImage(base, 0, y0, IW, h, 0, 0, IW, h);
    trampled = layer(IW, IH);
    var g = trampled.getContext("2d");
    g.fillStyle = "#5a4228"; g.fillRect(0, y0, IW, h);     // soil underneath
    try {
      var im = dg.getImageData(0, 0, IW, h), d = im.data;
      for (i = 0; i < d.length; i += 4) {
        var lum = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
        d[i]     = (d[i] * 0.55 + lum * 0.45) * 0.93 + 40;
        d[i + 1] = (d[i + 1] * 0.55 + lum * 0.45) * 0.83 + 29;
        d[i + 2] = (d[i + 2] * 0.55 + lum * 0.45) * 0.7 + 16;
      }
      dg.putImageData(im, 0, 0);
      var soil = g.getImageData(0, y0, IW, h), q = soil.data;
      for (i = 0; i < q.length; i += 4) { var n = (r() - 0.5) * 46 + (r() > 0.985 ? 52 : 0); q[i] += n; q[i + 1] += n * 0.85; q[i + 2] += n * 0.65; }
      g.putImageData(soil, 0, y0);
    } catch (e) {}
    // flattened plants: upright pieces of the photo laid nearly on their side
    for (i = 0; i < 5600; i++) {
      var t = r(), s = sc(t), x = r() * IW, y = py(t) + (r() - 0.5) * 30 * s;
      var w = (7 + r() * 11) * s, len = (34 + r() * 46) * s;
      var sx = clamp(x + (r() - 0.5) * 60 - w / 2, 0, IW - w), sy = clamp(y - y0 - len / 2 + (r() - 0.5) * 40, 0, h - len);
      g.save(); g.translate(x, y); g.scale(1, 0.62);
      g.rotate((r() < 0.5 ? -1 : 1) * (1.1 + r() * 0.8));
      g.beginPath(); g.ellipse(0, 0, w / 2, len / 2, 0, 0, 6.283);
      g.shadowColor = "rgba(20,12,4,.45)"; g.shadowBlur = 5 * s; g.shadowOffsetY = 3 * s;
      g.fillStyle = "rgba(90,66,40,.3)"; g.fill();
      g.shadowColor = "transparent"; g.clip();
      g.drawImage(dull, sx, sy, w, len, -w / 2, -len / 2, w, len);
      g.restore();
    }
    // snapped stalks
    var stalks = ["#b7a56c", "#d0c08a", "#7d7a3e", "#8f7442"];
    g.lineCap = "round"; g.lineJoin = "round";
    for (i = 0; i < 1500; i++) {
      var u = r(), k = sc(u), ax = r() * IW, ay = py(u), l = (12 + r() * 30) * k, ang = (r() - 0.5) * 1.1 + (r() < 0.5 ? 0 : Math.PI);
      var ex = ax + Math.cos(ang) * l, ey = ay + Math.sin(ang) * l * 0.55, mx = (ax + ex) / 2 + (r() - 0.5) * 10 * k, my = (ay + ey) / 2 + (r() - 0.5) * 10 * k;
      g.strokeStyle = "rgba(15,9,3,.45)"; g.lineWidth = 2.4 * k;
      g.beginPath(); g.moveTo(ax, ay + 2 * k); g.lineTo(mx, my + 2 * k); g.lineTo(ex, ey + 2 * k); g.stroke();
      g.strokeStyle = stalks[Math.floor(r() * stalks.length)]; g.lineWidth = (0.7 + r()) * k;
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(mx, my); g.lineTo(ex, ey); g.stroke();
    }
  }

  /* ---------- one step ---------- */
  function boot(g, x, y, s, turn, strength) {
    g.save(); g.translate(x, y); g.rotate(turn); g.scale(s * 0.92, s * 1.04);
    function sole() {
      g.beginPath();
      g.moveTo(1, -38);                                              // toe
      g.bezierCurveTo(11, -38, 15, -27, 13, -17); g.bezierCurveTo(12, -9, 7, -6, 8, 1);
      g.bezierCurveTo(4, 4, -5, 4, -8, 1); g.bezierCurveTo(-9, -6, -13, -12, -12, -22);
      g.bezierCurveTo(-11, -32, -7, -38, 1, -38); g.closePath();
      g.moveTo(-8, 8); g.bezierCurveTo(-3, 6, 4, 6, 8, 8);            // heel
      g.bezierCurveTo(11, 17, 9, 28, 0, 28); g.bezierCurveTo(-9, 28, -11, 17, -8, 8); g.closePath();
    }
    // soil pushed up around the lower edge, then the pressed hollow
    g.translate(1.5, 3.5); sole(); g.fillStyle = "rgba(232,208,164," + 0.7 * strength + ")"; g.fill();
    g.translate(-1.5, -3.5); sole(); g.fillStyle = "rgba(20,11,4," + 0.78 * strength + ")"; g.fill();
    g.save(); sole(); g.clip();
    g.fillStyle = "rgba(132,102,68," + 0.6 * strength + ")";           // tread blocks
    for (var k = -33; k < 27; k += 6.5) { g.fillRect(-9, k, 7, 2.6); g.fillRect(2, k + 1.8, 7, 2.6); }
    g.restore(); g.restore();
  }

  // Cuts a ragged patch out of the trampled picture, with two boot prints in it.
  function makePatch(x, y, s) {
    var rx = 70 * s, ry = 44 * s, w = Math.ceil(rx * 3.4), h = Math.ceil(ry * 3.6);
    var c = layer(w, h), g = c.getContext("2d"), r = rng(1000 + steps * 7), left = x - w / 2, top = y - h / 2, i;
    function blob(bx, by, br, a) {
      g.save(); g.translate(bx, by); g.scale(1, ry / rx);
      var grad = g.createRadialGradient(0, 0, 0, 0, 0, br);
      grad.addColorStop(0, "rgba(0,0,0," + a + ")"); grad.addColorStop(0.72, "rgba(0,0,0," + a + ")"); grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad; g.beginPath(); g.arc(0, 0, br, 0, 6.283); g.fill(); g.restore();
    }
    blob(w / 2, h / 2, rx, 1);
    for (i = 0; i < 18; i++) {
      var a = r() * 6.283, far = 0.6 + r() * 0.5;
      blob(w / 2 + Math.cos(a) * rx * far, h / 2 + Math.sin(a) * ry * far, rx * (0.18 + r() * 0.24), 0.9);
    }
    // thin flattened blades reaching out, so the edge looks broken, not round
    g.lineCap = "round"; g.strokeStyle = "#000";
    for (i = 0; i < 80; i++) {
      var b = r() * 6.283, from = 0.75 + r() * 0.2, to = 1.15 + r() * 0.42, bend = b + (r() - 0.5) * 0.6;
      g.lineWidth = (2 + r() * 5) * s;
      g.beginPath(); g.moveTo(w / 2 + Math.cos(b) * rx * from, h / 2 + Math.sin(b) * ry * from);
      g.lineTo(w / 2 + Math.cos(bend) * rx * to, h / 2 + Math.sin(bend) * ry * to); g.stroke();
    }
    g.globalCompositeOperation = "source-in";
    g.drawImage(trampled, -left, -top);
    // the standing flowers behind the hole throw a shadow into it
    g.globalCompositeOperation = "source-atop";
    var back = g.createLinearGradient(0, h / 2 - ry * 1.25, 0, h / 2);
    back.addColorStop(0, "rgba(10,6,2,.55)"); back.addColorStop(1, "rgba(10,6,2,0)");
    g.fillStyle = back; g.fillRect(0, 0, w, h / 2);
    var shade = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, rx * 0.8);
    shade.addColorStop(0, "rgba(28,17,7,.18)"); shade.addColorStop(1, "rgba(28,17,7,0)");
    g.fillStyle = shade; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "source-over";
    boot(g, w / 2 - 19 * s, h / 2 + 10 * s, s, -0.2, 1);
    boot(g, w / 2 + 20 * s, h / 2 - 8 * s, s, 0.12, 1);
    return { img: c, x: left, y: top, born: 0 };
  }

  var PETAL = ["#7f78d6", "#a59cf0", "#d62f5a", "#f4f1ea", "#f2c230", "#7aa63c"];
  function burst(x, y, s) {
    for (var i = 0; i < 18; i++) {
      petals.push({ x: x + (rand() - 0.5) * 80 * s, y: y - rand() * 20 * s, vx: (rand() - 0.5) * 240 * s, vy: -(60 + rand() * 210) * s,
        size: (2.5 + rand() * 3.5) * s, spin: rand() * 6.28, turn: (rand() - 0.5) * 12, color: PETAL[Math.floor(rand() * PETAL.length)], age: 0, floor: y + (rand() - 0.2) * 34 * s });
    }
  }

  function step(nx, t) {
    if (!ready) return;
    t = clamp(t, 0, 1); nx = clamp(nx, 0, 1);
    var x = nx * IW, y = py(t), s = sc(t);
    var ok = Math.abs(nx - tc(t)) < tw(t);
    steps++; lastOk = ok;
    if (ok) {
      var g = damage.getContext("2d");
      boot(g, x - 9 * s, y, s * 0.6, -0.12, 0.7); boot(g, x + 11 * s, y - 8 * s, s * 0.6, 0.1, 0.7);
    } else {
      var rx = 66 * s, ry = 36 * s;
      plants.forEach(function (p) {
        var dx = (p.x - x) / rx, dy = (p.y - y) / ry;
        if (!p.down && dx * dx + dy * dy < 1) { p.down = true; crushedCount++; }
      });
      var patch = makePatch(x, y, s);
      if (reduce) damage.getContext("2d").drawImage(patch.img, patch.x, patch.y);
      else { patch.born = performance.now(); growing.push(patch); burst(x, y, s); }
    }
    ui(); run();
  }

  /* ---------- drawing ---------- */
  function petal(g, q, alpha) {
    g.globalAlpha = alpha; g.fillStyle = q.color;
    g.beginPath(); g.ellipse(q.x, q.y, q.size, q.size * 0.45, q.spin, 0, 6.283); g.fill();
    g.globalAlpha = 1;
  }

  function draw(now, dt) {
    if (!ready || !view.w) return false;
    var d = cv.width / view.w;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);
    ctx.translate(view.x, view.y); ctx.scale(view.s, view.s);
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(damage, 0, 0);
    for (var i = 0; i < growing.length; i++) {
      var p = growing[i], k = clamp((now - p.born) / 260, 0, 1), pop = 1 + 0.12 * (1 - k);
      var w = p.img.width, h = p.img.height;
      ctx.globalAlpha = k;
      ctx.drawImage(p.img, p.x - w * (pop - 1) / 2, p.y - h * (pop - 1) / 2, w * pop, h * pop);
      ctx.globalAlpha = 1;
      if (k >= 1) { damage.getContext("2d").drawImage(p.img, p.x, p.y); growing.splice(i--, 1); }
    }
    for (var j = 0; j < petals.length; j++) {
      var q = petals[j];
      q.age += dt;
      if (q.y < q.floor || q.vy < 0) { q.vy += 520 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.spin += q.turn * dt; q.vx *= 0.985; }
      if (q.age > 1.3 && !growing.length) { petal(damage.getContext("2d"), q, 0.75); petal(ctx, q, 0.75); petals.splice(j--, 1); continue; }
      petal(ctx, q, 1);
    }
    return growing.length > 0 || petals.length > 0;
  }

  // Animates only while something is moving.
  function run() {
    if (ticking) return;
    ticking = true;
    var last = performance.now();
    function frame(now) {
      var busy = draw(now, clamp((now - last) / 1000, 0, 0.05));
      last = now;
      if (busy) requestAnimationFrame(frame); else ticking = false;
    }
    requestAnimationFrame(frame);
  }

  function layout() {
    var W = wrap.clientWidth;
    if (!W || !ready) return;               // hidden for now; the resize watcher tries again
    var H = Math.round(clamp(W * IH / IW, 340, 620));
    var d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * d; cv.height = H * d; cv.style.height = H + "px";
    var s = Math.max(W / IW, H / IH);       // fill the frame; trim sky or sides if needed
    view = { s: s, w: W, h: H, x: (W - IW * s) / 2, y: H - IH * s };
    draw(performance.now(), 0);
    var fb = $("meadow-fallback"); if (fb) fb.parentNode.removeChild(fb);
  }

  function ui() {
    var st = $("status"), m = $("msg"), h = $("hint"), c = $("n");
    if (c) c.textContent = crushedCount;
    if (st) st.className = "status" + (lastOk ? " good" : "");
    if (m) {
      if (!steps) m.textContent = "";
      else if (lastOk) m.textContent = "On the trail. No new plants harmed. Thank you.";
      else if (m.getAttribute("data-off")) m.innerHTML = m.getAttribute("data-off"); // text written in the page itself, may mark key words
      else m.textContent = "Off the trail. These can take decades to heal, if they ever do.";
    }
    if (h) h.style.display = steps > 3 ? "none" : "";
  }

  function reset() {
    steps = 0; lastOk = false; crushedCount = 0; growing = []; petals = [];
    plants.forEach(function (p) { p.down = false; });
    if (damage) damage.getContext("2d").clearRect(0, 0, IW, IH);
    ui();
    if (ready) draw(performance.now(), 0);
  }

  /* ---------- buttons and taps ---------- */
  function on(id, evt, fn) { var e = $(id); if (e) e.addEventListener(evt, fn); }
  on("meadow", "pointerdown", function (e) {
    var b = cv.getBoundingClientRect();
    var x = (e.clientX - b.left - view.x) / view.s, y = (e.clientY - b.top - view.y) / view.s;
    y = Math.max(y, gt + 6);                // a tap on the sky lands at the back of the meadow
    step(x / IW, (y - gt) / (IH - gt));
  });
  // the buttons pick a spot that is on screen, even on a narrow phone
  function visible() { var a = clamp(-view.x / view.s / IW, 0, 1); return [a + 0.05, 1 - a - 0.05]; }
  on("ontrail", "click", function () { var t = 0.2 + rand() * 0.72; step(tc(t) + (rand() - 0.5) * tw(t), t); });
  on("cut", "click", function () {
    var t = 0.25 + rand() * 0.65, range = visible(), x, tries = 0;
    do { x = range[0] + rand() * (range[1] - range[0]); } while (Math.abs(x - tc(t)) < tw(t) + 0.07 && ++tries < 40);
    step(x, t);
  });
  on("reset", "click", reset);

  /* ---------- the two "selfie" pictures further down the home page ---------- */
  // Both are cut from the same photo: one taken in the flowers, one taken from the trail.
  function shot(id, left, spots) {
    var c = $(id);
    if (!c) return;
    var g = c.getContext("2d"), cw = 560, ch = 700;
    var sx = clamp(left, 0, IW - cw), sy = IH - ch;
    g.drawImage(base, sx, sy, cw, ch, 0, 0, cw, ch);
    spots.forEach(function (p, i) {
      steps = i + 1;                         // gives each patch its own ragged shape
      var patch = makePatch(p[0], p[1], p[2]);
      g.drawImage(patch.img, patch.x - sx, patch.y - sy);
    });
    steps = 0;
  }
  function drawShots() {
    // trampled ground right in front of the camera, with the way in leading from the trail
    // back to front, so the nearest damage lies on top
    shot("shot-bad", 40, [[250, 545, 1.15], [390, 565, 1.2], [140, 575, 1.25], [310, 600, 1.65], [470, 630, 1.4], [170, 645, 1.8],
      [380, 680, 2.0], [110, 700, 1.7], [260, 720, 2.2], [520, 715, 1.5]]);
    shot("shot-good", tc(0.75) * IW - 280, []);
  }

  var img = new Image();
  img.onload = function () {
    IW = img.naturalWidth; IH = img.naturalHeight; gt = IH * TOP;
    makeBase(img); makeTrampled(); damage = layer(IW, IH);
    var r = rng(41);
    for (var i = 0; i < PLANTS; i++) {
      var t = r(), x = r();
      if (Math.abs(x - tc(t)) > tw(t) + 0.008) plants.push({ x: x * IW, y: py(t), down: false });
    }
    ready = true; layout(); ui(); drawShots();
  };
  img.onerror = function () { var fb = $("meadow-fallback"); if (fb) fb.textContent = "The meadow photo did not load. Refresh the page to try again."; };
  img.src = PHOTO;

  if (window.ResizeObserver) { var seen = 0; new ResizeObserver(function () { if (wrap.clientWidth !== seen) { seen = wrap.clientWidth; layout(); } }).observe(wrap); }
  else addEventListener("resize", layout);
})();

/* future.js — homepage WebGL scene + interactions (original Omedla build).
   Degrades gracefully: no THREE / no WebGL / reduced-motion => static page. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  var loader = document.getElementById('loader');
  var pctEl = document.getElementById('loaderPct');
  var pct = 0;
  var tick = setInterval(function () {
    pct = Math.min(100, pct + Math.ceil(Math.random() * 22));
    if (pctEl) pctEl.textContent = pct;
    if (pct >= 100) {
      clearInterval(tick);
      if (loader) loader.classList.add('done');
      document.body.classList.add('ready');
    }
  }, 90);
  // hard cap in case of throttled timers
  setTimeout(function () {
    clearInterval(tick);
    if (loader) loader.classList.add('done');
    document.body.classList.add('ready');
  }, 1600);

  /* ---------- reveals ---------- */
  var rvs = document.querySelectorAll('[data-rv]');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  var groups = new Map();
  rvs.forEach(function (el) {
    var i = groups.get(el.parentElement) || 0;
    groups.set(el.parentElement, i + 1);
    el.style.setProperty('--rvd', Math.min(i * 90, 450) + 'ms');
    io.observe(el);
  });

  /* ---------- custom cursor ---------- */
  var cur = document.getElementById('cur'), ring = document.getElementById('curRing');
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  if (cur && matchMedia('(pointer: fine)').matches) {
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.querySelectorAll('a,button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('on'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('on'); });
    });
    (function curLoop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      cur.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(curLoop);
    })();
  } else if (cur) { cur.style.display = 'none'; if (ring) ring.style.display = 'none'; }

  /* ---------- magnetic buttons ---------- */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.18 + 'px,' +
                                            (e.clientY - r.top - r.height / 2) * 0.22 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- card tilt + spotlight ---------- */
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      if (!reduced) card.style.transform =
        'perspective(900px) rotateX(' + ((0.5 - py) * 6) + 'deg) rotateY(' + ((px - 0.5) * 8) + 'deg) translateY(-4px)';
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  });

  /* ---------- manifesto word fill ---------- */
  var mani = document.getElementById('mani');
  var words = [];
  if (mani) {
    var text = mani.textContent.trim().split(/\s+/);
    mani.innerHTML = text.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = Array.prototype.slice.call(mani.querySelectorAll('.w'));
  }
  function maniUpdate() {
    if (!words.length) return;
    var r = mani.getBoundingClientRect();
    var p = (innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.35);
    var lit = Math.floor(Math.max(0, Math.min(1, p)) * words.length);
    words.forEach(function (w, i) { w.classList.toggle('lit', i < lit); });
  }

  /* ---------- WebGL scene ---------- */
  var knot, knotWire, stars, renderer, scene, camera;
  var canvas = document.getElementById('gl');
  function glOK() {
    try { var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function initGL() {
    if (!window.THREE || !canvas || !glOK()) { if (canvas) canvas.style.display = 'none'; return; }
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.12);
    camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 60);
    camera.position.set(0, 0, 5.4);

    // the trefoil — Omedla's knot, rendered as dark glass + glowing wire
    var geo = new THREE.TorusKnotGeometry(1.15, 0.34, 240, 40, 2, 3);
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1736, metalness: 0.35, roughness: 0.18,
      clearcoat: 1, clearcoatRoughness: 0.25,
      emissive: 0x0a1a3c, emissiveIntensity: 0.55
    });
    knot = new THREE.Mesh(geo, mat);
    knotWire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0x2e86d6, wireframe: true, transparent: true, opacity: 0.16
    }));
    knotWire.scale.setScalar(1.004);
    knot.add(knotWire);
    var mobile = innerWidth < 760;
    knot.position.set(mobile ? 0 : 1.75, mobile ? 0.9 : 0, 0);
    knot.scale.setScalar(mobile ? 0.62 : 1);
    scene.add(knot);

    // lights
    scene.add(new THREE.AmbientLight(0x1a2d55, 0.9));
    var l1 = new THREE.PointLight(0x5fbdf0, 42, 30); l1.position.set(4, 3, 4); scene.add(l1);
    var l2 = new THREE.PointLight(0x2e52c4, 34, 30); l2.position.set(-4, -2, 3); scene.add(l2);
    var l3 = new THREE.PointLight(0xffffff, 10, 20); l3.position.set(0, 4, -3); scene.add(l3);

    // particle field
    var N = mobile ? 350 : 900;
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    stars = new THREE.Points(pgeo, new THREE.PointsMaterial({
      color: 0x5fbdf0, size: 0.025, transparent: true, opacity: 0.55, sizeAttenuation: true
    }));
    scene.add(stars);

    addEventListener('resize', function () {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    if (reduced) { renderer.render(scene, camera); return; } // single static frame

    var t = 0;
    (function loop() {
      requestAnimationFrame(loop);
      t += 0.0042;
      var sp = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); // 0..1
      // idle motion + mouse parallax + scroll-driven travel
      knot.rotation.x += ((my / innerHeight - 0.5) * 0.5 + 0.25 + sp * 2.4 - knot.rotation.x) * 0.045;
      knot.rotation.y += ((mx / innerWidth - 0.5) * 0.7 + t + sp * 3.2 - knot.rotation.y) * 0.05;
      var mob = innerWidth < 760;
      var tx = (mob ? 0 : 1.75) * (1 - sp * 1.9);           // drifts to center then left
      var ts = (mob ? 0.62 : 1) * (1 - sp * 0.38);           // recedes as you scroll
      knot.position.x += (tx - knot.position.x) * 0.04;
      knot.scale.setScalar(knot.scale.x + (ts - knot.scale.x) * 0.04);
      camera.position.z = 5.4 - sp * 1.1;
      knotWire.material.opacity = 0.16 + sp * 0.3;
      stars.rotation.y = t * 0.18;
      stars.rotation.x = sp * 0.35;
      renderer.render(scene, camera);
      maniUpdate();
    })();
  }

  // THREE is loaded with defer after this file — wait for it
  if (document.readyState === 'complete') initGL();
  else addEventListener('load', initGL);

  // manifesto still fills without WebGL
  if (reduced) { words.forEach(function (w) { w.classList.add('lit'); }); }
  else addEventListener('scroll', maniUpdate, { passive: true });
})();

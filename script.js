// ---- scroll reveal (re-triggers each time you scroll into a section) ----
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const el = e.target;
    if (e.isIntersecting) {
      const delay = el.dataset.delay || 0;
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('in');
      if (el.dataset.count) countUp(el);
    } else if (e.boundingClientRect.top > 0) {
      // left viewport downward → reset so it re-animates on the next scroll up/down
      el.classList.remove('in');
    }
  }
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal, [data-count]').forEach(el => io.observe(el));

// ---- count-up stats ----
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  const dur = 1200, start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---- nav state + scroll progress ----
const nav = document.getElementById('nav');
const bar = document.getElementById('scrollProgress');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- mobile menu ----
const burger = document.getElementById('burger');
const links = document.querySelector('.nav__links');
burger.addEventListener('click', () => links.classList.toggle('open'));
links.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });

// ---- service card spotlight ----
document.querySelectorAll('.scard').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ---- year ----
document.getElementById('year').textContent = new Date().getFullYear();

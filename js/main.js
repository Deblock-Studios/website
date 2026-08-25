/* ═══════════════════════════════════════════════════════════
   DEBLOCK STUDIOS — main.js (v2)
   Shared interactions for every page
   ═══════════════════════════════════════════════════════════ */

/* ── Navbar scroll state ── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── Mobile drawer ── */
(function () {
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('drawer');
  if (!burger || !drawer) return;

  const setOpen = (open) => {
    drawer.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    const spans = burger.querySelectorAll('span');
    spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity = open ? '0' : '';
    spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
  };

  burger.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();

/* ── Language switcher ── */
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => i18n.setLang(btn.dataset.lang));
});

/* ── Reveal on scroll ── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
})();

/* ── 3D tilt on interactive rectangles ── */
(function () {
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(card => {
    let raf = 0;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateX(${(-py * 18).toFixed(2)}deg) rotateY(${(px * 24).toFixed(2)}deg) translateY(-10px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
})();

/* ── Wildium: copy server IP ── */
(function () {
  const btn = document.getElementById('copy-ip-btn');
  const ip = document.getElementById('server-ip');
  if (!btn || !ip) return;

  btn.addEventListener('click', async () => {
    const original = btn.textContent.trim();
    const address = ip.textContent.trim();
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(ip);
      const sel = document.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    btn.textContent = i18n.currentLang === 'en' ? '✅ Copied!' : '✅ Copié !';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  });
})();

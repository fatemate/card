(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Блик, следящий за курсором ---------- */
  const glassEls = document.querySelectorAll('.glass');

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    glassEls.forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      }, { passive: true });

      el.addEventListener('pointerenter', function () {
        el.classList.add('is-lit');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-lit');
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });
  }

  /* ---------- 2. Появление секций при скролле ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // небольшая каскадная задержка для соседних элементов
        const delay = Math.min(i * 70, 280);
        setTimeout(function () {
          entry.target.classList.add('is-in');
        }, delay);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. Состояние навигации при скролле ---------- */
  const navShell = document.getElementById('navShell');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      navShell.classList.toggle('is-stuck', window.scrollY > 24);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Лёгкий параллакс фоновых пятен ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    const blobs = document.querySelectorAll('.blob');
    let px = 0, py = 0, cx = 0, cy = 0, rafId = null;

    window.addEventListener('pointermove', function (e) {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(loop);
    }, { passive: true });

    function loop() {
      cx += (px - cx) * 0.045;
      cy += (py - cy) * 0.045;

      blobs.forEach(function (blob, i) {
        const depth = (i + 1) * 14;
        blob.style.marginLeft = (cx * depth) + 'px';
        blob.style.marginTop  = (cy * depth) + 'px';
      });

      if (Math.abs(px - cx) > 0.001 || Math.abs(py - cy) > 0.001) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    }
  }
})();
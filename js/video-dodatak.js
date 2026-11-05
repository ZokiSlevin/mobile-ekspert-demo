/* Original portrait video: lazy-loaded, viewport-controlled, motion-aware. */
(() => {
  'use strict';
  const video = document.querySelector('[data-brand-loop]');
  const toggle = document.querySelector('[data-loop-toggle]');
  if (!video || !toggle) return;

  const label = toggle.querySelector('.technology-toggle-label');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let loaded = false;
  let userPaused = false;
  let isVisible = false;
  let sequence = 0;

  const update = () => {
    const playing = !video.paused && !video.ended;
    toggle.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pauziraj animaciju' : 'Pokreni animaciju');
    if (label) label.textContent = playing ? 'Pauza' : 'Pokreni';
  };
  const loadIfNeeded = () => {
    if (loaded) return;
    loaded = true;
    video.src = video.getAttribute('data-video-src');
    video.load();
  };
  const play = async () => {
    loadIfNeeded();
    const current = ++sequence;
    try { await video.play(); }
    catch (error) { /* Poster remains visible; visitor can use button. */ }
    if (current === sequence) update();
  };
  const pause = () => { ++sequence; video.pause(); update(); };
  toggle.addEventListener('click', () => {
    if (video.paused) { userPaused = false; play(); }
    else { userPaused = true; pause(); }
  });
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      isVisible = entries.some(entry => entry.isIntersecting);
      if (isVisible && !reduce.matches && !userPaused) play();
      else pause();
    }, {rootMargin:'100px 0px', threshold:0.08});
    observer.observe(video);
  } else if (!reduce.matches) {
    isVisible = true;
    play();
  }
  if (reduce.addEventListener) {
    reduce.addEventListener('change', () => {
      if (reduce.matches) pause();
      else if (isVisible && !userPaused) play();
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (isVisible && !reduce.matches && !userPaused) play();
  });
  update();
})();

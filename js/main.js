/* Mobile Ekspert: accessible navigation and non-blocking contact form. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const mobile = window.matchMedia('(max-width: 980px)');

  const closeDropdown = () => {
    dropdown?.classList.remove('open');
    dropdownToggle?.setAttribute('aria-expanded','false');
  };
  const closeMenu = () => {
    nav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded','false');
    menuToggle?.setAttribute('aria-label','Otvori navigaciju');
    closeDropdown();
  };
  menuToggle?.addEventListener('click', () => {
    if (!nav) return;
    const opened = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(opened));
    menuToggle.setAttribute('aria-label', opened ? 'Zatvori navigaciju' : 'Otvori navigaciju');
    if (!opened) closeDropdown();
  });
  dropdownToggle?.addEventListener('click', () => {
    if (!dropdown) return;
    const opened = dropdown.classList.toggle('open');
    dropdownToggle.setAttribute('aria-expanded',String(opened));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const menuWasOpen = nav?.classList.contains('open');
      const dropdownWasOpen = dropdown?.classList.contains('open');
      closeMenu();
      if (menuWasOpen) menuToggle?.focus();
      else if (dropdownWasOpen) dropdownToggle?.focus();
    }
  });
  document.addEventListener('click', event => {
    if (dropdown && !dropdown.contains(event.target)) closeDropdown();
    if (mobile.matches && nav && menuToggle && !nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  const onViewportChange = () => closeMenu();
  if (mobile.addEventListener) mobile.addEventListener('change', onViewportChange);
  else mobile.addListener(onViewportChange);
  if (header) {
    const setScrollState = () => header.classList.toggle('scrolled', window.scrollY > 15);
    setScrollState();
    window.addEventListener('scroll',setScrollState,{passive:true});
  }
  document.getElementById('year')?.replaceChildren(String(new Date().getFullYear()));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer = !reducedMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {entry.target.classList.add('visible');observer.unobserve(entry.target);}
      }),{threshold:0.04,rootMargin:'0px 0px 30px 0px'}) : null;
  document.querySelectorAll('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('visible'));

  // Optional filtering on the services overview, works without any network request.
  const filters = document.querySelector('[data-service-filters]');
  if (filters) {
    const cards = [...document.querySelectorAll('main .service-grid .service-card')];
    const count = document.getElementById('filterCount');
    const buttonNames = {all:'svih',softver:'softverskih',procjene:'procjenskih',ostalo:'ostalih'};
    filters.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', () => {
        const group = button.dataset.filter;
        filters.querySelectorAll('[data-filter]').forEach(item => {
          const selected = item === button;
          item.classList.toggle('is-active',selected);
          item.setAttribute('aria-pressed',String(selected));
        });
        let visible = 0;
        cards.forEach(card => {
          const shown = group === 'all' || card.dataset.category === group;
          card.hidden = !shown;
          if (shown) visible++;
        });
        if (count) count.textContent = `Prikazano ${visible} od ukupno ${cards.length} usluga`;
      });
    });
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    const params = new URLSearchParams(window.location.search);
    const selectedService = params.get('usluga');
    const serviceSelect = form.querySelector('select[name="service"]');
    if (selectedService && serviceSelect && [...serviceSelect.options].some(o => o.value === selectedService)) serviceSelect.value = selectedService;
    const scainNote = document.getElementById('scainFormNote');
    const updateScainNote = () => { if (scainNote && serviceSelect) scainNote.hidden = serviceSelect.value !== 'Scain'; };
    serviceSelect?.addEventListener('change',updateScainNote);
    updateScainNote();

    const status = document.getElementById('formStatus');
    const submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const originalText = submit?.textContent;
      if (submit) {submit.disabled = true; submit.textContent = 'Slanje upita…';}
      if (status) {status.textContent='Šaljemo vaš upit…';status.className='form-status';}
      try {
        const controller = new AbortController();
        // Timeout is scoped and cleaned up after the request to avoid a permanent pending state.
        const timeout = setTimeout(() => controller.abort(), 15000);
        let response;
        try { response = await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'X-Requested-With':'XMLHttpRequest','Accept':'application/json'},signal:controller.signal}); }
        finally {clearTimeout(timeout);}
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Poslužitelj nije vratio valjan odgovor. Pokušajte putem e-maila.');
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Upit nije poslan.');
        if (status) {status.textContent = data.message || 'Upit je poslan.';status.classList.add('success');}
        form.reset();
        updateScainNote();
      } catch (error) {
        if (status) {
          status.textContent = error.name === 'AbortError'
            ? 'Slanje je potrajalo predugo. Pokušajte ponovno ili nam pošaljite e-mail.'
            : (error.message || 'Došlo je do pogreške.');
          status.classList.add('error');
        }
      } finally {
        if (submit) {submit.disabled = false;submit.textContent = originalText;}
      }
    });
  }
})();

// Original Mobile Ekspert service symbols, with local inline SVG fallbacks.
(function () {
  document.querySelectorAll('.original-service-mark').forEach(function (img) {
    function showOriginal() { if (img.naturalWidth > 0) img.parentElement.classList.add('has-original-icon'); }
    function showFallback() { img.parentElement.classList.remove('has-original-icon'); }
    if (img.complete) { img.naturalWidth ? showOriginal() : showFallback(); }
    img.addEventListener('load', showOriginal, {once:true});
    img.addEventListener('error', showFallback, {once:true});
  });
})();

/* Hide broken remote legacy team photos without leaving an empty-image icon. */
document.querySelectorAll("img[data-original-photo]").forEach(img => {
 const markUnavailable = () => img.closest(".about-actual-photo")?.classList.add("photo-unavailable");
 img.addEventListener("error", markUnavailable);
 if (img.complete && !img.naturalWidth) markUnavailable();
});

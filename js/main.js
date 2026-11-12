/* Mobile Ekspert: accessible navigation and non-blocking contact form. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  // Appearance: saved preference first, otherwise use the OS theme.
  const root = document.documentElement;
  const themeStorageKey = 'mobile-ekspert-theme';
  const osDark = window.matchMedia('(prefers-color-scheme: dark)');
  const readPreference = () => {
    try { return localStorage.getItem(themeStorageKey); } catch (_) { return null; }
  };
  const savePreference = value => {
    try { localStorage.setItem(themeStorageKey, value); } catch (_) { /* Private mode */ }
  };
  const preferredTheme = readPreference();
  let currentTheme = preferredTheme === 'dark' || preferredTheme === 'light'
    ? preferredTheme : (osDark.matches ? 'dark' : 'light');
  const themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.id = 'themeToggle';
  themeButton.className = 'theme-toggle';
  // The displayed glyph indicates the mode that will be activated.
  themeButton.innerHTML = '<svg class="theme-toggle__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.1A8.7 8.7 0 0 1 10.9 3.4a8.8 8.8 0 1 0 9.7 9.7z"/></svg>' +
    '<svg class="theme-toggle__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
  const applyTheme = value => {
    currentTheme = value;
    root.setAttribute('data-theme', value);
    const activateLight = value === 'dark';
    const label = activateLight ? 'Uklju\u010di svijetli na\u010din rada' : 'Uklju\u010di tamni na\u010din rada';
    themeButton.setAttribute('aria-label', label);
    themeButton.setAttribute('title', label);
    themeButton.setAttribute('aria-pressed', String(value === 'dark'));
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', value === 'dark' ? '#071725' : '#f9fcff');
  };
  applyTheme(currentTheme);
  const headerInner = document.querySelector('#siteHeader .header-inner');
  if (headerInner) {
    const menuButton = document.getElementById('menuToggle');
    headerInner.insertBefore(themeButton, menuButton || null);
  }
  themeButton.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    savePreference(nextTheme);
  });
  const followSystemTheme = event => {
    if (readPreference() !== 'dark' && readPreference() !== 'light') applyTheme(event.matches ? 'dark' : 'light');
  };
  if (osDark.addEventListener) osDark.addEventListener('change', followSystemTheme);
  else osDark.addListener(followSystemTheme);
  window.addEventListener('storage', event => {
    if (event.key === themeStorageKey) {
      const theme = event.newValue === 'dark' || event.newValue === 'light'
        ? event.newValue : (osDark.matches ? 'dark' : 'light');
      applyTheme(theme);
    }
  });

  // An accessible back-to-top control only after scrolling down.
  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.id = 'backToTop';
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Povratak na vrh stranice');
  backToTop.setAttribute('title', 'Povratak na vrh stranice');
  backToTop.setAttribute('aria-hidden', 'true');
  backToTop.tabIndex = -1;
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v14"/></svg>';
  document.body.appendChild(backToTop);
  const updateBackToTop = () => {
    const show = window.scrollY > 350;
    backToTop.classList.toggle('is-visible', show);
    backToTop.setAttribute('aria-hidden', String(!show));
    backToTop.tabIndex = show ? 0 : -1;
  };
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, {passive:true});
  backToTop.addEventListener('click', () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  }));

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
    if (mobile.matches && nav && menuToggle && !nav.contains(event.target) && !menuToggle.contains(event.target) && !themeButton.contains(event.target)) closeMenu();
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

  // Clean-page navigation: keep the correct section and service without #anchor or
  // ?usluga= in the visible address. Built on native links with no-JS fallback.
  const sectionNavigationKey = 'me-section-navigation';
  const normalizedPath = path => path.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
  const here = normalizedPath(window.location.pathname);
  const scrollToSection = (id, smooth) => {
    const target = document.getElementById(id);
    if (!target) return false;
    const headerHeight = document.getElementById('siteHeader')?.getBoundingClientRect().height || 0;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 16);
    const animate = smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top,behavior:animate ? 'smooth' : 'auto'});
    if (id === 'main') { // Preserve keyboard skip-link usability.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
    }
    return true;
  };
  let pendingNavigation = null;
  try {
    pendingNavigation = JSON.parse(sessionStorage.getItem(sectionNavigationKey) || 'null');
    sessionStorage.removeItem(sectionNavigationKey);
    if (!pendingNavigation || normalizedPath(pendingNavigation.path) !== here) pendingNavigation=null;
  } catch (_) { pendingNavigation=null; }

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    const explicit = link.dataset.scrollTarget;
    const fragment = link.getAttribute('href')?.startsWith('#') ? link.getAttribute('href').slice(1) : '';
    const section = explicit || fragment;
    if (!section) return;
    let destination;
    try { destination = new URL(link.href, window.location.href); } catch (_) { return; }
    if (destination.origin !== window.location.origin) return;
    const destinationPath = normalizedPath(destination.pathname);
    if (destinationPath === here) {
      if (!document.getElementById(section)) return;
      event.preventDefault();
      if (link.dataset.service) {
        const selector = document.querySelector('select[name="service"]');
        if (selector && [...selector.options].some(option=>option.value===link.dataset.service)) {
          selector.value=link.dataset.service;
          selector.dispatchEvent(new Event('change',{bubbles:true}));
        }
      }
      scrollToSection(section,true);
      return;
    }
    // Cross-page links work without visible hashes. A small tab-scoped hint is
    // consumed on the destination; normal URLs remain crawlable and shareable.
    try {
      sessionStorage.setItem(sectionNavigationKey, JSON.stringify({path:destination.pathname,target:section,service:link.dataset.service||''}));
      event.preventDefault();
      window.location.assign(destination.pathname + destination.search);
    } catch (_) {
      // Storage blocked: preserve the native destination as a functional fallback.
      window.location.assign(destination.pathname + destination.search + '#' + encodeURIComponent(section));
    }
  });

  // Old shared links with #upit, #imenik, etc. still scroll correctly, but
  // the browser bar is immediately normalized to the clean page address.
  const legacyHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
  if (legacyHash && document.getElementById(legacyHash)) {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    const params = new URLSearchParams(window.location.search);
    const selectedService = pendingNavigation?.service || params.get('usluga');
    if (params.has('usluga')) {
      params.delete('usluga');
      const cleanQuery = params.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (cleanQuery ? '?' + cleanQuery : ''));
    }
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
  const pendingTarget = pendingNavigation?.target || legacyHash;
  if (pendingTarget) {
    // Do not wait for slow legacy WordPress photos; the DOM is already parsed
    // when this deferred script runs, so the form/directory can be targeted now.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(pendingTarget, false)));
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

(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {if(e.key === 'Escape') closeMenu();});
  const filters = document.querySelector('.publication-filters');
  if (filters) {
    filters.hidden = false;
    filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      let count = 0;
      document.querySelectorAll('.publication').forEach(pub => {
        pub.hidden = button.dataset.filter !== 'all' && pub.dataset.type !== button.dataset.filter;
        if(!pub.hidden) count++;
      });
      document.getElementById('publication-count').textContent = `${count} publications shown`;
    }));
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          nav?.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
        }
      });
    }, {rootMargin: '-15% 0px -65% 0px'});
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();

/* Anonymous first-party visit measurement; no credentials or raw IP addresses. */
(() => {
  if (location.origin !== 'https://taehyun0213.github.io' || !['/', '/index.html'].includes(location.pathname)) return;
  const endpoint = 'https://taehyun-learning-sciences.taehyun-kim-623.chatgpt.site/api/analytics/collect';
  const optKey = 'tk-analytics-opt-out-v1';
  const visitorKey = 'tk-analytics-visitor-v1';
  const sessionKey = 'tk-analytics-session-v1';
  const uuid = () => crypto.randomUUID();
  try {
    const url = new URL(location.href);
    const preference = url.searchParams.get('analytics');
    if (preference === 'off' || preference === 'on') {
      localStorage.setItem(optKey, preference === 'off' ? '1' : '0');
      url.searchParams.delete('analytics');
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    if (localStorage.getItem(optKey) === '1') return;
  } catch {}
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const remembered = (key, duration) => {
    const now = Date.now();
    let item;
    try { item = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
    if (!item || typeof item.id !== 'string' || !Number.isFinite(item.expires) || item.expires <= now) {
      item = { id: uuid(), expires: now + duration };
    }
    if (key === sessionKey) item.expires = now + duration;
    try { localStorage.setItem(key, JSON.stringify(item)); } catch {}
    return item.id;
  };
  try {
    let referrer = 'direct';
    if (document.referrer) {
      try {
        const source = new URL(document.referrer);
        if (source.origin !== location.origin) referrer = source.hostname;
      } catch {}
    }
    const width = window.innerWidth;
    const event = {
      eventId: uuid(),
      visitor: remembered(visitorKey, 30 * 24 * 60 * 60 * 1000),
      session: remembered(sessionKey, 30 * 60 * 1000),
      path: '/',
      referrer,
      device: width < 600 ? 'mobile' : width < 1000 ? 'tablet' : 'desktop'
    };
    const body = JSON.stringify(event);
    const sent = navigator.sendBeacon?.(endpoint, new Blob([body], {type:'text/plain;charset=UTF-8'}));
    if (!sent) fetch(endpoint, {method:'POST',body,headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'omit',keepalive:true}).catch(() => {});
  } catch {}
})();

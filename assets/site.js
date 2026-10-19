(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const themeButton = document.getElementById('themeBtn');
  // Both pages share the same explicit preference; unavailable storage is harmless.
  let storedTheme;
  try { storedTheme = localStorage.getItem('theme'); } catch {}
  const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const setTheme = theme => {
    root.dataset.theme = theme;
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
      themeButton.setAttribute('aria-label', `Use ${theme === 'dark' ? 'light' : 'dark'} theme`);
      themeButton.title = themeButton.getAttribute('aria-label');
    }
  };
  setTheme(['light', 'dark'].includes(storedTheme) ? storedTheme : preferredTheme);
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
  });

  const menu = document.querySelector('.menu-toggle');
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    menu.textContent = expanded ? 'Close' : 'Menu';
  });
  document.querySelectorAll('.navlinks a').forEach(link => link.addEventListener('click', () => {
    menu?.setAttribute('aria-expanded', 'false');
    if (menu) menu.textContent = 'Menu';
  }));

  // Open a role before navigating to it, including direct shared links.
  const openRole = hash => {
    if (!hash?.startsWith('#')) return;
    const role = document.getElementById(hash.slice(1));
    if (role?.matches('details.job')) role.open = true;
  };
  openRole(location.hash);
  addEventListener('hashchange', () => openRole(location.hash));
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) openRole(anchor.getAttribute('href'));
  });

  const stories = [
    ['Intel / Planning systems', 'Make the system a better decision maker.', 'Refined MaPPS solver logic and allocation optimization to deliver $100M+ in cost savings. Served as the subject matter expert connecting substrate operations with planning systems.', 'intel'],
    ['Intel / Pricing & forecasting', 'Bring better signals into the decision.', 'Partnered with data science and software teams to build AI-driven pricing and allocation forecasting tools, delivering $44M+ in impact.', 'intel'],
    ['Western Digital / SanDisk', 'Plan capacity before the constraint arrives.', 'Managed $250M–$350M in capital planning across global manufacturing expansion and technology transitions. Scenario modeling also delivered 10%+ CapEx savings and approximately 20% capital avoidance.', 'western-digital'],
    ['Intel / Inventory strategy', 'Release working capital across the chain.', 'Co-led inventory reduction with CPLG and Finance: a 30% decrease in assembly-in inventory and a 40% reduction in supplier inventory.', 'intel'],
    ['Intel / Supplier strategy', 'Build a more productive supplier network.', 'Built supplier relationships and negotiated new product introduction pricing, increasing supplier utilization from 18% to 50%.', 'intel'],
    ['Intel / Commercial operations', 'Turn quote variation into a repeatable process.', 'Automated and standardized RFQ processes to reduce supplier price variation from over 60% to under 30%, while cutting quote turnaround by more than five days.', 'intel']
  ];
  const story = document.getElementById('impactStory');
  const metrics = [...document.querySelectorAll('[data-impact]')];
  metrics.forEach(button => button.addEventListener('click', () => {
    const data = stories[Number(button.dataset.impact)];
    if (!data || !story) return;
    metrics.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    story.querySelector('.eyebrow').textContent = data[0];
    story.querySelector('h3').textContent = data[1];
    story.querySelector('p:not(.eyebrow)').textContent = data[2];
    story.querySelector('a').href = `#${data[3]}`;
  }));

  document.getElementById('copyEmail')?.addEventListener('click', async () => {
    const status = document.getElementById('copyStatus');
    try {
      await navigator.clipboard.writeText('weeasu@gmail.com');
      status.textContent = 'Email address copied.';
    } catch {
      status.textContent = 'Email: weeasu@gmail.com — select the address above to copy it.';
    }
  });
  const year = document.getElementById('yr');
  if (year) year.textContent = new Date().getFullYear();

  // Complete the existing case-study tabs with roving focus and relationships.
  document.querySelectorAll('[role="tablist"]').forEach((list, groupIndex) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panel = list.classList.contains('toggle')
      ? document.getElementById('swapCode') : list.nextElementSibling;
    if (!tabs.length || !panel) return;
    panel.id ||= `tab-panel-${groupIndex}`;
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
    const sync = () => tabs.forEach((tab, index) => {
      tab.id ||= `tab-${groupIndex}-${index}`;
      tab.setAttribute('aria-controls', panel.id);
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
      if (tab.tabIndex === 0) panel.setAttribute('aria-labelledby', tab.id);
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', sync);
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        tabs[next].click();
        tabs[next].focus();
      });
    });
    sync();
  });

  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.navlinks a[href^="#"]')];
    const observer = new IntersectionObserver(entries => {
      const active = entries.find(entry => entry.isIntersecting);
      if (!active) return;
      links.forEach(link => {
        if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    links.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) observer.observe(section);
    });
  }

  /* Scroll reveal — slide blocks in from the left, staggered within each group.
     Grid blocks with shared cell borders (.metrics, .pipe) animate as a single
     unit; sliding their cells independently would tear the grid mid-transition. */
  const REVEAL = [
    '.metrics', '.impact-story', '.job', '.project', '.cap', '.stack-row',
    '.edu .card', '.career-index', '.pcol', '.demo-launch', '.pipe',
    '.stage-detail', '.mod-panel', '.layer', '.swap', '.dd', '.srow'
  ].join(', ');

  if ('IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const blocks = [...document.querySelectorAll(REVEAL)];
    const revealer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${entry.target.dataset.revealDelay || 0}ms`;
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    blocks.forEach(block => {
      const index = [...block.parentNode.children].indexOf(block);
      block.dataset.revealDelay = Math.min(index, 6) * 70;
      block.classList.add('reveal');
      revealer.observe(block);
    });
  }
})();

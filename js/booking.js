/* =========================================================
   Sentient Partners — Booking flow logic
   Multi-step: topic → date/time → details → confirmation
   ========================================================= */
(function () {
  'use strict';

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Theme toggle (reuse pattern) ----------
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sp-theme', next); } catch (e) {}
    });
  }

  // ---------- Nav scroll state ----------
  const nav = document.getElementById('nav');
  const onScroll = () => { if (!nav) return; nav.classList.toggle('scrolled', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- State ----------
  const state = { topic: null, date: null, slot: null };
  const slots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  // ---------- Step navigation ----------
  const steps = document.querySelectorAll('[data-step-panel]');
  const dots = document.querySelectorAll('.step-dot');
  function goTo(n) {
    steps.forEach((s) => s.classList.toggle('active', s.dataset.stepPanel === String(n)));
    dots.forEach((d) => {
      const dn = parseInt(d.dataset.step, 10);
      d.classList.remove('active', 'done');
      if (dn < n) d.classList.add('done');
      else if (dn === n) d.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- STEP 1: topic ----------
  const next1 = document.getElementById('next-1');
  document.querySelectorAll('.opt-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.opt-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      state.topic = card.dataset.topic;
      next1.disabled = false;
      next1.style.opacity = '1';
      next1.style.pointerEvents = 'auto';
      updateSummary();
    });
  });
  next1.addEventListener('click', () => goTo(2));

  // ---------- STEP 2: calendar ----------
  let viewYear, viewMonth;
  const today = new Date();
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  const calGrid = document.getElementById('cal-grid');
  const calTitle = document.getElementById('cal-title');
  const slotLabel = document.getElementById('slot-label');
  const slotsWrap = document.getElementById('slots');
  const next2 = document.getElementById('next-2');

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function renderCalendar() {
    calTitle.textContent = MONTHS[viewMonth] + ' ' + viewYear;
    calGrid.innerHTML = '';
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // leading blanks
    for (let i = 0; i < startDay; i++) {
      const b = document.createElement('div');
      calGrid.appendChild(b);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      const cell = document.createElement('div');
      cell.className = 'day-cell rounded-lg py-2';
      cell.textContent = d;
      cell.style.color = 'var(--text)';
      // disable past days and weekends
      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
      if (isPast || isWeekend) {
        cell.classList.add('muted');
      } else {
        if (cellDate.toDateString() === today.toDateString()) cell.classList.add('today');
        if (state.date && cellDate.toDateString() === state.date.toDateString()) cell.classList.add('selected');
        cell.addEventListener('click', () => selectDate(cellDate));
      }
      calGrid.appendChild(cell);
    }
  }

  function selectDate(d) {
    state.date = d;
    state.slot = null;
    renderCalendar();
    next2.disabled = true;
    next2.style.opacity = '0.5';
    next2.style.pointerEvents = 'none';
    // render slots
    slotLabel.textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    slotsWrap.innerHTML = '';
    slots.forEach((t) => {
      const b = document.createElement('button');
      b.className = 'slot rounded-lg border py-2 text-sm';
      b.style.borderColor = 'var(--border)';
      b.style.color = 'var(--text-muted)';
      b.textContent = t;
      b.addEventListener('click', () => {
        document.querySelectorAll('.slot').forEach((s) => s.classList.remove('selected'));
        b.classList.add('selected');
        state.slot = t;
        next2.disabled = false;
        next2.style.opacity = '1';
        next2.style.pointerEvents = 'auto';
        updateSummary();
      });
      slotsWrap.appendChild(b);
    });
  }

  document.getElementById('prev-month').addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar();
  });

  next2.addEventListener('click', () => goTo(3));
  document.querySelectorAll('.back-btn').forEach((b) => {
    b.addEventListener('click', () => {
      const active = document.querySelector('.step.active');
      const cur = parseInt(active.dataset.stepPanel, 10);
      goTo(cur - 1);
    });
  });

  // ---------- Summary ----------
  function updateSummary() {
    const s = document.getElementById('summary');
    const parts = [];
    if (state.topic) parts.push('• Topic: ' + state.topic);
    if (state.date) parts.push('• Date: ' + state.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
    if (state.slot) parts.push('• Time: ' + state.slot);
    s.textContent = parts.length ? parts.join('\n') : '—';
    s.style.whiteSpace = 'pre-line';
  }

  // ---------- STEP 3: confirm ----------
  document.getElementById('confirm').addEventListener('click', () => {
    const name = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    if (!name || !email) {
      alert('Please enter at least your name and email.');
      return;
    }
    const last = document.getElementById('f-last').value.trim();
    const company = document.getElementById('f-company').value.trim();
    document.getElementById('confirm-summary').textContent =
      name + (last ? ' ' + last : '') + ' — ' + state.topic + '\n' +
      state.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + state.slot +
      (company ? '\n' + company : '');
    document.getElementById('confirm-summary').style.whiteSpace = 'pre-line';
    goTo(4);
  });

  // ---------- init ----------
  renderCalendar();
})();

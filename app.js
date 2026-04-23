/* =========================================================
   Class Cost — app.js
   Vanilla JS. No dependencies. No analytics. No localStorage
   (sandbox-safe; state lives in memory only).
   ========================================================= */

(function () {
  'use strict';

  // -------------------------------------------------------
  // Theme toggle
  // -------------------------------------------------------
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  root.setAttribute('data-theme', theme);
  paintThemeButton();

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      paintThemeButton();
    });
  }

  function paintThemeButton() {
    if (!themeBtn) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    themeBtn.innerHTML =
      theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // -------------------------------------------------------
  // School preset data (sample — 25 common US institutions)
  // In production: replace with a College Scorecard API fetch.
  // Figures are published in-state tuition+fees for 2024–25.
  // -------------------------------------------------------
  const SCHOOLS = [
    { name: 'Arizona State University', tuition: 12051 },
    { name: 'Auburn University', tuition: 12912 },
    { name: 'Boston University', tuition: 66670 },
    { name: 'Columbia University', tuition: 68400 },
    { name: 'Cornell University', tuition: 68380 },
    { name: 'Florida State University', tuition: 6517 },
    { name: 'Georgia Institute of Technology', tuition: 12682 },
    { name: 'Harvard University', tuition: 59320 },
    { name: 'Indiana University Bloomington', tuition: 11790 },
    { name: 'Michigan State University', tuition: 16650 },
    { name: 'New York University', tuition: 62796 },
    { name: 'Northeastern University', tuition: 65453 },
    { name: 'Ohio State University', tuition: 12859 },
    { name: 'Pennsylvania State University', tuition: 20660 },
    { name: 'Purdue University', tuition: 10842 },
    { name: 'Rutgers University', tuition: 17029 },
    { name: 'Stanford University', tuition: 65127 },
    { name: 'Texas A&M University', tuition: 13576 },
    { name: 'University of California, Berkeley', tuition: 16266 },
    { name: 'University of Florida', tuition: 6381 },
    { name: 'University of Illinois Urbana-Champaign', tuition: 18052 },
    { name: 'University of Michigan', tuition: 17786 },
    { name: 'University of North Carolina at Chapel Hill', tuition: 9028 },
    { name: 'University of Southern California', tuition: 69904 },
    { name: 'University of Texas at Austin', tuition: 11678 },
    { name: 'University of Washington', tuition: 12973 },
    { name: 'University of Wisconsin–Madison', tuition: 11216 },
    { name: 'Yale University', tuition: 67250 },
  ];

  // Populate datalist
  const datalist = document.getElementById('school-list');
  if (datalist) {
    SCHOOLS.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.name;
      datalist.appendChild(opt);
    });
  }

  // -------------------------------------------------------
  // Equivalences — rough US averages, rotate on each render
  // -------------------------------------------------------
  function generateEquivalences(amount) {
    // Each item has singular + plural labels (Gen-Z, US averages)
    const items = [
      { one: 'Chipotle burrito', many: 'Chipotle burritos', unit: 11.5 },
      { one: 'month of Spotify Premium', many: 'months of Spotify Premium', unit: 11.99 },
      { one: 'Uber across town', many: 'Ubers across town', unit: 18 },
      { one: 'concert ticket', many: 'concert tickets', unit: 75 },
      { one: 'textbook', many: 'textbooks', unit: 65 },
      { one: 'tank of gas', many: 'tanks of gas', unit: 48 },
      { one: 'dining-hall meal swipe', many: 'dining-hall meal swipes', unit: 12 },
      { one: 'large pizza', many: 'large pizzas', unit: 18 },
      { one: 'movie ticket', many: 'movie tickets', unit: 14 },
    ];
    // Pick 3, deterministic per amount so renders are stable
    const seed = Math.floor(amount * 100) || 1;
    const shuffled = items.slice().sort((a, b) => {
      return hash(a.many + seed) - hash(b.many + seed);
    });
    // Skip items where rounded count would be 0
    const picked = [];
    for (const it of shuffled) {
      const count = Math.max(1, Math.round(amount / it.unit));
      if (count === 0) continue;
      picked.push({ count, label: count === 1 ? it.one : it.many });
      if (picked.length === 3) break;
    }
    return picked;
  }

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return h;
  }

  // -------------------------------------------------------
  // Calculator
  // -------------------------------------------------------
  const form = document.getElementById('calc-form');
  const billingRadios = form.querySelectorAll('input[name="billing"]');
  const creditField = form.querySelector('.field--credit');
  const loanToggle = document.getElementById('loan-toggle');
  const loanFields = form.querySelector('.loan-fields');

  const schoolInput = document.getElementById('school');
  const tuitionInput = document.getElementById('tuition');

  // When a school is picked, auto-fill tuition
  schoolInput.addEventListener('change', () => {
    const match = SCHOOLS.find(
      (s) => s.name.toLowerCase() === schoolInput.value.trim().toLowerCase()
    );
    if (match) {
      tuitionInput.value = match.tuition;
      render();
    }
  });

  // Billing mode reveal
  function updateBillingVisibility() {
    const mode = form.querySelector('input[name="billing"]:checked').value;
    if (mode === 'credit') {
      creditField.hidden = false;
    } else {
      creditField.hidden = true;
    }
  }
  billingRadios.forEach((r) => r.addEventListener('change', () => {
    updateBillingVisibility();
    render();
  }));
  updateBillingVisibility();

  // Loan toggle reveal
  loanToggle.addEventListener('change', () => {
    loanFields.hidden = !loanToggle.checked;
    render();
  });

  // Re-render on any input change (debounced lightly)
  let renderTimer;
  form.addEventListener('input', () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  });

  form.addEventListener('reset', () => {
    setTimeout(() => {
      updateBillingVisibility();
      loanFields.hidden = !loanToggle.checked;
      render();
    }, 0);
  });

  // -------------------------------------------------------
  // Math
  // -------------------------------------------------------
  function calcPerClass(values) {
    const { tuition, billing, credits, classCredits, meetings, weeks } = values;
    if (!tuition || tuition <= 0 || !meetings || !weeks) return null;

    let semesterTuitionForClass;
    if (billing === 'flat') {
      // Flat-rate: we approximate what a single class "costs" by its share of
      // the full-time credit load. Using 15 as typical full load if no value.
      const fullLoad = credits && credits > 0 ? credits : 15;
      semesterTuitionForClass = (tuition * classCredits) / fullLoad;
    } else {
      // Per credit hour — tuition IS the per-credit figure
      semesterTuitionForClass = tuition * classCredits;
    }

    const totalMeetings = meetings * weeks;
    if (totalMeetings <= 0) return null;

    return semesterTuitionForClass / totalMeetings;
  }

  function loanAdjusted(principal, annualRate, years) {
    if (!principal || !years) return principal;
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal;
    const monthlyPayment = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    return monthlyPayment * n;
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  const el = {
    today: document.getElementById('result-today'),
    total: document.getElementById('result-total'),
    loanWrap: document.getElementById('result-loan'),
    loanSub: document.getElementById('result-loan-sub'),
    school: document.getElementById('result-school'),
    schedule: document.getElementById('result-schedule'),
    eq: document.getElementById('equivalences'),
    footnote: document.getElementById('result-footnote'),
  };

  function readForm() {
    const data = new FormData(form);
    return {
      school: (data.get('school') || '').toString().trim(),
      tuition: parseFloat(data.get('tuition')) || 0,
      billing: data.get('billing'),
      credits: parseInt(data.get('credits'), 10) || 15,
      classCredits: parseInt(data.get('classCredits'), 10) || 3,
      meetings: parseInt(data.get('meetings'), 10) || 3,
      weeks: parseInt(data.get('weeks'), 10) || 15,
      loanOn: loanToggle.checked,
      rate: parseFloat(data.get('rate')) || 6.53,
      term: parseInt(data.get('term'), 10) || 10,
    };
  }

  function formatMoney(n) {
    if (!isFinite(n) || n <= 0) return '—';
    if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    const v = readForm();
    const perClass = calcPerClass(v);

    if (!perClass || perClass <= 0) {
      el.today.textContent = '—';
      el.loanWrap.hidden = true;
      el.school.textContent = 'your school';
      el.schedule.textContent = 'per session';
      renderEquivalences(0);
      el.footnote.textContent = 'Enter your tuition to see the damage.';
      return;
    }

    el.today.textContent = formatMoney(perClass);
    el.school.textContent = v.school || 'your school';
    el.schedule.textContent =
      v.meetings + (v.meetings === 1 ? ' meeting' : ' meetings') +
      '/week × ' + v.weeks + ' weeks';

    if (v.loanOn) {
      const total = loanAdjusted(perClass, v.rate, v.term);
      el.total.textContent = formatMoney(total);
      el.loanSub.textContent =
        'Assuming a ' + v.rate + '% rate over ' + v.term + ' years.';
      el.loanWrap.hidden = false;
    } else {
      el.loanWrap.hidden = true;
    }

    renderEquivalences(perClass);
    el.footnote.textContent = pickFootnote(perClass);
  }

  function renderEquivalences(amount) {
    el.eq.innerHTML = '';
    if (!amount || amount <= 0) return;
    const eqs = generateEquivalences(amount);
    eqs.forEach((it) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<strong>' + it.count.toLocaleString('en-US') + '</strong> ' + it.label;
      el.eq.appendChild(li);
    });
  }

  const FOOTNOTES = [
    'Now you know how much your nap cost. Make it a good one.',
    'Class is literally cheaper than the Uber there. Probably.',
    'You paid for this lecture. Might as well attend it.',
    'Think of attendance as a refund policy.',
    "You're not skipping class — you're buying one.",
    'A seat you paid for is a seat worth showing up to.',
  ];
  function pickFootnote(amount) {
    return FOOTNOTES[Math.abs(hash(String(amount))) % FOOTNOTES.length];
  }

  // Initial render
  render();

  // -------------------------------------------------------
  // Share card — HTML Canvas export
  // -------------------------------------------------------
  const canvas = document.getElementById('card-canvas');
  const ctx = canvas.getContext('2d');
  const downloadBtn = document.getElementById('download-card');

  downloadBtn.addEventListener('click', async () => {
    const v = readForm();
    const perClass = calcPerClass(v);
    if (!perClass || perClass <= 0) {
      alert('Enter your tuition first — then you can download the card.');
      return;
    }
    await drawCard(v, perClass);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'skipped-class-cost.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  });

  async function drawCard(v, perClass) {
    const W = 1200;
    const H = 630;

    // Ensure Instrument Serif is ready
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (e) { /* noop */ }
    }

    // Background — cream paper
    ctx.fillStyle = '#FBF6EC';
    ctx.fillRect(0, 0, W, H);

    // Soft blush
    const grad = ctx.createRadialGradient(W * 0.95, H * 0.1, 40, W * 0.95, H * 0.1, 700);
    grad.addColorStop(0, '#F2D9CE');
    grad.addColorStop(1, 'rgba(242, 217, 206, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Border frame
    ctx.strokeStyle = '#D1C3A3';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, W - 64, H - 64);

    // Logo
    ctx.fillStyle = '#B8391F';
    roundRect(ctx, 64, 64, 44, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#FBF6EC';
    ctx.font = '400 32px "Instrument Serif", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 86, 88);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = '400 28px "Instrument Serif", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Class', 124, 80);
    ctx.fillStyle = '#B8391F';
    ctx.font = 'italic 400 28px "Instrument Serif", Georgia, serif';
    ctx.fillText('Cost', 124 + ctx.measureText('Class').width, 96);

    // Eyebrow
    ctx.fillStyle = '#B8391F';
    ctx.font = '600 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ONE MISSED CLASS', 64, 220);

    // Big number
    ctx.fillStyle = '#B8391F';
    ctx.font = '400 180px "Instrument Serif", Georgia, serif';
    ctx.textBaseline = 'alphabetic';
    const amount = '$' + formatMoney(perClass);
    ctx.fillText(amount, 64, 400);

    // Caption — school
    ctx.fillStyle = '#5A5448';
    ctx.font = '500 22px Inter, system-ui, sans-serif';
    const schoolText = 'at ' + (v.school || 'your school');
    ctx.fillText(schoolText, 64, 445);

    // Loan figure (if on)
    if (v.loanOn) {
      const total = loanAdjusted(perClass, v.rate, v.term);
      ctx.fillStyle = '#1A1A1A';
      ctx.font = '400 38px "Instrument Serif", Georgia, serif';
      ctx.fillText('$' + formatMoney(total) + ' after loan interest', 64, 510);
      ctx.fillStyle = '#8A8372';
      ctx.font = '400 16px Inter, system-ui, sans-serif';
      ctx.fillText(v.rate + '% over ' + v.term + ' years', 64, 538);
    } else {
      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'italic 400 32px "Instrument Serif", Georgia, serif';
      ctx.fillText(pickFootnote(perClass), 64, 510);
    }

    // URL corner
    ctx.fillStyle = '#8A8372';
    ctx.font = '500 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('classcost.app', W - 64, H - 64);

    // Little stamp mark
    ctx.save();
    ctx.translate(W - 150, 150);
    ctx.rotate(-0.12);
    ctx.strokeStyle = '#B8391F';
    ctx.lineWidth = 3;
    ctx.strokeRect(-60, -28, 120, 56);
    ctx.fillStyle = '#B8391F';
    ctx.font = '700 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('REALITY', 0, -6);
    ctx.fillText('CHECK', 0, 14);
    ctx.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // -------------------------------------------------------
  // Copy link
  // -------------------------------------------------------
  const copyBtn = document.getElementById('copy-link');
  const copyLabel = document.getElementById('copy-link-label');

  copyBtn.addEventListener('click', async () => {
    const url = window.location.href.split('#')[0];
    try {
      await navigator.clipboard.writeText(url);
      copyLabel.textContent = 'Copied';
      setTimeout(() => { copyLabel.textContent = 'Copy link'; }, 1800);
    } catch (e) {
      // Fallback — select temporary input
      const tmp = document.createElement('input');
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand('copy'); copyLabel.textContent = 'Copied'; }
      catch (e2) { copyLabel.textContent = 'Copy failed'; }
      document.body.removeChild(tmp);
      setTimeout(() => { copyLabel.textContent = 'Copy link'; }, 1800);
    }
  });
})();

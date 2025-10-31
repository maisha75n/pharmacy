(() => {
  const STORAGE_KEYS = {
    prescriptions: 'pharmacare:prescriptions',
    profile: 'pharmacare:profile',
    chat: 'pharmacare:chat',
    wellness: 'pharmacare:wellness',
  };

  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // ---------- Utilities ----------
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function formatDate(dateLike) {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function daysUntil(dateLike) {
    const now = new Date();
    const d = new Date(dateLike);
    const ms = d.setHours(0,0,0,0) - now.setHours(0,0,0,0);
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  function generateId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  // ---------- Initial Data ----------
  function ensureSeedData() {
    const seeded = readStorage(STORAGE_KEYS.prescriptions, null);
    if (!seeded) {
      const sample = [
        {
          id: generateId('rx'),
          name: 'Atorvastatin',
          dosage: '20 mg',
          refillDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(), // in 8 days
        },
        {
          id: generateId('rx'),
          name: 'Metformin',
          dosage: '500 mg',
          refillDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // in 2 days
        },
        {
          id: generateId('rx'),
          name: 'Lisinopril',
          dosage: '10 mg',
          refillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // yesterday
        },
      ];
      writeStorage(STORAGE_KEYS.prescriptions, sample);
    }
    const prof = readStorage(STORAGE_KEYS.profile, null);
    if (!prof) {
      writeStorage(STORAGE_KEYS.profile, {
        fullName: '',
        email: '',
        phone: '',
        preferredCity: 'Boston, MA',
      });
    }
    const chat = readStorage(STORAGE_KEYS.chat, null);
    if (!chat) {
      writeStorage(STORAGE_KEYS.chat, [
        { id: generateId('msg'), from: 'agent', text: 'Hi! I\'m your PharmaCare assistant. How can I help today?' }
      ]);
    }
    const wellness = readStorage(STORAGE_KEYS.wellness, null);
    if (!wellness) {
      // by date key YYYY-MM-DD
      const today = dateKey(new Date());
      writeStorage(STORAGE_KEYS.wellness, {
        [today]: { mood: '', water: 0, waterMax: 8, foods: [] }
      });
    }
  }

  // ---------- Date Helpers ----------
  function dateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ---------- Navigation ----------
  function initNav() {
    const buttons = qsa('.primary-nav .nav-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const section = btn.getAttribute('data-section');
        setActiveSection(section);
      });
    });
  }

  function setActiveSection(sectionId) {
    const sections = qsa('.app-main > .section');
    sections.forEach(sec => {
      const isTarget = sec.id === `section-${sectionId}`;
      sec.toggleAttribute('hidden', !isTarget);
      sec.classList.toggle('is-active', isTarget);
    });
    // rerender section content if needed
    if (sectionId === 'dashboard') renderDashboard();
    if (sectionId === 'pharmacies') renderPharmacies();
    if (sectionId === 'chat') renderChat();
    if (sectionId === 'profile') renderProfile();
    if (sectionId === 'wellness') renderWellness();
  }

  // ---------- Dashboard ----------
  function renderDashboard() {
    const listEl = qs('#prescription-list');
    const alertsEl = qs('#alerts');
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);

    // Alerts
    const due = prescriptions.filter(p => daysUntil(p.refillDate) <= 0);
    const soon = prescriptions.filter(p => {
      const d = daysUntil(p.refillDate);
      return d > 0 && d <= 3;
    });
    alertsEl.innerHTML = '';
    if (due.length > 0) {
      due.slice(0, 3).forEach(p => {
        const div = document.createElement('div');
        div.className = 'alert due';
        div.innerHTML = `⏰ Refill due now: <strong>${p.name}</strong> (${p.dosage}). <button class="btn" data-refill="${p.id}">Request Refill</button>`;
        alertsEl.appendChild(div);
      });
    }
    if (soon.length > 0) {
      soon.slice(0, 3).forEach(p => {
        const days = daysUntil(p.refillDate);
        const div = document.createElement('div');
        div.className = 'alert';
        div.textContent = `Reminder: ${p.name} refill in ${days} day${days === 1 ? '' : 's'}.`;
        alertsEl.appendChild(div);
      });
    }

    listEl.innerHTML = '';
    if (prescriptions.length === 0) {
      listEl.innerHTML = '<p>No prescriptions yet. Add one from Upload.</p>';
      return;
    }

    prescriptions.forEach(p => {
      const days = daysUntil(p.refillDate);
      const wrap = document.createElement('article');
      wrap.className = 'card';
      wrap.innerHTML = `
        <h3>${p.name}</h3>
        <div class="meta">Dosage: ${p.dosage}</div>
        <div class="pill ${days <= 0 ? 'danger' : days <= 3 ? 'warn' : ''}" data-countdown="${p.refillDate}">
          <span class="countdown">${countdownText(days)}</span>
        </div>
        <div class="meta">Refill date: ${formatDate(p.refillDate)}</div>
        <div class="actions">
          <button class="btn primary" data-refill="${p.id}">Request Refill</button>
          <button class="btn" data-snooze="${p.id}">Snooze 1 day</button>
        </div>
      `;
      listEl.appendChild(wrap);
    });

    // Bind actions
    listEl.addEventListener('click', onDashboardClick);
    alertsEl.addEventListener('click', onDashboardClick);
  }

  function onDashboardClick(e) {
    const refillBtn = e.target.closest('[data-refill]');
    const snoozeBtn = e.target.closest('[data-snooze]');
    if (refillBtn) {
      const id = refillBtn.getAttribute('data-refill');
      requestRefill(id);
    }
    if (snoozeBtn) {
      const id = snoozeBtn.getAttribute('data-snooze');
      snoozeRefill(id);
    }
  }

  function countdownText(days) {
    if (days <= 0) return 'Refill due now';
    if (days === 1) return 'Refill in 1 day';
    return `Refill in ${days} days`;
  }

  function requestRefill(id) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const idx = prescriptions.findIndex(p => p.id === id);
    if (idx === -1) return;
    // Simulate refill by setting next date 30 days from now
    const next = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    prescriptions[idx].refillDate = next;
    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);
    addAgentMessage(`Refill requested for ${prescriptions[idx].name}. Your next refill date is ${formatDate(next)}.`);
    renderDashboard();
  }

  function snoozeRefill(id) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const idx = prescriptions.findIndex(p => p.id === id);
    if (idx === -1) return;
    const next = new Date(new Date(prescriptions[idx].refillDate).getTime() + 1000 * 60 * 60 * 24).toISOString();
    prescriptions[idx].refillDate = next;
    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);
    renderDashboard();
  }

  // live countdown updater
  function startCountdownTicker() {
    function tick() {
      qsa('[data-countdown]').forEach(el => {
        const iso = el.getAttribute('data-countdown');
        const days = daysUntil(iso);
        const cd = el.querySelector('.countdown');
        if (cd) cd.textContent = countdownText(days);
        el.classList.toggle('danger', days <= 0);
        el.classList.toggle('warn', days > 0 && days <= 3);
      });
    }
    tick();
    setInterval(tick, 60 * 1000);
  }

  // ---------- Upload ----------
  function initUpload() {
    const form = qs('#upload-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#medicationName').value.trim();
      const dosage = qs('#dosage').value.trim();
      const refillDate = qs('#refillDate').value;
      if (!name || !dosage || !refillDate) return;

      // Optional simulated file
      const fileEl = qs('#rxFile');
      const fileName = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0].name : '';

      const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
      prescriptions.unshift({ id: generateId('rx'), name, dosage, refillDate: new Date(refillDate).toISOString(), fileName });
      writeStorage(STORAGE_KEYS.prescriptions, prescriptions);

      form.reset();
      // Switch to dashboard
      setActiveSection('dashboard');
      addAgentMessage(`Added new prescription: ${name} (${dosage}). Refill on ${formatDate(refillDate)}.`);
      renderDashboard();
    });
  }

  // ---------- Pharmacies (Map) ----------
  const SAMPLE_PHARMACIES = [
    { id: 'ph1', name: 'Greenleaf Pharmacy', phone: '(617) 555-0101', address: '12 Beacon St, Boston, MA', hours: '8am–9pm', rating: 4.7 },
    { id: 'ph2', name: 'Harbor Wellness Rx', phone: '(617) 555-0145', address: '220 Seaport Blvd, Boston, MA', hours: 'Open 24/7', rating: 4.4 },
    { id: 'ph3', name: 'Back Bay Apothecary', phone: '(617) 555-0199', address: '800 Boylston St, Boston, MA', hours: '9am–8pm', rating: 4.6 },
    { id: 'ph4', name: 'Charles River Pharmacy', phone: '(617) 555-0166', address: '45 Cambridge St, Cambridge, MA', hours: '7am–10pm', rating: 4.3 },
  ];

  function renderPharmacies() {
    const listEl = qs('#pharmacy-list');
    const detailsEl = qs('#pharmacy-details');
    const frame = qs('#mapFrame');
    const profile = readStorage(STORAGE_KEYS.profile, {});
    const locationQuery = encodeURIComponent(profile.preferredCity || 'Boston, MA');
    const q = `pharmacies near ${locationQuery}`;
    frame.src = `https://www.google.com/maps?q=${q}&output=embed`;

    listEl.innerHTML = '';
    SAMPLE_PHARMACIES.forEach(ph => {
      const div = document.createElement('div');
      div.className = 'pharmacy-item';
      div.setAttribute('data-id', ph.id);
      div.innerHTML = `
        <strong>${ph.name}</strong><br/>
        <span>${ph.address}</span><br/>
        <span>Rating: ${ph.rating.toFixed(1)} ★</span>
      `;
      div.addEventListener('click', () => showPharmacyDetails(ph));
      listEl.appendChild(div);
    });
    detailsEl.innerHTML = '<em>Select a pharmacy to see details.</em>';
  }

  function showPharmacyDetails(ph) {
    const detailsEl = qs('#pharmacy-details');
    detailsEl.innerHTML = `
      <h3>${ph.name}</h3>
      <p>${ph.address}</p>
      <p>Hours: ${ph.hours}</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">
        <a class="btn primary" href="tel:${ph.phone.replace(/[^\d]/g, '')}">Call ${ph.phone}</a>
        <a class="btn" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ph.name + ' ' + ph.address)}">Open in Maps</a>
      </div>
    `;
  }

  // ---------- Chat ----------
  function renderChat() {
    const list = readStorage(STORAGE_KEYS.chat, []);
    const wrap = qs('#chatMessages');
    wrap.innerHTML = '';
    list.forEach(m => {
      const div = document.createElement('div');
      div.className = `bubble ${m.from}`;
      div.textContent = m.text;
      wrap.appendChild(div);
    });
    wrap.scrollTop = wrap.scrollHeight;
  }

  function initChat() {
    const form = qs('#chatForm');
    const input = qs('#chatText');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addUserMessage(text);
      input.value = '';
      setTimeout(() => autoRespond(text), clamp(text.length * 30, 300, 1200));
    });
  }

  function addUserMessage(text) {
    const list = readStorage(STORAGE_KEYS.chat, []);
    list.push({ id: generateId('msg'), from: 'user', text });
    writeStorage(STORAGE_KEYS.chat, list);
    renderChat();
  }

  function addAgentMessage(text) {
    const list = readStorage(STORAGE_KEYS.chat, []);
    list.push({ id: generateId('msg'), from: 'agent', text });
    writeStorage(STORAGE_KEYS.chat, list);
    // Render if chat visible
    if (!qs('#section-chat').hasAttribute('hidden')) renderChat();
  }

  function autoRespond(input) {
    const txt = input.toLowerCase();
    let reply = "I'm here to help. Could you share more details?";
    if (/(refill|renew)/.test(txt)) reply = 'To request a refill, tap the "Request Refill" button on the Dashboard. I can also remind you as the date approaches.';
    else if (/(hour|open)/.test(txt)) reply = 'Many pharmacies open 8am–9pm; some are 24/7. Check the Pharmacies tab for local hours.';
    else if (/(insurance|cover|copay)/.test(txt)) reply = 'Insurance coverage varies. Please contact your pharmacy or provider to confirm your copay.';
    else if (/(hello|hi|hey)/.test(txt)) reply = 'Hello! How can I assist with your prescriptions today?';
    else if (/(contact|phone|call)/.test(txt)) reply = 'Select a pharmacy from the list to view contact options, including a call button.';
    else if (/(side effect|reaction)/.test(txt)) reply = 'For urgent concerns, contact your pharmacist or healthcare provider. In emergencies, call local emergency services.';
    addAgentMessage(reply);
  }

  // ---------- Profile ----------
  function renderProfile() {
    const profile = readStorage(STORAGE_KEYS.profile, {});
    qs('#fullName').value = profile.fullName || '';
    qs('#email').value = profile.email || '';
    qs('#phone').value = profile.phone || '';
    qs('#preferredCity').value = profile.preferredCity || '';
    // Recenter map when returning
    const sec = qs('#section-pharmacies');
    if (!sec.hasAttribute('hidden')) renderPharmacies();
  }

  function initProfile() {
    const form = qs('#profile-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearProfileErrors();
      const fullName = qs('#fullName').value.trim();
      const email = qs('#email').value.trim();
      const phone = qs('#phone').value.trim();
      const preferredCity = qs('#preferredCity').value.trim();
      let valid = true;
      if (!fullName) { showError('fullName', 'Please enter your name.'); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Enter a valid email.'); valid = false; }
      if (!/^[+\d()\-\s]{7,}$/.test(phone)) { showError('phone', 'Enter a valid phone number.'); valid = false; }
      if (!valid) return;
      writeStorage(STORAGE_KEYS.profile, { fullName, email, phone, preferredCity });
      addAgentMessage('Profile saved successfully.');
      // Recenter map on next open
      if (!qs('#section-pharmacies').hasAttribute('hidden')) renderPharmacies();
    });
  }

  function showError(field, msg) {
    qs(`#err-${field}`).textContent = msg;
  }
  function clearProfileErrors() {
    ['fullName','email','phone'].forEach(f => showError(f, ''));
  }

  // ---------- Footer Year ----------
  function setYear() {
    const y = new Date().getFullYear();
    const el = qs('#year'); if (el) el.textContent = String(y);
  }

  // ---------- Wellness ----------
  function initWellness() {
    // Mood
    const moodGroup = qs('#moodChoices');
    if (moodGroup) {
      moodGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.mood-btn');
        if (!btn) return;
        const mood = btn.getAttribute('data-mood');
        setTodayMood(mood);
        renderWellness();
      });
    }

    // Water
    const addBtn = qs('#btnAddWater');
    const remBtn = qs('#btnRemoveWater');
    if (addBtn) addBtn.addEventListener('click', () => { adjustWater(1); });
    if (remBtn) remBtn.addEventListener('click', () => { adjustWater(-1); });

    // Food
    const foodForm = qs('#foodForm');
    if (foodForm) {
      foodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = qs('#foodInput');
        const val = (input.value || '').trim();
        if (!val) return;
        addFood(val);
        input.value = '';
        renderWellness();
      });
    }
  }

  function getTodayRecord() {
    const store = readStorage(STORAGE_KEYS.wellness, {});
    const key = dateKey(new Date());
    if (!store[key]) store[key] = { mood: '', water: 0, waterMax: 8, foods: [] };
    writeStorage(STORAGE_KEYS.wellness, store);
    return store[key];
  }

  function updateTodayRecord(mutator) {
    const store = readStorage(STORAGE_KEYS.wellness, {});
    const key = dateKey(new Date());
    const rec = store[key] || { mood: '', water: 0, waterMax: 8, foods: [] };
    mutator(rec);
    store[key] = rec;
    writeStorage(STORAGE_KEYS.wellness, store);
  }

  function setTodayMood(mood) {
    updateTodayRecord((r) => { r.mood = mood; });
    addAgentMessage(`Noted your mood today: ${mood}`);
  }

  function adjustWater(delta) {
    updateTodayRecord((r) => {
      const max = r.waterMax || 8;
      r.water = clamp((r.water || 0) + delta, 0, 24);
      r.waterMax = max;
    });
    renderWellness();
  }

  function addFood(text) {
    updateTodayRecord((r) => {
      r.foods = Array.isArray(r.foods) ? r.foods : [];
      r.foods.push({ id: generateId('food'), text });
    });
  }

  function removeFood(id) {
    updateTodayRecord((r) => {
      r.foods = (r.foods || []).filter(f => f.id !== id);
    });
    renderWellness();
  }

  function renderWellness() {
    const rec = getTodayRecord();
    // Mood UI
    const moodEl = qs('#moodToday');
    if (moodEl) moodEl.textContent = rec.mood || '—';
    const buttons = qsa('.mood-btn');
    buttons.forEach(b => b.classList.toggle('is-selected', b.getAttribute('data-mood') === rec.mood));

    // Water UI
    const max = rec.waterMax || 8;
    const fill = qs('#waterFill');
    const countEl = qs('#waterCount');
    const maxEl = qs('#waterMax');
    const targetEl = qs('#waterTarget');
    if (fill) {
      const pct = clamp((rec.water / max) * 100, 0, 100);
      fill.style.width = pct + '%';
      fill.setAttribute('aria-valuenow', String(rec.water));
      fill.setAttribute('aria-valuemax', String(max));
    }
    if (countEl) countEl.textContent = String(rec.water || 0);
    if (maxEl) maxEl.textContent = String(max);
    if (targetEl) targetEl.textContent = String(max);

    // Food list
    const listEl = qs('#foodList');
    if (listEl) {
      listEl.innerHTML = '';
      (rec.foods || []).forEach(item => {
        const row = document.createElement('div');
        row.className = 'food-item';
        row.innerHTML = `<span>${item.text}</span><button class="remove" data-remove-food="${item.id}">Remove</button>`;
        listEl.appendChild(row);
      });
      listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove-food]');
        if (!btn) return;
        const id = btn.getAttribute('data-remove-food');
        removeFood(id);
      }, { once: true });
    }
  }

  // ---------- Init ----------
  function init() {
    ensureSeedData();
    initNav();
    initUpload();
    initChat();
    initProfile();
    initWellness();
    renderDashboard();
    startCountdownTicker();
    setYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();



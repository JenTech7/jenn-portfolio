/* ==========================================================================
   Appointment Setting Workflow — Interactions
   Vanilla JS. Data persists to localStorage so the demo works statically
   on GitHub Pages with no backend required.
   ========================================================================== */

const KEYS = {
  appts: 'appt_workflow_appointments',
  checklist: 'appt_workflow_checklist',
};

/* --------------------------------------------------------------------------
   Seed data — shown on first load only
   -------------------------------------------------------------------------- */
const DEFAULT_CHECKLIST = [
  { id: 'c1', title: 'Send instant confirmation email', desc: 'Automatically sent the moment a booking is made.', completed: true },
  { id: 'c2', title: 'Send a reminder 24 hours before', desc: 'Email or SMS reminder with date, time, and location/link.', completed: true },
  { id: 'c3', title: 'Send a same-day reminder', desc: 'Short reminder 1–2 hours before the appointment.', completed: false },
  { id: 'c4', title: 'Confirm by phone or chat for high-value calls', desc: 'A quick personal touch for appointments that matter most.', completed: false },
  { id: 'c5', title: 'Make rescheduling one click away', desc: 'Always include an easy reschedule link instead of a dead end.', completed: true },
  { id: 'c6', title: 'Log no-show risk notes', desc: 'Flag clients with a history of missed appointments for extra follow-up.', completed: false },
];

function seedAppointments() {
  return [
    {
      id: uid(),
      name: 'Amanda Reyes',
      email: 'amanda@brightpath.co',
      date: todayPlus(1),
      time: '10:00',
      service: 'Discovery Call',
      status: 'Confirmed',
    },
    {
      id: uid(),
      name: 'Marcus Bell',
      email: 'marcus@bellconsulting.com',
      date: todayPlus(0),
      time: '15:30',
      service: 'Consultation',
      status: 'Pending',
    },
    {
      id: uid(),
      name: 'Priya Nair',
      email: 'priya@nairstudio.io',
      date: todayPlus(-2),
      time: '11:00',
      service: 'Onboarding Session',
      status: 'Cancelled',
    },
  ];
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function hoursUntil(dateStr, timeStr) {
  const target = new Date(`${dateStr}T${timeStr}:00`);
  const diffMs = target.getTime() - Date.now();
  return diffMs / (1000 * 60 * 60);
}

function load(key, seedFn) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through */ }
  const seeded = seedFn();
  save(key, seeded);
  return seeded;
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch (e) { console.warn('Could not save to localStorage', e); }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* --------------------------------------------------------------------------
   State
   -------------------------------------------------------------------------- */
let appointments = load(KEYS.appts, seedAppointments);
let checklist = load(KEYS.checklist, () => DEFAULT_CHECKLIST);
let activeFilter = 'all';

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const dateInput = document.getElementById('apptDate');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  initBookingForm();
  initFilters();
  renderAll();
});

function renderAll() {
  renderStats();
  renderAppointments();
  renderChecklist();
  renderReminders();
}

/* --------------------------------------------------------------------------
   Booking form
   -------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const fields = {
    clientName: (v) => v.trim().length >= 2 || 'Enter the client\'s name.',
    clientEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    apptDate: (v) => v !== '' || 'Choose an appointment date.',
    apptTime: (v) => v !== '' || 'Choose a time.',
    apptService: (v) => v !== '' || 'Select a service.',
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(fields).forEach((id) => {
      const input = document.getElementById(id);
      const errorEl = form.querySelector(`[data-error-for="${id}"]`);
      const result = fields[id](input.value);

      if (result !== true) {
        isValid = false;
        input.classList.add('has-error');
        if (errorEl) errorEl.textContent = result;
      } else {
        input.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';
      }
    });

    if (!isValid) return;

    appointments.unshift({
      id: uid(),
      name: document.getElementById('clientName').value.trim(),
      email: document.getElementById('clientEmail').value.trim(),
      date: document.getElementById('apptDate').value,
      time: document.getElementById('apptTime').value,
      service: document.getElementById('apptService').value,
      status: 'Pending',
    });

    save(KEYS.appts, appointments);
    form.reset();
    renderAll();
    showToast('Appointment booked');
    document.getElementById('appointments').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  Object.keys(fields).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
      const errorEl = form.querySelector(`[data-error-for="${id}"]`);
      if (errorEl) errorEl.textContent = '';
    });
  });
}

/* --------------------------------------------------------------------------
   Stats
   -------------------------------------------------------------------------- */
function renderStats() {
  setText('statTotal', appointments.length);
  setText('statConfirmed', appointments.filter((a) => a.status === 'Confirmed').length);
  setText('statPending', appointments.filter((a) => a.status === 'Pending').length);
  setText('statCancelled', appointments.filter((a) => a.status === 'Cancelled').length);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* --------------------------------------------------------------------------
   Filters
   -------------------------------------------------------------------------- */
function initFilters() {
  const chips = document.querySelectorAll('#apptFilters .filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderAppointments();
    });
  });
}

/* --------------------------------------------------------------------------
   Appointments
   -------------------------------------------------------------------------- */
function renderAppointments() {
  const list = document.getElementById('apptList');
  if (!list) return;

  let filtered = appointments;
  if (activeFilter !== 'all') {
    filtered = appointments.filter((a) => a.status === activeFilter);
  }

  // Sort soonest first
  filtered = [...filtered].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  if (!filtered.length) {
    list.innerHTML = `<p class="empty-state">No appointments match this filter yet.</p>`;
    return;
  }

  list.innerHTML = filtered.map((a) => `
    <div class="appt-card" data-id="${a.id}">
      <div class="appt-card__main">
        <span class="appt-card__name">${escapeHtml(a.name)}</span>
        <span class="appt-card__email">${escapeHtml(a.email)}</span>
        <div class="appt-card__meta">
          <span><i class="fa-regular fa-calendar"></i> ${formatDate(a.date)}</span>
          <span><i class="fa-regular fa-clock"></i> ${formatTime(a.time)}</span>
          <span><i class="fa-solid fa-briefcase"></i> ${escapeHtml(a.service)}</span>
        </div>
      </div>
      <div class="appt-card__actions">
        <span class="badge badge--${a.status}">${a.status}</span>
        <div class="appt-card__buttons">
          ${a.status !== 'Confirmed' ? `<button class="icon-btn icon-btn--confirm" data-action="confirm" aria-label="Confirm appointment" title="Confirm"><i class="fa-solid fa-check"></i></button>` : ''}
          ${a.status !== 'Cancelled' ? `<button class="icon-btn icon-btn--cancel" data-action="cancel" aria-label="Cancel appointment" title="Cancel"><i class="fa-solid fa-xmark"></i></button>` : ''}
          <button class="icon-btn icon-btn--delete" data-action="delete" aria-label="Delete appointment" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-action="confirm"]').forEach((btn) =>
    btn.addEventListener('click', () => updateStatus(btn.closest('.appt-card').dataset.id, 'Confirmed'))
  );
  list.querySelectorAll('[data-action="cancel"]').forEach((btn) =>
    btn.addEventListener('click', () => updateStatus(btn.closest('.appt-card').dataset.id, 'Cancelled'))
  );
  list.querySelectorAll('[data-action="delete"]').forEach((btn) =>
    btn.addEventListener('click', () => deleteAppointment(btn.closest('.appt-card').dataset.id))
  );
}

function updateStatus(id, status) {
  appointments = appointments.map((a) => (a.id === id ? { ...a, status } : a));
  save(KEYS.appts, appointments);
  renderAll();
  showToast(status === 'Confirmed' ? 'Appointment confirmed' : 'Appointment cancelled');
}

function deleteAppointment(id) {
  appointments = appointments.filter((a) => a.id !== id);
  save(KEYS.appts, appointments);
  renderAll();
  showToast('Appointment removed');
}

/* --------------------------------------------------------------------------
   No-show prevention checklist
   -------------------------------------------------------------------------- */
function renderChecklist() {
  const list = document.getElementById('checklistList');
  if (!list) return;

  list.innerHTML = checklist.map((c) => `
    <li class="checklist-item ${c.completed ? 'completed' : ''}" data-id="${c.id}">
      <button class="check-btn" data-action="toggle" aria-label="Toggle checklist item">
        <i class="fa-solid fa-check"></i>
      </button>
      <div class="checklist-item__body">
        <span class="checklist-item__title">${escapeHtml(c.title)}</span>
        <p class="checklist-item__desc">${escapeHtml(c.desc)}</p>
      </div>
    </li>
  `).join('');

  list.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener('click', () => toggleChecklist(btn.closest('.checklist-item').dataset.id));
  });
}

function toggleChecklist(id) {
  checklist = checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c));
  save(KEYS.checklist, checklist);
  renderChecklist();
}

/* --------------------------------------------------------------------------
   Follow-up reminders — derived from appointment data
   -------------------------------------------------------------------------- */
function renderReminders() {
  const list = document.getElementById('reminderList');
  if (!list) return;

  const reminders = [];

  appointments.forEach((a) => {
    if (a.status === 'Cancelled') return;
    const hrs = hoursUntil(a.date, a.time);

    if (a.status === 'Pending') {
      reminders.push({
        icon: 'fa-solid fa-phone',
        title: `Follow up to confirm ${a.name}`,
        sub: `${a.service} · ${formatDate(a.date)} at ${formatTime(a.time)} — still awaiting confirmation`,
        urgent: hrs < 24,
      });
    } else if (a.status === 'Confirmed' && hrs > 0 && hrs <= 48) {
      reminders.push({
        icon: 'fa-solid fa-bell',
        title: `Send reminder to ${a.name}`,
        sub: `${a.service} · ${formatDate(a.date)} at ${formatTime(a.time)} — coming up within 48 hours`,
        urgent: hrs <= 24,
      });
    }
  });

  reminders.sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1));

  if (!reminders.length) {
    list.innerHTML = `<p class="empty-state">No follow-ups needed right now — everything's on track.</p>`;
    return;
  }

  list.innerHTML = reminders.map((r) => `
    <li class="reminder-item ${r.urgent ? 'reminder-item--urgent' : ''}">
      <div class="reminder-item__icon"><i class="${r.icon}"></i></div>
      <div class="reminder-item__body">
        <span class="reminder-item__title">${escapeHtml(r.title)}</span>
        <p class="reminder-item__sub">${escapeHtml(r.sub)}</p>
      </div>
    </li>
  `).join('');
}

/* --------------------------------------------------------------------------
   Toast
   -------------------------------------------------------------------------- */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

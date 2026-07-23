/* ==========================================================================
   VA Dashboard — Interactions
   Vanilla JS, data persisted to localStorage so it survives page reloads.
   ========================================================================== */

const STORAGE_KEYS = {
  tasks: 'va_dashboard_tasks',
  schedule: 'va_dashboard_schedule',
  clients: 'va_dashboard_clients',
  checklist: 'va_dashboard_checklist',
};

/* --------------------------------------------------------------------------
   Seed data — shown the very first time, before the user adds their own
   -------------------------------------------------------------------------- */
const SEED = {
  tasks: [
    { id: uid(), title: 'Confirm tomorrow\'s discovery call', priority: 'High', due: todayPlus(1), completed: false },
    { id: uid(), title: 'Clear support inbox to zero', priority: 'Medium', due: todayPlus(0), completed: false },
    { id: uid(), title: 'Update CRM with new leads', priority: 'Low', due: todayPlus(2), completed: true },
  ],
  schedule: [
    { id: uid(), time: '09:00', activity: 'Inbox triage & priority sort' },
    { id: uid(), time: '10:30', activity: 'Client onboarding call' },
    { id: uid(), time: '14:00', activity: 'Calendar & appointment confirmations' },
  ],
  clients: [
    { id: uid(), name: 'Rachel M.', lastContact: todayPlus(-3), nextFollowup: todayPlus(2), status: 'Active' },
    { id: uid(), name: 'David T.', lastContact: todayPlus(-7), nextFollowup: todayPlus(0), status: 'Pending' },
  ],
  checklist: [
    { id: uid(), text: 'Review founder\'s priority list for the week', completed: true },
    { id: uid(), text: 'Send weekly operations summary', completed: false },
    { id: uid(), text: 'Audit recurring subscriptions & invoices', completed: false },
  ],
};

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
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to seed */ }
  save(key, seed);
  return seed;
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

/* --------------------------------------------------------------------------
   State
   -------------------------------------------------------------------------- */
let tasks = load(STORAGE_KEYS.tasks, SEED.tasks);
let schedule = load(STORAGE_KEYS.schedule, SEED.schedule);
let clients = load(STORAGE_KEYS.clients, SEED.clients);
let checklist = load(STORAGE_KEYS.checklist, SEED.checklist);
let activeFilter = 'all';

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initGreeting();
  initNav();
  initTaskForm();
  initTaskFilters();
  initScheduleForm();
  initClientForm();
  initChecklistForm();
  initOverviewLinks();
  initQuickAdd();

  renderAll();
});

function renderAll() {
  renderStats();
  renderTasks();
  renderSchedule();
  renderClients();
  renderChecklist();
  renderOverview();
}

/* --------------------------------------------------------------------------
   Greeting + date
   -------------------------------------------------------------------------- */
function initGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const el = document.getElementById('greetingText');
  if (el) el.textContent = `${greeting}, Jennelyn`;

  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }
}

/* --------------------------------------------------------------------------
   Sidebar navigation / view switching
   -------------------------------------------------------------------------- */
function initNav() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const burger = document.getElementById('burger');

  function showView(name) {
    navItems.forEach((n) => n.classList.toggle('active', n.dataset.view === name));
    views.forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => showView(item.dataset.view));
  });

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
  }
  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  }

  if (burger) burger.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  window.__showView = showView; // exposed for "View all" links + quick add
}

function initOverviewLinks() {
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => window.__showView(btn.dataset.goto));
  });
}

function initQuickAdd() {
  const btn = document.getElementById('quickAddBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.__showView('tasks');
    setTimeout(() => document.getElementById('taskTitle')?.focus(), 300);
  });
}

/* --------------------------------------------------------------------------
   Stat cards
   -------------------------------------------------------------------------- */
function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  setText('statTotal', total);
  setText('statCompleted', completed);
  setText('statPending', pending);
  setText('statRate', `${rate}%`);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* --------------------------------------------------------------------------
   TASKS
   -------------------------------------------------------------------------- */
function initTaskForm() {
  const form = document.getElementById('taskForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const due = document.getElementById('taskDue').value;
    if (!title) return;

    tasks.unshift({ id: uid(), title, priority, due, completed: false });
    save(STORAGE_KEYS.tasks, tasks);
    form.reset();
    document.getElementById('taskPriority').value = 'Medium';
    renderAll();
    showToast('Task added');
  });
}

function initTaskFilters() {
  const chips = document.querySelectorAll('#taskFilters .filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderTasks();
    });
  });
}

function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;

  let filtered = tasks;
  if (activeFilter === 'completed') {
    filtered = tasks.filter((t) => t.completed);
  } else if (activeFilter !== 'all') {
    filtered = tasks.filter((t) => t.priority === activeFilter);
  }

  if (!filtered.length) {
    list.innerHTML = `<li class="empty-state">No tasks match this filter yet.</li>`;
    return;
  }

  list.innerHTML = filtered.map((t) => `
    <li class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
      <button class="task-item__check" data-action="toggle" aria-label="Mark task complete">
        <i class="fa-solid fa-check"></i>
      </button>
      <div class="task-item__content">
        <span class="task-item__title">${escapeHtml(t.title)}</span>
        ${t.due ? `<span class="task-item__due"><i class="fa-regular fa-calendar"></i> Due ${formatDate(t.due)}</span>` : ''}
      </div>
      <span class="badge badge--${t.priority}">${t.priority}</span>
      <button class="icon-btn" data-action="delete" aria-label="Delete task">
        <i class="fa-solid fa-trash"></i>
      </button>
    </li>
  `).join('');

  list.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener('click', () => toggleTask(btn.closest('.task-item').dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteTask(btn.closest('.task-item').dataset.id));
  });
}

function toggleTask(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  save(STORAGE_KEYS.tasks, tasks);
  renderAll();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save(STORAGE_KEYS.tasks, tasks);
  renderAll();
  showToast('Task deleted');
}

/* --------------------------------------------------------------------------
   SCHEDULE
   -------------------------------------------------------------------------- */
function initScheduleForm() {
  const form = document.getElementById('scheduleForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const time = document.getElementById('scheduleTime').value;
    const activity = document.getElementById('scheduleActivity').value.trim();
    if (!time || !activity) return;

    schedule.push({ id: uid(), time, activity });
    schedule.sort((a, b) => a.time.localeCompare(b.time));
    save(STORAGE_KEYS.schedule, schedule);
    form.reset();
    renderAll();
    showToast('Added to schedule');
  });
}

function renderSchedule() {
  const list = document.getElementById('scheduleList');
  if (!list) return;

  if (!schedule.length) {
    list.innerHTML = `<li class="empty-state">No schedule items yet — add your first one above.</li>`;
    return;
  }

  list.innerHTML = schedule.map((s) => `
    <li class="schedule-item" data-id="${s.id}">
      <span class="schedule-item__time">${formatTime(s.time)}</span>
      <span class="schedule-item__dot"></span>
      <span class="schedule-item__activity">${escapeHtml(s.activity)}</span>
      <button class="icon-btn" data-action="delete" aria-label="Remove schedule item">
        <i class="fa-solid fa-trash"></i>
      </button>
    </li>
  `).join('');

  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteSchedule(btn.closest('.schedule-item').dataset.id));
  });
}

function deleteSchedule(id) {
  schedule = schedule.filter((s) => s.id !== id);
  save(STORAGE_KEYS.schedule, schedule);
  renderAll();
}

/* --------------------------------------------------------------------------
   CLIENTS
   -------------------------------------------------------------------------- */
function initClientForm() {
  const form = document.getElementById('clientForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName').value.trim();
    const lastContact = document.getElementById('clientLastContact').value;
    const nextFollowup = document.getElementById('clientNextFollowup').value;
    const status = document.getElementById('clientStatus').value;
    if (!name || !lastContact || !nextFollowup) return;

    clients.push({ id: uid(), name, lastContact, nextFollowup, status });
    save(STORAGE_KEYS.clients, clients);
    form.reset();
    document.getElementById('clientStatus').value = 'Active';
    renderAll();
    showToast('Client added');
  });
}

function renderClients() {
  const tbody = document.getElementById('clientTableBody');
  const emptyState = document.getElementById('clientEmptyState');
  if (!tbody) return;

  if (!clients.length) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  const sorted = [...clients].sort((a, b) => a.nextFollowup.localeCompare(b.nextFollowup));

  tbody.innerHTML = sorted.map((c) => `
    <tr data-id="${c.id}">
      <td>${escapeHtml(c.name)}</td>
      <td>${formatDate(c.lastContact)}</td>
      <td>${formatDate(c.nextFollowup)}</td>
      <td><span class="badge badge--${c.status}">${c.status}</span></td>
      <td><button class="icon-btn" data-action="delete" aria-label="Remove client"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteClient(btn.closest('tr').dataset.id));
  });
}

function deleteClient(id) {
  clients = clients.filter((c) => c.id !== id);
  save(STORAGE_KEYS.clients, clients);
  renderAll();
}

/* --------------------------------------------------------------------------
   FOUNDER CHECKLIST
   -------------------------------------------------------------------------- */
function initChecklistForm() {
  const form = document.getElementById('checklistForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('checklistItemInput');
    const text = input.value.trim();
    if (!text) return;

    checklist.push({ id: uid(), text, completed: false });
    save(STORAGE_KEYS.checklist, checklist);
    form.reset();
    renderAll();
    showToast('Checklist item added');
  });
}

function renderChecklist() {
  const list = document.getElementById('checklistList');
  if (!list) return;

  if (!checklist.length) {
    list.innerHTML = `<li class="empty-state">No checklist items yet — add your first one above.</li>`;
  } else {
    list.innerHTML = checklist.map((c) => `
      <li class="checklist-item ${c.completed ? 'completed' : ''}" data-id="${c.id}">
        <button class="task-item__check" data-action="toggle" aria-label="Mark item complete">
          <i class="fa-solid fa-check"></i>
        </button>
        <span class="checklist-item__text">${escapeHtml(c.text)}</span>
        <button class="icon-btn" data-action="delete" aria-label="Delete checklist item">
          <i class="fa-solid fa-trash"></i>
        </button>
      </li>
    `).join('');

    list.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
      btn.addEventListener('click', () => toggleChecklist(btn.closest('.checklist-item').dataset.id));
    });
    list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => deleteChecklist(btn.closest('.checklist-item').dataset.id));
    });
  }

  const done = checklist.filter((c) => c.completed).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const fill = document.getElementById('checklistFill');
  const label = document.getElementById('checklistProgressLabel');
  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = `${done} of ${total} complete`;
}

function toggleChecklist(id) {
  checklist = checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c));
  save(STORAGE_KEYS.checklist, checklist);
  renderAll();
}

function deleteChecklist(id) {
  checklist = checklist.filter((c) => c.id !== id);
  save(STORAGE_KEYS.checklist, checklist);
  renderAll();
}

/* --------------------------------------------------------------------------
   OVERVIEW (summary widgets)
   -------------------------------------------------------------------------- */
function renderOverview() {
  // Priority tasks: incomplete, High first, then Medium, then Low — top 4
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const topTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 4);

  const overviewTasks = document.getElementById('overviewTasks');
  if (overviewTasks) {
    overviewTasks.innerHTML = topTasks.length
      ? topTasks.map((t) => `
          <li>
            <span>${escapeHtml(t.title)}</span>
            <span class="badge badge--${t.priority}">${t.priority}</span>
          </li>
        `).join('')
      : `<li class="empty-state">No pending tasks — nice work!</li>`;
  }

  const overviewSchedule = document.getElementById('overviewSchedule');
  if (overviewSchedule) {
    const topSchedule = schedule.slice(0, 4);
    overviewSchedule.innerHTML = topSchedule.length
      ? topSchedule.map((s) => `
          <li>
            <span>${escapeHtml(s.activity)}</span>
            <span class="badge badge--Low">${formatTime(s.time)}</span>
          </li>
        `).join('')
      : `<li class="empty-state">No schedule items yet.</li>`;
  }

  const overviewClients = document.getElementById('overviewClients');
  if (overviewClients) {
    const upcoming = [...clients]
      .sort((a, b) => a.nextFollowup.localeCompare(b.nextFollowup))
      .slice(0, 4);
    overviewClients.innerHTML = upcoming.length
      ? upcoming.map((c) => `
          <li>
            <span>${escapeHtml(c.name)}</span>
            <span class="badge badge--${c.status}">${formatDate(c.nextFollowup)}</span>
          </li>
        `).join('')
      : `<li class="empty-state">No clients tracked yet.</li>`;
  }
}

/* --------------------------------------------------------------------------
   Toast notifications
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

/* --------------------------------------------------------------------------
   Small utility: escape user input before injecting into innerHTML
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

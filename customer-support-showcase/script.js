/* ============================================================
   CUSTOMER SUPPORT SHOWCASE — APP LOGIC
   Vanilla JS. Data persists in localStorage under 'css_tickets'.
   ============================================================ */

const STORAGE_KEY = 'css_tickets';
const ACTIVITY_KEY = 'css_activity';

/* -------------------- Seed data -------------------- */
const SEED_TICKETS = [
  {
    id: '#201', customer: 'Rachel Ng', email: 'rachel.ng@meridianco.com',
    issue: 'Unable to reset password after email domain change.',
    priority: 'High', status: 'Open', assignedTo: 'Jennelyn', date: '2026-07-22',
    resolution: '',
    convo: [
      { from: 'customer', text: "Hi, I changed my company email and now I can't log in at all." },
      { from: 'agent', text: "Thanks for reaching out, Rachel — I can help. Could you confirm your old email so I can locate the account?" }
    ]
  },
  {
    id: '#202', customer: 'Devon Brooks', email: 'devon.b@harboranalytics.io',
    issue: 'Invoice #4471 shows an incorrect billing amount.',
    priority: 'Medium', status: 'Pending', assignedTo: 'Billing', date: '2026-07-21',
    resolution: 'Escalated to billing team for manual adjustment. Awaiting confirmation from finance.',
    convo: [
      { from: 'customer', text: "My last invoice charged me for two seats but we only use one." },
      { from: 'agent', text: "You're right, I see the discrepancy. I've flagged this with our billing team for correction." }
    ]
  },
  {
    id: '#203', customer: 'Maya Lindqvist', email: 'maya.l@nordicdesignstudio.com',
    issue: 'Dashboard charts fail to load on Safari.',
    priority: 'High', status: 'Resolved', assignedTo: 'Technical Support', date: '2026-07-19',
    resolution: 'Cleared cached script version conflict; confirmed working with customer on a follow-up call.',
    convo: [
      { from: 'customer', text: "The reporting charts are just blank on Safari, works fine on Chrome." },
      { from: 'agent', text: "Found it — a caching issue on our end. Please hard-refresh and let me know if it's resolved." },
      { from: 'customer', text: "That fixed it, thank you!" }
    ]
  },
  {
    id: '#204', customer: 'Oliver Fitzgerald', email: 'oliver.f@brightpathconsulting.com',
    issue: 'Requesting a walkthrough of the new automation features.',
    priority: 'Low', status: 'Open', assignedTo: 'Support Team', date: '2026-07-23',
    resolution: '',
    convo: [
      { from: 'customer', text: "Saw the new automation update — is there a guide or can someone walk me through it?" }
    ]
  },
  {
    id: '#205', customer: 'Priya Chandrasekaran', email: 'priya.c@zenithretail.com',
    issue: 'Bulk CSV import failing on row validation.',
    priority: 'High', status: 'Pending', assignedTo: 'Technical Support', date: '2026-07-22',
    resolution: 'Investigating malformed date fields in customer file; sample requested.',
    convo: [
      { from: 'customer', text: "Every time I upload our customer list it fails at row 40 with no clear error." },
      { from: 'agent', text: "Could you send over a sample of rows 35–45? That'll help us pinpoint the formatting issue." }
    ]
  },
  {
    id: '#206', customer: 'Ben Okafor', email: 'ben.okafor@summitlogix.com',
    issue: 'Wants to downgrade subscription plan before renewal.',
    priority: 'Medium', status: 'Resolved', assignedTo: 'Billing', date: '2026-07-17',
    resolution: 'Plan downgraded effective next billing cycle; confirmation email sent.',
    convo: [
      { from: 'customer', text: "We don't need the premium tier anymore, can we move to standard before renewal?" },
      { from: 'agent', text: "Done — you're scheduled to move to Standard on your next billing date, no proration needed." }
    ]
  },
  {
    id: '#207', customer: 'Isla Whitfield', email: 'isla.w@coastalcreative.studio',
    issue: 'Team member cannot receive notification emails.',
    priority: 'Medium', status: 'Open', assignedTo: 'Jennelyn', date: '2026-07-23',
    resolution: '',
    convo: [
      { from: 'customer', text: "One of my teammates stopped getting any notification emails from the platform." }
    ]
  },
  {
    id: '#208', customer: 'Marcus Webb', email: 'marcus.webb@webbandsons.com',
    issue: 'Requesting data export for annual audit.',
    priority: 'Low', status: 'Pending', assignedTo: 'Support Team', date: '2026-07-20',
    resolution: 'Export queued; large dataset, ETA 24 hours.',
    convo: [
      { from: 'customer', text: "Need a full export of our account activity for this year for our auditors." },
      { from: 'agent', text: "Got it, I've queued the export — given the size it should be ready within 24 hours." }
    ]
  }
];

const SEED_ACTIVITY = [
  { text: 'Ticket #203 resolved', time: '2 hours ago', icon: '✓' },
  { text: 'New ticket assigned to Technical Support', time: '4 hours ago', icon: '→' },
  { text: 'Customer replied on #205', time: '5 hours ago', icon: '💬' },
  { text: 'Priority updated on #201 to High', time: 'Yesterday', icon: '⚑' }
];

let tickets = [];
let activityLog = [];
let activeStatusChip = '';
let openTicketId = null;

/* -------------------- Storage -------------------- */
function loadData() {
  const rawTickets = localStorage.getItem(STORAGE_KEY);
  tickets = rawTickets ? JSON.parse(rawTickets) : SEED_TICKETS.slice();
  if (!rawTickets) saveTickets();

  const rawActivity = localStorage.getItem(ACTIVITY_KEY);
  activityLog = rawActivity ? JSON.parse(rawActivity) : SEED_ACTIVITY.slice();
  if (!rawActivity) saveActivity();
}

function saveTickets() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }
function saveActivity() { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLog)); }

function logActivity(text, icon = '•') {
  activityLog.unshift({ text, time: 'Just now', icon });
  activityLog = activityLog.slice(0, 8);
  saveActivity();
  renderActivity();
}

/* -------------------- Helpers -------------------- */
function slug(str) { return str.toLowerCase().replace(/\s+/g, '-'); }

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* -------------------- Header date -------------------- */
function renderHeaderDate() {
  const now = new Date();
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
}

/* -------------------- Animated counters -------------------- */
function animateCounter(el, target) {
  const duration = 700;
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

function renderStats() {
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const pending = tickets.filter(t => t.status === 'Pending').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  animateCounter(document.getElementById('statTotal'), total);
  animateCounter(document.getElementById('statOpen'), open);
  animateCounter(document.getElementById('statPending'), pending);
  animateCounter(document.getElementById('statResolved'), resolved);
}

/* -------------------- Satisfaction ring -------------------- */
function renderSatisfactionRing() {
  const circumference = 364.4;
  const pct = 0.96;
  const offset = circumference * (1 - pct);
  const ring = document.getElementById('ringProgress');
  requestAnimationFrame(() => { ring.style.strokeDashoffset = offset; });
}

/* -------------------- Table rendering -------------------- */
function getFilteredTickets() {
  const term = document.getElementById('searchInput').value.trim().toLowerCase();
  const statusSelect = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const status = activeStatusChip || statusSelect;

  return tickets.filter(t => {
    const matchesSearch = !term ||
      t.customer.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term);
    const matchesStatus = !status || t.status === status;
    const matchesPriority = !priority || t.priority === priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function renderTable() {
  const tbody = document.getElementById('ticketTableBody');
  const emptyState = document.getElementById('emptyState');
  const rows = getFilteredTickets();

  tbody.innerHTML = '';

  if (rows.length === 0) {
    emptyState.hidden = false;
    document.getElementById('ticketTable').style.display = 'none';
  } else {
    emptyState.hidden = true;
    document.getElementById('ticketTable').style.display = '';
  }

  rows.forEach(t => {
    const tr = document.createElement('tr');
    tr.dataset.id = t.id;
    tr.innerHTML = `
      <td class="cell-id">${escapeHtml(t.id)}</td>
      <td class="cell-customer">${escapeHtml(t.customer)}</td>
      <td class="cell-email">${escapeHtml(t.email)}</td>
      <td class="cell-issue" title="${escapeHtml(t.issue)}">${escapeHtml(t.issue)}</td>
      <td><span class="priority-badge priority-${slug(t.priority)}">${escapeHtml(t.priority)}</span></td>
      <td><span class="badge status-${slug(t.status)}">${escapeHtml(t.status)}</span></td>
      <td>${escapeHtml(t.assignedTo)}</td>
      <td>${formatDate(t.date)}</td>
    `;
    tbody.appendChild(tr);
  });

  renderStats();
}

function renderActivity() {
  const list = document.getElementById('activityList');
  list.innerHTML = '';
  activityLog.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="activity-dot">${item.icon}</span>
      <div class="activity-text">
        ${escapeHtml(item.text)}
        <span class="activity-time">${escapeHtml(item.time)}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

/* -------------------- Ticket detail modal -------------------- */
const ticketModalOverlay = document.getElementById('ticketModalOverlay');

function openTicketModal(ticket) {
  openTicketId = ticket.id;

  document.getElementById('modalTicketId').textContent = ticket.id;
  document.getElementById('dCustomer').textContent = ticket.customer;
  document.getElementById('dEmail').textContent = ticket.email;
  document.getElementById('dPriority').textContent = ticket.priority;
  document.getElementById('dDate').textContent = formatDate(ticket.date);
  document.getElementById('dIssue').textContent = ticket.issue;
  document.getElementById('dResolution').textContent = ticket.resolution || 'No resolution notes yet.';
  document.getElementById('dAssign').value = ticket.assignedTo;
  document.getElementById('dStatus').value = ticket.status;

  const convo = document.getElementById('dConvo');
  convo.innerHTML = ticket.convo.map(msg => `
    <div class="convo-msg from-${msg.from}">
      <span class="convo-author">${msg.from === 'customer' ? escapeHtml(ticket.customer) : 'Support Agent'}</span>
      ${escapeHtml(msg.text)}
    </div>
  `).join('');

  updateStepper(ticket.status);

  ticketModalOverlay.classList.add('open');
}

function closeTicketModal() {
  ticketModalOverlay.classList.remove('open');
  openTicketId = null;
}

function updateStepper(status) {
  const order = ['Open', 'Pending', 'Resolved'];
  const currentIdx = order.indexOf(status);
  document.querySelectorAll('#statusStepper .step').forEach(stepEl => {
    const stepIdx = order.indexOf(stepEl.dataset.step);
    stepEl.classList.remove('active', 'done');
    if (stepIdx < currentIdx) stepEl.classList.add('done');
    else if (stepIdx === currentIdx) stepEl.classList.add('active');
  });
}

document.getElementById('dStatus').addEventListener('change', e => {
  updateStepper(e.target.value);
});

document.getElementById('saveTicketBtn').addEventListener('click', () => {
  const ticket = tickets.find(t => t.id === openTicketId);
  if (!ticket) return;

  const newStatus = document.getElementById('dStatus').value;
  const newAssign = document.getElementById('dAssign').value;
  const statusChanged = newStatus !== ticket.status;
  const assignChanged = newAssign !== ticket.assignedTo;

  ticket.status = newStatus;
  ticket.assignedTo = newAssign;

  saveTickets();
  renderTable();

  if (statusChanged) {
    logActivity(`Ticket ${ticket.id} status updated to ${newStatus}`, newStatus === 'Resolved' ? '✓' : '⚑');
    showToast(newStatus === 'Resolved' ? `Ticket ${ticket.id} resolved.` : `Status updated to ${newStatus}.`);
  }
  if (assignChanged) {
    logActivity(`Ticket ${ticket.id} assigned to ${newAssign}`, '→');
    showToast(`Assigned to ${newAssign}.`);
  }
  if (!statusChanged && !assignChanged) {
    showToast('No changes to save.');
  }

  closeTicketModal();
});

/* -------------------- Event wiring -------------------- */
document.getElementById('ticketTableBody').addEventListener('click', e => {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const ticket = tickets.find(t => t.id === tr.dataset.id);
  if (ticket) openTicketModal(ticket);
});

document.getElementById('closeTicketModal').addEventListener('click', closeTicketModal);
document.getElementById('closeTicketModalBtn').addEventListener('click', closeTicketModal);
ticketModalOverlay.addEventListener('click', e => { if (e.target === ticketModalOverlay) closeTicketModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTicketModal(); });

let searchDebounce;
document.getElementById('searchInput').addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    renderTable();
    const term = document.getElementById('searchInput').value.trim();
    if (term) showToast('Search completed.');
  }, 350);
});

document.getElementById('filterStatus').addEventListener('change', e => {
  activeStatusChip = '';
  syncChips('');
  renderTable();
});
document.getElementById('filterPriority').addEventListener('change', renderTable);

document.getElementById('chipFilters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  activeStatusChip = chip.dataset.status;
  document.getElementById('filterStatus').value = activeStatusChip;
  syncChips(activeStatusChip);
  renderTable();
});

function syncChips(status) {
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.status === status);
  });
}

/* -------------------- Init -------------------- */
loadData();
renderHeaderDate();
renderTable();
renderActivity();
renderSatisfactionRing();

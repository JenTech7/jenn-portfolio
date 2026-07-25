/* ============================================================
   LEAD GENERATION TRACKER — APP LOGIC
   Vanilla JS. Data persists in localStorage under 'lgt_leads'.
   ============================================================ */

const STORAGE_KEY = 'lgt_leads';

const STATUS_ORDER = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];

const STATUS_COLORS = {
  'New Lead': '#6E5AC9',
  'Contacted': '#D98A2B',
  'Qualified': '#1F9D6F',
  'Proposal Sent': '#3D66C4',
  'Negotiation': '#C33B72',
  'Converted': '#17875A',
  'Lost': '#D64545'
};

/* -------------------- Seed data -------------------- */
const SEED_LEADS = [
  {
    id: 'L001', name: 'Amanda Wilson', company: 'Bright Media Agency', industry: 'Digital Marketing',
    email: 'amanda@brightmedia.com', phone: '+1 555 123 4567', source: 'LinkedIn',
    status: 'Qualified', priority: 'High', score: 92,
    lastContact: '2026-07-20', nextFollowup: '2026-07-28',
    notes: 'Interested in a 3-month retainer for lead nurturing. Wants a proposal by end of month.'
  },
  {
    id: 'L002', name: 'Marcus Chen', company: 'Chen & Partners Law', industry: 'Legal Services',
    email: 'marcus@chenpartners.com', phone: '+1 555 220 8891', source: 'Referral',
    status: 'Proposal Sent', priority: 'High', score: 85,
    lastContact: '2026-07-18', nextFollowup: '2026-07-26',
    notes: 'Sent proposal for inbox + calendar management. Awaiting decision from managing partner.'
  },
  {
    id: 'L003', name: 'Priya Natarajan', company: 'GreenLeaf Wellness', industry: 'Health & Wellness',
    email: 'priya@greenleafwellness.com', phone: '+1 555 340 7712', source: 'Instagram',
    status: 'Contacted', priority: 'Medium', score: 64,
    lastContact: '2026-07-15', nextFollowup: '2026-07-29',
    notes: 'Early conversation about social media scheduling support. Budget still being confirmed.'
  },
  {
    id: 'L004', name: 'Diego Ramirez', company: 'Ramirez Realty Group', industry: 'Real Estate',
    email: 'diego@ramirezrealty.com', phone: '+1 555 480 3321', source: 'Networking Event',
    status: 'Negotiation', priority: 'High', score: 88,
    lastContact: '2026-07-21', nextFollowup: '2026-07-27',
    notes: 'Negotiating scope for listing coordination and CRM cleanup. Close to signing.'
  },
  {
    id: 'L005', name: 'Sophie Turner', company: 'Turner Fitness Studio', industry: 'Fitness',
    email: 'sophie@turnerfitness.com', phone: '+1 555 561 9932', source: 'Facebook Ads',
    status: 'New Lead', priority: 'Low', score: 38,
    lastContact: '2026-07-22', nextFollowup: '2026-08-02',
    notes: 'Filled out contact form asking about admin support pricing. Not yet contacted directly.'
  },
  {
    id: 'L006', name: 'James Okafor', company: 'Okafor Financial Advisory', industry: 'Finance',
    email: 'james@okaforfa.com', phone: '+1 555 674 1120', source: 'Cold Email',
    status: 'Converted', priority: 'Medium', score: 95,
    lastContact: '2026-07-10', nextFollowup: '2026-08-10',
    notes: 'Onboarded as a client for ongoing calendar and client intake management.'
  },
  {
    id: 'L007', name: 'Lena Kowalski', company: 'Kowalski Design Co.', industry: 'Creative / Design',
    email: 'lena@kowalskidesign.com', phone: '+1 555 782 4456', source: 'Website Form',
    status: 'Qualified', priority: 'Medium', score: 71,
    lastContact: '2026-07-19', nextFollowup: '2026-07-30',
    notes: 'Needs help managing client onboarding paperwork and project timelines.'
  },
  {
    id: 'L008', name: 'Tom Bradley', company: 'Bradley Home Services', industry: 'Home Services',
    email: 'tom@bradleyhome.com', phone: '+1 555 893 5567', source: 'Upwork',
    status: 'Lost', priority: 'Low', score: 22,
    lastContact: '2026-07-05', nextFollowup: '',
    notes: 'Decided to hire an in-house assistant instead. Keep warm for future referrals.'
  },
  {
    id: 'L009', name: 'Nadia Farouk', company: 'Farouk Events Co.', industry: 'Events & Hospitality',
    email: 'nadia@faroukevents.com', phone: '+1 555 918 2234', source: 'LinkedIn',
    status: 'Contacted', priority: 'High', score: 77,
    lastContact: '2026-07-23', nextFollowup: '2026-07-25',
    notes: 'Peak season coming up — wants help managing vendor communications and RSVPs.'
  }
];

let leads = [];
let editingLeadId = null;
let deletingLeadId = null;
let sortState = { key: 'nextFollowup', dir: 'asc' };

/* -------------------- Storage -------------------- */
function loadLeads() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      leads = JSON.parse(raw);
      return;
    } catch (e) {
      console.warn('Could not parse stored leads, reseeding.', e);
    }
  }
  leads = SEED_LEADS.slice();
  saveLeads();
}

function saveLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

/* -------------------- Helpers -------------------- */
function slugStatus(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function slugPriority(priority) {
  return priority.toLowerCase();
}

function scoreTag(score) {
  if (score >= 80) return { label: '🔥 Hot', cls: 'hot' };
  if (score >= 50) return { label: '🌸 Warm', cls: 'warm' };
  return { label: '❄ Cold', cls: 'cold' };
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysFromToday(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* -------------------- Dashboard KPIs -------------------- */
function renderKpis() {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'New Lead').length;
  const qualified = leads.filter(l => l.status === 'Qualified').length;
  const converted = leads.filter(l => l.status === 'Converted').length;
  const followupsDue = leads.filter(l => {
    const d = daysFromToday(l.nextFollowup);
    return d !== null && d >= 0 && d <= 7 && l.status !== 'Converted' && l.status !== 'Lost';
  }).length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiNew').textContent = newLeads;
  document.getElementById('kpiQualified').textContent = qualified;
  document.getElementById('kpiFollowups').textContent = followupsDue;
  document.getElementById('kpiConverted').textContent = converted;
}

/* -------------------- Pipeline Pulse -------------------- */
function renderPulse() {
  const bar = document.getElementById('pulseBar');
  const legend = document.getElementById('pulseLegend');
  bar.innerHTML = '';
  legend.innerHTML = '';

  const total = leads.length || 1;

  STATUS_ORDER.forEach(status => {
    const count = leads.filter(l => l.status === status).length;
    if (count === 0) return;
    const pct = (count / total) * 100;

    const seg = document.createElement('div');
    seg.className = 'pulse-seg';
    seg.style.width = pct + '%';
    seg.style.background = STATUS_COLORS[status];
    seg.title = `${status}: ${count}`;
    bar.appendChild(seg);

    const item = document.createElement('div');
    item.className = 'pulse-legend-item';
    item.innerHTML = `<span class="pulse-dot" style="background:${STATUS_COLORS[status]}"></span> ${status} · ${count}`;
    legend.appendChild(item);
  });
}

/* -------------------- Table rendering -------------------- */
function getFilteredSortedLeads() {
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  const statusFilter = document.getElementById('filterStatus').value;
  const priorityFilter = document.getElementById('filterPriority').value;
  const sourceFilter = document.getElementById('filterSource').value;

  let result = leads.filter(l => {
    const matchesSearch = !searchTerm ||
      l.name.toLowerCase().includes(searchTerm) ||
      l.company.toLowerCase().includes(searchTerm) ||
      l.email.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesPriority = !priorityFilter || l.priority === priorityFilter;
    const matchesSource = !sourceFilter || l.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const { key, dir } = sortState;
  result.sort((a, b) => {
    let va = a[key], vb = b[key];
    if (key === 'score') { va = Number(va); vb = Number(vb); }
    if (va === undefined || va === '') va = dir === 'asc' ? '\uffff' : '';
    if (vb === undefined || vb === '') vb = dir === 'asc' ? '\uffff' : '';
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}

function renderTable() {
  const tbody = document.getElementById('leadTableBody');
  const emptyState = document.getElementById('emptyState');
  const rows = getFilteredSortedLeads();

  tbody.innerHTML = '';

  if (leads.length === 0) {
    emptyState.hidden = false;
    document.getElementById('leadTable').style.display = 'none';
    renderKpis();
    renderPulse();
    renderFollowups();
    return;
  }
  document.getElementById('leadTable').style.display = '';
  emptyState.hidden = rows.length !== 0 ? true : (leads.length === 0);

  if (rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="11" style="text-align:center; padding: 36px; color: var(--muted);">
      No leads match your search or filters.
    </td>`;
    tbody.appendChild(tr);
  }

  rows.forEach(lead => {
    const tag = scoreTag(lead.score);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="cell-name">${escapeHtml(lead.name)}</span>
        <span class="cell-sub">${escapeHtml(lead.industry || '—')}</span>
      </td>
      <td>${escapeHtml(lead.company)}</td>
      <td>${escapeHtml(lead.industry || '—')}</td>
      <td>
        <div class="cell-contact">
          <strong>${escapeHtml(lead.email)}</strong>
          <span>${escapeHtml(lead.phone || '—')}</span>
        </div>
      </td>
      <td>${escapeHtml(lead.source)}</td>
      <td><span class="badge status-${slugStatus(lead.status)}">${escapeHtml(lead.status)}</span></td>
      <td><span class="priority-badge priority-${slugPriority(lead.priority)}">${escapeHtml(lead.priority)}</span></td>
      <td>
        <div class="score-cell">
          <span class="score-num">${lead.score}</span>
          <span class="score-tag">${tag.label}</span>
        </div>
      </td>
      <td>${formatDate(lead.lastContact)}</td>
      <td>${formatDate(lead.nextFollowup)}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn view-btn" data-id="${lead.id}" title="View">👁</button>
          <button class="action-btn edit-btn" data-id="${lead.id}" title="Edit">✎</button>
          <button class="action-btn delete-btn" data-id="${lead.id}" title="Delete">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderKpis();
  renderPulse();
  renderFollowups();
  populateSourceFilter();
}

function populateSourceFilter() {
  const select = document.getElementById('filterSource');
  const current = select.value;
  const sources = [...new Set(leads.map(l => l.source))].sort();
  select.innerHTML = '<option value="">All Sources</option>' +
    sources.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  select.value = current;
}

/* -------------------- Follow-ups -------------------- */
function renderFollowups() {
  const list = document.getElementById('followupList');
  list.innerHTML = '';

  const upcoming = leads
    .filter(l => l.nextFollowup && l.status !== 'Converted' && l.status !== 'Lost')
    .sort((a, b) => new Date(a.nextFollowup) - new Date(b.nextFollowup))
    .slice(0, 8);

  if (upcoming.length === 0) {
    list.innerHTML = `<div class="followup-empty">No upcoming follow-ups scheduled.</div>`;
    return;
  }

  upcoming.forEach(lead => {
    const days = daysFromToday(lead.nextFollowup);
    let dateClass = '';
    let dateLabel = formatDate(lead.nextFollowup);
    if (days < 0) { dateClass = 'overdue'; dateLabel = `Overdue · ${dateLabel}`; }
    else if (days === 0) { dateClass = 'today'; dateLabel = `Today · ${dateLabel}`; }

    const item = document.createElement('div');
    item.className = 'followup-item';
    item.innerHTML = `
      <div class="followup-left">
        <div class="followup-avatar">${initials(lead.name)}</div>
        <div>
          <div class="followup-name">Follow up with ${escapeHtml(lead.name)}</div>
          <div class="followup-meta">${escapeHtml(lead.company)} · ${escapeHtml(lead.status)}</div>
        </div>
      </div>
      <span class="followup-date ${dateClass}">${dateLabel}</span>
    `;
    list.appendChild(item);
  });
}

/* -------------------- Modal: Add / Edit Lead -------------------- */
const leadModalOverlay = document.getElementById('leadModalOverlay');
const leadForm = document.getElementById('leadForm');

function openLeadModal(lead = null) {
  editingLeadId = lead ? lead.id : null;
  document.getElementById('leadModalTitle').textContent = lead ? 'Edit Lead' : 'Add New Lead';
  document.getElementById('saveLeadBtn').textContent = lead ? 'Save Changes' : 'Save Lead';

  clearFormErrors();

  document.getElementById('fName').value = lead ? lead.name : '';
  document.getElementById('fCompany').value = lead ? lead.company : '';
  document.getElementById('fIndustry').value = lead ? lead.industry : '';
  document.getElementById('fEmail').value = lead ? lead.email : '';
  document.getElementById('fPhone').value = lead ? lead.phone : '';
  document.getElementById('fSource').value = lead ? lead.source : 'LinkedIn';
  document.getElementById('fStatus').value = lead ? lead.status : 'New Lead';
  document.getElementById('fPriority').value = lead ? lead.priority : 'Medium';
  document.getElementById('fScore').value = lead ? lead.score : 50;
  document.getElementById('fLastContact').value = lead ? lead.lastContact : '';
  document.getElementById('fNextFollowup').value = lead ? lead.nextFollowup : '';
  document.getElementById('fNotes').value = lead ? lead.notes : '';

  leadModalOverlay.classList.add('open');
  document.getElementById('fName').focus();
}

function closeLeadModal() {
  leadModalOverlay.classList.remove('open');
  editingLeadId = null;
}

function clearFormErrors() {
  ['fName', 'fCompany', 'fEmail', 'fScore'].forEach(id => {
    const err = document.getElementById('err-' + id);
    if (err) err.textContent = '';
  });
}

function validateForm() {
  clearFormErrors();
  let valid = true;

  const name = document.getElementById('fName').value.trim();
  const company = document.getElementById('fCompany').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const score = Number(document.getElementById('fScore').value);

  if (!name) { document.getElementById('err-fName').textContent = 'Full name is required.'; valid = false; }
  if (!company) { document.getElementById('err-fCompany').textContent = 'Company name is required.'; valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('err-fEmail').textContent = 'Enter a valid email address.'; valid = false;
  }
  if (isNaN(score) || score < 0 || score > 100) {
    document.getElementById('err-fScore').textContent = 'Score must be between 0 and 100.'; valid = false;
  }

  return valid;
}

leadForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const data = {
    name: document.getElementById('fName').value.trim(),
    company: document.getElementById('fCompany').value.trim(),
    industry: document.getElementById('fIndustry').value.trim(),
    email: document.getElementById('fEmail').value.trim(),
    phone: document.getElementById('fPhone').value.trim(),
    source: document.getElementById('fSource').value,
    status: document.getElementById('fStatus').value,
    priority: document.getElementById('fPriority').value,
    score: Number(document.getElementById('fScore').value),
    lastContact: document.getElementById('fLastContact').value,
    nextFollowup: document.getElementById('fNextFollowup').value,
    notes: document.getElementById('fNotes').value.trim()
  };

  if (editingLeadId) {
    const idx = leads.findIndex(l => l.id === editingLeadId);
    if (idx !== -1) leads[idx] = { ...leads[idx], ...data };
    showToast('Lead updated successfully.');
  } else {
    const id = 'L' + String(Date.now()).slice(-6);
    leads.unshift({ id, ...data });
    showToast('New lead added to pipeline.');
  }

  saveLeads();
  renderTable();
  closeLeadModal();
});

/* -------------------- Modal: View Profile -------------------- */
const viewModalOverlay = document.getElementById('viewModalOverlay');

function openViewModal(lead) {
  const tag = scoreTag(lead.score);
  const body = document.getElementById('profileBody');
  body.innerHTML = `
    <div class="profile-top">
      <div class="profile-avatar">${initials(lead.name)}</div>
      <div>
        <h3>${escapeHtml(lead.name)}</h3>
        <span>${escapeHtml(lead.company)} · ${escapeHtml(lead.industry || '—')}</span>
      </div>
    </div>

    <div class="profile-section">
      <h4>Contact Information</h4>
      <div class="profile-grid">
        <div class="profile-item"><span>Email</span><strong>${escapeHtml(lead.email)}</strong></div>
        <div class="profile-item"><span>Phone</span><strong>${escapeHtml(lead.phone || '—')}</strong></div>
        <div class="profile-item"><span>Lead Source</span><strong>${escapeHtml(lead.source)}</strong></div>
        <div class="profile-item"><span>Priority</span><strong>${escapeHtml(lead.priority)}</strong></div>
      </div>
    </div>

    <div class="profile-section">
      <h4>Lead History &amp; Qualification</h4>
      <div class="profile-grid">
        <div class="profile-item"><span>Status</span><strong>${escapeHtml(lead.status)}</strong></div>
        <div class="profile-item"><span>Lead Score</span><strong>${lead.score} · ${tag.label}</strong></div>
        <div class="profile-item"><span>Last Contact</span><strong>${formatDate(lead.lastContact)}</strong></div>
        <div class="profile-item"><span>Next Follow-up</span><strong>${formatDate(lead.nextFollowup)}</strong></div>
      </div>
    </div>

    <div class="profile-section">
      <h4>Notes</h4>
      <div class="profile-notes">${escapeHtml(lead.notes) || 'No notes on file yet.'}</div>
    </div>
  `;
  viewModalOverlay.classList.add('open');
}

function closeViewModal() { viewModalOverlay.classList.remove('open'); }

/* -------------------- Modal: Delete -------------------- */
const deleteModalOverlay = document.getElementById('deleteModalOverlay');

function openDeleteModal(lead) {
  deletingLeadId = lead.id;
  document.getElementById('deleteLeadName').textContent = lead.name;
  deleteModalOverlay.classList.add('open');
}

function closeDeleteModal() {
  deleteModalOverlay.classList.remove('open');
  deletingLeadId = null;
}

document.getElementById('confirmDelete').addEventListener('click', () => {
  leads = leads.filter(l => l.id !== deletingLeadId);
  saveLeads();
  renderTable();
  showToast('Lead deleted.');
  closeDeleteModal();
});

/* -------------------- CSV Export -------------------- */
function exportCsv() {
  if (leads.length === 0) {
    showToast('No leads to export yet.');
    return;
  }
  const headers = ['Lead Name', 'Company', 'Industry', 'Email', 'Phone', 'Source', 'Status', 'Priority', 'Score', 'Last Contact', 'Next Follow-up', 'Notes'];
  const rows = leads.map(l => [
    l.name, l.company, l.industry, l.email, l.phone, l.source, l.status, l.priority, l.score, l.lastContact, l.nextFollowup, l.notes
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lead-generation-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('CSV export downloaded.');
}

/* -------------------- Sorting -------------------- */
document.querySelectorAll('.lead-table thead th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortState.key === key) {
      sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sortState = { key, dir: 'asc' };
    }
    renderTable();
  });
});

/* -------------------- Event wiring -------------------- */
document.getElementById('addLeadBtn').addEventListener('click', () => openLeadModal());
document.getElementById('emptyAddBtn').addEventListener('click', () => openLeadModal());
document.getElementById('closeLeadModal').addEventListener('click', closeLeadModal);
document.getElementById('cancelLeadModal').addEventListener('click', closeLeadModal);
leadModalOverlay.addEventListener('click', e => { if (e.target === leadModalOverlay) closeLeadModal(); });

document.getElementById('closeViewModal').addEventListener('click', closeViewModal);
viewModalOverlay.addEventListener('click', e => { if (e.target === viewModalOverlay) closeViewModal(); });

document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
deleteModalOverlay.addEventListener('click', e => { if (e.target === deleteModalOverlay) closeDeleteModal(); });

document.getElementById('exportBtn').addEventListener('click', exportCsv);

document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('filterStatus').addEventListener('change', renderTable);
document.getElementById('filterPriority').addEventListener('change', renderTable);
document.getElementById('filterSource').addEventListener('change', renderTable);

document.getElementById('leadTableBody').addEventListener('click', e => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  const lead = leads.find(l => l.id === id);
  if (!lead) return;

  if (btn.classList.contains('view-btn')) openViewModal(lead);
  if (btn.classList.contains('edit-btn')) openLeadModal(lead);
  if (btn.classList.contains('delete-btn')) openDeleteModal(lead);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLeadModal();
    closeViewModal();
    closeDeleteModal();
  }
});

/* Sidebar nav smooth-scroll active state */
document.querySelectorAll('.side-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

/* -------------------- Init -------------------- */
loadLeads();
renderTable();

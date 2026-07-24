/* =========================================================
   PulseLeads — Lead Generation Tracker
   Vanilla JS CRUD + LocalStorage
   ========================================================= */

const STORAGE_KEY = "pulseleads_leads_v1";

/* ---------- Sample starter data (only used the very first time) ---------- */
const SEED_LEADS = [
  {
    id: "l1",
    company: "Brightline Home Goods",
    contact: "Maria Chen",
    email: "maria@brightlinehome.com",
    phone: "(310) 555-0142",
    industry: "E-commerce / Retail",
    source: "Referral",
    status: "Qualified",
    priority: "High",
    notes: "Needs help managing 200+ weekly customer emails. Ready for a proposal call."
  },
  {
    id: "l2",
    company: "Nordhaus Legal Group",
    contact: "Daniel Ortiz",
    email: "d.ortiz@nordhauslaw.com",
    phone: "(212) 555-0198",
    industry: "Legal Services",
    source: "LinkedIn",
    status: "Contacted",
    priority: "Medium",
    notes: "Sent intro message, waiting on reply about calendar management scope."
  },
  {
    id: "l3",
    company: "Willow & Bee Studio",
    contact: "Priya Anand",
    email: "priya@willowandbee.co",
    phone: "(415) 555-0177",
    industry: "Creative / Design",
    source: "Upwork",
    status: "New",
    priority: "Medium",
    notes: "Inbound inquiry via Upwork profile. Needs social media scheduling support."
  },
  {
    id: "l4",
    company: "Fernridge Realty Partners",
    contact: "Tom Sackville",
    email: "tom@fernridgerealty.com",
    phone: "(646) 555-0113",
    industry: "Real Estate",
    source: "Networking Event",
    status: "Proposal Sent",
    priority: "High",
    notes: "Proposal sent for listing coordination + CRM data entry. Follow up Friday."
  },
  {
    id: "l5",
    company: "Coastal Fit Studio",
    contact: "Alana Reyes",
    email: "alana@coastalfit.com",
    phone: "(619) 555-0161",
    industry: "Health & Wellness",
    source: "Cold Email",
    status: "Lost",
    priority: "Low",
    notes: "Went with an in-house hire. Keep warm for future referrals."
  },
  {
    id: "l6",
    company: "Ampere Robotics",
    contact: "Kevin Lu",
    email: "kevin.lu@amperorobotics.io",
    phone: "(408) 555-0129",
    industry: "Technology",
    source: "Website",
    status: "Won",
    priority: "High",
    notes: "Onboarded! Weekly retainer for inbox + travel management."
  }
];

let leads = [];

/* ---------- DOM refs ---------- */
const leadsBody      = document.getElementById("leadsBody");
const emptyState      = document.getElementById("emptyState");
const resultCount     = document.getElementById("resultCount");

const statTotal       = document.getElementById("statTotal");
const statQualified    = document.getElementById("statQualified");
const statContacted    = document.getElementById("statContacted");
const statClosed       = document.getElementById("statClosed");

const searchInput      = document.getElementById("searchInput");
const statusFilter      = document.getElementById("statusFilter");
const priorityFilter    = document.getElementById("priorityFilter");

const modalOverlay      = document.getElementById("modalOverlay");
const modalTitle        = document.getElementById("modalTitle");
const leadForm          = document.getElementById("leadForm");
const openAddModal      = document.getElementById("openAddModal");
const emptyAddBtn        = document.getElementById("emptyAddBtn");
const closeModalBtn      = document.getElementById("closeModal");
const cancelModalBtn     = document.getElementById("cancelModal");

const deleteOverlay      = document.getElementById("deleteOverlay");
const cancelDeleteBtn    = document.getElementById("cancelDelete");
const confirmDeleteBtn   = document.getElementById("confirmDelete");

const toastEl            = document.getElementById("toast");

let pendingDeleteId = null;

/* ---------- Storage helpers ---------- */
function loadLeads(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw){
    try{
      leads = JSON.parse(raw);
      return;
    }catch(e){
      leads = [];
    }
  }
  // First run: seed with sample leads so the demo isn't empty
  leads = SEED_LEADS.slice();
  saveLeads();
}

function saveLeads(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function uid(){
  return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

/* ---------- Rendering ---------- */
function statusClass(status){
  return "status-" + status.replace(/\s+/g, "-");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function getFilteredLeads(){
  const q = searchInput.value.trim().toLowerCase();
  const st = statusFilter.value;
  const pr = priorityFilter.value;

  return leads.filter(l => {
    const matchesQuery = !q ||
      l.company.toLowerCase().includes(q) ||
      l.contact.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q);
    const matchesStatus = st === "all" || l.status === st;
    const matchesPriority = pr === "all" || l.priority === pr;
    return matchesQuery && matchesStatus && matchesPriority;
  });
}

function renderTable(){
  const filtered = getFilteredLeads();

  leadsBody.innerHTML = "";

  if (filtered.length === 0){
    emptyState.hidden = leads.length !== 0; // only show "no leads at all" empty state when truly empty
    if (leads.length === 0){
      document.querySelector(".table-scroll").style.display = "none";
      emptyState.hidden = false;
    } else {
      document.querySelector(".table-scroll").style.display = "";
      emptyState.hidden = true;
      leadsBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--ink-500);padding:36px;">No leads match your search or filters.</td></tr>`;
    }
  } else {
    document.querySelector(".table-scroll").style.display = "";
    emptyState.hidden = true;

    filtered.forEach(lead => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="cell-company">${escapeHtml(lead.company)}</td>
        <td>${escapeHtml(lead.contact)}</td>
        <td>${escapeHtml(lead.email)}</td>
        <td>${escapeHtml(lead.phone || "—")}</td>
        <td>${escapeHtml(lead.industry || "—")}</td>
        <td>${escapeHtml(lead.source || "—")}</td>
        <td><span class="badge ${statusClass(lead.status)}">${escapeHtml(lead.status)}</span></td>
        <td><span class="priority priority-${lead.priority}">${escapeHtml(lead.priority)}</span></td>
        <td class="cell-notes">${escapeHtml(lead.notes || "—")}</td>
        <td class="cell-actions">
          <button class="icon-btn" data-action="edit" data-id="${lead.id}" title="Edit lead">✎</button>
          <button class="icon-btn danger" data-action="delete" data-id="${lead.id}" title="Delete lead">🗑</button>
        </td>
      `;
      leadsBody.appendChild(tr);
    });
  }

  resultCount.textContent = `${filtered.length} lead${filtered.length === 1 ? "" : "s"}`;
  renderStats();
}

function renderStats(){
  const total = leads.length;
  const qualified = leads.filter(l => l.status === "Qualified").length;
  const contacted = leads.filter(l => l.status === "Contacted").length;
  const closed = leads.filter(l => l.status === "Won").length;

  statTotal.textContent = total;
  statQualified.textContent = qualified;
  statContacted.textContent = contacted;
  statClosed.textContent = closed;
}

/* ---------- Modal: add/edit ---------- */
function openModal(lead = null){
  leadForm.reset();
  if (lead){
    modalTitle.textContent = "Edit Lead";
    document.getElementById("leadId").value = lead.id;
    document.getElementById("companyName").value = lead.company;
    document.getElementById("contactPerson").value = lead.contact;
    document.getElementById("email").value = lead.email;
    document.getElementById("phone").value = lead.phone || "";
    document.getElementById("industry").value = lead.industry || "";
    document.getElementById("leadSource").value = lead.source || "Referral";
    document.getElementById("status").value = lead.status || "New";
    document.getElementById("priority").value = lead.priority || "Medium";
    document.getElementById("notes").value = lead.notes || "";
  } else {
    modalTitle.textContent = "Add New Lead";
    document.getElementById("leadId").value = "";
    document.getElementById("status").value = "New";
    document.getElementById("priority").value = "Medium";
  }
  modalOverlay.hidden = false;
  document.getElementById("companyName").focus();
}

function closeModal(){
  modalOverlay.hidden = true;
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(message, danger = false){
  toastEl.textContent = message;
  toastEl.classList.toggle("toast-danger", danger);
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ---------- Event handlers ---------- */
openAddModal.addEventListener("click", () => openModal());
emptyAddBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

leadForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("leadId").value;
  const leadData = {
    company: document.getElementById("companyName").value.trim(),
    contact: document.getElementById("contactPerson").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    industry: document.getElementById("industry").value.trim(),
    source: document.getElementById("leadSource").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    notes: document.getElementById("notes").value.trim()
  };

  if (id){
    const idx = leads.findIndex(l => l.id === id);
    if (idx !== -1){
      leads[idx] = { ...leads[idx], ...leadData };
      showToast("Lead updated");
    }
  } else {
    leadData.id = uid();
    leads.unshift(leadData);
    showToast("Lead added");
  }

  saveLeads();
  renderTable();
  closeModal();
});

leadsBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".icon-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "edit"){
    const lead = leads.find(l => l.id === id);
    if (lead) openModal(lead);
  } else if (action === "delete"){
    pendingDeleteId = id;
    deleteOverlay.hidden = false;
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  pendingDeleteId = null;
  deleteOverlay.hidden = true;
});
deleteOverlay.addEventListener("click", (e) => {
  if (e.target === deleteOverlay){
    pendingDeleteId = null;
    deleteOverlay.hidden = true;
  }
});
confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDeleteId){
    leads = leads.filter(l => l.id !== pendingDeleteId);
    saveLeads();
    renderTable();
    showToast("Lead deleted", true);
  }
  pendingDeleteId = null;
  deleteOverlay.hidden = true;
});

searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
priorityFilter.addEventListener("change", renderTable);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape"){
    if (!modalOverlay.hidden) closeModal();
    if (!deleteOverlay.hidden){ deleteOverlay.hidden = true; pendingDeleteId = null; }
  }
});

/* ---------- Init ---------- */
loadLeads();
renderTable();

/* =========================================================
   JENNELYN PORTEA — EMAIL MANAGEMENT DASHBOARD
   Vanilla JS + localStorage — Portfolio Demo
   ========================================================= */

/* ---------------------------------------------------------
   STORAGE KEYS
   --------------------------------------------------------- */
const LS_KEYS = {
  emails: 'vaDash_emails',
  sent: 'vaDash_sent',
  drafts: 'vaDash_drafts',
  templates: 'vaDash_templates',
  followups: 'vaDash_followups',
  tasks: 'vaDash_tasks',
  prefs: 'vaDash_prefs',
  seeded: 'vaDash_seeded_v1'
};

/* ---------------------------------------------------------
   APP STATE
   --------------------------------------------------------- */
const state = {
  view: 'dashboard',
  filter: 'all',
  search: '',
  emails: [],
  sent: [],
  drafts: [],
  templates: [],
  followups: [],
  tasks: [],
  prefs: {},
  confirmCallback: null
};

const FILTERS_BY_VIEW = {
  inbox: ['all','unread','read','starred','high','awaiting','resolved','client','lead','meeting','support'],
  starred: [],
  sent: [],
  drafts: [],
  archived: [],
  followups: []
};

/* ===========================================================
   SEED DATA
   =========================================================== */
function seedEmails(){
  const now = Date.now();
  const mins = (n)=> new Date(now - n*60000);
  const fmtDate = (d)=> d.toLocaleDateString('en-US',{month:'short', day:'numeric'});
  const fmtTime = (d)=> d.toLocaleTimeString('en-US',{hour:'numeric', minute:'2-digit'});
  const mk = (o, offsetMin)=>{
    const d = mins(offsetMin);
    return Object.assign({
      id: 'em_' + Math.random().toString(36).slice(2,10),
      folder: 'inbox',
      unread: true,
      starred: false,
      resolved: false,
      followUp: false,
      date: fmtDate(d),
      time: fmtTime(d),
      ts: d.getTime()
    }, o);
  };
  return [
    mk({sender:'Sarah Johnson', senderEmail:'sarah@brightstudio.com', subject:'Project Proposal Follow-Up',
      preview:"Hi! I wanted to follow up on the proposal we sent last week — do you have a moment to...",
      message:"Hi there,\n\nI wanted to follow up on the proposal we sent last week for the brand refresh project. We're excited about the possibility of working together and would love to schedule a quick call to answer any questions.\n\nCould you let me know your availability this week?\n\nBest,\nSarah Johnson\nBright Studio",
      priority:'High', category:'Client', status:'Awaiting Reply', unread:true}, 12),

    mk({sender:'Michael Reed', senderEmail:'michael@techflow.io', subject:'Meeting Confirmation',
      preview:"Just confirming our call tomorrow at 2 PM EST. Looking forward to discussing the...",
      message:"Hello,\n\nJust confirming our call tomorrow at 2:00 PM EST to discuss the onboarding workflow. I'll send over the agenda beforehand so we can make the most of the time.\n\nTalk soon,\nMichael Reed\nTechFlow",
      priority:'Medium', category:'Meeting', status:'Scheduled', unread:false}, 55),

    mk({sender:'Amanda Lee', senderEmail:'amanda@marketpro.com', subject:'Partnership Opportunity',
      preview:"We came across your work and think there's a great partnership opportunity between...",
      message:"Hi,\n\nWe came across your work and think there's a great partnership opportunity between our companies. We'd love to explore a co-marketing arrangement for Q3.\n\nWould you be open to a short intro call next week?\n\nWarm regards,\nAmanda Lee\nMarketPro",
      priority:'High', category:'Business', status:'Unread', unread:true, starred:true}, 130),

    mk({sender:'Daniel Cruz', senderEmail:'daniel.cruz@gmail.com', subject:'Question about my recent order',
      preview:"Hi, I placed an order last week (#48221) and haven't received a shipping update yet...",
      message:"Hi,\n\nI placed an order last week (#48221) and haven't received a shipping update yet. Could you check on the status for me?\n\nThanks,\nDaniel",
      priority:'Medium', category:'Support', status:'Awaiting Reply', unread:true}, 210),

    mk({sender:'Priya Natarajan', senderEmail:'priya@growthly.co', subject:'Interested in your services',
      preview:"Hello! I found your profile and I'm interested in learning more about your lead generation...",
      message:"Hello!\n\nI found your profile and I'm interested in learning more about your lead generation services for our SaaS startup. Do you have a service package overview you could share?\n\nBest,\nPriya",
      priority:'High', category:'Lead', status:'Awaiting Reply', unread:true}, 320),

    mk({sender:'James Whitfield', senderEmail:'james@whitfieldlaw.com', subject:'Appointment Reminder — Thursday 10 AM',
      preview:"This is a reminder for your appointment this Thursday at 10:00 AM. Please let us know if...",
      message:"Hello,\n\nThis is a reminder for your appointment this Thursday at 10:00 AM. Please let us know if you need to reschedule.\n\nRegards,\nJames Whitfield",
      priority:'Low', category:'Appointment', status:'Scheduled', unread:false}, 480),

    mk({sender:'Billing — CloudHost', senderEmail:'billing@cloudhost.com', subject:'Invoice #33291 is now due',
      preview:"Your invoice #33291 for $84.00 is due on the 15th. Please review the attached summary...",
      message:"Hello,\n\nYour invoice #33291 for $84.00 is due on the 15th. Please review your account to avoid a service interruption.\n\nThank you,\nCloudHost Billing",
      priority:'Medium', category:'Billing', status:'Awaiting Reply', unread:true}, 600),

    mk({sender:'Olivia Bennett', senderEmail:'olivia.bennett@outlook.com', subject:'General inquiry about pricing',
      preview:"Hi there, could you send over your current pricing sheet for virtual assistant packages?",
      message:"Hi there,\n\nCould you send over your current pricing sheet for virtual assistant packages? I'm comparing a few options this month.\n\nThanks,\nOlivia",
      priority:'Low', category:'General', status:'Unread', unread:true}, 720),

    mk({sender:'Internal — Ops Team', senderEmail:'ops@internal.team', subject:'Weekly sync notes attached',
      preview:"Sharing this week's internal sync notes and action items for review before Friday...",
      message:"Hi team,\n\nSharing this week's internal sync notes and action items for review before Friday's stand-up.\n\n- Review client onboarding checklist\n- Update template library\n- Confirm Q3 calendar\n\nThanks,\nOps Team",
      priority:'Low', category:'Internal', status:'Resolved', unread:false, resolved:true}, 900),

    mk({sender:'The VA Weekly', senderEmail:'news@vaweekly.com', subject:'5 Tools Every Virtual Assistant Needs in 2026',
      preview:"This week: automation tools, client communication tips, and a spotlight on top VA...",
      message:"This week's issue covers automation tools, client communication tips, and a spotlight on top virtual assistant service packages for 2026.\n\nRead more on our site.\n\n— The VA Weekly Team",
      priority:'Low', category:'Newsletter', status:'Unread', unread:true}, 1200),

    mk({sender:'Rachel Kim', senderEmail:'rachel@bloomco.com', subject:'Re: Contract renewal terms',
      preview:"Thanks for sending over the updated terms — everything looks good on our end...",
      message:"Hi,\n\nThanks for sending over the updated terms — everything looks good on our end. We're ready to move forward with the renewal.\n\nBest,\nRachel Kim\nBloomCo",
      priority:'Medium', category:'Client', status:'Resolved', unread:false, resolved:true, starred:true}, 1440),

    mk({sender:'Marcus Webb', senderEmail:'marcus@webbfinance.com', subject:'Follow-up needed: onboarding call',
      preview:"Circling back on this — we'd still love to get the onboarding call scheduled for...",
      message:"Hi,\n\nCircling back on this — we'd still love to get the onboarding call scheduled for next week. Let me know a few times that work.\n\nThanks,\nMarcus",
      priority:'High', category:'Client', status:'Awaiting Reply', unread:true, followUp:true}, 1600),
  ];
}

function seedTemplates(){
  return [
    {id:'tpl_1', name:'Client Follow-Up', subject:'Following up on our conversation',
      message:"Hi {{name}},\n\nI wanted to follow up on our recent conversation and see if you had any questions I can help with.\n\nLooking forward to hearing from you.\n\nBest,\nJennelyn Portea"},
    {id:'tpl_2', name:'Meeting Confirmation', subject:'Confirming our upcoming meeting',
      message:"Hi {{name}},\n\nThis confirms our meeting scheduled for {{date}} at {{time}}. Please let me know if anything changes on your end.\n\nTalk soon,\nJennelyn Portea"},
    {id:'tpl_3', name:'Customer Support Response', subject:'Re: Your recent inquiry',
      message:"Hi {{name}},\n\nThank you for reaching out. I've looked into your request and here's an update...\n\nPlease let me know if you have any further questions.\n\nWarm regards,\nJennelyn Portea"},
    {id:'tpl_4', name:'Appointment Reminder', subject:'Reminder: Your upcoming appointment',
      message:"Hi {{name}},\n\nThis is a friendly reminder about your upcoming appointment on {{date}} at {{time}}. Please reach out if you need to reschedule.\n\nBest,\nJennelyn Portea"},
    {id:'tpl_5', name:'Lead Follow-Up', subject:'Great connecting with you',
      message:"Hi {{name}},\n\nIt was great connecting with you. I'd love to share more about how we can help — do you have 15 minutes this week for a quick call?\n\nBest,\nJennelyn Portea"},
    {id:'tpl_6', name:'Payment Reminder', subject:'Friendly reminder: Invoice due',
      message:"Hi {{name}},\n\nThis is a friendly reminder that invoice {{invoice}} is due on {{date}}. Let me know if you have any questions about the charges.\n\nThank you,\nJennelyn Portea"},
    {id:'tpl_7', name:'Welcome Email', subject:'Welcome aboard!',
      message:"Hi {{name}},\n\nWelcome aboard! I'm excited to start working together. Attached you'll find everything you need to get started.\n\nWarmly,\nJennelyn Portea"},
  ];
}

function seedFollowups(){
  const d1 = new Date(); d1.setDate(d1.getDate()+2);
  const d2 = new Date(); d2.setDate(d2.getDate()+4);
  return [
    {id:'fu_1', contact:'Amanda Lee', company:'MarketPro', subject:'Partnership Opportunity',
      date:d1.toISOString().slice(0,10), priority:'High', status:'Pending'},
    {id:'fu_2', contact:'Marcus Webb', company:'Webb Finance', subject:'Onboarding call scheduling',
      date:d2.toISOString().slice(0,10), priority:'High', status:'Pending'},
  ];
}

function seedTasks(){
  return [
    {id:'tk_1', text:"Reply to Sarah — Project Proposal", done:false},
    {id:'tk_2', text:"Follow up with Amanda — Partnership", done:false},
    {id:'tk_3', text:"Confirm Michael's meeting", done:true},
    {id:'tk_4', text:"Clear unread emails", done:false},
  ];
}

/* ===========================================================
   PERSISTENCE
   =========================================================== */
function loadData(){
  const seeded = localStorage.getItem(LS_KEYS.seeded);
  if(!seeded){
    state.emails = seedEmails();
    state.sent = [];
    state.drafts = [];
    state.templates = seedTemplates();
    state.followups = seedFollowups();
    state.tasks = seedTasks();
    state.prefs = {status:'Available', responseTime:'Within 2 hours', mode:'Portfolio Demo Mode'};
    saveData();
    localStorage.setItem(LS_KEYS.seeded, 'true');
    return;
  }
  try{
    state.emails = JSON.parse(localStorage.getItem(LS_KEYS.emails)) || [];
    state.sent = JSON.parse(localStorage.getItem(LS_KEYS.sent)) || [];
    state.drafts = JSON.parse(localStorage.getItem(LS_KEYS.drafts)) || [];
    state.templates = JSON.parse(localStorage.getItem(LS_KEYS.templates)) || [];
    state.followups = JSON.parse(localStorage.getItem(LS_KEYS.followups)) || [];
    state.tasks = JSON.parse(localStorage.getItem(LS_KEYS.tasks)) || [];
    state.prefs = JSON.parse(localStorage.getItem(LS_KEYS.prefs)) || {status:'Available', responseTime:'Within 2 hours', mode:'Portfolio Demo Mode'};
  }catch(e){
    console.error('Failed to parse stored data, reseeding.', e);
    resetDemoData(true);
  }
}

function saveData(){
  try{
    localStorage.setItem(LS_KEYS.emails, JSON.stringify(state.emails));
    localStorage.setItem(LS_KEYS.sent, JSON.stringify(state.sent));
    localStorage.setItem(LS_KEYS.drafts, JSON.stringify(state.drafts));
    localStorage.setItem(LS_KEYS.templates, JSON.stringify(state.templates));
    localStorage.setItem(LS_KEYS.followups, JSON.stringify(state.followups));
    localStorage.setItem(LS_KEYS.tasks, JSON.stringify(state.tasks));
    localStorage.setItem(LS_KEYS.prefs, JSON.stringify(state.prefs));
  }catch(e){
    console.error('Storage save failed', e);
    showToast('Storage error — changes may not persist', 'error');
  }
}

function resetDemoData(silent){
  localStorage.removeItem(LS_KEYS.seeded);
  loadData();
  state.view = 'dashboard';
  state.filter = 'all';
  state.search = '';
  renderApp();
  if(!silent) showToast('Demo data reset ✓', 'success');
}

/* ===========================================================
   HELPERS
   =========================================================== */
function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function initials(name){
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
}
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function nowStamp(){
  const d = new Date();
  return {
    date: d.toLocaleDateString('en-US',{month:'short', day:'numeric'}),
    time: d.toLocaleTimeString('en-US',{hour:'numeric', minute:'2-digit'}),
    ts: d.getTime()
  };
}
function isValidEmailAddress(str){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}
function getEmailById(id){ return state.emails.find(e=>e.id===id); }

/* ===========================================================
   TOASTS
   =========================================================== */
function showToast(message, type){
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'success');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(()=>{
    toast.classList.add('is-leaving');
    setTimeout(()=> toast.remove(), 220);
  }, 3000);
}

/* ===========================================================
   CONFIRM DIALOG
   =========================================================== */
function openConfirm(title, message, onConfirm){
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  state.confirmCallback = onConfirm;
  document.getElementById('confirmModal').hidden = false;
}
function closeConfirm(){
  document.getElementById('confirmModal').hidden = true;
  state.confirmCallback = null;
}

/* ===========================================================
   NAVIGATION / VIEW RENDERING
   =========================================================== */
const VIEW_META = {
  dashboard:{title:'Dashboard', subtitle:"Welcome back — here's what's happening today."},
  inbox:{title:'Inbox', subtitle:'All incoming client and lead communication.'},
  starred:{title:'Starred', subtitle:'Emails you flagged as important.'},
  sent:{title:'Sent', subtitle:'Messages sent from this workspace.'},
  drafts:{title:'Drafts', subtitle:'Unfinished messages saved for later.'},
  archived:{title:'Archived', subtitle:'Emails moved out of the active inbox.'},
  followups:{title:'Follow-ups', subtitle:'Contacts to circle back with.'},
  templates:{title:'Email Templates', subtitle:'Reusable messages for common situations.'},
  reports:{title:'Reports', subtitle:'Performance across the inbox this period.'},
  settings:{title:'Settings', subtitle:'Profile, availability, and demo controls.'}
};

function setView(view){
  state.view = view;
  state.filter = 'all';
  state.search = '';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.classList.toggle('is-active', btn.dataset.view === view);
  });
  closeMobileSidebar();
  renderApp();
  document.getElementById('main-content').scrollTo({top:0, behavior:'smooth'});
}

function renderApp(){
  const meta = VIEW_META[state.view] || VIEW_META.dashboard;
  document.getElementById('viewTitle').textContent = meta.title;
  document.getElementById('viewSubtitle').textContent = meta.subtitle;
  updateSidebarBadges();
  renderToolbar();
  renderHeaderActions();

  const root = document.getElementById('viewRoot');
  switch(state.view){
    case 'dashboard': root.innerHTML = renderDashboard(); attachDashboardEvents(); break;
    case 'inbox': root.innerHTML = renderInbox(); attachEmailListEvents(); break;
    case 'starred': root.innerHTML = renderStarred(); attachEmailListEvents(); break;
    case 'sent': root.innerHTML = renderSent(); attachSentEvents(); break;
    case 'drafts': root.innerHTML = renderDrafts(); attachDraftEvents(); break;
    case 'archived': root.innerHTML = renderArchived(); attachEmailListEvents(); break;
    case 'followups': root.innerHTML = renderFollowUps(); attachFollowupEvents(); break;
    case 'templates': root.innerHTML = renderTemplates(); attachTemplateEvents(); break;
    case 'reports': root.innerHTML = renderReports(); break;
    case 'settings': root.innerHTML = renderSettings(); attachSettingsEvents(); break;
    default: root.innerHTML = renderDashboard();
  }
}

function updateSidebarBadges(){
  const unread = state.emails.filter(e=>e.folder==='inbox' && e.unread).length;
  document.getElementById('badgeInbox').textContent = unread;
  document.getElementById('badgeInbox').style.display = unread ? 'inline-flex' : 'none';
  document.getElementById('badgeDrafts').textContent = state.drafts.length;
  document.getElementById('badgeDrafts').style.display = state.drafts.length ? 'inline-flex' : 'none';
  const pendingFu = state.followups.filter(f=>f.status==='Pending').length;
  document.getElementById('badgeFollowups').textContent = pendingFu;
  document.getElementById('badgeFollowups').style.display = pendingFu ? 'inline-flex' : 'none';
}

function renderToolbar(){
  const toolbar = document.getElementById('toolbar');
  const searchableViews = ['inbox','starred','sent','drafts','archived'];
  const filterOptions = FILTERS_BY_VIEW[state.view];

  if(!searchableViews.includes(state.view)){
    toolbar.style.display = 'none';
    return;
  }
  toolbar.style.display = 'flex';

  const filterBar = document.getElementById('filterBar');
  if(filterOptions && filterOptions.length){
    filterBar.style.display = 'flex';
    const labels = {all:'All', unread:'Unread', read:'Read', starred:'Starred', high:'High Priority',
      awaiting:'Awaiting Reply', resolved:'Resolved', client:'Client', lead:'Lead', meeting:'Meeting', support:'Support'};
    filterBar.innerHTML = filterOptions.map(f=>
      `<button class="filter-chip ${state.filter===f?'is-active':''}" data-filter="${f}">${labels[f]}</button>`
    ).join('');
    filterBar.querySelectorAll('.filter-chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        state.filter = chip.dataset.filter;
        renderApp();
      });
    });
  }else{
    filterBar.style.display = 'none';
    filterBar.innerHTML = '';
  }
}

function renderHeaderActions(){
  const box = document.getElementById('viewHeaderActions');
  if(state.view === 'templates'){
    box.innerHTML = `<button class="btn btn-primary" id="newTemplateBtn">+ New Template</button>`;
    document.getElementById('newTemplateBtn').addEventListener('click', ()=> openTemplateModal());
  }else if(state.view === 'followups'){
    box.innerHTML = `<button class="btn btn-primary" id="newFollowupBtn">+ Add Follow-up</button>`;
    document.getElementById('newFollowupBtn').addEventListener('click', ()=> openFollowupModal());
  }else if(state.view === 'inbox' || state.view === 'starred' || state.view === 'archived'){
    box.innerHTML = `<button class="btn btn-primary" id="headerComposeBtn">+ Compose</button>`;
    document.getElementById('headerComposeBtn').addEventListener('click', ()=> composeEmail());
  }else{
    box.innerHTML = '';
  }
}

/* ===========================================================
   SEARCH + FILTER (shared)
   =========================================================== */
function searchEmails(list){
  const q = state.search.trim().toLowerCase();
  if(!q) return list;
  return list.filter(e=>{
    const hay = [e.sender, e.senderEmail, e.subject, e.message, e.preview, e.category].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function filterEmails(list){
  switch(state.filter){
    case 'unread': return list.filter(e=>e.unread);
    case 'read': return list.filter(e=>!e.unread);
    case 'starred': return list.filter(e=>e.starred);
    case 'high': return list.filter(e=>e.priority==='High');
    case 'awaiting': return list.filter(e=>e.status==='Awaiting Reply');
    case 'resolved': return list.filter(e=>e.resolved);
    case 'client': return list.filter(e=>e.category==='Client');
    case 'lead': return list.filter(e=>e.category==='Lead');
    case 'meeting': return list.filter(e=>e.category==='Meeting');
    case 'support': return list.filter(e=>e.category==='Support');
    default: return list;
  }
}

/* ===========================================================
   DASHBOARD
   =========================================================== */
function computeStats(){
  const inbox = state.emails.filter(e=>e.folder==='inbox');
  const unread = inbox.filter(e=>e.unread).length;
  const high = inbox.filter(e=>e.priority==='High').length;
  const awaiting = inbox.filter(e=>e.status==='Awaiting Reply').length;
  const today = nowStamp().date;
  const resolvedToday = state.emails.filter(e=>e.resolved && e.date===today).length;
  return {
    total: state.emails.length,
    unread, high, awaiting,
    resolvedToday,
    avgResponse: '1.8 hrs',
    followups: state.followups.filter(f=>f.status==='Pending').length,
    drafts: state.drafts.length
  };
}

function renderDashboard(){
  const s = computeStats();
  const cards = [
    {label:'Total Emails', value:s.total, icon:'✉'},
    {label:'Unread', value:s.unread, icon:'●'},
    {label:'High Priority', value:s.high, icon:'▲'},
    {label:'Awaiting Reply', value:s.awaiting, icon:'⏳'},
    {label:'Resolved Today', value:s.resolvedToday, icon:'✓'},
    {label:'Avg. Response Time', value:s.avgResponse, icon:'⏱'},
    {label:'Follow-ups', value:s.followups, icon:'⏰'},
    {label:'Drafts', value:s.drafts, icon:'✎'},
  ];
  const statCards = cards.map(c=>`
    <div class="stat-card">
      <div class="stat-icon">${c.icon}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
    </div>
  `).join('');

  const priorityInbox = state.emails
    .filter(e=>e.folder==='inbox' && !e.resolved)
    .sort((a,b)=> (b.priority==='High') - (a.priority==='High') || b.ts - a.ts)
    .slice(0,5);

  const emailListHtml = priorityInbox.length ? priorityInbox.map(e=> emailRowTemplate(e)).join('') :
    emptyStateTemplate('✉','Inbox zero','No priority emails right now — nice work.');

  const tasksHtml = state.tasks.length ? state.tasks.map(t=>`
    <div class="task-row ${t.done?'is-done':''}" data-id="${t.id}">
      <input type="checkbox" ${t.done?'checked':''} class="task-check" aria-label="Mark task complete">
      <span class="task-text">${escapeHtml(t.text)}</span>
      <button class="task-del" data-id="${t.id}" aria-label="Delete task">✕</button>
    </div>
  `).join('') : `<p style="color:var(--ink-muted); font-size:.85rem;">No tasks yet — add one below.</p>`;

  return `
    <div class="stat-grid">${statCards}</div>
    <div class="dashboard-grid">
      <div>
        <div class="panel">
          <div class="panel-title"><h2>Priority Inbox</h2><button class="btn btn-outline btn-sm" data-goto="inbox">View all</button></div>
          <div class="email-list">${emailListHtml}</div>
        </div>
      </div>
      <div>
        <div class="panel">
          <div class="panel-title"><h2>Today's Email Priorities</h2></div>
          <div class="task-list" id="taskList">${tasksHtml}</div>
          <div class="task-add-row">
            <label for="newTaskInput" class="sr-only">Add a task</label>
            <input type="text" id="newTaskInput" placeholder="Add a priority task…">
            <button class="btn btn-primary btn-sm" id="addTaskBtn">Add</button>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title"><h2>Snapshot</h2></div>
          <div class="settings-row"><span class="settings-row-label">Status</span><span class="settings-row-value">${escapeHtml(state.prefs.status)}</span></div>
          <div class="settings-row"><span class="settings-row-label">Response Time</span><span class="settings-row-value">${escapeHtml(state.prefs.responseTime)}</span></div>
          <div class="settings-row"><span class="settings-row-label">Mode</span><span class="settings-row-value">${escapeHtml(state.prefs.mode)}</span></div>
        </div>
      </div>
    </div>
  `;
}

function attachDashboardEvents(){
  document.querySelectorAll('[data-goto]').forEach(btn=>{
    btn.addEventListener('click', ()=> setView(btn.dataset.goto));
  });
  document.querySelectorAll('.email-row').forEach(row=>{
    row.addEventListener('click', (evt)=>{
      if(evt.target.closest('.mini-btn') || evt.target.closest('.email-row-check')) return;
      openEmail(row.dataset.id);
    });
  });
  attachRowMiniButtons();

  const list = document.getElementById('taskList');
  if(list){
    list.querySelectorAll('.task-check').forEach(cb=>{
      cb.addEventListener('change', ()=> toggleTask(cb.closest('.task-row').dataset.id));
    });
    list.querySelectorAll('.task-del').forEach(btn=>{
      btn.addEventListener('click', ()=> deleteTask(btn.dataset.id));
    });
  }
  const addBtn = document.getElementById('addTaskBtn');
  const input = document.getElementById('newTaskInput');
  if(addBtn){
    addBtn.addEventListener('click', ()=> addTask(input.value));
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTask(input.value); } });
  }
}

function addTask(text){
  const trimmed = (text||'').trim();
  if(!trimmed) return;
  state.tasks.unshift({id: uid('tk'), text: trimmed, done:false});
  saveData();
  renderApp();
  showToast('Task added ✓','success');
}
function toggleTask(id){
  const t = state.tasks.find(x=>x.id===id);
  if(!t) return;
  t.done = !t.done;
  saveData();
  renderApp();
}
function deleteTask(id){
  state.tasks = state.tasks.filter(x=>x.id!==id);
  saveData();
  renderApp();
  showToast('Task deleted ✓','success');
}

/* ===========================================================
   EMAIL LIST VIEWS (inbox / starred / archived)
   =========================================================== */
function emailRowTemplate(e){
  const tags = [`<span class="tag tag-${e.category}">${escapeHtml(e.category)}</span>`];
  if(e.resolved) tags.push(`<span class="tag tag-Resolved">Resolved</span>`);
  else tags.push(`<span class="tag tag-status">${escapeHtml(e.status)}</span>`);
  if(e.followUp) tags.push(`<span class="tag tag-status">Follow-up</span>`);

  return `
  <article class="email-row ${e.unread?'is-unread':''}" data-id="${e.id}" tabindex="0" role="button" aria-label="Open email from ${escapeHtml(e.sender)}: ${escapeHtml(e.subject)}">
    <div class="avatar" aria-hidden="true">${initials(e.sender)}</div>
    <div class="email-row-body">
      <div class="email-row-top">
        <span class="email-sender">${escapeHtml(e.sender)}</span>
        <span class="email-priority-dot priority-${e.priority}" title="${e.priority} priority"></span>
      </div>
      <div class="email-subject">${escapeHtml(e.subject)}</div>
      <div class="email-preview">${escapeHtml(e.preview || '')}</div>
      <div class="email-row-tags">${tags.join('')}</div>
    </div>
    <div class="email-row-meta">
      <span class="email-time">${e.date} · ${e.time}</span>
      <div class="email-row-actions">
        <button class="mini-btn ${e.starred?'is-starred':''}" data-action="star" data-id="${e.id}" aria-label="${e.starred?'Unstar':'Star'} email" title="${e.starred?'Unstar':'Star'}">★</button>
        <button class="mini-btn" data-action="read" data-id="${e.id}" aria-label="Mark as ${e.unread?'read':'unread'}" title="Mark as ${e.unread?'read':'unread'}">${e.unread?'●':'○'}</button>
        <button class="mini-btn" data-action="archive" data-id="${e.id}" aria-label="${e.folder==='archived'?'Restore':'Archive'} email" title="${e.folder==='archived'?'Restore':'Archive'}">${e.folder==='archived'?'⤴':'▢'}</button>
        <button class="mini-btn" data-action="delete" data-id="${e.id}" aria-label="Delete email" title="Delete">🗑</button>
      </div>
    </div>
  </article>`;
}

function emptyStateTemplate(icon, title, message){
  return `<div class="empty-state">
    <div class="empty-state-icon">${icon}</div>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(message)}</p>
  </div>`;
}

function renderInbox(){
  let list = state.emails.filter(e=>e.folder==='inbox');
  list = filterEmails(list);
  list = searchEmails(list);
  list.sort((a,b)=> b.ts - a.ts);
  if(!list.length) return emptyStateTemplate('🔍','No emails found','Try adjusting your search or filters.');
  return `<div class="email-list">${list.map(emailRowTemplate).join('')}</div>`;
}

function renderStarred(){
  let list = state.emails.filter(e=>e.starred);
  list = searchEmails(list);
  list.sort((a,b)=> b.ts - a.ts);
  if(!list.length) return emptyStateTemplate('★','No starred emails','Star important emails to find them quickly here.');
  return `<div class="email-list">${list.map(emailRowTemplate).join('')}</div>`;
}

function renderArchived(){
  let list = state.emails.filter(e=>e.folder==='archived');
  list = searchEmails(list);
  list.sort((a,b)=> b.ts - a.ts);
  if(!list.length) return emptyStateTemplate('▢','Nothing archived','Archived emails will show up here.');
  return `<div class="email-list">${list.map(emailRowTemplate).join('')}</div>`;
}

function attachEmailListEvents(){
  document.querySelectorAll('.email-row').forEach(row=>{
    row.addEventListener('click', (evt)=>{
      if(evt.target.closest('.mini-btn')) return;
      openEmail(row.dataset.id);
    });
    row.addEventListener('keydown', (evt)=>{
      if((evt.key==='Enter' || evt.key===' ') && !evt.target.closest('.mini-btn')){
        evt.preventDefault();
        openEmail(row.dataset.id);
      }
    });
  });
  attachRowMiniButtons();
}

function attachRowMiniButtons(){
  document.querySelectorAll('.mini-btn[data-action]').forEach(btn=>{
    btn.addEventListener('click', (evt)=>{
      evt.stopPropagation();
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if(action==='star') toggleStar(id);
      if(action==='read') toggleRead(id);
      if(action==='archive') archiveEmail(id);
      if(action==='delete'){
        openConfirm('Delete this email?', 'This email will be permanently removed.', ()=> deleteEmail(id));
      }
    });
  });
}

/* ===========================================================
   SENT
   =========================================================== */
function renderSent(){
  let list = searchEmails(state.sent.map(s=>({...s, sender:s.to, senderEmail:s.to, category:'Sent', priority:'Low', preview:s.message.slice(0,90)})));
  list.sort((a,b)=> b.ts - a.ts);
  if(!list.length) return emptyStateTemplate('➤','No sent emails yet','Emails you send will appear here.');
  return `<div class="email-list">${list.map(e=>`
    <article class="email-row" data-id="${e.id}" tabindex="0">
      <div class="avatar" aria-hidden="true">${initials(e.to || 'NA')}</div>
      <div class="email-row-body">
        <div class="email-row-top"><span class="email-sender">To: ${escapeHtml(e.to)}</span></div>
        <div class="email-subject">${escapeHtml(e.subject)}</div>
        <div class="email-preview">${escapeHtml(e.preview)}</div>
      </div>
      <div class="email-row-meta">
        <span class="email-time">${e.date} · ${e.time}</span>
      </div>
    </article>
  `).join('')}</div>`;
}

function attachSentEvents(){
  document.querySelectorAll('.email-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const item = state.sent.find(s=>s.id===row.dataset.id);
      if(item) openSentDetail(item);
    });
  });
}

function openSentDetail(item){
  const body = document.getElementById('emailModalBody');
  body.innerHTML = `
    <div class="detail-head">
      <div class="avatar" style="width:52px;height:52px;font-size:1.1rem;" aria-hidden="true">${initials(item.to||'NA')}</div>
      <div class="detail-info">
        <h2 class="detail-subject" id="emailModalSubject">${escapeHtml(item.subject || '(no subject)')}</h2>
        <p class="detail-from">To: <strong>${escapeHtml(item.to)}</strong>${item.cc? ' · Cc: '+escapeHtml(item.cc):''}</p>
        <p class="detail-from">${item.date} at ${item.time}</p>
      </div>
    </div>
    <div class="detail-message">${escapeHtml(item.message)}</div>
    <p class="demo-mode-note">Sent in Portfolio Demo Mode.</p>
  `;
  document.getElementById('emailModal').hidden = false;
}

/* ===========================================================
   DRAFTS
   =========================================================== */
function renderDrafts(){
  let list = searchEmails(state.drafts.map(d=>({...d, sender:d.to||'(no recipient)', senderEmail:d.to, category:'Draft', priority:'Low', preview:d.message.slice(0,90)})));
  list.sort((a,b)=> b.ts - a.ts);
  if(!list.length) return emptyStateTemplate('✎','No drafts saved','Unsent messages you save will land here.');
  return `<div class="email-list">${list.map(d=>`
    <article class="email-row" data-id="${d.id}">
      <div class="avatar" aria-hidden="true">${initials(d.to || 'ND')}</div>
      <div class="email-row-body">
        <div class="email-row-top"><span class="email-sender">${d.to? 'To: '+escapeHtml(d.to) : '(no recipient yet)'}</span></div>
        <div class="email-subject">${escapeHtml(d.subject || '(no subject)')}</div>
        <div class="email-preview">${escapeHtml(d.preview)}</div>
      </div>
      <div class="email-row-meta">
        <span class="email-time">${d.date} · ${d.time}</span>
        <div class="email-row-actions">
          <button class="mini-btn" data-action="edit-draft" data-id="${d.id}" aria-label="Edit draft" title="Edit">✎</button>
          <button class="mini-btn" data-action="delete-draft" data-id="${d.id}" aria-label="Delete draft" title="Delete">🗑</button>
        </div>
      </div>
    </article>
  `).join('')}</div>`;
}

function attachDraftEvents(){
  document.querySelectorAll('[data-action="edit-draft"]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); editDraft(btn.dataset.id); });
  });
  document.querySelectorAll('[data-action="delete-draft"]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      openConfirm('Delete draft?', 'This draft will be permanently deleted.', ()=>{
        state.drafts = state.drafts.filter(d=>d.id!==btn.dataset.id);
        saveData(); renderApp();
        showToast('Draft deleted ✓','success');
      });
    });
  });
  document.querySelectorAll('.email-row').forEach(row=>{
    row.addEventListener('click', ()=> editDraft(row.dataset.id));
  });
}

function editDraft(id){
  const draft = state.drafts.find(d=>d.id===id);
  if(!draft) return;
  openComposer({
    mode:'draft', draftId:draft.id,
    to:draft.to, cc:draft.cc, bcc:draft.bcc, subject:draft.subject, message:draft.message,
    title:'Edit Draft'
  });
}

/* ===========================================================
   EMAIL DETAIL / OPEN EMAIL
   =========================================================== */
function openEmail(id){
  const email = getEmailById(id);
  if(!email) return;
  if(email.unread){
    email.unread = false;
    saveData();
    updateSidebarBadges();
  }
  renderEmail(email);
  document.getElementById('emailModal').hidden = false;
}

function renderEmail(e){
  const body = document.getElementById('emailModalBody');
  body.innerHTML = `
    <div class="detail-head">
      <div class="avatar" style="width:52px;height:52px;font-size:1.1rem;" aria-hidden="true">${initials(e.sender)}</div>
      <div class="detail-info">
        <h2 class="detail-subject" id="emailModalSubject">${escapeHtml(e.subject)}</h2>
        <p class="detail-from"><strong>${escapeHtml(e.sender)}</strong> · ${escapeHtml(e.senderEmail)}</p>
        <p class="detail-from">${e.date} at ${e.time}</p>
        <div class="detail-meta-row">
          <span class="tag tag-${e.category}">${escapeHtml(e.category)}</span>
          <span class="tag tag-status">Priority: ${e.priority}</span>
          <span class="tag tag-status">${e.resolved? 'Resolved' : e.status}</span>
          ${e.followUp? '<span class="tag tag-status">Follow-up set</span>' : ''}
        </div>
      </div>
    </div>
    <div class="detail-message">${escapeHtml(e.message)}</div>
    <div class="detail-actions">
      <button class="btn btn-primary btn-sm" id="detailReply">Reply</button>
      <button class="btn btn-outline btn-sm" id="detailForward">Forward</button>
      <button class="btn btn-outline btn-sm" id="detailStar">${e.starred? '★ Unstar':'☆ Star'}</button>
      <button class="btn btn-outline btn-sm" id="detailRead">${e.unread? 'Mark Read' : 'Mark Unread'}</button>
      <button class="btn btn-outline btn-sm" id="detailResolve">${e.resolved? 'Reopen' : 'Resolve'}</button>
      <button class="btn btn-outline btn-sm" id="detailArchive">${e.folder==='archived' ? 'Restore' : 'Archive'}</button>
      <button class="btn btn-outline btn-sm" id="detailFollowup">Add Follow-up</button>
      <button class="btn btn-danger btn-sm" id="detailDelete">Delete</button>
    </div>
  `;
  document.getElementById('detailReply').addEventListener('click', ()=> replyToEmail(e.id));
  document.getElementById('detailForward').addEventListener('click', ()=> forwardEmail(e.id));
  document.getElementById('detailStar').addEventListener('click', ()=>{ toggleStar(e.id); renderEmail(getEmailById(e.id)); });
  document.getElementById('detailRead').addEventListener('click', ()=>{ toggleRead(e.id); renderEmail(getEmailById(e.id)); });
  document.getElementById('detailResolve').addEventListener('click', ()=>{ markAsResolved(e.id); renderEmail(getEmailById(e.id)); });
  document.getElementById('detailArchive').addEventListener('click', ()=>{ archiveEmail(e.id); closeModal('emailModal'); });
  document.getElementById('detailFollowup').addEventListener('click', ()=>{ openFollowupModal(e); });
  document.getElementById('detailDelete').addEventListener('click', ()=>{
    openConfirm('Delete this email?', 'This email will be permanently removed.', ()=>{
      deleteEmail(e.id);
      closeModal('emailModal');
    });
  });
}

/* ===========================================================
   EMAIL ACTIONS
   =========================================================== */
function toggleStar(id){
  const e = getEmailById(id); if(!e) return;
  e.starred = !e.starred;
  saveData(); renderApp();
  showToast(e.starred? 'Email starred ✓' : 'Email unstarred ✓', 'success');
}
function toggleRead(id){
  const e = getEmailById(id); if(!e) return;
  e.unread = !e.unread;
  saveData(); renderApp();
  showToast(e.unread? 'Email marked as unread ✓' : 'Email marked as read ✓', 'success');
}
function markAsRead(id){
  const e = getEmailById(id); if(!e) return;
  e.unread = false;
  saveData(); renderApp();
  showToast('Email marked as read ✓','success');
}
function markAsResolved(id){
  const e = getEmailById(id); if(!e) return;
  e.resolved = !e.resolved;
  if(e.resolved){ e.status = 'Resolved'; e.unread = false; }
  saveData(); renderApp();
  showToast(e.resolved? 'Email marked resolved ✓' : 'Email reopened ✓', 'success');
}
function archiveEmail(id){
  const e = getEmailById(id); if(!e) return;
  e.folder = e.folder==='archived' ? 'inbox' : 'archived';
  saveData(); renderApp();
  showToast(e.folder==='archived' ? 'Email archived ✓' : 'Email restored to inbox ✓', 'success');
}
function deleteEmail(id){
  state.emails = state.emails.filter(e=>e.id!==id);
  state.followups = state.followups.filter(f=>f.emailId!==id);
  saveData(); renderApp();
  showToast('Email deleted ✓','success');
}

/* ===========================================================
   COMPOSER
   =========================================================== */
function closeModal(id){ document.getElementById(id).hidden = true; }

function openComposer(opts){
  opts = opts || {};
  document.getElementById('composerTitle').textContent = opts.title || 'New Message';
  document.getElementById('composerMode').value = opts.mode || 'new';
  document.getElementById('composerRefId').value = opts.refId || '';
  document.getElementById('composerDraftId').value = opts.draftId || '';
  document.getElementById('composeTo').value = opts.to || '';
  document.getElementById('composeCc').value = opts.cc || '';
  document.getElementById('composeBcc').value = opts.bcc || '';
  document.getElementById('composeSubject').value = opts.subject || '';
  document.getElementById('composeMessage').value = opts.message || '';
  document.getElementById('composerError').hidden = true;
  document.getElementById('composerModal').hidden = false;
  setTimeout(()=> document.getElementById('composeTo').focus(), 60);
}

function composeEmail(){
  openComposer({mode:'new', title:'New Message'});
}

function replyToEmail(id){
  const e = getEmailById(id);
  if(!e) return;
  closeModal('emailModal');
  openComposer({
    mode:'reply', refId:e.id, title:'Reply',
    to:e.senderEmail, subject: e.subject.startsWith('Re:') ? e.subject : 'Re: ' + e.subject,
    message:`\n\n---------- Original message ----------\nFrom: ${e.sender} <${e.senderEmail}>\n${e.date} ${e.time}\nSubject: ${e.subject}\n\n${e.message}`
  });
}

function forwardEmail(id){
  const e = getEmailById(id);
  if(!e) return;
  closeModal('emailModal');
  openComposer({
    mode:'forward', refId:e.id, title:'Forward',
    to:'', subject: e.subject.startsWith('Fwd:') ? e.subject : 'Fwd: ' + e.subject,
    message:`\n\n---------- Forwarded message ----------\nFrom: ${e.sender} <${e.senderEmail}>\n${e.date} ${e.time}\nSubject: ${e.subject}\n\n${e.message}`
  });
}

function readComposerFields(){
  return {
    mode: document.getElementById('composerMode').value,
    refId: document.getElementById('composerRefId').value,
    draftId: document.getElementById('composerDraftId').value,
    to: document.getElementById('composeTo').value.trim(),
    cc: document.getElementById('composeCc').value.trim(),
    bcc: document.getElementById('composeBcc').value.trim(),
    subject: document.getElementById('composeSubject').value.trim(),
    message: document.getElementById('composeMessage').value.trim()
  };
}

function validateComposer(fields, requireRecipient){
  const errEl = document.getElementById('composerError');
  if(requireRecipient && !fields.to){
    errEl.textContent = 'Please enter a recipient email address.';
    errEl.hidden = false; return false;
  }
  if(requireRecipient && !isValidEmailAddress(fields.to)){
    errEl.textContent = 'Please enter a valid recipient email address.';
    errEl.hidden = false; return false;
  }
  if(requireRecipient && !fields.subject){
    errEl.textContent = 'Please add a subject line.';
    errEl.hidden = false; return false;
  }
  if(requireRecipient && !fields.message){
    errEl.textContent = 'Please write a message before sending.';
    errEl.hidden = false; return false;
  }
  errEl.hidden = true;
  return true;
}

function sendEmail(evt){
  evt.preventDefault();
  const fields = readComposerFields();
  if(!validateComposer(fields, true)) return;

  const sendBtn = document.getElementById('composeSendBtn');
  const label = sendBtn.querySelector('.btn-label');
  sendBtn.disabled = true;
  label.textContent = 'Sending…';

  setTimeout(()=>{
    const ts = nowStamp();
    state.sent.unshift({
      id: uid('sent'),
      to: fields.to, cc: fields.cc, bcc: fields.bcc,
      subject: fields.subject || '(no subject)', message: fields.message,
      date: ts.date, time: ts.time, ts: ts.ts
    });

    // If this was a reply, update the original email's status
    if(fields.refId){
      const orig = getEmailById(fields.refId);
      if(orig){ orig.status = 'Resolved'; orig.resolved = true; }
    }
    // If sent from a draft, remove the draft
    if(fields.draftId){
      state.drafts = state.drafts.filter(d=>d.id!==fields.draftId);
    }

    saveData();
    sendBtn.disabled = false;
    label.textContent = 'Send Email';
    closeModal('composerModal');
    renderApp();
    showToast('Demo email sent successfully ✓','success');
  }, 700);
}

function saveDraftFromComposer(){
  const fields = readComposerFields();
  if(!fields.to && !fields.subject && !fields.message){
    showToast('Nothing to save yet','error');
    return;
  }
  const ts = nowStamp();
  if(fields.draftId){
    const d = state.drafts.find(x=>x.id===fields.draftId);
    if(d){
      Object.assign(d, {to:fields.to, cc:fields.cc, bcc:fields.bcc, subject:fields.subject, message:fields.message, date:ts.date, time:ts.time, ts:ts.ts});
    }
  }else{
    state.drafts.unshift({
      id: uid('draft'), to:fields.to, cc:fields.cc, bcc:fields.bcc,
      subject:fields.subject, message:fields.message, date:ts.date, time:ts.time, ts:ts.ts,
      refId: fields.refId || null
    });
  }
  saveData();
  closeModal('composerModal');
  renderApp();
  showToast('Draft saved ✓','success');
}

function discardComposer(){
  closeModal('composerModal');
}

/* ===========================================================
   TEMPLATES
   =========================================================== */
function renderTemplates(){
  if(!state.templates.length) return emptyStateTemplate('▤','No templates yet','Create a template to speed up your replies.');
  return `<div class="template-grid">${state.templates.map(t=>`
    <div class="template-card" data-id="${t.id}">
      <h3>${escapeHtml(t.name)}</h3>
      <p class="template-subject">${escapeHtml(t.subject)}</p>
      <p class="template-preview">${escapeHtml(t.message)}</p>
      <div class="template-actions">
        <button class="btn btn-primary btn-sm" data-action="use" data-id="${t.id}">Use Template</button>
        <button class="btn btn-outline btn-sm" data-action="copy" data-id="${t.id}">Copy</button>
        <button class="btn btn-outline btn-sm" data-action="editTpl" data-id="${t.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-action="deleteTpl" data-id="${t.id}">Delete</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function attachTemplateEvents(){
  document.querySelectorAll('[data-action="use"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const t = state.templates.find(x=>x.id===btn.dataset.id);
      if(!t) return;
      openComposer({mode:'template', title:'New Message', subject:t.subject, message:t.message});
    });
  });
  document.querySelectorAll('[data-action="copy"]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const t = state.templates.find(x=>x.id===btn.dataset.id);
      if(!t) return;
      const text = `Subject: ${t.subject}\n\n${t.message}`;
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(text);
        }else{
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        showToast('Template copied ✓','success');
      }catch(err){
        console.error('Clipboard error', err);
        showToast('Could not copy to clipboard','error');
      }
    });
  });
  document.querySelectorAll('[data-action="editTpl"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const t = state.templates.find(x=>x.id===btn.dataset.id);
      if(t) openTemplateModal(t);
    });
  });
  document.querySelectorAll('[data-action="deleteTpl"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openConfirm('Delete this template?', 'This template will be permanently removed.', ()=>{
        state.templates = state.templates.filter(x=>x.id!==btn.dataset.id);
        saveData(); renderApp();
        showToast('Template deleted ✓','success');
      });
    });
  });
}

function openTemplateModal(t){
  document.getElementById('templateModalTitle').textContent = t ? 'Edit Template' : 'New Template';
  document.getElementById('templateId').value = t ? t.id : '';
  document.getElementById('templateName').value = t ? t.name : '';
  document.getElementById('templateSubject').value = t ? t.subject : '';
  document.getElementById('templateMessage').value = t ? t.message : '';
  document.getElementById('templateError').hidden = true;
  document.getElementById('templateModal').hidden = false;
  setTimeout(()=> document.getElementById('templateName').focus(), 60);
}

function saveTemplate(evt){
  evt.preventDefault();
  const id = document.getElementById('templateId').value;
  const name = document.getElementById('templateName').value.trim();
  const subject = document.getElementById('templateSubject').value.trim();
  const message = document.getElementById('templateMessage').value.trim();
  const errEl = document.getElementById('templateError');
  if(!name || !subject || !message){
    errEl.textContent = 'Please fill in the template name, subject, and message.';
    errEl.hidden = false;
    return;
  }
  errEl.hidden = true;
  if(id){
    const t = state.templates.find(x=>x.id===id);
    if(t) Object.assign(t, {name, subject, message});
  }else{
    state.templates.unshift({id: uid('tpl'), name, subject, message});
  }
  saveData();
  closeModal('templateModal');
  renderApp();
  showToast('Template saved ✓','success');
}

/* ===========================================================
   FOLLOW-UPS
   =========================================================== */
function renderFollowUps(){
  if(!state.followups.length) return emptyStateTemplate('⏰','No follow-ups scheduled','Add a follow-up to keep track of who to circle back with.');
  const sorted = [...state.followups].sort((a,b)=> new Date(a.date) - new Date(b.date));
  return `<div class="followup-grid">${sorted.map(f=>`
    <div class="followup-card ${f.status==='Completed'?'is-complete':''}" data-id="${f.id}">
      <div class="followup-main">
        <h3>${escapeHtml(f.contact)}${f.company? ' · ' + escapeHtml(f.company):''}</h3>
        <p>${escapeHtml(f.subject)}</p>
      </div>
      <div class="followup-meta">
        <span class="tag tag-status">${f.priority} priority</span>
        <span class="followup-date">${formatDateForDisplay(f.date)}</span>
        <span class="tag ${f.status==='Completed'?'tag-Resolved':'tag-status'}">${f.status}</span>
      </div>
      <div class="followup-actions">
        ${f.status!=='Completed' ? `<button class="btn btn-outline btn-sm" data-action="complete-fu" data-id="${f.id}">Complete</button>` : ''}
        <button class="btn btn-outline btn-sm" data-action="edit-fu" data-id="${f.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-action="delete-fu" data-id="${f.id}">Delete</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function formatDateForDisplay(iso){
  try{
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US',{month:'short', day:'numeric', year:'numeric'});
  }catch(e){ return iso; }
}

function attachFollowupEvents(){
  document.querySelectorAll('[data-action="complete-fu"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const f = state.followups.find(x=>x.id===btn.dataset.id);
      if(!f) return;
      f.status = 'Completed';
      saveData(); renderApp();
      showToast('Follow-up completed ✓','success');
    });
  });
  document.querySelectorAll('[data-action="edit-fu"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const f = state.followups.find(x=>x.id===btn.dataset.id);
      if(f) openFollowupModal(null, f);
    });
  });
  document.querySelectorAll('[data-action="delete-fu"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openConfirm('Delete this follow-up?', 'This follow-up will be permanently removed.', ()=>{
        state.followups = state.followups.filter(x=>x.id!==btn.dataset.id);
        saveData(); renderApp();
        showToast('Follow-up deleted ✓','success');
      });
    });
  });
}

function openFollowupModal(fromEmail, existing){
  document.getElementById('followupModalTitle').textContent = existing ? 'Edit Follow-up' : 'Add Follow-up';
  document.getElementById('followupId').value = existing ? existing.id : '';
  document.getElementById('followupContact').value = existing ? existing.contact : (fromEmail ? fromEmail.sender : '');
  document.getElementById('followupCompany').value = existing ? existing.company : (fromEmail ? (fromEmail.senderEmail.split('@')[1]||'').split('.')[0] : '');
  document.getElementById('followupSubject').value = existing ? existing.subject : (fromEmail ? fromEmail.subject : '');
  const d = new Date(); d.setDate(d.getDate()+3);
  document.getElementById('followupDate').value = existing ? existing.date : d.toISOString().slice(0,10);
  document.getElementById('followupPriority').value = existing ? existing.priority : (fromEmail ? fromEmail.priority : 'Medium');
  document.getElementById('followupError').hidden = true;
  document.getElementById('followupModal').dataset.emailId = fromEmail ? fromEmail.id : '';
  document.getElementById('followupModal').hidden = false;
  setTimeout(()=> document.getElementById('followupContact').focus(), 60);
}

function saveFollowup(evt){
  evt.preventDefault();
  const id = document.getElementById('followupId').value;
  const contact = document.getElementById('followupContact').value.trim();
  const company = document.getElementById('followupCompany').value.trim();
  const subject = document.getElementById('followupSubject').value.trim();
  const date = document.getElementById('followupDate').value;
  const priority = document.getElementById('followupPriority').value;
  const errEl = document.getElementById('followupError');
  if(!contact || !subject || !date){
    errEl.textContent = 'Please fill in contact, subject, and follow-up date.';
    errEl.hidden = false;
    return;
  }
  errEl.hidden = true;
  if(id){
    const f = state.followups.find(x=>x.id===id);
    if(f) Object.assign(f, {contact, company, subject, date, priority});
  }else{
    const emailId = document.getElementById('followupModal').dataset.emailId;
    state.followups.unshift({id: uid('fu'), contact, company, subject, date, priority, status:'Pending', emailId: emailId || null});
    if(emailId){
      const e = getEmailById(emailId);
      if(e) e.followUp = true;
    }
  }
  saveData();
  closeModal('followupModal');
  closeModal('emailModal');
  renderApp();
  showToast('Follow-up saved ✓','success');
}

/* ===========================================================
   REPORTS
   =========================================================== */
function renderReports(){
  const total = state.emails.length + state.sent.length;
  const resolved = state.emails.filter(e=>e.resolved).length;
  const resolutionRate = state.emails.length ? Math.round((resolved/state.emails.length)*100) : 0;
  const unread = state.emails.filter(e=>e.unread).length;
  const completedFu = state.followups.filter(f=>f.status==='Completed').length;

  const barData = [
    {label:'Client', value: state.emails.filter(e=>e.category==='Client').length},
    {label:'Support', value: state.emails.filter(e=>e.category==='Support').length},
    {label:'Lead', value: state.emails.filter(e=>e.category==='Lead').length},
    {label:'Meeting', value: state.emails.filter(e=>e.category==='Meeting').length},
    {label:'Business', value: state.emails.filter(e=>e.category==='Business').length},
    {label:'Other', value: state.emails.filter(e=>['Billing','General','Internal','Newsletter','Appointment'].includes(e.category)).length},
  ];
  const maxVal = Math.max(1, ...barData.map(b=>b.value));

  const donutSegments = [
    {label:'Resolved', value: resolved, color:'var(--success)'},
    {label:'Awaiting Reply', value: state.emails.filter(e=>e.status==='Awaiting Reply' && !e.resolved).length, color:'var(--warning)'},
    {label:'Other', value: Math.max(0, state.emails.length - resolved - state.emails.filter(e=>e.status==='Awaiting Reply'&&!e.resolved).length), color:'var(--navy-300)'}
  ];
  const donutTotal = Math.max(1, donutSegments.reduce((s,d)=>s+d.value,0));
  let cumulative = 0;
  const gradientStops = donutSegments.map(seg=>{
    const start = (cumulative/donutTotal)*360;
    cumulative += seg.value;
    const end = (cumulative/donutTotal)*360;
    return `${seg.color} ${start}deg ${end}deg`;
  }).join(', ');

  return `
    <div class="report-grid">
      <div class="stat-card"><div class="stat-icon">⏱</div><div class="stat-label">Avg. Response Time</div><div class="stat-value">1.8 hrs</div></div>
      <div class="stat-card"><div class="stat-icon">✓</div><div class="stat-label">Resolution Rate</div><div class="stat-value">${resolutionRate}%</div></div>
      <div class="stat-card"><div class="stat-icon">✉</div><div class="stat-label">Emails Processed</div><div class="stat-value">${total}</div></div>
      <div class="stat-card"><div class="stat-icon">✔</div><div class="stat-label">Emails Resolved</div><div class="stat-value">${resolved}</div></div>
      <div class="stat-card"><div class="stat-icon">●</div><div class="stat-label">Unread Count</div><div class="stat-value">${unread}</div></div>
      <div class="stat-card"><div class="stat-icon">⏰</div><div class="stat-label">Follow-ups Completed</div><div class="stat-value">${completedFu}</div></div>
    </div>
    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel-title"><h2>Emails by Category</h2></div>
        <div class="bar-chart">
          ${barData.map(b=>`
            <div class="bar-col">
              <span class="bar-value">${b.value}</span>
              <div class="bar-fill" style="height:${Math.max(6,(b.value/maxVal)*150)}px"></div>
              <span class="bar-label">${b.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Inbox Status Breakdown</h2></div>
        <div class="donut-wrap">
          <div class="donut" style="background:conic-gradient(${gradientStops});"></div>
          <div class="donut-legend">
            ${donutSegments.map(s=>`<span><span class="legend-dot" style="background:${s.color}"></span>${s.label}: ${s.value}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ===========================================================
   SETTINGS
   =========================================================== */
function renderSettings(){
  return `
    <div class="settings-grid">
      <div class="panel">
        <div class="panel-title"><h2>Profile</h2></div>
        <div class="settings-row"><span class="settings-row-label">Name</span><span class="settings-row-value">Jennelyn Portea</span></div>
        <div class="settings-row"><span class="settings-row-label">Role</span><span class="settings-row-value">Virtual Assistant</span></div>
        <div class="settings-row"><span class="settings-row-label">Status</span><span class="settings-row-value">${escapeHtml(state.prefs.status)}</span></div>
        <div class="settings-row"><span class="settings-row-label">Response Time</span><span class="settings-row-value">${escapeHtml(state.prefs.responseTime)}</span></div>
        <div class="settings-row"><span class="settings-row-label">Mode</span><span class="settings-row-value">${escapeHtml(state.prefs.mode)}</span></div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Services</h2></div>
        <div class="settings-row"><span class="settings-row-value">Email Management</span></div>
        <div class="settings-row"><span class="settings-row-value">Customer Support</span></div>
        <div class="settings-row"><span class="settings-row-value">Lead Generation</span></div>
        <div class="settings-row"><span class="settings-row-value">Appointment Setting</span></div>
        <div class="settings-row" style="border-bottom:none;"><span class="settings-row-value">Administrative Support</span></div>
      </div>
    </div>
    <div class="danger-zone">
      <h3>Reset Demo Data</h3>
      <p>This restores the dashboard to its original sample emails, drafts, templates, and follow-ups. Anything you've added or changed will be lost.</p>
      <button class="btn btn-danger" id="resetDataBtn">Reset Demo Data</button>
    </div>
  `;
}

function attachSettingsEvents(){
  document.getElementById('resetDataBtn').addEventListener('click', ()=>{
    openConfirm('Reset all demo data?', 'This will restore the original sample inbox and permanently remove any emails, drafts, templates, or follow-ups you added.', ()=>{
      resetDemoData();
    });
  });
}

/* ===========================================================
   MOBILE SIDEBAR
   =========================================================== */
function openMobileSidebar(){
  document.getElementById('sidebar').classList.add('is-open');
  document.getElementById('sidebarOverlay').hidden = false;
  requestAnimationFrame(()=> document.getElementById('sidebarOverlay').classList.add('is-visible'));
  document.getElementById('mobileMenuToggle').setAttribute('aria-expanded','true');
}
function closeMobileSidebar(){
  document.getElementById('sidebar').classList.remove('is-open');
  document.getElementById('sidebarOverlay').classList.remove('is-visible');
  setTimeout(()=>{ document.getElementById('sidebarOverlay').hidden = true; }, 200);
  document.getElementById('mobileMenuToggle').setAttribute('aria-expanded','false');
}

/* ===========================================================
   GLOBAL EVENT WIRING
   =========================================================== */
function wireStaticEvents(){
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click', ()=> setView(btn.dataset.view));
  });

  // Mobile menu
  document.getElementById('mobileMenuToggle').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);
  document.getElementById('mobileComposeBtn').addEventListener('click', ()=> composeEmail());

  // Compose
  document.getElementById('composeBtn').addEventListener('click', ()=> composeEmail());

  // Search
  document.getElementById('searchInput').addEventListener('input', (e)=>{
    state.search = e.target.value;
    renderApp();
  });

  // Composer modal
  document.getElementById('closeComposerModal').addEventListener('click', discardComposer);
  document.getElementById('composeDiscardBtn').addEventListener('click', discardComposer);
  document.getElementById('composeSaveDraftBtn').addEventListener('click', saveDraftFromComposer);
  document.getElementById('composerForm').addEventListener('submit', sendEmail);

  // Email modal
  document.getElementById('closeEmailModal').addEventListener('click', ()=> closeModal('emailModal'));

  // Followup modal
  document.getElementById('closeFollowupModal').addEventListener('click', ()=> closeModal('followupModal'));
  document.getElementById('followupCancelBtn').addEventListener('click', ()=> closeModal('followupModal'));
  document.getElementById('followupForm').addEventListener('submit', saveFollowup);

  // Template modal
  document.getElementById('closeTemplateModal').addEventListener('click', ()=> closeModal('templateModal'));
  document.getElementById('templateCancelBtn').addEventListener('click', ()=> closeModal('templateModal'));
  document.getElementById('templateForm').addEventListener('submit', saveTemplate);

  // Confirm modal
  document.getElementById('confirmCancelBtn').addEventListener('click', closeConfirm);
  document.getElementById('confirmOkBtn').addEventListener('click', ()=>{
    const cb = state.confirmCallback;
    closeConfirm();
    if(cb) cb();
  });

  // Close modals on overlay click (outside the modal box)
  document.querySelectorAll('.modal-overlay').forEach(overlay=>{
    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay){
        if(overlay.id === 'confirmModal'){
          closeConfirm();
        }else{
          overlay.hidden = true;
        }
      }
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal-overlay').forEach(o=>{
        if(!o.hidden){
          if(o.id === 'confirmModal'){
            closeConfirm();
          }else{
            o.hidden = true;
          }
        }
      });
      closeMobileSidebar();
    }
  });
}

/* ===========================================================
   INIT
   =========================================================== */
function initApp(){
  loadData();
  wireStaticEvents();
  renderApp();
}

document.addEventListener('DOMContentLoaded', initApp);

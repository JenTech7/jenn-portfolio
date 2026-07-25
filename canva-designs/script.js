/* ============================================================
   CANVA DESIGNS SHOWCASE — APP LOGIC
   Vanilla JS. Static portfolio data (no persistence needed).
   ============================================================ */

const DESIGNS = [
  {
    id: 'd01', title: 'Summer Glow Skincare Carousel', category: 'Instagram',
    clientType: 'Beauty Brand', date: '2026-07-10',
    goal: 'Drive engagement for a new skincare line launch with a scroll-stopping carousel that highlights product benefits in a clean, aspirational way.',
    audience: 'Women aged 22–38 interested in clean beauty and skincare routines.',
    palette: ['#F7C9DA', '#E85D8C', '#FFF7F9', '#8A3568'],
    typography: 'Cormorant Garamond for headlines, Manrope for supporting text.',
    tools: ['Canva Pro', 'Canva Brand Kit', 'Magic Resize'],
    deliverables: '5-slide Instagram carousel + matching Story cover.',
    feedback: 'Exactly the aesthetic we wanted — soft, premium, and on-brand. Engagement doubled our usual average.',
    rating: 5
  },
  {
    id: 'd02', title: 'Boutique Fitness Launch Cover', category: 'Instagram',
    clientType: 'Fitness Studio', date: '2026-06-28',
    goal: 'Create a bold Reel cover announcing a new studio location to build local excitement.',
    audience: 'Local fitness enthusiasts aged 20–40 following the studio on Instagram.',
    palette: ['#34142E', '#C9973A', '#FFF4E9', '#B8407F'],
    typography: 'Bold condensed display pairing with a clean sans body.',
    tools: ['Canva Pro', 'Canva Video Editor'],
    deliverables: 'Reel cover graphic + 3 supporting story frames.',
    feedback: 'High energy, matched our brand voice perfectly. Got so many DMs asking about the new space.',
    rating: 5
  },
  {
    id: 'd03', title: 'Open House Announcement Ad', category: 'Facebook',
    clientType: 'Real Estate Agency', date: '2026-07-02',
    goal: 'Promote a weekend open house event and drive local foot traffic through a targeted Facebook ad.',
    audience: 'Prospective homebuyers within a 15-mile radius of the listing.',
    palette: ['#4F6FD6', '#7C5CC7', '#FFFBF6', '#372A34'],
    typography: 'Clean geometric sans for a trustworthy, professional feel.',
    tools: ['Canva Pro', 'Canva Ads Manager Templates'],
    deliverables: 'Facebook feed ad + matching cover image for the event post.',
    feedback: 'Professional and easy to read at a glance — exactly what we needed to promote the listing.',
    rating: 4
  },
  {
    id: 'd04', title: 'Weekend Promo Announcement', category: 'Facebook',
    clientType: 'Bakery', date: '2026-06-15',
    goal: 'Announce a weekend discount to drive walk-in traffic and boost weekend sales.',
    audience: 'Local families and regulars following the bakery on social media.',
    palette: ['#DE8B27', '#E85D8C', '#FFF4E9', '#34142E'],
    typography: 'Playful hand-lettered-style display with a friendly rounded body font.',
    tools: ['Canva Pro', 'Canva Elements'],
    deliverables: 'Facebook post graphic sized for feed and shared to Stories.',
    feedback: 'So warm and inviting — customers said it made them hungry just scrolling past it!',
    rating: 5
  },
  {
    id: 'd05', title: 'Q3 Investor Pitch Deck', category: 'Presentation',
    clientType: 'Tech Startup', date: '2026-07-18',
    goal: 'Present quarterly growth metrics and roadmap clearly and confidently to potential investors.',
    audience: 'Angel investors and VC partners evaluating a Series A round.',
    palette: ['#34142E', '#B8407F', '#FFFBF6', '#C9973A'],
    typography: 'Cormorant Garamond for section titles, Manrope for data labels.',
    tools: ['Canva Pro', 'Canva Presentations', 'Chart Elements'],
    deliverables: '18-slide investor deck with data visualizations and speaker notes.',
    feedback: 'Clean, credible, and easy to present from. Helped us close our round faster than expected.',
    rating: 5
  },
  {
    id: 'd06', title: 'Client Onboarding Welcome Deck', category: 'Presentation',
    clientType: 'Consulting Firm', date: '2026-06-30',
    goal: 'Give new clients a polished first impression and a clear overview of the engagement process.',
    audience: 'New consulting clients in their first week of onboarding.',
    palette: ['#8A3568', '#F7DDEB', '#FFFBF6', '#372A34'],
    typography: 'Elegant serif headings paired with a readable sans body.',
    tools: ['Canva Pro', 'Canva Brand Kit'],
    deliverables: '10-slide welcome deck + editable template for future clients.',
    feedback: 'Sets the tone beautifully. Clients comment on how professional our onboarding feels now.',
    rating: 5
  },
  {
    id: 'd07', title: 'Summer Sale Flyer', category: 'Flyer',
    clientType: 'Retail Store', date: '2026-07-05',
    goal: 'Promote a storewide summer sale both in-store and across digital channels.',
    audience: 'Existing customers and walk-in shoppers during the promotional period.',
    palette: ['#E85D8C', '#F0A466', '#FFFBF6', '#34142E'],
    typography: 'High-impact display font for the headline, clean sans for details.',
    tools: ['Canva Pro', 'Canva Print'],
    deliverables: 'Print-ready flyer (8.5x11) + digital version for email and social.',
    feedback: 'Vibrant and eye-catching — it worked great both printed in-store and shared online.',
    rating: 4
  },
  {
    id: 'd08', title: 'Community Yoga Workshop Flyer', category: 'Flyer',
    clientType: 'Wellness Studio', date: '2026-06-20',
    goal: 'Promote a one-day community yoga workshop and encourage local sign-ups.',
    audience: 'Local wellness community members interested in mindfulness events.',
    palette: ['#CC5B94', '#F7DDEB', '#FFFBF6', '#8A3568'],
    typography: 'Soft serif display with generous whitespace for a calm, grounded feel.',
    tools: ['Canva Pro', 'Canva Elements'],
    deliverables: 'A5 print flyer + Instagram-sized digital version.',
    feedback: 'Peaceful and inviting, exactly the vibe of our studio. The workshop sold out.',
    rating: 5
  },
  {
    id: 'd09', title: 'Business Card Set', category: 'Business',
    clientType: 'Law Firm', date: '2026-07-12',
    goal: 'Create a refined, trustworthy business card set reflecting the firm\'s established reputation.',
    audience: 'Prospective clients and referral partners at networking events.',
    palette: ['#34142E', '#C9973A', '#FFFBF6'],
    typography: 'Classic serif for names and titles, minimal sans for contact details.',
    tools: ['Canva Pro', 'Canva Print'],
    deliverables: 'Double-sided business card design, print-ready with bleed marks.',
    feedback: 'Understated and premium — matches exactly how we want to be perceived.',
    rating: 5
  },
  {
    id: 'd10', title: 'Letterhead & Invoice Template', category: 'Business',
    clientType: 'Accounting Firm', date: '2026-06-25',
    goal: 'Standardize client-facing documents with a cohesive, professional look.',
    audience: 'Existing accounting clients receiving invoices and formal correspondence.',
    palette: ['#372A34', '#B8407F', '#FFFBF6'],
    typography: 'Clean, highly legible sans for numerical clarity and professionalism.',
    tools: ['Canva Pro', 'Canva Docs'],
    deliverables: 'Editable letterhead template + matching invoice template.',
    feedback: 'Simple, consistent, and saves us time every month. Clients notice the polish.',
    rating: 4
  },
  {
    id: 'd11', title: 'Full Brand Identity Kit', category: 'Branding',
    clientType: 'Coffee Roastery', date: '2026-07-20',
    goal: 'Establish a cohesive brand identity across packaging, social, and print touchpoints for a new roastery.',
    audience: 'Coffee enthusiasts and café owners considering wholesale partnership.',
    palette: ['#5C2049', '#C9973A', '#FFF4E9', '#34142E'],
    typography: 'Warm serif display paired with an earthy, rounded sans.',
    tools: ['Canva Pro', 'Canva Brand Kit', 'Canva Print'],
    deliverables: 'Logo suite, color palette, packaging mockups, and social templates.',
    feedback: 'They captured our story perfectly. The brand finally feels as good as the coffee tastes.',
    rating: 5
  },
  {
    id: 'd12', title: 'Logo & Style Guide', category: 'Branding',
    clientType: 'Interior Design Studio', date: '2026-07-08',
    goal: 'Deliver a refined logo and style guide to unify the studio\'s visual presence across platforms.',
    audience: 'High-end residential and commercial design clients.',
    palette: ['#8A3568', '#F7DDEB', '#372A34', '#C9973A'],
    typography: 'Editorial serif display with a minimal geometric sans for structure.',
    tools: ['Canva Pro', 'Canva Brand Kit'],
    deliverables: 'Primary + secondary logo marks, color and type guide, 12-page style guide PDF.',
    feedback: 'Elevated and timeless — it instantly upgraded how our studio presents itself.',
    rating: 5
  }
];

const TESTIMONIALS = [
  {
    name: 'Amanda Reyes', role: 'Founder, Bright Media Agency', rating: 5,
    quote: 'Every design felt intentional and on-brand. Turnaround was fast and communication was effortless.'
  },
  {
    name: 'Derek Coleman', role: 'Marketing Lead, Summit Logix', rating: 5,
    quote: 'Our social presence looks entirely different now — more polished, more consistent, more us.'
  },
  {
    name: 'Nadia Farouk', role: 'Owner, Farouk Events Co.', rating: 4,
    quote: 'Reliable, detail-oriented, and genuinely creative. I send over rough ideas and get back something better than I imagined.'
  }
];

let activeCategory = '';

/* -------------------- Helpers -------------------- */
function slug(str) { return str.toLowerCase(); }

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function stars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

/* -------------------- Stats -------------------- */
function animateCounter(el, target) {
  const duration = 800;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

function renderStats() {
  const total = DESIGNS.length;
  const social = DESIGNS.filter(d => d.category === 'Instagram' || d.category === 'Facebook').length;
  const presentations = DESIGNS.filter(d => d.category === 'Presentation').length;
  const marketing = DESIGNS.filter(d => ['Flyer', 'Business', 'Branding'].includes(d.category)).length;

  animateCounter(document.getElementById('statTotal'), total);
  animateCounter(document.getElementById('statSocial'), social);
  animateCounter(document.getElementById('statPresentations'), presentations);
  animateCounter(document.getElementById('statMarketing'), marketing);
}

/* -------------------- Gallery -------------------- */
function getFilteredSortedDesigns() {
  const term = document.getElementById('searchInput').value.trim().toLowerCase();
  const sortMode = document.getElementById('sortSelect').value;

  let result = DESIGNS.filter(d => {
    const matchesCategory = !activeCategory || d.category === activeCategory;
    const matchesSearch = !term || d.title.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (sortMode === 'newest') result.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (sortMode === 'oldest') result.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (sortMode === 'category') result.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  return result;
}

function renderGallery() {
  const grid = document.getElementById('designGrid');
  const emptyState = document.getElementById('emptyState');
  const rows = getFilteredSortedDesigns();

  grid.innerHTML = '';

  if (rows.length === 0) {
    emptyState.hidden = false;
    grid.style.display = 'none';
    return;
  }
  emptyState.hidden = true;
  grid.style.display = 'grid';

  rows.forEach(d => {
    const card = document.createElement('div');
    card.className = 'design-card';
    card.innerHTML = `
      <div class="card-preview bg-${slug(d.category)}">
        <span class="card-cat-tag">${escapeHtml(d.category)}</span>
        <span>${escapeHtml(d.title)}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(d.title)}</div>
        <div class="card-meta"><span>${escapeHtml(d.category)}</span><span>${escapeHtml(d.clientType)}</span></div>
        <div class="card-date">${formatDate(d.date)}</div>
        <button class="card-btn" data-id="${d.id}">View Design</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* -------------------- Modal -------------------- */
const modalOverlay = document.getElementById('designModalOverlay');

function openModal(design) {
  document.getElementById('modalPreview').className = `modal-preview bg-${slug(design.category)}`;
  document.getElementById('modalPreview').textContent = design.title;
  document.getElementById('modalCategory').textContent = `${design.category} · ${design.clientType}`;
  document.getElementById('modalTitle').textContent = design.title;
  document.getElementById('mGoal').textContent = design.goal;
  document.getElementById('mAudience').textContent = design.audience;
  document.getElementById('mTypography').textContent = design.typography;
  document.getElementById('mDeliverables').textContent = design.deliverables;
  document.getElementById('mFeedback').textContent = design.feedback;
  document.getElementById('mStars').textContent = stars(design.rating);

  document.getElementById('mPalette').innerHTML = design.palette.map(hex => `
    <div class="swatch">
      <div class="swatch-color" style="background:${hex}"></div>
      <span>${hex}</span>
    </div>
  `).join('');

  document.getElementById('mTools').innerHTML = design.tools.map(tool => `
    <span class="tool-tag">${escapeHtml(tool)}</span>
  `).join('');

  modalOverlay.classList.add('open');
}

function closeModal() { modalOverlay.classList.remove('open'); }

/* -------------------- Testimonials -------------------- */
function renderTestimonials() {
  const grid = document.getElementById('testimonialGrid');
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${stars(t.rating)}</div>
      <p class="testimonial-quote">"${escapeHtml(t.quote)}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.name.split(' ').map(p => p[0]).join('')}</div>
        <div>
          <div class="author-name">${escapeHtml(t.name)}</div>
          <div class="author-role">${escapeHtml(t.role)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* -------------------- Timeline -------------------- */
function renderTimeline() {
  const list = document.getElementById('timelineList');
  const recent = DESIGNS.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  list.innerHTML = recent.map(d => `
    <div class="timeline-item">
      <div class="timeline-card">
        <div>
          <div class="timeline-title">${escapeHtml(d.title)}</div>
          <div class="timeline-sub">${escapeHtml(d.category)} · ${escapeHtml(d.clientType)}</div>
        </div>
        <span class="timeline-date">${formatDate(d.date)}</span>
      </div>
    </div>
  `).join('');
}

/* -------------------- Event wiring -------------------- */
document.getElementById('searchInput').addEventListener('input', renderGallery);
document.getElementById('sortSelect').addEventListener('change', renderGallery);

document.getElementById('filterRow').addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  activeCategory = chip.dataset.cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c === chip));
  renderGallery();
});

document.getElementById('designGrid').addEventListener('click', e => {
  const btn = e.target.closest('.card-btn');
  if (!btn) return;
  const design = DESIGNS.find(d => d.id === btn.dataset.id);
  if (design) openModal(design);
});

document.getElementById('closeDesignModal').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* -------------------- Init -------------------- */
renderStats();
renderGallery();
renderTestimonials();
renderTimeline();

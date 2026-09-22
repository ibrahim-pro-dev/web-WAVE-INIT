/* FitGym SPA — talks to the /api backend via fetch */

const view = document.getElementById('view');

/* ---------- helpers ---------- */

const e = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (err) {
    return { ok: false, status: 0, data: { error: 'Cannot reach the server. Is it running?' } };
  }
  let data = null;
  try { data = await res.json(); } catch (_) {}
  return { ok: res.ok, status: res.status, data };
}

const go = (path) => { location.hash = path; };

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(expiry) {
  return Math.max(0, Math.ceil((new Date(expiry + 'T00:00:00') - new Date()) / 86400000));
}

function statusBadge(status) {
  const cls = { active: 'badge-active', expired: 'badge-expired', pending: 'badge-pending' }[status] || 'badge-pending';
  const label = { active: 'Active', expired: 'Expired', pending: 'Pending' }[status] || status || 'Unknown';
  return `<span class="badge ${cls}">${e(label)}</span>`;
}

/* ---------- data ---------- */

const FACILITIES = [
  { icon: '🏃', name: 'Cardio Zone', description: 'Treadmills, bikes, rowers & ellipticals.' },
  { icon: '🏋️', name: 'Strength Area', description: 'Free weights, racks & deadlift platforms.' },
  { icon: '⚡', name: 'Functional Zone', description: 'Battle ropes, kettlebells & turf.' },
  { icon: '♨️', name: 'Steam & Sauna', description: 'Relax and recover post-workout.' }
];

const TRAINERS = [
  { name: 'Aarav Sharma', specialty: 'Strength & Powerlifting', photo: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Priya Verma', specialty: 'HIIT & Fat Loss', photo: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Rohan Mehta', specialty: 'Yoga & Mobility', photo: 'https://i.pravatar.cc/150?img=12' }
];

const memberStore = {
  get id() { return Number(localStorage.getItem('fitgym.memberId')); },
  set id(v) { localStorage.setItem('fitgym.memberId', v); },
  clear() { localStorage.removeItem('fitgym.memberId'); }
};

/* ---------- shared renderers ---------- */

function membershipCards(plans) {
  return plans.map((p) => `
    <div class="plan-card reveal ${p.price >= 2400 ? 'popular' : ''}">
      ${p.price >= 2400 ? '<span class="plan-badge">Best Value</span>' : ''}
      <span class="plan-name">${e(p.name)}</span>
      <div class="plan-price">₹${Number(p.price).toLocaleString('en-IN')}<span> / month</span></div>
      <div class="plan-duration">1 month validity</div>
      <ul class="plan-perks">
        ${(p.features || []).map((f) => `<li>${e(f)}</li>`).join('')}
      </ul>
      <a href="#/register?plan=${encodeURIComponent(p.name)}" class="btn ${p.price >= 2400 ? 'btn-primary' : 'btn-outline'} btn-block">Join Now</a>
    </div>`).join('');
}

function loadMemberships() {
  return api('/api/memberships').then((r) => (r.ok ? r.data : []));
}

/* ---------- views ---------- */

async function home() {
  const plans = await loadMemberships();
  view.innerHTML = `
    <section class="hero">
      <div class="container reveal">
        <p class="section-label">No excuses. Only results.</p>
        <h1 class="hero-title">Train Hard.<br /><em>Transform Your Body.</em></h1>
        <p class="hero-sub">FitGym is where dedication meets equipment that works as hard as you do. Join a community that pushes you past every limit.</p>
        <div class="hero-cta">
          <a href="#/register" class="btn btn-primary">Join Now</a>
          <a href="#/plans" class="btn btn-ghost">View Plans</a>
        </div>
      </div>
    </section>

    <section class="section" id="facilities">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-label">Facilities</p>
          <h2 class="section-title">World-Class Equipment</h2>
          <p>Everything you need under one roof — from heavy iron to mindful recovery.</p>
        </div>
        <div class="grid grid-4">
          ${FACILITIES.map((f) => `
            <div class="card reveal">
              <div class="card-icon">${f.icon}</div>
              <h3>${e(f.name)}</h3>
              <p>${e(f.description)}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="trainers">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-label">Team</p>
          <h2 class="section-title">Meet Our Trainers</h2>
          <p>Certified coaches who design everything around your goals.</p>
        </div>
        <div class="grid grid-3">
          ${TRAINERS.map((t) => `
            <div class="card trainer-card reveal">
              <img src="${t.photo}" alt="${e(t.name)}" />
              <h3>${e(t.name)}</h3>
              <p class="specialty">${e(t.specialty)}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="membership">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-label">Memberships</p>
          <h2 class="section-title">Choose Your Plan</h2>
          <p>Flexible memberships, zero hidden fees, cancel anytime.</p>
        </div>
        <div class="plans-grid">
          ${plans.length ? membershipCards(plans) : '<p style="color:var(--muted)">Memberships unavailable right now.</p>'}
        </div>
      </div>
    </section>

    <section class="section center">
      <div class="container reveal">
        <h2 class="section-title">Ready to Start?</h2>
        <p class="mb-2" style="color: var(--muted);">Pick a plan and claim your first session today.</p>
        <a href="#/register" class="btn btn-primary">Join Now</a>
      </div>
    </section>`;
  initReveal();
}

function plans() {
  view.innerHTML = `
    <section class="page-head">
      <div class="container">
        <p class="section-label">Memberships</p>
        <h1 class="section-title">Choose Your Plan</h1>
        <p>Flexible memberships, zero hidden fees, cancel anytime.</p>
      </div>
    </section>
    <section class="section" style="padding-top: 20px;">
      <div class="container plans-grid" id="plans-grid"></div>
    </section>`;

  loadMemberships().then((plans) => {
    document.getElementById('plans-grid').innerHTML =
      plans.length ? membershipCards(plans) : '<p style="color:var(--muted);text-align:center;">No memberships available right now.</p>';
    initReveal();
  }).catch(() => {
    document.getElementById('plans-grid').innerHTML = '<p style="color:var(--danger);text-align:center;">Failed to load memberships.</p>';
  });
}

function register() {
  const prefill = new URLSearchParams(location.hash.split('?')[1] || '').get('plan') || '';
  view.innerHTML = `
    <section class="auth-wrap container">
      <div class="form-card reveal">
        <h1>Join FitGym</h1>
        <p class="form-sub">Fill in your details and start training today.</p>
        <div id="register-error"></div>
        <form id="register-form" novalidate>
          <div class="field">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder="e.g. Rahul Sharma" required />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" required />
          </div>
          <div class="field">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" placeholder="10-digit mobile number" required />
          </div>
          <div class="field">
            <label for="plan">Membership Plan</label>
            <select id="plan" name="plan" required>
              <option value="">-- Select a plan --</option>
            </select>
          </div>
          <button type="submit" id="register-btn" class="btn btn-primary btn-block">Create My Membership</button>
        </form>
        <p class="form-footer">View plans first? <a href="#/plans">Compare plans</a></p>
      </div>
    </section>`;

  const btn = document.getElementById('register-btn');
  loadMemberships().then((plans) => {
    const sel = document.getElementById('plan');
    plans.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = `${p.name} — ₹${Number(p.price).toLocaleString('en-IN')}/month`;
      sel.appendChild(opt);
    });
    if (prefill) sel.value = prefill;
  });

  document.getElementById('register-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const errBox = document.getElementById('register-error');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const plan = document.getElementById('plan').value;

    const fail = (msg) => { errBox.innerHTML = `<div class="alert">${e(msg)}</div>`; };
    errBox.innerHTML = '';
    if (!name) return fail('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email.');
    if (!/^[0-9]{10}$/.test(phone)) return fail('Phone must be a 10-digit number.');
    if (!plan) return fail('Please select a membership plan.');

    btn.disabled = true;
    btn.textContent = 'Creating…';
    const r = await api('/api/members', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, membershipPlan: plan })
    });
    btn.disabled = false;
    btn.textContent = 'Create My Membership';

    if (!r.ok) return fail(r.data?.error || 'Registration failed. Try again.');

    memberStore.id = r.data.id;
    sessionStorage.setItem('fitgym.joined', '1');
    go('#/dashboard');
  });
  initReveal();
}

async function dashboard() {
  const joined = sessionStorage.getItem('fitgym.joined');
  view.innerHTML = `
    <section class="container section">
      ${joined ? '<div class="alert reveal-visible" style="background:rgba(74,222,128,0.12);border-color:rgba(74,222,128,0.4);color:var(--success);">Membership created! Welcome to FitGym. 💪</div>' : ''}

      <div class="dash-head reveal">
        <div>
          <p class="section-label">My Dashboard</p>
          <h1 class="section-title" style="margin-bottom:0;">Member Dashboard</h1>
        </div>
        <div>
          <a href="#/workout" class="btn btn-primary btn-sm">🤖 AI Workout Assistant</a>
        </div>
      </div>

      <div class="card mt-4 reveal" style="max-width:480px;">
        <div class="stat-label" style="margin-bottom:10px;">Member lookup</div>
        <div class="lookup-row">
          <input type="number" id="lookup-id" placeholder="Enter member ID (e.g. 1)" min="1" />
          <button id="lookup-btn" class="btn btn-outline btn-sm">View Member</button>
        </div>
        <div class="form-footer" style="text-align:left;margin-top:10px;">
          ${memberStore.id ? `Signed in as member #${memberStore.id} — <a href="#/register">New registration</a> · <a href="#" id="logout-btn">Logout</a>` : 'Not signed in yet — <a href="#/register">Register now</a>'}
        </div>
      </div>

      <div id="dash-content">
        <p style="color:var(--muted);margin-top:28px;">Enter a member ID above to view a membership, or register to create one.</p>
      </div>
    </section>`;

  sessionStorage.removeItem('fitgym.joined');
  document.getElementById('logout-btn')?.addEventListener('click', (ev) => {
    ev.preventDefault();
    memberStore.clear();
    go('#/dashboard');
  });

  document.getElementById('lookup-btn').addEventListener('click', () => {
    const id = document.getElementById('lookup-id').value.trim();
    if (/^[1-9]\d*$/.test(id)) { memberStore.id = id; renderMember(id); }
  });
  document.getElementById('lookup-id').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') document.getElementById('lookup-btn').click();
  });

  if (memberStore.id) renderMember(memberStore.id);
}

async function renderMember(id) {
  const box = document.getElementById('dash-content');
  box.innerHTML = '<p style="color:var(--muted);margin-top:28px;">Loading member…</p>';

  const [mr, plans] = await Promise.all([
    api(`/api/members/${id}`),
    loadMemberships()
  ]);

  if (!mr.ok) {
    box.innerHTML = `<div class="alert" style="margin-top:28px;">${e(mr.data?.error || 'Could not load member.')}</div>`;
    if (mr.status === 404) memberStore.clear();
    return;
  }

  const m = mr.data;
  const plan = (plans || []).find((p) => p.name === m.membershipPlan) || {};

  box.innerHTML = `
    <div class="dash-grid">
      <div class="stat-card reveal">
        <div class="stat-label">Member Name</div>
        <div class="stat-value">${e(m.name)}</div>
      </div>
      <div class="stat-card reveal">
        <div class="stat-label">Selected Plan</div>
        <div class="stat-value">${e(plan.name || m.membershipPlan)}${plan.price ? ` <span style="font-size:1rem;color:var(--accent-2);">₹${Number(plan.price).toLocaleString('en-IN')}/mo</span>` : ''}</div>
      </div>
      <div class="stat-card reveal">
        <div class="stat-label">Membership Status</div>
        <div style="margin-top:8px;">${statusBadge(m.membershipStatus)}</div>
      </div>
      <div class="stat-card reveal">
        <div class="stat-label">Expiry Date</div>
        <div class="stat-value">${formatDate(m.expiryDate)}</div>
      </div>
      <div class="stat-card reveal">
        <div class="stat-label">Days Remaining</div>
        <div class="stat-value">${daysLeft(m.expiryDate)} days</div>
      </div>
      <div class="stat-card reveal">
        <div class="stat-label">Email</div>
        <div class="stat-value" style="font-size:1rem;font-weight:500;">${e(m.email)}</div>
      </div>
    </div>

    ${daysLeft(m.expiryDate) <= 0 && m.membershipStatus === 'active' ? '<div class="alert" style="margin-top:24px;">Your membership has expired. <a href="#/plans" style="color:var(--accent);font-weight:700;">Renew now →</a></div>' : ''}

    ${(plan.features && plan.features.length) ? `
      <div class="card mt-4 reveal">
        <h3>${e(plan.name)} Plan — Features</h3>
        <ul class="plan-perks" style="margin-top:12px;">
          ${plan.features.map((f) => `<li>${e(f)}</li>`).join('')}
        </ul>
        <a href="#/plans" class="btn btn-outline btn-sm">Compare plans</a>
      </div>` : ''}`;
  initReveal();
}

function workout() {
  view.innerHTML = `
    <section class="container section">
      <div class="auth-wrap" style="margin:0 auto;max-width:620px;">
        <div class="form-card reveal">
          <p class="section-label">AI Workout Assistant</p>
          <h1>Build My Workout</h1>
          <p class="form-sub">Tell us your goal and experience — we'll generate your weekly plan instantly.</p>
          <div id="workout-error"></div>
          <form id="workout-form">
            <div class="field">
              <label for="goal">Fitness Goal</label>
              <select id="goal" name="goal" required>
                <option value="">-- Select a goal --</option>
                <option value="strength">Strength & Powerlifting</option>
                <option value="fat-loss">Fat Loss</option>
                <option value="muscle">Muscle Gain</option>
                <option value="fitness">General Fitness</option>
              </select>
            </div>
            <div class="field">
              <label for="level">Experience Level</label>
              <select id="level" name="level" required>
                <option value="">-- Select experience --</option>
                <option value="beginner">Beginner (0–6 months)</option>
                <option value="intermediate">Intermediate (6–24 months)</option>
                <option value="advanced">Advanced (2+ years)</option>
              </select>
            </div>
            <div class="field">
              <label for="days">Training Days Per Week</label>
              <select id="days" name="days" required>
                <option value="">-- Select days --</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
              </select>
            </div>
            <button type="submit" id="workout-btn" class="btn btn-primary btn-block">🤖 Generate My Plan</button>
          </form>
        </div>
        <div id="workout-result"></div>
      </div>
    </section>`;

  document.getElementById('workout-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const errBox = document.getElementById('workout-error');
    const result = document.getElementById('workout-result');
    const goal = document.getElementById('goal').value;
    const level = document.getElementById('level').value;
    const days = document.getElementById('days').value;

    errBox.innerHTML = '';
    result.innerHTML = '';
    if (!goal || !level || !days) {
      errBox.innerHTML = '<div class="alert">Please select a goal, experience level and training days.</div>';
      return;
    }

    const btn = document.getElementById('workout-btn');
    btn.disabled = true;
    btn.textContent = 'Generating…';
    const r = await api('/api/workout-assistant', {
      method: 'POST',
      body: JSON.stringify({ goal, level, days: Number(days) })
    });
    btn.disabled = false;
    btn.textContent = '🤖 Generate My Plan';

    if (!r.ok) return errBox.innerHTML = `<div class="alert">${e(r.data?.error || 'Could not generate plan.')}</div>`;

    const p = r.data;
    const header = p.planName ? `${p.planName} Plan` : `${p.days}-Day ${p.goal} Plan`;
    result.innerHTML = `
      <div class="result-card reveal">
        <h2 style="text-transform:uppercase;font-size:1.5rem;">${e(header)}</h2>
        <div class="result-meta">
          <span class="pill">Goal: ${e(p.goal)}</span>
          <span class="pill">Level: ${e(p.level)}</span>
          <span class="pill">${p.days} days / week</span>
          <span class="pill ${p.source === 'ai' ? 'pill-ai' : ''}">${p.source === 'ai' ? '🤖 AI Generated' : 'FitGym Coach'}</span>
        </div>
        <div style="margin-top:18px;">
          ${(p.schedule || []).map((d) => `
            <div class="workout-day reveal">
              <div class="workout-day-title">${e(d.day)} — ${e(d.focus)}</div>
              <ul class="exercise-list">
                ${d.exercises.map((ex) => `<li>${e(ex)}</li>`).join('')}
              </ul>
              <div class="sets-line">Sets/Reps: ${e(d.setsReps)}</div>
            </div>`).join('')}
        </div>
        <div class="note">🧠 ${e(p.note)}</div>
        <a href="#/register" class="btn btn-outline btn-sm mt-4">Join FitGym to train this plan</a>
      </div>`;
    initReveal();
  });
}

/* ---------- router ---------- */

const routes = { home, plans, register, dashboard, workout };

async function navigate() {
  const hash = location.hash || '#/';
  const pathPart = hash.split('?')[0];
  const route = pathPart.replace(/^#\//, '') || 'home';
  const fn = routes[route] || home;

  document.querySelectorAll('#navbar .nav-link').forEach((a) => {
    a.classList.toggle('active-nav', a.dataset.route === route);
  });

  document.querySelector('.site-header')?.classList.remove('nav-open');
  const toggle = document.getElementById('nav-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');

  window.scrollTo(0, 0);
  await fn();
  initReveal();
}

/* ---------- UI wiring ---------- */

function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.reveal-ready)');
  if (!els.length) return;
  els.forEach((el) => el.classList.add('reveal-ready'));

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => el.classList.add('reveal-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => io.observe(el));
}

window.addEventListener('hashchange', navigate);

document.addEventListener('click', (e) => {
  const toggle = e.target.closest('#nav-toggle');
  if (!toggle) return;
  const header = document.querySelector('.site-header');
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});

window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();
navigate();
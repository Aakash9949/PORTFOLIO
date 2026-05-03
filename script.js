/* ══ DATA ═══════════════════════════════════════════════
   ADD a project  → push to DATA.projects  → card + counter auto-update
   ADD a cert     → push to DATA.certs     → badge + counter auto-update
   ════════════════════════════════════════════════════ */
const DATA = {
  tags: ["Python","JavaScript","HTML/CSS","C++","AI / ML","Full-Stack","IoT","Flask"],

  skills: {
    languages:  ["Python","JavaScript","HTML","CSS","C++","Java"],
    frameworks: ["NumPy","Pandas","Flask","Speech Recognition","NLP","Browser APIs"],
    tools:      ["GitHub","VS Code","WordPress","Git"],
    database:   ["SQL","MongoDB"],
    soft:       ["Leadership","Communication","Problem Solving","Team Work"],
  },

  proficiency: [
    { label:"Python",      pct:85 },
    { label:"JavaScript",  pct:80 },
    { label:"HTML / CSS",  pct:90 },
    { label:"C++",         pct:65 },
    { label:"Flask / NLP", pct:70 },
  ],

  /* ── PROJECTS ── add more objects here ─────────────── */
  projects: [
    {
      title:"SmartSathi — AI Elderly Care Companion",
      tech:"HTML · CSS · JavaScript · Browser APIs · CDN Libraries",
      desc:"Voice-enabled AI companion for elderly care providing health monitoring, emergency assistance, and daily reminders via real-time browser APIs.",
      tags:["AI","JavaScript","Web"],
      cat:"AI",
      github:"https://github.com/akshita0819/SmartSaathi",
      live:"https://smartsaathi.onrender.com/",
    },
    {
      title:"Smart Rainwater Harvesting System",
      tech:"IoT · Python · Sensors",
      desc:"IoT-integrated solution automating water collection and promoting sustainable practices with sensor-based real-time level monitoring.",
      tags:["IoT","Python","Hardware"],
      cat:"IoT",
      github:"https://github.com/Aakash9949/LAB_2_INDIGENOUS_RAINWATER_PROJECT",
      live:"https://aakash9949.github.io/LAB_2_INDIGENOUS_RAINWATER_PROJECT/",
    },
    {
      title:"Hospital Management System",
      tech:"Python · HTML · CSS · JavaScript · SQL",
      desc:"Full-stack app to streamline patient records, appointment scheduling, and admin workflows with a role-based dashboard and secure access.",
      tags:["Full-Stack","Python","SQL"],
      cat:"Web",
      github:"https://github.com/Aakash9949/HOSPITAL_MANAGEMENT",
      live:"https://aakash9949.github.io/HOSPITAL_MANAGEMENT/",
    },
    {
      title:"Event Management System",
      tech:"Python · CSS · HTML · JavaScript · Flask",
      desc:"Platform enabling seamless planning, scheduling, and coordination of events with attendee registration and real-time organizer updates.",
      tags:["Full-Stack","Flask","Web"],
      cat:"Web",
      github:"https://github.com/Aakash9949/WEB_EVENT_MANAGEMENT",
      live:"https://aakash9949.github.io/WEB_EVENT_MANAGEMENT/",
    },
  ],

  /* ── CERTS ── add more strings here ────────────────── */
  certs: [
    "IT Fundamentals — Udemy",
    "30 Days DSA Bootcamp — Unstop",
    "AI for Beginners — HP",
    "Data Science & Analytics — HP",
    "Intro to Generative AI — AWS",
    "Cybersecurity Analyst Simulation — Tata / Forage",
  ],
};

/* ══ CURSOR ═════════════════════════════════════════════ */
const cur  = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");
let mx=0,my=0,rx=0,ry=0;
document.addEventListener("mousemove", e => {
  mx=e.clientX; my=e.clientY;
  cur.style.left=mx+"px"; cur.style.top=my+"px";
});
(function animRing(){
  rx+=(mx-rx)*.13; ry+=(my-ry)*.13;
  ring.style.left=rx+"px"; ring.style.top=ry+"px";
  requestAnimationFrame(animRing);
})();

/* ══ NAV SCROLL ═════════════════════════════════════════ */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
  document.querySelectorAll("section[id]").forEach(sec => {
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (!link) return;
    const {top,bottom} = sec.getBoundingClientRect();
    link.style.color = top<100 && bottom>100 ? "var(--text)" : "";
  });
});

/* ══ HAMBURGER ══════════════════════════════════════════ */
const hamburger  = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
hamburger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
mobileMenu.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => mobileMenu.classList.remove("open"))
);

/* ══ RESUME DOWNLOAD ════════════════════════════════════
   Always uses /api/resume — server handles the file.
   Falls back to direct file path if server not running.   */
function downloadResume() {
  const a = document.createElement("a");
  a.href = "/api/resume";
  a.download = "Aakash_Yadav_Resume.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
document.getElementById("download-btn").addEventListener("click", downloadResume);
const mobileResume = document.getElementById("mobile-resume");
if (mobileResume) mobileResume.addEventListener("click", e => { e.preventDefault(); downloadResume(); });

/* ══ HERO TAGS ══════════════════════════════════════════ */
const htContainer = document.getElementById("hero-tags");
DATA.tags.forEach((t,i) => {
  const s = document.createElement("span");
  s.className="tag reveal"; s.textContent=t;
  s.style.animationDelay=(.4+i*.05)+"s";
  htContainer.appendChild(s);
});

/* ══ DYNAMIC COUNTERS (auto from DATA arrays) ═══════════
   Projects counter  = DATA.projects.length  (now 4)
   Certs counter     = DATA.certs.length     (now 6)
   Add to either array → counter updates automatically.    */
document.getElementById("stat-projects").dataset.target = DATA.projects.length;
document.getElementById("stat-certs").dataset.target    = DATA.certs.length;

function animateCount(el, target) {
  let n=0;
  const step = Math.max(target/40, 0.5);
  const t = setInterval(() => {
    n+=step;
    if(n>=target){ el.textContent=target; clearInterval(t); return; }
    el.textContent=Math.floor(n);
  }, 40);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      animateCount(e.target, +e.target.dataset.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold:.5 });
document.querySelectorAll(".stat-num[data-target]").forEach(c => counterObserver.observe(c));

/* ══ SKILLS ═════════════════════════════════════════════ */
const tabsEl = document.getElementById("skill-tabs");
const tagsEl = document.getElementById("skill-tags");
let activeTab = "languages";

function renderTabs() {
  tabsEl.innerHTML="";
  Object.keys(DATA.skills).forEach(cat => {
    const btn = document.createElement("button");
    btn.className="tab-btn"+(cat===activeTab?" active":"");
    btn.textContent=cat.charAt(0).toUpperCase()+cat.slice(1);
    btn.addEventListener("click",()=>{ activeTab=cat; renderTabs(); renderTags(); });
    tabsEl.appendChild(btn);
  });
}
function renderTags() {
  tagsEl.innerHTML="";
  DATA.skills[activeTab].forEach((s,i)=>{
    const span=document.createElement("span");
    span.className="s-tag fade-in"; span.textContent=s;
    span.style.transitionDelay=(i*.05)+"s";
    tagsEl.appendChild(span);
    requestAnimationFrame(()=>span.classList.add("visible"));
  });
}
renderTabs(); renderTags();

// Proficiency bars
const barsEl = document.getElementById("prof-bars");
DATA.proficiency.forEach(p => {
  barsEl.innerHTML+=`
    <div class="prof-bar fade-in">
      <div class="prof-label"><span>${p.label}</span><span>${p.pct}%</span></div>
      <div class="prof-track"><div class="prof-fill" data-pct="${p.pct}"></div></div>
    </div>`;
});
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll(".prof-fill").forEach(f=>{ f.style.width=f.dataset.pct+"%"; });
      barObserver.unobserve(e.target);
    }
  });
},{ threshold:.2 });
document.querySelectorAll(".prof-bar").forEach(b=>barObserver.observe(b));

/* ══ PROJECTS ═══════════════════════════════════════════ */
const allCats    = ["All",...new Set(DATA.projects.map(p=>p.cat))];
const filterEl   = document.getElementById("proj-filters");
const gridEl     = document.getElementById("proj-grid");
let activeFilter = "All";

const GH_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;
const EXT_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

function renderFilters() {
  filterEl.innerHTML="";
  allCats.forEach(cat=>{
    const btn=document.createElement("button");
    btn.className="filter-btn"+(cat===activeFilter?" active":"");
    btn.textContent=cat;
    btn.addEventListener("click",()=>{ activeFilter=cat; renderFilters(); renderProjects(); });
    filterEl.appendChild(btn);
  });
}

function renderProjects() {
  const filtered = activeFilter==="All" ? DATA.projects : DATA.projects.filter(p=>p.cat===activeFilter);
  gridEl.innerHTML="";
  filtered.forEach((p,i)=>{
    const card=document.createElement("div");
    card.className="proj-card fade-in";
    card.style.transitionDelay=(i*.08)+"s";

    const ghBtn = p.github
      ? `<a href="${p.github}" target="_blank" rel="noopener" class="proj-link-btn github-btn">${GH_ICON} GitHub</a>`
      : `<span class="proj-link-btn github-btn disabled">${GH_ICON} GitHub</span>`;

    const liveBtn = p.live
      ? `<a href="${p.live}" target="_blank" rel="noopener" class="proj-link-btn live-btn">${EXT_ICON} Live Demo</a>`
      : `<span class="proj-link-btn live-btn disabled">${EXT_ICON} Coming Soon</span>`;

    card.innerHTML=`
      <div class="proj-num">${String(i+1).padStart(2,"0")} /</div>
      <h3>${p.title}</h3>
      <div class="proj-tech">${p.tech}</div>
      <p class="proj-desc">${p.desc}</p>
      <div class="proj-tags">${p.tags.map(t=>`<span class="proj-tag">${t}</span>`).join("")}</div>
      <div class="proj-links-row">${ghBtn}${liveBtn}</div>`;
    gridEl.appendChild(card);
    requestAnimationFrame(()=>card.classList.add("visible"));
  });
}
renderFilters(); renderProjects();

/* ══ CERTIFICATIONS ═════════════════════════════════════ */
const certGrid = document.getElementById("cert-grid");
DATA.certs.forEach(c=>{
  certGrid.innerHTML+=`<span class="cert-badge">🏅 ${c}</span>`;
});

/* ══ CONTACT FORM ════════════════════════════════════════ */
const form   = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = document.getElementById("submit-btn");
  btn.textContent="Sending…"; btn.disabled=true;
  status.textContent=""; status.className="form-status";

  const payload = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res  = await fetch("/api/contact", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    });
    const data = await res.json();
    if(res.ok && data.success){
      status.textContent="✓ "+data.message;
      status.className="form-status ok";
      form.reset();
    } else {
      status.textContent="✗ "+(data.message||"Something went wrong. Please try again.");
      status.className="form-status err";
    }
  } catch {
    status.textContent="✗ Server not reachable. Email me: aakashyd09@gmail.com";
    status.className="form-status err";
  }
  btn.textContent="Send Message →"; btn.disabled=false;
  setTimeout(()=>{ status.textContent=""; status.className="form-status"; },6000);
});

/* ══ SCROLL REVEAL ══════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("visible"); revealObs.unobserve(e.target); } });
},{ threshold:.12 });
document.querySelectorAll(
  ".t-card,.cert-badge,.proj-card,.c-link,.info-item,.pill,.prof-bar,.stat-card,.about-left p"
).forEach(el=>{ el.classList.add("fade-in"); revealObs.observe(el); });

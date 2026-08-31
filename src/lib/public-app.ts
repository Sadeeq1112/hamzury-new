// @ts-nocheck
"use client";

import {
  AGE_BANDS,
  EDUCATION,
  GENDERS,
  GUARDIAN_RELS,
  HEARD_ABOUT,
  JUNIOR_CLASSES,
  JUNIOR_INTERESTS,
  NG_STATES,
  OCCUPATIONS,
  PARTNER_TYPES,
  SPONSOR_AREAS,
  SPONSOR_FORMS,
  SPONSOR_TYPES,
  ageFromDob,
  isEmail,
  isNgPhone
} from "./lists";

declare global {
  interface Window {
    app?: ReturnType<typeof bootHamzury>;
  }
}

export function bootHamzury() {
  const N = (n) => "₦" + n.toLocaleString("en-NG");
  const FEE = 5000;
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const S = { level: null, jroute: null, age: null, route: null, track: null, guess: null, stack: 0, app: null };
  const PF = {};

  const ND = {
    start: { nm: "Start", why: "You are here.", req: "Nothing.", will: "See the route before you commit.", next: "Check" },
    check: { nm: "Check", why: "We read your current level.", req: "A few questions.", will: "Be placed, not tested.", next: "Foundation or track" },
    found: { nm: "Foundation", why: "The base every track assumes.", req: "Assigned, not chosen.", will: "Work fluently with the tools. One month.", next: "Your track" },
    jbasic: { nm: "Foundation", why: "Where every Junior begins.", req: "Age 13–16.", will: "Build digital confidence and make things.", next: "Software or Hardware" },
    jspec: { nm: "Software / Hardware", why: "Your direction.", req: "Foundation complete.", will: "Build real projects.", next: "Projects" },
    jproj: { nm: "Projects", why: "Proof you can make things.", req: "A specialist route.", will: "Take one project all the way.", next: "Innovator → CEO at 17" },
    track: { nm: "Track", why: "One problem worth solving.", req: "Foundation, or equivalent.", will: "Build the capability to solve it.", next: "Build" },
    build: { nm: "Build", why: "Capability becomes evidence.", req: "A working skill.", will: "Build for Hamzury, then for yourself.", next: "Market" },
    market: { nm: "Market", why: "Someone must want it.", req: "Something built.", will: "Find the market and make the offer.", next: "Revenue" },
    revenue: { nm: "Revenue", why: "Value the market recognised.", req: "Delivered work.", will: "Sell, deliver and review honestly.", next: "CEO" },
    ceo: { nm: "CEO", why: "Can I make it work?", req: "Evidence across the cycle.", will: "Operate the business you built.", next: "Founder" },
    founder: { nm: "Founder", why: "Can I build the system that works?", req: "CEO capability, verified.", will: "Build systems, team and structure. One month, one achievement.", next: "Ecosystem" },
    product: { nm: "Product", why: "Can a customer understand and receive it?", req: "An existing business.", will: "Make the offer clear and repeatable.", next: "Marketing" },
    marketing: { nm: "Marketing", why: "Random posting is not marketing.", req: "A clear product.", will: "Build audience, message, content, lead, follow-up.", next: "Sales" },
    sales: { nm: "Sales", why: "Interest has to go somewhere.", req: "Demand.", will: "Build the path from prospect to decision.", next: "CRM" },
    crm: { nm: "CRM", why: "Customers should not live in WhatsApp memory.", req: "Sales activity.", will: "Build lead, follow-up, customer, delivery, retention.", next: "Finance" },
    finance: { nm: "Finance", why: "You cannot decide what you cannot see.", req: "Revenue.", will: "Build visibility over money in and out.", next: "Operations" },
    operations: { nm: "Operations", why: "What happens after payment?", req: "Delivery.", will: "Define who does what, and when.", next: "Workflows" },
    workflows: { nm: "Workflows", why: "Repeated work should be repeatable.", req: "Operations.", will: "Turn habits into process.", next: "Automation" },
    automation: { nm: "Automation", why: "Technology should remove manual work.", req: "Workflows.", will: "Automate what should not need you.", next: "Team" },
    team: { nm: "Team", why: "The CEO should not do everything.", req: "Systems worth handing over.", will: "Bring in the capability you lack.", next: "Management" },
    management: { nm: "Management", why: "People, systems, numbers, outcomes.", req: "A team.", will: "Manage rather than perform.", next: "Scale" },
    scale: { nm: "Scale", why: "Growth without collapse.", req: "Management.", will: "Grow what already works.", next: "Founder" },
    business: { nm: "Business", why: "A skill is not yet a business.", req: "A market and an offer.", will: "Build name, brand, offer, landing page, WhatsApp, CRM, operations.", next: "Revenue" },
    present: { nm: "Present", why: "Work that cannot be shown cannot be sold.", req: "A finished project.", will: "Show it and defend it.", next: "Next level" },
    test: { nm: "Test", why: "It has to actually work.", req: "A build.", will: "Test, break and fix it.", next: "Project" },
    proven: { nm: "Proven business", why: "You have already done it once.", req: "Revenue over ₦1,000,000.", will: "Build from experience, not from zero.", next: "Ecosystem" },
    expand: { nm: "Expand", why: "Growth or a second venture.", req: "A working business.", will: "Strengthen, expand or start something new.", next: "New venture" },
    venture: { nm: "New venture", why: "You do not restart at the beginning.", req: "Founder experience.", will: "Assess, build, launch, manage.", next: "Scale" },
    eco: { nm: "Ecosystem", why: "Independent, not alone.", req: "Founder status.", will: "Own your company, keep the network.", next: "—" }
  };

  const RT = {
    junior: {
      t: "Junior Innovator",
      m: "Ages 13–16",
      min: 13,
      max: 16,
      map: () =>
        ["start", "check", "jbasic", "jspec"]
          .concat(S.jroute === "hardware" ? ["build", "test"] : ["build"])
          .concat(["jproj", "present"])
    },
    ceo: {
      t: "Innovator → CEO",
      m: "Ages 17+",
      min: 17,
      max: null,
      map: () => ["start", "check"].concat(S.level === "ready" ? [] : ["found"]).concat(["track", "build", "market", "business", "revenue", "ceo"])
    },
    founder: {
      t: "CEO → Founder",
      m: "₦100,000 / month",
      min: 17,
      max: null,
      map: () => ["ceo", "product", "marketing", "sales", "crm", "finance", "operations", "workflows", "automation", "team", "management", "scale", "founder"]
    },
    ecosystem: {
      t: "Founder → Ecosystem",
      m: "₦200,000 · proven revenue over ₦1,000,000",
      min: 17,
      max: null,
      map: () => ["proven", "eco", "expand", "venture", "build", "management", "scale"]
    },
    siwes: {
      t: "SIWES / Internship",
      m: "Junior Staff · 5 days · 8:00–3:00 · monthly",
      min: 17,
      max: null,
      map: () => ["start", "check"].concat(S.level === "ready" ? [] : ["found"]).concat(["track", "build", "market", "business", "revenue", "ceo"])
    }
  };

  const TR = [
    { id: "data", nm: "AI Data & Insight Analyst", p: 64000, prob: "Businesses hold data they never use.", market: "Any business with sales, stock or customer records.", work: "Dashboards, reports and decision briefs from real records.", out: "Turn a company's own data into decisions it can act on.", biz: "Monthly reporting retainer or one-off analysis." },
    { id: "automation", nm: "AI Automation Agency", p: 64000, prob: "Manual work repeats until it breaks.", market: "Operations-heavy businesses with repetitive processes.", work: "Workflows and automations that run without supervision.", out: "Remove hours of manual work from a business.", biz: "Build fee plus maintenance, or retained support." },
    { id: "assistant", nm: "AI Executive Assistant", p: 59000, prob: "Leaders lose hours to work beneath them.", market: "Founders, executives and small leadership teams.", work: "Research, documentation, reporting and communication systems.", out: "Multiply an executive's output without adding headcount.", biz: "Monthly retainer or fractional support." },
    { id: "brand", nm: "AI Brand & Positioning", p: 59000, prob: "Good businesses lose to clearer ones.", market: "Businesses with a real offer and unclear positioning.", work: "Positioning, messaging and the content that carries it.", out: "Make a business understood and chosen.", biz: "Brand project or retained brand support." },
    { id: "revenue", nm: "AI Revenue & Systems Closer", p: 64000, prob: "Interest arrives, then disappears.", market: "Businesses with enquiries and no follow-up system.", work: "Offer, follow-up, WhatsApp systems, CRM and tracking.", out: "Turn enquiries into closed business, on record.", biz: "System build fee or retained sales operations." },
    { id: "startup", nm: "AI Startup Architect", p: 64000, prob: "Ideas fail on structure, not effort.", market: "Founders and teams at the idea stage.", work: "Validation, business model, product spec and an MVP.", out: "Take an idea to something real and tested.", biz: "Venture build or product consulting." },
    { id: "agentic", nm: "Agentic AI Engineer", p: 69000, prob: "Multi-step work is where AI fails.", market: "Businesses whose processes span several systems.", work: "AI agents and agentic workflows that hold up under load.", out: "Build agents that complete real multi-step work.", biz: "Build and maintain, or technical consulting." },
    { id: "media", nm: "AI Media & Faceless Agency", p: 59000, prob: "Attention starts, then stops.", market: "Businesses needing visibility without a media team.", work: "Content systems, production workflows and distribution.", out: "Keep a business visible without burning out.", biz: "Monthly content retainer or channel management." },
    { id: "industry", nm: "Industry AI Transformer", p: 64000, prob: "Traditional industry is largely untouched.", market: "Agriculture, transport, trade, construction, health, education.", work: "One operational problem, analysed and solved with technology.", out: "Modernise a real operation in a traditional sector.", biz: "Transformation project or sector consulting." },
    { id: "wealth", nm: "AI Wealth & Compliance", p: 59000, prob: "Disorder costs more than competition.", market: "Businesses formalising their money and filing.", work: "Compliance calendars, financial workflows and record systems.", out: "Put a business in order and keep it there.", biz: "System setup or ongoing compliance support." },
    { id: "web", nm: "Website Design & Development", p: 56000, prob: "Most businesses have no working front door.", market: "Any business that needs to be found and trusted online.", work: "Designed, built and deployed websites that convert.", out: "Ship a working site a business can rely on.", biz: "Build fee plus hosting, care and iteration." },
    { id: "software", nm: "Software & App Development", p: 56000, prob: "Off-the-shelf tools rarely fit the actual process.", market: "Businesses outgrowing spreadsheets and manual systems.", work: "Applications built to a real specification and shipped.", out: "Build software people actually use.", biz: "Project build, or product with recurring licensing." }
  ];
  const TR_FUTURE = [
    { nm: "Cybersecurity", note: "Available as an additional track." },
    { nm: "Product Design", note: "Available as an additional track." }
  ];
  const trk = (id) => TR.find((t) => t.id === id);

  const QP = [
    { id: "afternoon", dim: "track", w: 3, q: "What would you rather spend an afternoon doing?", a: [
      ["Building something", { startup: 2, agentic: 2 }, 0],
      ["Helping someone solve a problem", { assistant: 2, industry: 1 }, 0],
      ["Making something look better", { brand: 2, media: 2 }, 0],
      ["Finding what the numbers say", { data: 3 }, 0],
      ["Making a process faster", { automation: 3 }, 0],
      ["Selling an idea", { revenue: 3 }, 0],
      ["I don't know yet", {}, 0]
    ]},
    { id: "done", dim: "both", w: 2, q: "Which of these have you actually done?", a: [
      ["Solved a real problem with digital tools", { automation: 2, data: 1 }, 1],
      ["Made something people used", { startup: 3 }, 2],
      ["Sold or explained something", { revenue: 2, brand: 1 }, 1],
      ["Organised work for other people", { assistant: 2, wealth: 1 }, 1],
      ["Worked in a traditional business", { industry: 3 }, 1],
      ["Not much yet", {}, -2]
    ]},
    { id: "computer", dim: "level", w: 4, q: "Using a computer feels…", a: [
      ["Easy", {}, 2], ["I can manage", {}, 0], ["I need help", {}, -2], ["I avoid it", {}, -2], ["I'm not sure", {}, 0]
    ]},
    { id: "tools", dim: "level", w: 3, q: "Which of these have you used for real work?", a: [
      ["Spreadsheets or documents", { data: 1 }, 2],
      ["Design or content tools", { media: 1, brand: 1 }, 2],
      ["AI tools, beyond curiosity", { agentic: 1 }, 2],
      ["Business tools — CRM, invoicing, bookkeeping", { revenue: 1, wealth: 1 }, 2],
      ["None of these yet", {}, -2]
    ]},
    { id: "unfamiliar", dim: "level", w: 2, q: "When something is unfamiliar, you…", a: [
      ["Break it into parts", { data: 1 }, 1],
      ["Try things until it works", { startup: 1 }, 1],
      ["Watch someone first", { assistant: 1 }, 0],
      ["Ask for direction", {}, -1]
    ]},
    { id: "worth", dim: "track", w: 2, q: "What would make this worth it?", a: [
      ["A capability I can use", { data: 1, assistant: 1 }, 0],
      ["A service I can sell", { automation: 2, revenue: 2 }, 0],
      ["A business I can build", { startup: 3 }, 0],
      ["Real experience", { industry: 1, assistant: 1 }, 0]
    ]},
    { id: "age", dim: "age", w: 9, q: "How old are you?", a: [
      ["13–16", "13-16"], ["17–20", "17-20"], ["21–25", "21-25"], ["26 and above", "26+"]
    ]}
  ];
  const QID = (id) => QP.find((q) => q.id === id);

  const STEP = [
    "Explore",
    "Check",
    "Your programme",
    "Your details",
    "Application fee",
    "Send evidence",
    "Programme fee",
    "Programme evidence",
    "Confirmed"
  ];
  const BANK = { bank: "Moniepoint", name: "Hamzury Mainstream Ltd", acct: "82025158500" };
  const WHATSAPP = "08067149356";
  const wa = (text) =>
    "https://wa.me/234" + WHATSAPP.replace(/^0/, "") + "?text=" + encodeURIComponent(text);

  const CHK = [
    { q: "Day to day, using a computer feels…", a: [["Comfortable", 1], ["Manageable", 0], ["New to me", -1]] },
    { q: "Have you used tools like Docs, Sheets or Drive for real work?", a: [["Yes, regularly", 1], ["A little", 0], ["Not yet", -1]] },
    { q: "Have you built or produced something digital before?", a: [["Yes", 1], ["Once or twice", 0], ["No", -1]] }
  ];

  const TY = [
    { y: 2027, s: "Upcoming", months: [] },
    { y: 2026, s: "Current", months: ["January", "February", "March", "April", "May", "June", "July", "August"] },
    { y: 2025, s: "Archive", months: ["April", "August", "December"] }
  ];
  const TSTATS = ["Impact", "Cohorts", "Businesses", "Projects", "Outcomes", "Participation"];
  const LIFE = [
    { id: "dandali", nm: "Dandali", m: "Building" },
    { id: "zaure", nm: "Zaure", m: "Presenting" },
    { id: "madafa", nm: "Workspace", m: "Daily work" },
    { id: "tsunguna", nm: "Mentoring", m: "Unblocking" },
    { id: "build", nm: "Building", m: "Hands on" },
    { id: "present", nm: "Presentations", m: "Showing work" },
    { id: "events", nm: "Events", m: "The ecosystem" }
  ];
  const QA = [
    ["Is ₦5,000 the full fee?", "No. It is the application fee. Programme fees come later, separately, once your route is set."],
    ["Do I choose Foundation?", "No. We check your level and place you. If you already have it, you skip it."],
    ["Does paying guarantee admission?", "No. It puts a verified application on record."],
    ["When can I apply?", "Between the 1st and 25th each month."],
    ["Do I need to know my career?", "No. Guide Me works from what you have already done."],
    ["Will I earn money?", "We do not promise income. We build the capability and the business around it."]
  ];

  const fact = (k, v) => '<div class="fact"><dt>' + k + "</dt><dd>" + v + "</dd></div>";
  const facts = (rows) => '<dl class="facts">' + rows.map((r) => fact(r[0], r[1])).join("") + "</dl>";
  const payRow = (k, v) => '<div class="payrow"><span class="pk">' + esc(k) + '</span><span class="pv">' + esc(v) + "</span></div>";
  const nextRow = (n, t, m) =>
    '<div class="nextrow"><span class="nn">' + n + "</span><span><b>" + esc(t) + "</b><small>" + esc(m) + "</small></span></div>";
  const mkRef = () => "HMZ-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  function jmap(ids, activeId) {
    return (
      '<div class="journey"><div class="jline"></div>' +
      ids
        .map((id) => {
          const n = ND[id];
          let cls = "",
            hint = "";
          if (id === activeId) {
            cls = " on";
            hint = "You start here";
          } else if (id === "found" && S.level === null) {
            cls = " maybe";
            hint = "If needed";
          } else if (id === "found" && S.level === "needs") {
            cls = " on";
            hint = "You start here";
          }
          return (
            '<button class="jnode' +
            cls +
            "\" onclick=\"app.open('n-" +
            id +
            '\')">' +
            '<span class="dot"><i></i></span>' +
            '<span class="txt"><span class="nm">' +
            esc(n.nm) +
            "</span>" +
            (hint ? '<span class="hint">' + hint + "</span>" : "") +
            "</span></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  const V = {};
  Object.keys(ND).forEach((id) => {
    V["n-" + id] = () => {
      const n = ND[id];
      return {
        t: n.nm,
        h:
          facts([
            ["Why", esc(n.why)],
            ["Required", esc(n.req)],
            ["You will", esc(n.will)],
            ["Next", esc(n.next)]
          ]) +
          (id === "found"
            ? '<div class="note">Assigned by the check, never chosen. If you already have it, you skip it.</div>'
            : "") +
          (id === "track" ? '<button class="btn quiet" style="margin-top:26px" onclick="app.open(\'tracks\')">See the tracks</button>' : "") +
          (id === "build" ? '<button class="btn quiet" style="margin-top:26px" onclick="app.open(\'inside\')">Inside a month</button>' : "")
      };
    };
  });

  Object.keys(RT).forEach((k) => {
    V["r-" + k] = () => {
      const r = RT[k];
      const start = S.level === "needs" ? (k === "junior" ? "jbasic" : "found") : null;
      return {
        t: r.t,
        sub: r.m,
        h:
          jmap(r.map(), start) +
          (S.level === null ? '<div class="note">We check your level before you start. You are never asked to choose Foundation.</div>' : "") +
          '<div class="actions"><button class="btn primary" onclick="app.startApp(\'' +
          k +
          '\')">Apply</button>' +
          '<button class="btn quiet" onclick="app.open(\'paths\')">Other routes</button></div>'
      };
    };
  });

  V.paths = () => ({
    t: "Find my path",
    sub: "If you already know what you want.",
    h:
      '<div class="index">' +
      Object.keys(RT)
        .map(
          (k, i) =>
            '<button class="row" onclick="app.open(\'r-' +
            k +
            '\')"><span class="n">' +
            String(i + 1).padStart(2, "0") +
            '</span><span class="t">' +
            esc(RT[k].t) +
            '<span class="m">' +
            esc(RT[k].m) +
            '</span></span><span class="go">→</span></button>'
        )
        .join("") +
      '<button class="row" onclick="app.open(\'tracks\')"><span class="n">06</span>' +
      '<span class="t">Tracks<span class="m">Choose a capability directly</span></span><span class="go">→</span></button>' +
      '<button class="row" onclick="app.open(\'partnership\')"><span class="n">07</span>' +
      '<span class="t">Partner<span class="m">Build something together</span></span><span class="go">→</span></button>' +
      '<button class="row" onclick="app.open(\'sponsorship\')"><span class="n">08</span>' +
      '<span class="t">Sponsor<span class="m">Fund what comes next</span></span><span class="go">→</span></button></div>' +
      '<div class="note">Not sure? <button style="color:var(--gold)" onclick="app.open(\'guide\')">Guide me instead</button></div>'
  });

  V.tracks = () => ({
    t: "Tracks",
    sub: "Twelve problems worth solving.",
    h:
      '<div class="index">' +
      TR.map(
        (t, i) =>
          '<button class="row" onclick="app.open(\'t-' +
          t.id +
          '\')"><span class="n">' +
          String(i + 1).padStart(2, "0") +
          '</span><span class="t">' +
          esc(t.nm) +
          '<span class="m">' +
          esc(t.prob) +
          '</span></span><span class="go">' +
          N(t.p) +
          "</span></button>"
      ).join("") +
      "</div>" +
      '<div class="label" style="margin:44px 0 14px">Additional tracks</div>' +
      '<div class="index">' +
      TR_FUTURE.map(
        (f) =>
          '<div class="row" style="cursor:default"><span class="n">—</span><span class="t" style="color:var(--muted)">' +
          esc(f.nm) +
          '<span class="m">' +
          esc(f.note) +
          '</span></span><span class="go" style="opacity:.4">·</span></div>'
      ).join("") +
      "</div>"
  });

  TR.forEach((t) => {
    V["t-" + t.id] = () => ({
      t: t.nm,
      h:
        facts([
          ["The problem", esc(t.prob)],
          ["The market", esc(t.market)],
          ["The work", esc(t.work)],
          ["The outcome", esc(t.out)],
          ["The business", esc(t.biz)]
        ]) +
        '<div class="label" style="margin:36px 0 4px">The journey</div>' +
        jmap(["track", "build", "market", "revenue", "ceo"], "track") +
        '<div class="amt" style="margin-top:26px"><div class="l">Track fee<small>Separate from the ' +
        N(FEE) +
        ' application fee</small></div><div class="v now">' +
        N(t.p) +
        "</div></div>" +
        '<div class="actions"><button class="btn primary" onclick="app.startApp(\'ceo\',\'' +
        t.id +
        '\')">Apply</button>' +
        '<button class="btn quiet" onclick="app.open(\'tracks\')">Other tracks</button></div>'
    });
  });

  V.inside = () => ({
    t: "Inside the journey",
    sub: "Every journey runs month by month. Each month is an achievement cycle.",
    h:
      '<div class="label" style="margin-bottom:4px">A day</div>' +
      facts([
        ["8:00–10:00", "Guided workspace. Practical building."],
        ["10:00–2:00", "Mentor-guided learning, application, building and submission."]
      ]) +
      '<div class="label" style="margin:36px 0 4px">The loop</div>' +
      '<div class="journey"><div class="jline"></div>' +
      ["Month", "Missions", "Tasks", "Submission", "Review", "Points", "Achievement", "Next unlock"]
        .map(
          (x, i) =>
            '<div class="jnode' +
            (i === 7 ? " on" : "") +
            '"><span class="dot"><i></i></span><span class="txt"><span class="nm">' +
            x +
            "</span></span></div>"
        )
        .join("") +
      "</div>" +
      '<div class="note">AI is the standard, not an extra. Better result, faster execution.</div>'
  });

  V.fees = () => ({
    t: "Fees",
    sub: "Two payments, at two different moments.",
    h:
      '<div class="amt"><div class="l">Discovery<small>Exploring and Guide Me</small></div><div class="v later">Free</div></div>' +
      '<div class="amt"><div class="l">Application<small>Once you decide to apply</small></div><div class="v now">' +
      N(FEE) +
      "</div></div>" +
      '<div class="amt"><div class="l">Programme<small>After your route is set</small></div><div class="v later">Separate</div></div>' +
      '<div class="note">Never combined. You are never asked for a programme fee before your route is set.</div>' +
      facts([
        ["Junior", N(25000) + " Foundation · " + N(30000) + " Software · " + N(120000) + " Robotics"],
        ["Tracks", N(56000) + "–" + N(69000)],
        ["SIWES / Internship", "1 month " + N(30000) + " · 2 months " + N(50000) + " · 3 months " + N(70000)],
        ["Direct Internship", N(70000) + " per month · 5 days · 8:00–3:00"],
        ["CEO → Founder", N(100000) + " per month"],
        ["Founder → Ecosystem", N(200000) + " · requires proven revenue over " + N(1000000)],
        ["Longer placements", "Progression stays monthly. Each month is its own cycle."],
        ["Foundation", "Set at review"]
      ])
  });

  let RS = { ref: "", state: null, track: null, payload: null };
  V.resume = () => ({ t: "Continue my application", sub: "Enter the reference from your application.", h: '<div id="rs"></div>', after: () => rsStep() });

  function receiptBox(kind, amountLabel) {
    return (
      '<label class="drop" id="drop"><input type="file" id="receipt" accept="image/jpeg,image/png,image/webp,application/pdf">' +
      '<span id="drop-label">Drop a photo of your receipt, or tap to choose</span></label>' +
      '<div id="receipt-status" class="tiny" style="margin-top:12px">' +
      (amountLabel || "") +
      "</div>"
    );
  }

  function rsStep() {
    const box = $("#rs");
    if (!box) return;
    if (!RS.state) {
      box.innerHTML =
        '<div class="field"><label for="rs-ref">Your reference</label>' +
        '<input id="rs-ref" placeholder="HMZ-2026-XXXXX" autocomplete="off" value="' +
        esc(RS.ref) +
        '">' +
        '<div class="err" id="rs-err"></div></div>' +
        '<div class="actions"><button class="btn primary" onclick="app.rsCheck()">Check my application</button></div>';
      return;
    }
    if (RS.state === "PENDING")
      box.innerHTML =
        "<h2>Still being checked.</h2><div class=\"sub\">A person checks every payment. You will be contacted once it is confirmed.</div>" +
        '<div class="actions"><button class="btn quiet" onclick="app.rsReset()">Check another reference</button></div>';
    else if (RS.state === "REJECTED")
      box.innerHTML =
        "<h2>We could not confirm your payment.</h2><div class=\"sub\">Send a clearer receipt, quoting " +
        esc(RS.ref) +
        ".</div>" +
        '<div class="actions"><button class="btn primary" onclick="app.rsReset()">Try again</button>' +
        '<a class="btn quiet" style="text-decoration:none" target="_blank" rel="noopener" href="' +
        wa("Hamzury " + RS.ref + " — new receipt attached.") +
        '">Open WhatsApp</a></div>';
    else if (RS.state === "NOT_FOUND")
      box.innerHTML =
        "<h2>We do not have that reference.</h2><div class=\"sub\">Check it and try again, or contact us on WhatsApp.</div>" +
        '<div class="actions"><button class="btn quiet" onclick="app.rsReset()">Try another reference</button></div>';
    else if (RS.state === "VERIFIED") {
      box.innerHTML =
        '<div class="label accent">Application verified</div>' +
        '<h2 style="margin:12px 0 8px">Choose your track.</h2>' +
        '<div class="sub">This is the last step before orientation.</div>' +
        '<div class="opts" style="margin-top:24px">' +
        TR.map(
          (t) =>
            '<button class="opt" onclick="app.rsPick(\'' +
            t.id +
            '\')" aria-pressed="' +
            (RS.track === t.id) +
            '"><span>' +
            esc(t.nm) +
            "<small>" +
            N(t.p) +
            '</small></span><span class="mark">→</span></button>'
        ).join("") +
        "</div>" +
        (RS.track
          ? '<div class="actions"><button class="btn primary" onclick="app.rsSubmit()">Confirm ' + esc(trk(RS.track).nm) + "</button></div>"
          : "");
    } else if (RS.state === "DONE") {
      const t = trk(RS.track);
      const label = (t && t.nm) || (RS.payload && RS.payload.programmeLabel) || "Programme fee";
      const amount = (t && t.p) || (RS.payload && RS.payload.programmeFee) || 0;
      A.ref = RS.ref;
      A.receiptKind = "PROGRAMME_FEE";
      A.receiptUploaded = false;
      box.innerHTML =
        '<div class="label accent">Programme fee</div>' +
        '<h2 style="margin:12px 0 8px">' +
        esc(label) +
        "</h2>" +
        '<div class="sub">Separate from the ' +
        N(FEE) +
        " application fee you have already paid.</div>" +
        '<div class="pay" style="margin-top:24px">' +
        payRow("Bank", BANK.bank) +
        payRow("Account name", BANK.name) +
        payRow("Account number", BANK.acct) +
        payRow("Amount", N(amount)) +
        payRow("Use as reference", RS.ref) +
        "</div>" +
        receiptBox("PROGRAMME_FEE") +
        '<div class="actions"><button class="btn primary" onclick="app.uploadReceipt()">Upload receipt</button>' +
        '<a class="btn quiet" style="text-decoration:none" target="_blank" rel="noopener" href="' +
        wa("HAMZURY PROGRAMME FEE\nReference: " + RS.ref + "\nProgramme: " + label + "\nAmount: " + N(amount) + " — receipt attached.") +
        '">Also send on WhatsApp</a></div>' +
        '<div class="note">A person checks it. Once confirmed you receive your offer letter and orientation.</div>';
      bindReceipt();
    } else
      box.innerHTML =
        '<div class="note">We could not check right now. Try again, or use WhatsApp.</div>' +
        '<div class="actions"><button class="btn quiet" onclick="app.rsReset()">Try again</button></div>';
  }

  async function rsCheck() {
    const v = ($("#rs-ref").value || "").trim().toUpperCase();
    if (!/^HMZ-/.test(v)) {
      $("#rs-err").textContent = "That does not look like a reference.";
      return;
    }
    RS.ref = v;
    $("#rs-err").textContent = "Checking…";
    try {
      const r = await fetch("/api/applications?ref=" + encodeURIComponent(v));
      const d = await r.json();
      if (r.status === 404 || d.status === "NOT_FOUND") RS.state = "NOT_FOUND";
      else if (!r.ok) RS.state = "ERROR";
      else {
        RS.state = d.status;
        RS.track = d.track || null;
        RS.payload = d;
        const hasProg = (d.payments || []).some((p) => p.type === "PROGRAMME_FEE" && p.hasReceipt);
        const canPayProgramme = d.track || d.route === "founder" || d.route === "ecosystem";
        if (!hasProg && canPayProgramme && (d.status === "VERIFIED" || d.status === "PENDING")) RS.state = "DONE";
      }
    } catch (e) {
      RS.state = "ERROR";
    }
    rsStep();
  }
  function rsPick(id) {
    RS.track = id;
    rsStep();
  }
  async function rsSubmit() {
    if (RS.track) {
      try {
        await fetch("/api/applications/" + encodeURIComponent(RS.ref) + "/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track: RS.track })
        });
      } catch (e) {}
    }
    RS.state = "DONE";
    rsStep();
  }
  function rsReset() {
    RS = { ref: "", state: null, track: null, payload: null };
    rsStep();
  }

  V.questions = () => ({
    t: "Questions",
    h:
      '<dl class="facts">' +
      QA.map(
        (x) =>
          '<div class="fact"><dt style="letter-spacing:0;text-transform:none;font-size:14px;color:var(--ink);font-weight:600">' +
          esc(x[0]) +
          '</dt><dd style="color:var(--muted)">' +
          esc(x[1]) +
          "</dd></div>"
      ).join("") +
      "</dl>"
  });

  V.life = () => ({
    t: "Life at Hamzury",
    h:
      '<div class="tiles">' +
      LIFE.map(
        (l) =>
          '<button class="tile" onclick="app.open(\'l-' + l.id + '\')"><span class="tn">' + esc(l.nm) + '</span><span class="tm">' + esc(l.m) + "</span></button>"
      ).join("") +
      "</div>"
  });
  LIFE.forEach((l) => {
    V["l-" + l.id] = () => ({
      t: l.nm,
      sub: l.m,
      h:
        '<div class="tiles">' +
        [1, 2, 3, 4].map(() => '<div class="tile" style="min-height:150px"></div>').join("") +
        "</div>" +
        '<div class="note">Photography appears here once supplied.</div>'
    });
  });

  V.treasury = () => ({
    t: "Treasury",
    sub: "The evidence room.",
    h:
      '<div class="index">' +
      TY.map(
        (y) =>
          '<button class="row" onclick="app.open(\'y-' +
          y.y +
          '\')"><span class="n">' +
          y.s.slice(0, 3).toUpperCase() +
          '</span><span class="t">' +
          y.y +
          '</span><span class="go">→</span></button>'
      ).join("") +
      "</div>"
  });
  TY.forEach((y) => {
    V["y-" + y.y] = () => ({
      t: String(y.y),
      sub: y.s,
      h:
        '<div class="crumbs"><button onclick="app.open(\'treasury\')">Treasury</button><span>/</span><span>' +
        y.y +
        "</span></div>" +
        TSTATS.map((s) => '<div class="stat"><span class="k">' + s + '</span><span class="v">—</span></div>').join("") +
        (y.months.length
          ? '<div class="index" style="margin-top:30px">' +
            y.months
              .map(
                (m) =>
                  '<button class="row" onclick="app.open(\'m-' +
                  y.y +
                  "-" +
                  m +
                  '\')"><span class="n"></span><span class="t" style="font-size:19px">' +
                  m +
                  '</span><span class="go">→</span></button>'
              )
              .join("") +
            "</div>"
          : '<div class="empty" style="margin-top:30px">Records appear here as the Treasury is updated.</div>') +
        '<p class="tiny" style="margin-top:30px">Public records will be published here, and downloadable, once the Treasury holds data.</p>'
    });
    y.months.forEach((m) => {
      V["m-" + y.y + "-" + m] = () => ({
        t: m + " " + y.y,
        h:
          '<div class="crumbs"><button onclick="app.open(\'treasury\')">Treasury</button><span>/</span>' +
          '<button onclick="app.open(\'y-' +
          y.y +
          "')\">" +
          y.y +
          "</button><span>/</span><span>" +
          m +
          "</span></div>" +
          '<div class="empty">Records appear here as the Treasury is updated.</div>' +
          '<div class="tiny" style="margin-top:26px">A participant record holds: name · track · project · business · problem solved · website · outcome. Published only with consent.</div>'
      });
    });
  });

  const G = { asked: [], picks: [], sc: {}, ev: 0 };
  const resetG = () => {
    G.asked = [];
    G.picks = [];
    G.sc = {};
    G.ev = 0;
    TR.forEach((t) => (G.sc[t.id] = 0));
    S.age = null;
  };
  const ranked = () => TR.slice().sort((a, b) => G.sc[b.id] - G.sc[a.id]);
  function knowDirection() {
    const r = ranked();
    return G.sc[r[0].id] >= 3 && G.sc[r[0].id] - G.sc[r[1].id] >= 2;
  }
  function knowExperience() {
    return Math.abs(G.ev) >= 2;
  }
  function knowAge() {
    return !!S.age;
  }
  const MAX_ASK = 4;
  const poolDry = () =>
    G.asked.filter((id) => QID(id).dim !== "age").length >= MAX_ASK || QP.filter((q) => q.dim !== "age" && !G.asked.includes(q.id)).length === 0;
  const juniorLocked = () => S.age === "13-16";
  function enough() {
    if (!knowAge()) return false;
    if (juniorLocked()) return knowExperience() || poolDry();
    return (knowDirection() || poolDry()) && (knowExperience() || poolDry());
  }
  function nextQ() {
    const left = QP.filter((q) => q.dim !== "age" && !G.asked.includes(q.id));
    const needDir = !juniorLocked() && !knowDirection();
    const needExp = !knowExperience();
    if (!needDir && !needExp && !knowAge()) return "age";
    if (poolDry()) return knowAge() ? null : "age";
    let pool = left;
    if (needDir && !needExp) pool = left.filter((q) => q.dim === "track" || q.dim === "both");
    else if (needExp && !needDir) pool = left.filter((q) => q.dim === "level" || q.dim === "both");
    if (!pool.length) pool = left;
    return pool.sort((a, b) => b.w - a.w)[0].id;
  }

  V.guide = () => ({ t: "Guide me", h: '<div id="g"></div>', after: () => { resetG(); qStep(); } });

  function qStep() {
    if (enough()) return hypothesis();
    const id = nextQ();
    if (!id) return hypothesis();
    const q = QID(id);
    const seg = (done, now) => '<i class="' + (done ? "done" : now ? "now" : "") + '"></i>';
    const cur = q.dim;
    $("#g").innerHTML =
      '<div class="prog">' +
      seg(juniorLocked() || knowDirection(), cur === "track" || cur === "both") +
      seg(knowExperience(), cur === "level" || cur === "both") +
      seg(knowAge(), cur === "age") +
      "</div>" +
      '<div class="q">' +
      esc(q.q) +
      "</div>" +
      '<div class="opts">' +
      q.a
        .map((a, i) => '<button class="opt" onclick="app.pick(' + i + ')"><span>' + esc(a[0]) + '</span><span class="mark">→</span></button>')
        .join("") +
      "</div>" +
      (G.asked.length ? '<button class="iconbtn wide" style="margin-top:26px" onclick="app.qBack()">← Back</button>' : "");
    G.current = id;
  }
  function applyPick(id, ai) {
    const q = QID(id),
      a = q.a[ai];
    if (q.dim === "age") {
      S.age = a[1];
      return;
    }
    if (a[1]) for (const k in a[1]) G.sc[k] = (G.sc[k] || 0) + a[1][k];
    if (a[2]) G.ev += a[2];
  }
  function pick(i) {
    G.asked.push(G.current);
    G.picks.push([G.current, i]);
    applyPick(G.current, i);
    qStep();
  }
  function qBack() {
    if (!G.picks.length) return;
    const keep = G.picks.slice(0, -1);
    resetG();
    keep.forEach((p) => {
      G.asked.push(p[0]);
      G.picks.push(p);
      applyPick(p[0], p[1]);
    });
    qStep();
  }
  function hypothesis() {
    const best = ranked()[0];
    const junior = juniorLocked();
    const sure = knowDirection();
    S.level = G.ev >= 2 ? "ready" : "needs";
    S.route = junior ? "junior" : "ceo";
    S.track = junior ? null : best.id;
    S.guess = best.id;
    const r = RT[S.route];
    $("#g").innerHTML =
      '<div class="prog"><i class="done"></i><i class="done"></i><i class="done"></i></div>' +
      '<div class="label accent">We think you may fit here</div>' +
      '<h2 style="margin:14px 0 6px">' +
      esc(junior ? r.t : best.nm) +
      "</h2>" +
      '<div class="sub">' +
      esc(junior ? "A standalone journey for 13–16." : best.prob) +
      "</div>" +
      jmap(r.map(), S.level === "needs" ? (junior ? "jbasic" : "found") : junior ? "jbasic" : "track") +
      '<div class="note">' +
      (S.level === "needs"
        ? "Your level means you begin at Foundation. It is the shortest route to your track."
        : "Your level means you go straight to your track.") +
      (!junior && !sure ? " We will confirm your direction at the check." : "") +
      "</div>" +
      '<div class="actions"><button class="btn primary" onclick="app.startApp(\'' +
      S.route +
      "'" +
      (S.track ? ",'" + S.track + "'" : "") +
      ')">Accept</button>' +
      '<button class="btn quiet" onclick="app.open(\'paths\')">Explore another path</button></div>' +
      '<div style="margin-top:20px"><button class="iconbtn wide" onclick="app.open(\'tracks\')">See all tracks</button></div>';
  }

  const A = {
    s: 0,
    route: null,
    track: null,
    name: "",
    email: "",
    phone: "",
    ref: null,
    chk: 0,
    ci: 0,
    cans: [],
    siwes: null,
    docs: false,
    founder: null,
    saved: false,
    receiptUploaded: false,
    appReceipt: false,
    progReceipt: false,
    receiptKind: "APPLICATION_FEE"
  };
  V.apply = () => ({ t: "Apply", h: '<div id="a"></div>', after: () => aStep() });

  const prog = () =>
    '<div class="prog">' +
    STEP.map((_, i) => '<i class="' + (i < A.s ? "done" : i === A.s ? "now" : "") + '"></i>').join("") +
    "</div>" +
    '<div class="label" style="margin-bottom:20px">' +
    STEP[A.s] +
    "</div>";
  const acts = (b, n, l) =>
    '<div class="actions">' +
    (b ? '<button class="btn quiet" onclick="app.aBack()">Back</button>' : "") +
    (n ? '<button class="btn primary" onclick="' + n + '">' + (l || "Continue") + "</button>" : "") +
    "</div>";

  function pickProg(v) {
    if (A.route === "siwes") A.siwes = v;
    else {
      A.track = v;
      if (A.route === "junior") S.jroute = v;
    }
    aStep();
  }
  function clearProg() {
    if (A.route === "siwes") A.siwes = null;
    else A.track = null;
    aStep();
  }
  function progLabel() {
    if (A.route === "junior") return A.track === "hardware" ? "Robotics" : A.track === "software" ? "Software" : "Programme fee";
    if (A.route === "siwes") return A.siwes === "intern" ? "Direct internship" : A.siwes ? "SIWES · " + A.siwes + " month" + (A.siwes === "1" ? "" : "s") : "Placement fee";
    if (A.route === "founder") return "CEO → Founder";
    if (A.route === "ecosystem") return "Founder → Ecosystem";
    return A.track && trk(A.track) ? trk(A.track).nm : "Programme fee";
  }
  function progFee() {
    if (A.route === "junior") return A.track === "hardware" ? N(120000) : A.track === "software" ? N(30000) : "To be confirmed";
    if (A.route === "siwes") {
      const m = { "1": 30000, "2": 50000, "3": 70000, intern: 70000 }[A.siwes];
      return m ? N(m) + (A.siwes === "intern" ? " / month" : "") : "To be confirmed";
    }
    if (A.route === "founder") return N(100000) + " / month";
    if (A.route === "ecosystem") return N(200000);
    return A.track && trk(A.track) ? N(trk(A.track).p) : "To be confirmed";
  }

  function applicationMessage() {
    const L = [];
    L.push("HAMZURY APPLICATION");
    L.push("Reference: " + (A.ref || ""));
    L.push("");
    L.push("Name: " + (A.name || "—"));
    L.push("Phone: " + (A.phone || "—"));
    L.push("Email: " + (A.email || "—"));
    L.push("Location: " + (A.location || "—"));
    if (A.route === "junior") {
      L.push("Date of birth: " + (A.dob || "—"));
      L.push("School: " + (A.school || "—") + (A.cls ? " · " + A.cls : ""));
      L.push("");
      L.push("GUARDIAN");
      L.push("Name: " + (A.gname || "—") + (A.grel ? " (" + A.grel + ")" : ""));
      L.push("Phone: " + (A.gphone || "—"));
      L.push("Email: " + (A.gemail || "—"));
      L.push("Emergency: " + (A.gemergency || "—"));
      L.push("Consent given: " + (A.consent ? "Yes" : "No"));
    }
    if (S.age) L.push("Age: " + S.age);
    L.push("");
    L.push("Route: " + ((RT[A.route] || {}).t || "—"));
    if (A.track) L.push("Track: " + (trk(A.track) ? trk(A.track).nm : A.track));
    L.push("Starting point: " + (S.level === "needs" ? "Foundation first" : S.level === "ready" ? "Straight to track" : "To be confirmed"));
    L.push("");
    L.push("Programme chosen: " + progLabel() + " — " + progFee());
    L.push("");
    L.push("Application fee: " + N(FEE) + " — receipt attached.");
    return L.join("\n");
  }

  function applicationPayload() {
    return {
      ref: A.ref || undefined,
      name: A.name,
      email: A.email,
      phone: A.phone,
      location: A.location,
      gender: A.gender || null,
      state: A.state || null,
      occupation: A.occupation || null,
      education: A.education || null,
      heardAbout: A.heardAbout || null,
      route: A.route,
      track: A.track || null,
      siwes: A.siwes || null,
      level: S.level || null,
      age: S.age || null,
      guess: S.guess || null,
      dob: A.dob || null,
      school: A.school || null,
      cls: A.cls || null,
      interests: A.interests || null,
      guardianName: A.gname || null,
      guardianRel: A.grel || null,
      guardianPhone: A.gphone || null,
      guardianEmail: A.gemail || null,
      emergency: A.gemergency || null,
      consent: A.consent || null
    };
  }

  async function saveApplication() {
    try {
      const r = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationPayload())
      });
      const d = await r.json();
      if (!r.ok) {
        toast(d.error || "Could not save your application.", "bad");
        return false;
      }
      A.ref = d.ref;
      A.saved = true;
      persistLocal();
      return true;
    } catch (e) {
      toast("Could not reach the server. Check your connection and try again.", "bad");
      return false;
    }
  }

  function bindReceipt() {
    const input = $("#receipt");
    const drop = $("#drop");
    if (!input || !drop) return;
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      drop.classList.toggle("has", !!f);
      const lab = $("#drop-label");
      if (f && lab) {
        lab.textContent = f.name;
        if (f.type.startsWith("image/")) {
          let img = drop.querySelector("img");
          if (!img) {
            img = document.createElement("img");
            drop.appendChild(img);
          }
          img.src = URL.createObjectURL(f);
        }
      }
    });
  }

  async function uploadReceipt() {
    const input = $("#receipt");
    if (!input || !input.files || !input.files[0]) {
      toast("Choose a receipt first.", "bad");
      return;
    }
    if (!A.ref) {
      toast("Missing reference. Go back and save your details.", "bad");
      return;
    }
    const fd = new FormData();
    fd.append("file", input.files[0]);
    fd.append("type", A.receiptKind || "APPLICATION_FEE");
    const st = $("#receipt-status");
    if (st) st.textContent = "Uploading…";
    try {
      const r = await fetch("/api/applications/" + encodeURIComponent(A.ref) + "/receipt", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) {
        if (st) st.textContent = d.error || "Upload failed.";
        toast(d.error || "Upload failed.", "bad");
        return;
      }
      A.receiptUploaded = true;
      if (A.receiptKind === "PROGRAMME_FEE") A.progReceipt = true;
      else A.appReceipt = true;
      if (st) st.textContent = "Receipt received. A person will check it.";
      toast("Receipt received", "ok");
      persistLocal();
      if (RS.state === "DONE") {
        const box = $("#rs");
        if (box) {
          box.innerHTML =
            "<h2>Programme receipt received.</h2><div class=\"sub\">A person checks both payments. Keep " +
            esc(RS.ref) +
            ".</div>" +
            '<div class="actions"><button class="btn quiet" onclick="app.close()">Done</button></div>';
        }
        return;
      }
      if (A.s === 5) {
        A.s = 6;
        aStep();
        return;
      }
      if (A.s === 7) {
        A.s = 8;
        aStep();
        return;
      }
    } catch (e) {
      if (st) st.textContent = "Could not upload. Use WhatsApp instead.";
      toast("Could not upload. Try again, or send on WhatsApp.", "bad");
    }
  }

  function star(req) {
    return req ? '<span class="req" aria-hidden="true">*</span>' : "";
  }
  function fld(k, l, t, ph, req) {
    return (
      '<div class="field"><label for="f-' +
      k +
      '">' +
      l +
      star(req) +
      '</label><input id="f-' +
      k +
      '" type="' +
      (t || "text") +
      '"' +
      (ph ? ' placeholder="' + esc(ph) + '"' : "") +
      (req ? " required aria-required=\"true\"" : "") +
      ' value="' +
      esc(A[k] || "") +
      '"><div class="err" id="e-' +
      k +
      '"></div></div>'
    );
  }
  function sel(k, l, options, req) {
    return (
      '<div class="field"><label for="f-' +
      k +
      '">' +
      l +
      star(req) +
      '</label><select id="f-' +
      k +
      '"' +
      (req ? " required aria-required=\"true\"" : "") +
      '><option value="">Select</option>' +
      options
        .map((o) => {
          const v = Array.isArray(o) ? o[0] : o;
          const lab = Array.isArray(o) ? o[1] : o;
          return "<option value=\"" + esc(v) + "\"" + (A[k] === v ? " selected" : "") + ">" + esc(lab) + "</option>";
        })
        .join("") +
      '</select><div class="err" id="e-' +
      k +
      '"></div></div>'
    );
  }
  function pfld(k, l, t, req) {
    return (
      '<div class="field"><label for="pf-' +
      k +
      '">' +
      l +
      star(req) +
      '</label><input id="pf-' +
      k +
      '" type="' +
      (t || "text") +
      '" value="' +
      esc(PF[k] || "") +
      '"><div class="err" id="pe-' +
      k +
      '"></div></div>'
    );
  }
  function psel(k, l, options, req) {
    return (
      '<div class="field"><label for="pf-' +
      k +
      '">' +
      l +
      star(req) +
      '</label><select id="pf-' +
      k +
      '"><option value="">Select</option>' +
      options
        .map((o) => "<option" + (PF[k] === o ? " selected" : "") + ">" + esc(o) + "</option>")
        .join("") +
      '</select><div class="err" id="pe-' +
      k +
      '"></div></div>'
    );
  }
  function bindClearErrors(rootSel) {
    const root = $(rootSel);
    if (!root) return;
    root.querySelectorAll("input,select,textarea").forEach((el) => {
      const clear = () => {
        const id = (el.id || "").replace(/^f-/, "").replace(/^pf-/, "");
        const box = el.closest(".field");
        const err = box ? box.querySelector(".err") : null;
        if (err) err.textContent = "";
        el.setAttribute("aria-invalid", "false");
        if (id) setErr(id, "");
      };
      el.addEventListener("input", clear);
      el.addEventListener("change", clear);
    });
  }
  function persistLocal() {
    try {
      localStorage.setItem(
        "hamzury.application",
        JSON.stringify({
          ref: A.ref,
          at: new Date().toISOString(),
          name: A.name,
          email: A.email,
          phone: A.phone,
          location: A.location,
          route: A.route,
          level: S.level,
          track: A.track || S.track || null,
          appReceipt: A.appReceipt,
          progReceipt: A.progReceipt
        })
      );
    } catch (e) {}
  }

  function aStep() {
    const box = $("#a");
    if (!box) return;
    const r = A.route ? RT[A.route] : null;
    let h = prog();
    switch (A.s) {
      case 0:
        h += r
          ? "<h2>" +
            esc(r.t) +
            '</h2><div class="sub">' +
            esc(r.m) +
            "</div>" +
            jmap(r.map(), S.level === "needs" ? (A.route === "junior" ? "jbasic" : "found") : null)
          : '<div class="q">Which route?</div><div class="opts">' +
            Object.keys(RT)
              .map(
                (k) =>
                  '<button class="opt" onclick="app.setRoute(\'' +
                  k +
                  '\')"><span>' +
                  esc(RT[k].t) +
                  "<small>" +
                  esc(RT[k].m) +
                  '</small></span><span class="mark">→</span></button>'
              )
              .join("") +
            "</div>";
        h += acts(false, r ? "app.aNext()" : null);
        break;

      case 1:
        if (A.ci < CHK.length) {
          const c = CHK[A.ci];
          h +=
            '<div class="q">' +
            esc(c.q) +
            '</div><div class="opts">' +
            c.a
              .map((o, i) => '<button class="opt" onclick="app.chk(' + i + ')"><span>' + esc(o[0]) + '</span><span class="mark">→</span></button>')
              .join("") +
            "</div>";
        } else {
          S.level = A.chk >= 1 ? "ready" : "needs";
          h +=
            "<h2>" +
            (S.level === "needs" ? "Your starting point is Foundation." : "You are ready for your track.") +
            "</h2>" +
            '<div class="sub">' +
            (S.level === "needs" ? "The shortest route to your track." : "You go straight to your track.") +
            (S.guess ? " Based on your Guide Me answers." : "") +
            "</div>" +
            jmap(RT[A.route].map(), S.level === "needs" ? (A.route === "junior" ? "jbasic" : "found") : "track") +
            acts(true, "app.aNext()");
        }
        break;

      case 2: {
        const opts =
          A.route === "junior"
            ? [["software", "Software", 30000], ["hardware", "Robotics", 120000]]
            : A.route === "siwes"
              ? [
                  ["1", "SIWES · 1 month", 30000],
                  ["2", "SIWES · 2 months", 50000],
                  ["3", "SIWES · 3 months", 70000],
                  ["intern", "Direct internship · per month", 70000]
                ]
              : TR.map((t) => [t.id, t.nm, t.p]);
        const picked = A.route === "siwes" ? A.siwes : A.track;
        if (A.route === "founder" || A.route === "ecosystem") {
          const adv =
            A.route === "founder"
              ? ["CEO → Founder", N(100000) + " per month", "You already run a business.", "Stop being the system. Build the system.", "Founder"]
              : ["Founder → Ecosystem", N(200000), "Founder status and proven revenue over " + N(1000000) + ".", "Expand, or build the next venture on what you already proved.", "Ecosystem"];
          h +=
            "<h2>" +
            esc(adv[0]) +
            "</h2>" +
            facts([
              ["Why", "No track is chosen here — this route works on the business you already have."],
              ["Required", esc(adv[2])],
              ["You will", esc(adv[3])],
              ["Next", esc(adv[4])],
              ["Price", "<b>" + adv[1] + "</b>"]
            ]) +
            '<div class="note">You pay the ' +
            N(FEE) +
            " application fee first, then this programme fee.</div>" +
            acts(true, "app.aNext()");
        } else if (!picked) {
          h +=
            '<div class="q">Which programme?</div>' +
            (A.route === "junior" ? '<div class="note">Basic Foundation (' + N(25000) + ") comes first, then the route you choose here.</div>" : "") +
            '<div class="opts">' +
            opts
              .map(
                (o) =>
                  '<button class="opt" onclick="app.pickProg(\'' +
                  o[0] +
                  '\')"><span>' +
                  esc(o[1]) +
                  '</span><span class="mark">' +
                  N(o[2]) +
                  "</span></button>"
              )
              .join("") +
            "</div>" +
            acts(true, null);
        } else {
          const o = opts.find((x) => x[0] === picked) || opts[0];
          const t = A.route !== "siwes" && A.route !== "junior" ? trk(picked) : null;
          h +=
            "<h2>" +
            esc(o[1]) +
            "</h2>" +
            facts([
              ["Why", t ? esc(t.prob) : "You join the professional journey as Junior Staff."],
              ["Required", S.level === "needs" ? "Foundation first — one month." : "You are ready for this."],
              ["You will", t ? esc(t.work) : "Work five days a week on the journey your level supports."],
              ["Next", t ? esc(t.out) : "Progress month by month."],
              [
                "Price",
                "<b>" +
                  N(o[2]) +
                  "</b>" +
                  (picked === "intern" ? " per month" : "") +
                  (A.route === "junior" ? " — after Basic Foundation " + N(25000) : "")
              ]
            ]) +
            '<div class="note">You pay the ' +
            N(FEE) +
            " application fee first, then this programme fee.</div>" +
            '<div class="actions"><button class="btn quiet" onclick="app.clearProg()">Change</button>' +
            '<button class="btn primary" onclick="app.aNext()">Continue</button></div>';
        }
        break;
      }

      case 3:
        if (A.route === "junior") {
          h +=
            '<p class="hint">Fields marked <span class="req">*</span> are required.</p>' +
            '<div class="label">Applicant</div>' +
            fld("name", "Full name", "text", "", true) +
            fld("dob", "Date of birth", "date", "", true) +
            sel("gender", "Gender", GENDERS, true) +
            fld("school", "School", "text", "", true) +
            sel("cls", "Class", JUNIOR_CLASSES, true) +
            sel("state", "State", NG_STATES, true) +
            fld("location", "City or town", "text", "", true) +
            sel("interests", "Interest", JUNIOR_INTERESTS, true) +
            sel("heardAbout", "How did you hear about us", HEARD_ABOUT, true) +
            '<div class="label" style="margin-top:34px">Parent or guardian</div>' +
            fld("gname", "Full name", "text", "", true) +
            sel("grel", "Relationship", GUARDIAN_RELS, true) +
            fld("gphone", "Phone", "tel", "0803 123 4567", true) +
            fld("gemail", "Email", "email", "", true) +
            fld("gemergency", "Emergency contact", "tel", "", true) +
            '<div class="field" style="margin-top:22px"><label style="display:flex;gap:14px;align-items:flex-start;text-transform:none;letter-spacing:0;font-size:14.5px;color:var(--muted);font-weight:400;min-height:48px;padding:12px 0;cursor:pointer">' +
            '<input type="checkbox" id="f-consent" style="width:20px;height:20px;flex:0 0 auto;margin-top:2px;accent-color:var(--orange)"' +
            (A.consent ? " checked" : "") +
            ">" +
            "<span>I am the parent or guardian and I consent to this application. <span class=\"req\">*</span></span></label>" +
            '<div class="err" id="e-consent"></div></div>' +
            acts(true, "app.aNext()");
          break;
        }
        if (!A.age && S.age) {
          A.age = { "17-20": "17–20", "21-25": "21–25", "26+": "26–30" }[S.age] || A.age;
        }
        h +=
          '<p class="hint">Fields marked <span class="req">*</span> are required.</p>' +
          fld("name", "Full name", "text", "", true) +
          fld("email", "Email", "email", "", true) +
          fld("phone", "Phone", "tel", "0803 123 4567", true) +
          sel("gender", "Gender", GENDERS, true) +
          sel("age", "Age", AGE_BANDS, true) +
          sel("state", "State", NG_STATES, true) +
          fld("location", "City or town", "text", "", true) +
          sel("occupation", "Occupation", OCCUPATIONS, true) +
          sel("education", "Education", EDUCATION, true) +
          sel("heardAbout", "How did you hear about us", HEARD_ABOUT, true) +
          acts(true, "app.aNext()");
        break;

      case 4:
        h +=
          '<div class="big">' +
          N(FEE) +
          "</div>" +
          '<div class="sub" style="margin-top:14px">Application fee. Not programme tuition, and it does not guarantee admission.</div>' +
          '<div class="pay">' +
          payRow("Bank", BANK.bank) +
          payRow("Account name", BANK.name) +
          payRow("Account number", BANK.acct) +
          payRow("Amount", N(FEE)) +
          payRow("Use as reference", A.ref || "Saving…") +
          "</div>" +
          acts(true, "app.aNext()", "I have paid");
        break;

      case 5:
        A.receiptKind = "APPLICATION_FEE";
        h +=
          '<div class="q">Upload your application-fee receipt.</div>' +
          '<div class="sub">A photo or PDF of the ₦5,000 transfer. A person checks it — this is required to continue.</div>' +
          receiptBox("APPLICATION_FEE") +
          '<div class="pay" style="margin-top:26px">' +
          payRow("WhatsApp", WHATSAPP) +
          payRow("Your reference", A.ref) +
          "</div>" +
          '<div class="actions"><button class="btn primary" onclick="app.uploadReceipt()">Upload receipt</button>' +
          '<a class="btn quiet" style="text-decoration:none;display:inline-block" target="_blank" rel="noopener" href="' +
          wa(applicationMessage()) +
          '">Also send on WhatsApp</a>' +
          '<button class="btn quiet" onclick="app.copyRef()">Copy reference</button></div>' +
          (A.appReceipt ? '<div class="note">Receipt received.</div>' + acts(true, "app.aNext()", "Continue to programme fee") : acts(true, null));
        break;

      case 6:
        h +=
          '<div class="label accent">Programme fee</div>' +
          '<h2 style="margin:12px 0 8px">' +
          esc(progLabel()) +
          "</h2>" +
          '<div class="big" style="margin-top:18px">' +
          progFee() +
          "</div>" +
          '<div class="sub" style="margin-top:14px">Separate from the ' +
          N(FEE) +
          " application fee you have already paid.</div>" +
          '<div class="pay">' +
          payRow("Bank", BANK.bank) +
          payRow("Account name", BANK.name) +
          payRow("Account number", BANK.acct) +
          payRow("Amount", progFee()) +
          payRow("Use as reference", A.ref) +
          "</div>" +
          acts(true, "app.aNext()", "I have paid");
        break;

      case 7:
        A.receiptKind = "PROGRAMME_FEE";
        h +=
          '<div class="q">Upload your programme-fee receipt.</div>' +
          '<div class="sub">A photo or PDF of the ' +
          esc(progFee()) +
          " transfer for " +
          esc(progLabel()) +
          ".</div>" +
          receiptBox("PROGRAMME_FEE") +
          '<div class="pay" style="margin-top:26px">' +
          payRow("WhatsApp", WHATSAPP) +
          payRow("Your reference", A.ref) +
          payRow("Programme", progLabel()) +
          "</div>" +
          '<div class="actions"><button class="btn primary" onclick="app.uploadReceipt()">Upload receipt</button>' +
          '<a class="btn quiet" style="text-decoration:none;display:inline-block" target="_blank" rel="noopener" href="' +
          wa(
            "HAMZURY PROGRAMME FEE\nReference: " +
              (A.ref || "") +
              "\nProgramme: " +
              progLabel() +
              "\nAmount: " +
              progFee() +
              " — receipt attached."
          ) +
          '">Also send on WhatsApp</a>' +
          '<button class="btn quiet" onclick="app.copyRef()">Copy reference</button></div>' +
          (A.progReceipt ? '<div class="note">Receipt received.</div>' + acts(true, "app.aNext()", "Finish") : acts(true, null));
        break;

      case 8:
        h =
          '<div class="label accent">Application received</div>' +
          '<h2 style="margin:14px 0 8px">' +
          esc(A.ref) +
          "</h2>" +
          '<div class="sub">Keep this reference. Both receipts are on file.</div>' +
          '<div class="amt" style="margin-top:8px"><div class="l">Application fee</div><div class="v now">' +
          N(FEE) +
          "</div></div>" +
          '<div class="amt"><div class="l">' +
          esc(progLabel()) +
          "</div><div class=\"v now\">" +
          progFee() +
          "</div></div>" +
          '<div class="steps-next">' +
          nextRow("1", "Both payments are checked", "A person checks each receipt against the account.") +
          nextRow("2", "Your application is reviewed", S.level === "needs" ? "Your starting point is Foundation." : "You are ready for your track.") +
          nextRow("3", "You are contacted with the next step", "Offer letter and orientation follow confirmation.") +
          nextRow("4", "Your Journey begins after confirmation", "Nothing is automatic. Admission is not guaranteed.") +
          "</div>" +
          '<div class="note">Applications are received between the 1st and 25th. If you applied outside that window, you are held for the next one.</div>' +
          '<div class="actions"><button class="btn quiet" onclick="app.close()">Done</button></div>';
        break;
    }
    box.innerHTML = h;
    if (A.s === 3) bindClearErrors("#a");
    if (A.s === 5 || A.s === 7) bindReceipt();
  }

  function copyRef() {
    try {
      navigator.clipboard.writeText(A.ref);
      toast("Reference copied", "ok");
    } catch (e) {
      toast(A.ref);
    }
  }

  function finishApp() {
    persistLocal();
    if (A.s === 5) {
      A.s = 6;
      aStep();
      return;
    }
    if (A.s === 7) {
      A.s = 8;
      aStep();
    }
  }

  function setRoute(k) {
    A.route = k;
    A.track = null;
    if (k === "junior") S.age = "13-16";
    aStep();
  }
  function chk(i) {
    A.chk += CHK[A.ci].a[i][1];
    A.cans[A.ci] = i;
    A.ci++;
    aStep();
  }
  function setErr(id, m) {
    const i = $("#f-" + id) || $("#pf-" + id),
      e = $("#e-" + id) || $("#pe-" + id);
    if (e) e.textContent = m || "";
    if (i) i.setAttribute("aria-invalid", m ? "true" : "false");
    return !m;
  }
  function readFields(ids) {
    ids.forEach((k) => {
      const el = $("#f-" + k);
      if (el) A[k] = el.value.trim();
    });
  }
  function showFormErrors() {
    const el = $("#a [aria-invalid='true']") || $("#content [aria-invalid='true']");
    if (el && el.focus) {
      el.focus();
      if (el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    toast("Fill the required fields marked *.", "bad");
  }
  async function aNext() {
    if (A.s === 2 && A.route !== "founder" && A.route !== "ecosystem" && !(A.route === "siwes" ? A.siwes : A.track)) {
      toast("Choose a programme first.", "bad");
      return;
    }
    if (A.s === 3 && A.route === "junior") {
      readFields(["name", "dob", "gender", "school", "cls", "state", "location", "interests", "heardAbout", "gname", "grel", "gphone", "gemail", "gemergency"]);
      A.consent = $("#f-consent") ? $("#f-consent").checked : false;
      let ok = true;
      ok = setErr("name", A.name.length < 2 ? "The applicant's name." : "") && ok;
      const years = A.dob ? ageFromDob(A.dob) : null;
      ok = setErr("dob", !A.dob ? "Date of birth." : years == null || years < 13 || years > 16 ? "Junior Innovator is for ages 13–16." : "") && ok;
      ok = setErr("gender", A.gender ? "" : "Choose a gender.") && ok;
      ok = setErr("school", A.school.length < 2 ? "School name." : "") && ok;
      ok = setErr("cls", A.cls ? "" : "Choose a class.") && ok;
      ok = setErr("state", A.state ? "" : "Choose a state.") && ok;
      ok = setErr("location", A.location.length < 2 ? "City or town." : "") && ok;
      ok = setErr("interests", A.interests ? "" : "Choose an interest.") && ok;
      ok = setErr("heardAbout", A.heardAbout ? "" : "How did you hear about us?") && ok;
      ok = setErr("gname", A.gname.length < 2 ? "Parent or guardian name." : "") && ok;
      ok = setErr("grel", A.grel ? "" : "Relationship.") && ok;
      ok = setErr("gphone", isNgPhone(A.gphone) ? "" : "A Nigerian number, e.g. 0803 123 4567.") && ok;
      ok = setErr("gemail", isEmail(A.gemail) ? "" : "A valid email.") && ok;
      ok = setErr("gemergency", isNgPhone(A.gemergency) ? "" : "An emergency number.") && ok;
      ok = setErr("consent", A.consent ? "" : "Guardian consent is required.") && ok;
      if (!ok) {
        showFormErrors();
        return;
      }
      A.email = A.gemail;
      A.phone = A.gphone;
      A.age = "13–16";
      if (!(await saveApplication())) return;
      A.s++;
      aStep();
      return;
    }
    if (A.s === 3) {
      readFields(["name", "email", "phone", "gender", "age", "state", "location", "occupation", "education", "heardAbout"]);
      let ok = true;
      ok = setErr("name", A.name.length < 2 ? "Your name." : "") && ok;
      ok = setErr("email", isEmail(A.email) ? "" : "A valid email.") && ok;
      ok = setErr("phone", isNgPhone(A.phone) ? "" : "A Nigerian number, e.g. 0803 123 4567.") && ok;
      ok = setErr("gender", A.gender ? "" : "Choose a gender.") && ok;
      ok = setErr("age", A.age ? "" : "Choose an age range.") && ok;
      ok = setErr("state", A.state ? "" : "Choose a state.") && ok;
      ok = setErr("location", A.location.length < 2 ? "City or town." : "") && ok;
      ok = setErr("occupation", A.occupation ? "" : "Choose an occupation.") && ok;
      ok = setErr("education", A.education ? "" : "Choose education.") && ok;
      ok = setErr("heardAbout", A.heardAbout ? "" : "How did you hear about us?") && ok;
      if (!ok) {
        showFormErrors();
        return;
      }
      S.age = A.age;
      if (!(await saveApplication())) return;
    }
    if (A.s === 5 && !A.appReceipt) {
      toast("Upload your application-fee receipt to continue.", "bad");
      return;
    }
    if (A.s === 7 && !A.progReceipt) {
      toast("Upload your programme-fee receipt to continue.", "bad");
      return;
    }
    if (A.s === STEP.length - 1) return;
    A.s++;
    aStep();
  }
  function aBack() {
    if (A.s === 1 && A.ci > 0) {
      A.ci--;
      A.chk -= CHK[A.ci].a[A.cans[A.ci]][1];
      aStep();
      return;
    }
    if (A.s > 0) {
      A.s--;
      aStep();
    }
  }
  function startApp(route, track) {
    A.route = route || A.route;
    A.track = track || A.track;
    if (route === "junior") S.age = "13-16";
    A.s = 0;
    A.saved = false;
    A.receiptUploaded = false;
    A.appReceipt = false;
    A.progReceipt = false;
    if (S.level) {
      A.ci = CHK.length;
      A.chk = S.level === "ready" ? 1 : -1;
    } else {
      A.ci = 0;
      A.chk = 0;
    }
    open("apply");
  }

  const efield = (k, l, ph) =>
    '<div class="field"><label for="pf-' +
    k +
    '">' +
    l +
    '</label><input id="pf-' +
    k +
    '"' +
    (ph ? ' placeholder="' + ph + '"' : "") +
    ' value="' +
    esc(PF[k] || "") +
    '"><div class="err" id="pe-' +
    k +
    '"></div></div>';

  V.partnership = () => ({
    t: "Partner",
    sub: "What can we build together?",
    h:
      '<div class="journey"><div class="jline"></div>' +
      ["Introduce", "Understand", "Match", "Propose", "Build", "Measure"]
        .map(
          (x, i) =>
            '<div class="jnode' + (i === 5 ? " on" : "") + '"><span class="dot"><i></i></span><span class="txt"><span class="nm">' + x + "</span></span></div>"
        )
        .join("") +
      "</div>" +
      facts([
        ["Who", "Schools, organisations, companies, training and technology partners, community groups."],
        ["We need", "What you do, why you want to partner, what you bring, what you want from us."],
        ["You get", "A defined arrangement with an agreed outcome and a way to measure it."]
      ]) +
      '<div class="actions"><button class="btn primary" onclick="app.open(\'partner-form\')">Start a partnership request</button></div>'
  });

  V.sponsorship = () => ({
    t: "Sponsor",
    sub: "Help build what comes next.",
    h:
      '<div class="journey"><div class="jline"></div>' +
      ["Choose impact", "Define support", "Connect", "Agree", "Support", "Report"]
        .map(
          (x, i) =>
            '<div class="jnode' + (i === 5 ? " on" : "") + '"><span class="dot"><i></i></span><span class="txt"><span class="nm">' + x + "</span></span></div>"
        )
        .join("") +
      "</div>" +
      facts([
        ["Who", "Individuals, businesses, foundations and institutions."],
        ["You choose", "Junior innovation, digital skills, technology, entrepreneurship, equipment, scholarships or projects."],
        ["You see", "Where your support went, what was built, who benefited, what changed."]
      ]) +
      '<div class="note">Reported through the Treasury, so support is a public record rather than a private claim.</div>' +
      '<div class="actions"><button class="btn primary" onclick="app.open(\'sponsor-form\')">Discuss sponsorship</button></div>'
  });

  V["partner-form"] = () => ({
    t: "Partnership request",
    h:
      '<p class="hint">Fields marked <span class="req">*</span> are required.</p>' +
      pfld("org", "Organisation", "text", true) +
      psel("orgType", "Organisation type", PARTNER_TYPES, true) +
      pfld("contact", "Contact name", "text", true) +
      pfld("phone", "Phone", "tel", true) +
      pfld("email", "Email", "email", true) +
      psel("state", "State", NG_STATES, false) +
      pfld("does", "What your organisation does", "text", true) +
      pfld("why", "Why you want to partner", "text", true) +
      pfld("bring", "What you can contribute", "text", false) +
      pfld("want", "What you want Hamzury to provide", "text", false) +
      pfld("outcome", "Expected outcome", "text", false) +
      '<div class="actions"><button class="btn primary" onclick="app.sendEnquiry(\'partner\')">Send request</button></div>' +
      '<div class="note">Your request is stored, and WhatsApp opens with the same details so a person can pick it up.</div>',
    after: () => bindClearErrors("#content")
  });

  V["sponsor-form"] = () => ({
    t: "Sponsorship",
    h:
      '<p class="hint">Fields marked <span class="req">*</span> are required.</p>' +
      psel("orgType", "I am / we are", SPONSOR_TYPES, true) +
      pfld("org", "Name or organisation", "text", true) +
      pfld("phone", "Phone", "tel", true) +
      pfld("email", "Email", "email", true) +
      psel("area", "What you want to support", SPONSOR_AREAS, true) +
      psel("support", "What you would like to give", SPONSOR_FORMS, true) +
      pfld("report", "What you want reported back", "text", false) +
      '<div class="actions"><button class="btn primary" onclick="app.sendEnquiry(\'sponsor\')">Send</button></div>' +
      '<div class="note">Your request is stored, and WhatsApp opens with the same details so a person can pick it up.</div>',
    after: () => bindClearErrors("#content")
  });

  async function sendEnquiry(kind) {
    ["org", "orgType", "contact", "phone", "email", "state", "does", "why", "bring", "want", "outcome", "area", "support", "report"].forEach((k) => {
      const el = $("#pf-" + k);
      if (el) PF[k] = el.value.trim();
    });
    let ok = true;
    ok = setErr("org", PF.org && PF.org.length >= 2 ? "" : "Required.") && ok;
    ok = setErr("phone", isNgPhone(PF.phone) ? "" : "A Nigerian number, e.g. 0803 123 4567.") && ok;
    ok = setErr("email", isEmail(PF.email) ? "" : "A valid email.") && ok;
    if (kind === "partner") {
      ok = setErr("orgType", PF.orgType ? "" : "Choose a type.") && ok;
      ok = setErr("contact", PF.contact && PF.contact.length >= 2 ? "" : "Contact name.") && ok;
      ok = setErr("does", PF.does ? "" : "Required.") && ok;
      ok = setErr("why", PF.why ? "" : "Required.") && ok;
    } else {
      ok = setErr("orgType", PF.orgType ? "" : "Choose a type.") && ok;
      ok = setErr("area", PF.area ? "" : "Choose an area.") && ok;
      ok = setErr("support", PF.support ? "" : "What would you like to give?") && ok;
    }
    if (!ok) {
      showFormErrors();
      return;
    }
    try {
      const r = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...PF })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast(d.error || "Could not save the request.", "bad");
        return;
      }
    } catch (e) {
      toast("Could not reach the server.", "bad");
      return;
    }
    const L =
      kind === "partner"
        ? [
            "HAMZURY PARTNERSHIP REQUEST",
            "",
            "Organisation: " + PF.org,
            "Contact: " + (PF.contact || "—"),
            "Phone: " + PF.phone,
            "Email: " + (PF.email || "—"),
            "",
            "What they do: " + (PF.does || "—"),
            "Why partner: " + (PF.why || "—"),
            "They bring: " + (PF.bring || "—"),
            "They want: " + (PF.want || "—"),
            "Expected outcome: " + (PF.outcome || "—")
          ]
        : [
            "HAMZURY SPONSORSHIP",
            "",
            "Name: " + PF.org,
            "Phone: " + PF.phone,
            "Email: " + (PF.email || "—"),
            "",
            "Impact area: " + (PF.area || "—"),
            "Support offered: " + (PF.support || "—"),
            "Wants reported: " + (PF.report || "—")
          ];
    window.open(wa(L.join("\n")), "_blank", "noopener");
    toast("Request sent", "ok");
  }

  const modal = $("#modal"),
    panel = $("#panel"),
    content = $("#content"),
    backbtn = $("#backbtn");
  let lastFocus = null;
  const FOC = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function render(k) {
    const v = V[k];
    if (!v) return hide();
    const d = v();
    content.innerHTML = '<h2 id="mt">' + esc(d.t) + "</h2>" + (d.sub ? '<div class="sub">' + esc(d.sub) + "</div>" : "") + d.h;
    if (!modal.classList.contains("open")) {
      lastFocus = document.activeElement;
      modal.hidden = false;
      modal.classList.add("open");
      document.body.classList.add("locked");
    }
    backbtn.hidden = S.stack < 2;
    panel.scrollTop = 0;
    panel.focus();
    if (d.after) d.after();
  }
  function hide() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.hidden = true;
    document.body.classList.remove("locked");
    S.stack = 0;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function open(k) {
    if (!V[k]) return;
    if (location.hash !== "#/" + k) {
      S.stack++;
      history.pushState({ m: k, d: S.stack }, "", "#/" + k);
    }
    render(k);
  }
  function close() {
    if (!modal.classList.contains("open")) return;
    if (S.stack > 0) history.go(-S.stack);
    else {
      history.replaceState(null, "", location.pathname + location.search);
      hide();
    }
  }
  function back() {
    history.back();
  }
  function sync() {
    const k = (location.hash || "").replace(/^#\/?/, "");
    if (V[k]) {
      S.stack = (history.state && history.state.d) || 0;
      render(k);
    } else hide();
  }

  let downOnBackdrop = false;
  const onModalDown = (e) => {
    downOnBackdrop = e.target === modal;
  };
  const onModalClick = (e) => {
    if (e.target === modal && downOnBackdrop) close();
    downOnBackdrop = false;
  };
  const onKey = (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const it = Array.from(panel.querySelectorAll(FOC)).filter((el) => el.offsetParent !== null);
    if (!it.length) return;
    const f = it[0],
      l = it[it.length - 1];
    if (e.shiftKey && (document.activeElement === f || document.activeElement === panel)) {
      e.preventDefault();
      l.focus();
    } else if (!e.shiftKey && document.activeElement === l) {
      e.preventDefault();
      f.focus();
    }
  };
  modal.addEventListener("mousedown", onModalDown);
  modal.addEventListener("click", onModalClick);
  document.addEventListener("keydown", onKey);
  addEventListener("popstate", sync);

  let tt;
  function toast(m, kind) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = m;
    t.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(tt);
    const ms = kind === "bad" ? 4500 : 3200;
    tt = setTimeout(() => t.classList.remove("show"), ms);
  }
  const toastEl = $("#toast");
  if (toastEl) {
    toastEl.addEventListener("click", () => toastEl.classList.remove("show"));
  }
  function top() {
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
  }

  function paint() {
    const flow = $("#stance-flow");
    if (flow)
      flow.innerHTML = [
        ["Understand", "What this is"],
        ["Find your start", "Where you fit"],
        ["Build", "Make it real"],
        ["Apply", "Real work"],
        ["Prove", "Evidence"],
        ["Unlock", "Next stage"],
        ["Build a business", "Yours"]
      ]
        .map((x, i, arr) => "<b" + (i === arr.length - 1 ? ' class="end"' : "") + ">" + esc(x[0]) + "<span>" + esc(x[1]) + "</span></b>")
        .join("<i>→</i>");
    const row = (i, t, m, act) =>
      '<button class="row" onclick="' +
      act +
      '"><span class="n">' +
      i +
      '</span><span class="t">' +
      esc(t) +
      '<span class="m">' +
      esc(m) +
      '</span></span><span class="go">→</span></button>';
    const index = $("#index");
    if (index)
      index.innerHTML = [
        ["Find my path", "Every route, side by side", "app.open('paths')"],
        ["Guide me", "If you are not sure yet", "app.open('guide')"],
        ["Junior Innovator", RT.junior.m, "app.open('r-junior')"],
        ["Innovator → CEO", RT.ceo.m, "app.open('r-ceo')"],
        ["CEO → Founder", RT.founder.m, "app.open('r-founder')"],
        ["Founder → Ecosystem", RT.ecosystem.m, "app.open('r-ecosystem')"],
        ["SIWES / Internship", "Same journey, different arrangement", "app.open('r-siwes')"],
        ["Partnership", "Build something together", "app.open('partnership')"],
        ["Sponsorship", "Fund a participant", "app.open('sponsorship')"],
        ["Tracks", "Twelve problems worth solving", "app.open('tracks')"],
        ["Life at Hamzury", "Where the work happens", "app.open('life')"],
        ["Treasury", "Cohorts, projects, businesses", "app.open('treasury')"]
      ]
        .map((d, i) => row(String(i + 1).padStart(2, "0"), d[0], d[1], d[2]))
        .join("");
    try {
      const s = localStorage.getItem("hamzury.application") || localStorage.getItem("hamzury.app");
      if (s) {
        const rec = JSON.parse(s);
        S.app = rec;
        Object.assign(A, { name: rec.name, email: rec.email, phone: rec.phone, route: rec.route, track: rec.track, ref: rec.ref });
        S.level = rec.level;
      }
    } catch (e) {}
  }

  function destroy() {
    modal.removeEventListener("mousedown", onModalDown);
    modal.removeEventListener("click", onModalClick);
    document.removeEventListener("keydown", onKey);
    removeEventListener("popstate", sync);
    hide();
  }

  paint();
  sync();

  const api = {
    open,
    close,
    back,
    top,
    toast,
    pick,
    qBack,
    startApp,
    aNext,
    aBack,
    aStep,
    setRoute,
    chk,
    copyRef,
    finishApp,
    rsCheck,
    rsPick,
    rsSubmit,
    rsReset,
    pickProg,
    clearProg,
    sendEnquiry,
    uploadReceipt,
    destroy
  };
  window.app = api;
  return api;
}

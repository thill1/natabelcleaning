/* =========================================================
   Sentient Partners — Interactive AI Assistant
   A self-contained demo: text chat + voice (Web Speech API).
   Local knowledge base responds about Sentient's offerings,
   so visitors can *feel* the conversational-AI solution live.
   ========================================================= */
(function () {
  'use strict';

  const fab = document.getElementById('ai-fab');
  const panel = document.getElementById('ai-panel');
  const closeBtn = document.getElementById('ai-close');
  const messages = document.getElementById('ai-messages');
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const voiceBtn = document.getElementById('ai-voice');

  if (!fab || !panel || !messages || !input) return;

  /* ---------- Local knowledge base ---------- */
  const KB = [
    {
      keys: ['revenue', 'sales', 'lead', 'outbound', 'pipeline', 'prospecting'],
      answer: "Our <b>Autonomous Revenue Agents</b> qualify leads, run multi-touch outreach across email, LinkedIn, SMS & chat, and book meetings directly into your calendar — 24/7. Clients typically see a 3-5x lift in booked demos within the first 60 days. Want me to show you how it'd fit your sales motion?",
      cta: { label: 'Explore Revenue Agents', href: 'book.html' },
    },
    {
      keys: ['knowledge', 'rag', 'brain', 'document', 'search', 'hallucin', 'q&a', 'question', 'ask'],
      answer: "The <b>Intelligence Knowledge Core</b> is a private brain trained on your docs, calls, CRM & tickets. Every answer comes with citations — zero hallucinations. It's SOC2-aligned and your data never leaves your tenant. Imagine your whole team getting instant, accurate answers instead of digging.",
      cta: { label: 'Explore Knowledge Core', href: 'book.html' },
    },
    {
      keys: ['operations', 'ops', 'automat', 'workflow', 'back office', 'invoice', 'onboard', 'schedule', 'busywork'],
      answer: "<b>Operations Autopilot</b> automates the back office end-to-end — invoicing, onboarding, scheduling, reporting, approvals. 40+ integrations, human-in-the-loop where it matters. Most clients eliminate 70-90% of manual ops work.",
      cta: { label: 'Explore Ops Autopilot', href: 'book.html' },
    },
    {
      keys: ['predict', 'forecast', 'churn', 'analytics', 'dashboard', 'data', 'insight', 'decision', 'ltv', 'price'],
      answer: "<b>Decision Intelligence</b> turns your data into the next best action — churn prediction, demand forecasting, dynamic pricing, live exec dashboards. Trained on your data, explained in plain English so you can act with confidence.",
      cta: { label: 'Explore Decision Intelligence', href: 'book.html' },
    },
    {
      keys: ['voice', 'support', 'chat', 'phone', 'call', 'customer service', 'conversational'],
      answer: "<b>Conversational Commerce</b> deploys voice & chat agents that handle support, sales and scheduling 24/7 — in your brand voice, across web, phone and messaging, in 30+ languages. Resolution in seconds, smart escalation to humans when needed. (You're talking to a version of it right now!)",
      cta: { label: 'Explore Conversational Commerce', href: 'book.html' },
    },
    {
      keys: ['custom', 'product', 'app', 'copilot', 'build', 'ip', 'proprietary', 'moat'],
      answer: "With <b>Custom AI Products</b> we design, build & deploy proprietary AI features into your offering — internal copilots or customer-facing intelligence. You own 100% of the IP & code. It's a defensible moat your competitors can't copy.",
      cta: { label: 'Explore Custom AI Products', href: 'book.html' },
    },
    {
      keys: ['price', 'cost', 'budget', 'how much', 'invest', 'fee', 'retainer'],
      answer: "Engagements are bespoke and outcome-bound — we scope to your highest-leverage opportunity first, then expand. Most clients see ROI within the first quarter. Book a strategy call and we'll give you a concrete blueprint with numbers.",
      cta: { label: 'Book a strategy call', href: 'book.html' },
    },
    {
      keys: ['founder', 'team', 'who', 'experience', 'fortune', 'credib', 'background'],
      answer: "Sentient Partners was founded by engineers, data scientists & strategists who built AI at the highest levels of <b>Fortune 500</b> tech organizations — across finance, healthcare, retail, logistics, defense & more. We've taken that enterprise-grade capability and pointed it at small & mid-market businesses.",
      cta: { label: 'Meet the founders', href: '#founder' },
    },
    {
      keys: ['book', 'call', 'demo', 'meeting', 'schedule', 'consult', 'strategy', 'contact'],
      answer: "Happy to set that up! Our 30-minute strategy call maps your highest-leverage AI opportunities — no commitment, no fluff, senior team on every call. Tap below to grab a time.",
      cta: { label: 'Book your strategy call', href: 'book.html' },
    },
    {
      keys: ['help', 'what can you', 'menu', 'options', 'solutions', 'services', 'offer'],
      answer: "I can tell you about any of our six solutions — <b>Revenue Agents, Knowledge Core, Ops Autopilot, Decision Intelligence, Conversational Commerce, and Custom AI Products</b>. You can also ask about pricing, our founders, or book a strategy call. What interests you most?",
    },
  ];

  const FALLBACK = "Great question. I can tell you about our six AI solutions, pricing, our founders' Fortune 500 background, or book you a strategy call. Which would you like to explore? (Tip: try 'revenue', 'automate my ops', or 'how much does it cost'.)";

  function matchKB(text) {
    const t = text.toLowerCase();
    for (const item of KB) {
      if (item.keys.some((k) => t.includes(k))) return item;
    }
    return { answer: FALLBACK };
  }

  /* ---------- Rendering ---------- */
  function addMessage(text, who) {
    const el = document.createElement('div');
    el.className = 'ai-msg ' + who;
    el.innerHTML = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addTyping() {
    const el = document.createElement('div');
    el.className = 'ai-msg bot ai-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function botReply(text, cta) {
    const typing = addTyping();
    const delay = 500 + Math.min(text.length * 12, 1100);
    setTimeout(() => {
      typing.remove();
      addMessage(text, 'bot');
      if (cta) {
        const wrap = document.createElement('div');
        wrap.className = 'ai-msg user';
        wrap.style.background = 'transparent';
        wrap.style.padding = '0';
        wrap.style.alignSelf = 'flex-start';
        const a = document.createElement('a');
        a.href = cta.href;
        a.className = 'btn-primary cta-magnetic';
        a.style.fontSize = '0.8rem';
        a.style.padding = '0.55rem 1rem';
        a.textContent = cta.label + ' →';
        wrap.appendChild(a);
        messages.appendChild(wrap);
        messages.scrollTop = messages.scrollHeight;
      }
    }, delay);
  }

  function handleUserText(text) {
    if (!text || !text.trim()) return;
    addMessage(escapeHtml(text), 'user');
    input.value = '';
    const match = matchKB(text);
    botReply(match.answer, match.cta);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- Panel open/close ---------- */
  let isOpen = false;
  function openPanel() {
    panel.classList.add('open');
    requestAnimationFrame(() => panel.classList.add('show-in'));
    isOpen = true;
    setTimeout(() => input.focus(), 350);
  }
  function closePanel() {
    panel.classList.remove('show-in');
    setTimeout(() => panel.classList.remove('open'), 300);
    isOpen = false;
  }
  fab.addEventListener('click', () => { isOpen ? closePanel() : openPanel(); });
  closeBtn.addEventListener('click', closePanel);

  /* ---------- Send ---------- */
  sendBtn.addEventListener('click', () => handleUserText(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleUserText(input.value); });

  /* ---------- Quick suggestion chips ---------- */
  const suggestions = ['Automate my sales', 'What does it cost?', 'Tell me about the founders'];
  const chipRow = document.createElement('div');
  chipRow.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;padding:0.4rem 0.75rem 0.75rem;';
  suggestions.forEach((s) => {
    const b = document.createElement('button');
    b.textContent = s;
    b.style.cssText = 'font-size:0.72rem;padding:0.35rem 0.7rem;border-radius:9999px;border:1px solid var(--border);background:var(--bg-glass-2);color:var(--text-muted);cursor:pointer;transition:all .2s;';
    b.onmouseenter = () => { b.style.borderColor = 'var(--cyan)'; b.style.color = 'var(--heading)'; };
    b.onmouseleave = () => { b.style.borderColor = 'var(--border)'; b.style.color = 'var(--text-muted)'; };
    b.addEventListener('click', () => handleUserText(s));
    chipRow.appendChild(b);
  });
  // insert suggestion chips above input row
  const inputRow = panel.querySelector('.ai-input-row');
  if (inputRow) inputRow.parentNode.insertBefore(chipRow, inputRow);

  /* ---------- Greeting ---------- */
  setTimeout(() => {
    addMessage("👋 Hi, I'm the <b>Sentient Assistant</b> — a live demo of the conversational AI we build for our clients. Ask me anything about our solutions, pricing, or the team.", 'bot');
  }, 400);

  /* ---------- Voice input (Web Speech API) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recog = null;
  if (SR) {
    recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      input.value = text;
      handleUserText(text);
    };
    recog.onend = () => { voiceBtn.classList.remove('listening'); };
    recog.onerror = () => { voiceBtn.classList.remove('listening'); };
    voiceBtn.addEventListener('click', () => {
      if (voiceBtn.classList.contains('listening')) { recog.stop(); return; }
      try {
        recog.start();
        voiceBtn.classList.add('listening');
      } catch (e) { voiceBtn.classList.remove('listening'); }
    });
  } else {
    // Hide voice button if unsupported
    voiceBtn.style.display = 'none';
  }
})();

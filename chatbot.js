/* 정책 안내 챗봇 — policy.md 안에서만 답합니다.
   - 서버(server.js)가 있고 OPENAI_API_KEY가 설정돼 있으면 AI가 답합니다.
   - 서버가 없거나 키가 비어 있으면 policy.md의 FAQ에서 가장 비슷한 질문을 찾아 답합니다. */
(() => {
  const CONTACT = '정확한 안내를 위해 의원실로 문의해 주세요. (전화 041-635-5224 · 이메일 jin2026@kakao.com)';
  const API = window.JIN_CHAT_API || '/api/chat';
  const QUICK = ['민원이나 정책 제안은 어떻게 하나요?', '충남형 기본금융은 무엇인가요?', '후원은 어떻게 하나요?'];
  let faq = [];
  let useApi = true;

  const css = `
.jc-btn{position:fixed;right:20px;bottom:20px;z-index:90;width:60px;height:60px;border-radius:50%;border:0;background:#102b42;color:#d8ed77;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;display:grid;place-items:center}
.jc-btn svg{width:30px;height:30px}
.jc-btn:focus-visible{outline:3px solid #bf461f;outline-offset:3px}
.jc-panel{padding:0!important;margin:0;position:fixed;right:20px;bottom:92px;z-index:91;width:min(360px,calc(100vw - 32px));height:min(540px,calc(100vh - 120px));background:#fff;border:1px solid #d9e0e2;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden;font-family:"Noto Sans KR",sans-serif}
.jc-panel[hidden]{display:none}
.jc-head{background:#102b42;color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}
.jc-head b{font-size:16px}
.jc-close{background:none;border:0;color:#fff;font-size:20px;cursor:pointer;width:36px;height:36px}
.jc-log{flex:1;overflow-y:auto;padding:14px;background:#f6f5f0;display:flex;flex-direction:column;gap:10px}
.jc-msg{max-width:85%;padding:10px 12px;border-radius:12px;font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere}
.jc-bot{background:#fff;border:1px solid #d9e0e2;color:#102b42;align-self:flex-start}
.jc-me{background:#167c79;color:#fff;align-self:flex-end}
.jc-quick{display:flex;flex-direction:column;gap:6px;align-self:flex-start;max-width:90%}
.jc-quick button{text-align:left;font:inherit;font-size:14px;padding:8px 12px;border:1px solid #167c79;background:#fff;color:#167c79;border-radius:999px;cursor:pointer}
.jc-quick button:hover{background:#e8efec}
.jc-form{display:flex;gap:6px;padding:10px;border-top:1px solid #d9e0e2;background:#fff}
.jc-form input{flex:1;min-width:0;font:inherit;font-size:15px;padding:10px;border:1px solid #b9c8cf;border-radius:8px}
.jc-form button{font:inherit;font-weight:700;padding:0 14px;border:0;border-radius:8px;background:#102b42;color:#fff;cursor:pointer}
.jc-note{margin:0;padding:0 12px 10px;background:#fff;font-size:12px;color:#4c616d}
@media(max-width:480px){.jc-btn{right:14px;bottom:14px}.jc-panel{right:8px;bottom:84px;width:calc(100vw - 16px)}}`;

  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>';

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'jc-btn';
  btn.setAttribute('aria-label', '정책 안내 챗봇 열기');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = icon;

  const panel = document.createElement('div');
  panel.setAttribute('role', 'dialog');
  panel.className = 'jc-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', '정책 안내 챗봇');
  panel.innerHTML = `
    <div class="jc-head"><b>정책 안내 챗봇</b><button type="button" class="jc-close" aria-label="닫기">✕</button></div>
    <div class="jc-log" role="log" aria-live="polite"></div>
    <form class="jc-form"><input type="text" maxlength="300" placeholder="궁금한 정책을 입력하세요" aria-label="질문 입력"><button type="submit">보내기</button></form>
    <p class="jc-note">이름 · 전화번호 · 주소 등 개인정보는 입력하지 마세요.</p>`;

  document.body.appendChild(panel);
  document.body.appendChild(btn);

  const log = panel.querySelector('.jc-log');
  const form = panel.querySelector('.jc-form');
  const input = form.querySelector('input');

  function add(text, who) {
    const d = document.createElement('div');
    d.className = 'jc-msg ' + (who === 'me' ? 'jc-me' : 'jc-bot');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    add('안녕하세요! 궁금한 정책을 물어보세요.', 'bot');
    const q = document.createElement('div');
    q.className = 'jc-quick';
    QUICK.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.addEventListener('click', () => ask(t));
      q.appendChild(b);
    });
    log.appendChild(q);
  }

  function toggle(open) {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? '정책 안내 챗봇 닫기' : '정책 안내 챗봇 열기');
    if (open) { start(); input.focus(); }
  }
  btn.addEventListener('click', () => toggle(panel.hidden));
  panel.querySelector('.jc-close').addEventListener('click', () => { toggle(false); btn.focus(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); btn.focus(); } });

  // ---- policy.md FAQ 읽기 ----
  const ready = fetch('policy.md', { cache: 'no-cache' })
    .then(r => (r.ok ? r.text() : ''))
    .then(md => {
      const parts = md.split(/^### Q:\s*/m).slice(1);
      faq = parts.map(p => {
        const q = p.split('\n')[0].trim();
        const kw = (p.match(/^키워드:\s*(.+)$/m) || [, ''])[1].split(/[,，]/).map(s => s.trim()).filter(Boolean);
        const a = (p.match(/^A:\s*([\s\S]*?)(?:\n\s*\n|$)/m) || [, ''])[1].trim();
        return { q, kw, a };
      }).filter(x => x.q && x.a);
    })
    .catch(() => {});

  const norm = s => s.toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
  const grams = s => { const n = norm(s); const g = new Set(); for (let i = 0; i < n.length - 1; i++) g.add(n.slice(i, i + 2)); return g; };

  function faqAnswer(text) {
    const qg = grams(text);
    const nt = norm(text);
    let best = null, bestScore = 0;
    for (const f of faq) {
      const fg = grams(f.q);
      let inter = 0;
      qg.forEach(g => { if (fg.has(g)) inter++; });
      const sim = qg.size ? inter / Math.max(qg.size, 1) : 0;
      const hits = f.kw.filter(k => k && nt.includes(norm(k))).length;
      const score = sim + hits * 0.35;
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return bestScore >= 0.35 && best ? best.a : CONTACT;
  }

  async function apiAnswer(text) {
    if (!useApi) return null;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text }), signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) { if (r.status !== 502 && r.status !== 504) useApi = false; return null; }
      const j = await r.json();
      return j && typeof j.answer === 'string' && j.answer.trim() ? j.answer.trim() : null;
    } catch (e) {
      useApi = false;
      return null;
    }
  }

  async function ask(text) {
    text = String(text || '').trim().slice(0, 300);
    if (!text) return;
    add(text, 'me');
    input.value = '';
    const wait = add('답변을 찾고 있습니다…', 'bot');
    await ready;
    const ans = (await apiAnswer(text)) || faqAnswer(text);
    wait.textContent = ans;
    log.scrollTop = log.scrollHeight;
  }

  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
})();

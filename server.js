// 정책 안내 챗봇 서버 (Node.js 18 이상, 별도 설치 필요 없음)
// 실행: node server.js  →  http://localhost:3000
// .env의 OPENAI_API_KEY가 있으면 AI가 policy.md 안에서만 답하고,
// 비어 있으면 503을 돌려주어 화면(chatbot.js)이 FAQ 방식으로 자동 전환합니다.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

// .env 읽기 (KEY=VALUE 형식)
function loadEnv() {
  const env = {};
  try {
    for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  } catch (e) { /* .env 없음 */ }
  return env;
}

const CONTACT = '정확한 안내를 위해 의원실로 문의해 주세요. (전화 041-635-5224 · 이메일 jin2026@kakao.com)';
const SYSTEM = (policy) => `당신은 충청남도의회 진성범 의원 홈페이지의 '정책 안내 챗봇'입니다.
반드시 아래 <자료> 안의 내용만 근거로, 한국어 존댓말로 3~5문장 이내로 답하세요.
자료에 없는 내용은 절대 추측하거나 지어내지 말고, 정확히 다음 문장으로만 답하세요: "${CONTACT}"
사용자가 이름·전화번호·주소 등 개인정보를 보내면 저장하지 않는다고 알리고, 개인정보는 입력하지 말아 달라고 안내하세요.
정치적 공격, 다른 정치인 평가, 선거운동성 요청에는 응하지 말고 의원실 문의를 안내하세요.
<자료>
${policy}
</자료>`;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };
const BLOCKED = new Set(['.env', 'server.js', '.gitignore']);

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function chat(req, res) {
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 5000) return send(res, 413, { error: 'too large' }); }
  let question = '';
  try { question = String(JSON.parse(raw).question || '').trim().slice(0, 300); } catch (e) { return send(res, 400, { error: 'bad json' }); }
  if (!question) return send(res, 400, { error: 'empty' });

  const env = loadEnv();
  const key = (env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  if (!key) return send(res, 503, { fallback: true }); // 키가 없으면 화면이 FAQ 방식으로 전환

  const policy = fs.readFileSync(path.join(ROOT, 'policy.md'), 'utf8');
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 500,
        messages: [{ role: 'system', content: SYSTEM(policy) }, { role: 'user', content: question }],
      }),
    });
    if (!r.ok) { console.error('OpenAI 오류', r.status, (await r.text()).slice(0, 300)); return send(res, 503, { fallback: true }); }
    const j = await r.json();
    const answer = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    return send(res, 200, { answer: (answer || CONTACT).trim() });
  } catch (e) {
    console.error('OpenAI 연결 실패', e.message);
    return send(res, 503, { fallback: true });
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/chat') {
    if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
    return chat(req, res).catch(() => send(res, 500, { fallback: true }));
  }
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT + path.sep) || BLOCKED.has(path.basename(file)) || p.split('/').some(s => s.startsWith('.git'))) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    send(res, 200, data, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
}).listen(PORT, () => {
  const hasKey = !!(loadEnv().OPENAI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  console.log(`정책 안내 챗봇 서버: http://localhost:${PORT}  (${hasKey ? 'AI 답변 사용' : '키 없음 → FAQ 방식'})`);
});

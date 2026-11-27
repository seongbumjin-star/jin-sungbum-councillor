/* 바로 전화하기 버튼: 모든 페이지 왼쪽 아래에 떠 있음 (챗봇 버튼은 오른쪽 아래) */
(function () {
  if (document.querySelector('.jcall')) return;
  var css = document.createElement('style');
  css.textContent =
    '.jcall{position:fixed;left:20px;bottom:20px;z-index:89;display:inline-flex;align-items:center;gap:8px;height:52px;padding:0 20px 0 16px;border-radius:26px;background:#f28c28;color:#fff;font:700 16px/1 "Noto Sans KR",sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
    '.jcall:hover{background:#e07a14}.jcall:focus-visible{outline:3px solid #d8ed77;outline-offset:3px}' +
    '.jcall svg{width:22px;height:22px;flex:none}' +
    '.jcall small{font-weight:500;font-size:13px;opacity:.9}' +
    '@media(max-width:480px){.jcall{left:14px;bottom:14px;height:56px}.jcall small{display:none}}' +
    '@media print{.jcall{display:none}}';
  document.head.appendChild(css);
  var a = document.createElement('a');
  a.className = 'jcall';
  a.href = 'tel:+82416355224';
  a.setAttribute('aria-label', '의회 사무실에 전화하기 041-635-5224');
  a.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>' +
    '전화하기 <small>041-635-5224</small>';
  a.addEventListener('click', function () {
    if (typeof gtag === 'function') gtag('event', 'click_call', {location: location.pathname});
  });
  document.body.appendChild(a);
})();

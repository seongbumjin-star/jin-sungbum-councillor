/* 모든 페이지 왼쪽 아래 빠른 버튼: 공유하기(위) · 전화하기(아래). 챗봇 버튼은 오른쪽 아래 */
(function () {
  if (document.querySelector('.jqa')) return;
  var PHONE = '010-5092-5169';
  var css = document.createElement('style');
  css.textContent =
    '.jqa{position:fixed;left:20px;bottom:20px;z-index:89;display:flex;flex-direction:column;align-items:flex-start;gap:10px;font-family:"Noto Sans KR",sans-serif}' +
    '.jqa a,.jqa button{display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.25);font:700 16px/1 "Noto Sans KR",sans-serif}' +
    '.jqa a:focus-visible,.jqa button:focus-visible{outline:3px solid #d8ed77;outline-offset:3px}' +
    '.jqa svg{width:22px;height:22px;flex:none}' +
    '.jqa-call{height:52px;padding:0 20px 0 16px;border-radius:26px;background:#f28c28;color:#fff}.jqa-call:hover{background:#e07a14}' +
    '.jqa-call small{font-weight:500;font-size:13px;opacity:.9}' +
    '.jqa-share{width:52px;height:52px;justify-content:center;border-radius:50%;background:#fff;color:#102b42;border:1px solid #d9e0e2!important}.jqa-share:hover{background:#eef3f1}' +
    '.jqa-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:95;background:#102b42;color:#fff;padding:12px 18px;border-radius:10px;font:500 15px/1.4 "Noto Sans KR",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
    '@media(max-width:480px){.jqa{left:14px;bottom:14px}.jqa-call{height:56px}.jqa-call small{display:none}.jqa-share{width:56px;height:56px}}' +
    '@media print{.jqa{display:none}}';
  document.head.appendChild(css);

  function track(name) {
    if (typeof gtag === 'function') gtag('event', name, {location: location.pathname});
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'jqa-toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function pageUrl() {
    var c = document.querySelector('link[rel="canonical"]');
    return c ? c.href : location.href.split('#')[0];
  }

  var box = document.createElement('div');
  box.className = 'jqa';

  var share = document.createElement('button');
  share.type = 'button';
  share.className = 'jqa-share';
  share.setAttribute('aria-label', '이 페이지 공유하기');
  share.title = '공유하기';
  share.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
  share.addEventListener('click', function () {
    var data = {title: document.title, text: document.title + ' | 진성범 충남도의원', url: pageUrl()};
    track('click_share');
    if (navigator.share) {
      navigator.share(data).catch(function () {});
      return;
    }
    var done = function () { toast('주소를 복사했습니다. 카카오톡·문자에 붙여넣어 공유해 주세요.'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(data.url).then(done, function () { window.prompt('아래 주소를 복사해 공유해 주세요.', data.url); });
    } else {
      window.prompt('아래 주소를 복사해 공유해 주세요.', data.url);
    }
  });

  var call = document.createElement('a');
  call.className = 'jqa-call';
  call.href = 'tel:+821050925169';
  call.setAttribute('aria-label', '진성범 의원 휴대폰으로 전화하기 ' + PHONE);
  call.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>' +
    '전화하기 <small>' + PHONE + '</small>';
  call.addEventListener('click', function () { track('click_call'); });

  box.appendChild(share);
  box.appendChild(call);
  document.body.appendChild(box);
})();

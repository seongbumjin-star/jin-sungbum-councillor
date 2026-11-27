// 사용: node render.cjs <프레임 폴더> [미리보기만: preview]
const {chromium}=require('playwright');const path=require('path');
(async()=>{const out=process.argv[2];const preview=process.argv[3]==='preview';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
await p.goto('file://'+path.join(__dirname,'render.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
const fonts=await p.evaluate(()=>document.fonts.check('900 40px "Noto Sans KR"'));console.log('font ok',fonts);
const ts=preview?[1.0,2.6,5.5,10.5,13.5,16.5,22,24.5,29]:Array.from({length:900},(_,i)=>i/30);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>render(t),ts[i]);await p.screenshot({path:path.join(out,(preview?'p':'f')+String(i).padStart(4,'0')+'.jpg'),type:'jpeg',quality:92});}
await b.close();})();

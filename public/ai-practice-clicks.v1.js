(()=>{
 const paths=new Set(['/aplikace/ai-v-praci/','/en/apps/ai-v-praci/']);
 const allowed=()=>location.origin==='https://vcode.zeleznalady.cz'&&paths.has(location.pathname)&&!['1','yes'].includes(navigator.doNotTrack)&&navigator.globalPrivacyControl!==true&&navigator.onLine!==false;
 if(!allowed()||window.__vcodeAiPracticeClicksBound)return;
 window.__vcodeAiPracticeClicksBound=true;
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||!allowed())return;
  const link=event.target.closest?.('a[data-ai-practice="true"]');
  if(!link)return;
  const expected='https://games.zeleznalady.cz/prezentaceAI/';
  if(link.href!==expected)return;
  try{fetch('/analytics/event',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',keepalive:true,body:JSON.stringify({website:'e155b7ef-28c5-4787-96cb-53777ecf693c',name:'practice-open-click',url:location.origin+location.pathname})}).catch(()=>{});}catch{}
 },{passive:true});
})();

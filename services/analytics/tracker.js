(() => {
 if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true||location.pathname.startsWith('/prehled/'))return;
 const website='__WEBSITE_ID__';
 const page=()=>{
  const original=new URL(location.href),clean=new URL(original.pathname,original.origin);
  for(const key of ['utm_source','utm_medium','utm_campaign']){
   const value=original.searchParams.get(key);
   if(value&&/^[a-zA-Z0-9_-]{1,64}$/.test(value))clean.searchParams.set(key,value);
  }
  return clean.href;
 };
 const source=()=>{try{const url=new URL(document.referrer);return url.protocol==='https:'&&!url.username&&!url.password?url.origin:'';}catch{return '';}};
 const send=name=>{try{fetch('/analytics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({website,name,url:page(),referrer:source()}),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});}catch{}};
 send('pageview');
 document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(!link)return;try{const url=new URL(link.href);if(link.hasAttribute('data-collaboration-interest'))send('collaboration-click');else if(url.hostname==='apps.apple.com')send('app-store-click');else if(url.protocol==='mailto:')send('contact-click');}catch{}});
})();

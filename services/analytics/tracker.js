(() => {
 if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true||location.pathname.startsWith('/prehled/'))return;
 const website='__WEBSITE_ID__';
 const send=name=>{fetch('/analytics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({website,name,url:location.href,referrer:document.referrer}),credentials:'omit',keepalive:true}).catch(()=>{});};
 send('pageview');
 document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(!link)return;try{const url=new URL(link.href);if(url.hostname==='apps.apple.com')send('app-store-click');else if(url.protocol==='mailto:')send('contact-click');}catch{}});
})();

'use strict';
(() => {
 const copy={
  cs:{signedOut:'Pro nastavení upozornění se přihlaste.',loading:'Kontroluji upozornění…',disabled:'Upozornění zatím nejsou zapnutá.',ready:'Upozornění jsou na tomto zařízení vypnutá.',enabled:'Upozornění jsou na tomto zařízení zapnutá.',unsupported:'Tento prohlížeč upozornění nepodporuje.',install:'Na iPhonu a iPadu nejprve přidejte Přehled na plochu a otevřete jej z jeho ikony.',denied:'Upozornění jsou zablokovaná v nastavení zařízení.',failed:'Nastavení se nepodařilo potvrdit. Zkuste to znovu.',permission:'Povolení upozornění nebylo uděleno.',enable:'Zapnout upozornění',disable:'Vypnout na tomto zařízení',help:'Upozornění obsahují jen informaci o nové zprávě, nikdy její obsah nebo kontakty. Klepnutí otevře soukromou schránku. Nová upozornění se posílají jen při platném přihlášení. Doručení řídí systém a jeho nastavení soustředění.',blockedHelp:'Povolte oznámení pro VCode Přehled v nastavení systému nebo prohlížeče, potom se vraťte sem.',unsupportedHelp:'Nové zprávy stále uvidíte v menu Přehledu a na Telegramu. Upozornění a číslo na ikoně závisí na podpoře zařízení.',loadingHelp:'Upozornění se zapnou až po vašem klepnutí a souhlasu zařízení.',serverHelp:'Upozornění na zařízení teď nejsou dostupná. Čísla nových zpráv v menu fungují nezávisle.'},
  en:{signedOut:'Sign in to manage notifications.',loading:'Checking notifications…',disabled:'Notifications are not enabled yet.',ready:'Notifications are off on this device.',enabled:'Notifications are on on this device.',unsupported:'This browser does not support notifications.',install:'On iPhone and iPad, first add the Dashboard to your Home Screen and open it from its icon.',denied:'Notifications are blocked in your device settings.',failed:'The setting could not be confirmed. Please try again.',permission:'Notification permission was not granted.',enable:'Enable notifications',disable:'Disable on this device',help:'Notifications only announce a new message; they never contain its text or contact details. Tap to open the private inbox. New notifications are sent only while your sign-in is valid. Delivery depends on the system and its Focus settings.',blockedHelp:'Allow notifications for VCode Dashboard in your system or browser settings, then return here.',unsupportedHelp:'New messages remain visible in the Dashboard menu and on Telegram. Notifications and app icon badges depend on device support.',loadingHelp:'Notifications will only be enabled after you tap and grant permission on this device.',serverHelp:'Device notifications are currently unavailable. New-message counts in the menu work independently.'}
 };
 let options={},initialized=false,generation=0,controller,registration,configuration,subscribed=false,busy=false,message='',badge=0;
 const el=id=>document.getElementById(id),locale=()=>options.locale?.()==='en'?'en':'cs',authenticated=()=>options.authenticated?.()===true;
 const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent??'')||(/Mac/.test(navigator.platform??'')&&navigator.maxTouchPoints>1);
 const standalone=()=>navigator.standalone===true||window.matchMedia?.('(display-mode: standalone)').matches===true;
 const supported=()=>window.isSecureContext!==false&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
 function state(){if(!authenticated())return'signedOut';if(ios()&&!standalone())return'install';if(!supported())return'unsupported';if(message)return message;if(busy)return'loading';if(Notification.permission==='denied')return'denied';if(!configuration?.available)return'disabled';return subscribed?'enabled':'ready';}
 function updateLocale(){
  const text=copy[locale()],current=state(),status=el('notification-status'),help=el('notification-help'),enable=el('notification-enable'),disable=el('notification-disable');
  if(status){status.textContent=text[current]??text.failed;status.setAttribute('role','status');status.setAttribute('aria-live','polite');}
  if(help)help.textContent=text[{install:'loadingHelp',denied:'blockedHelp',unsupported:'unsupportedHelp',disabled:'serverHelp',loading:'loadingHelp'}[current]??'help'];
  if(enable){enable.textContent=text.enable;enable.hidden=subscribed;enable.disabled=busy||!authenticated()||!supported()||(ios()&&!standalone())||!configuration?.available||!registration||Notification.permission==='denied'||subscribed;}
  if(disable){disable.textContent=text.disable;disable.hidden=!subscribed;disable.disabled=busy||!authenticated()||!subscribed;}
 }
 async function request(path='',init={}){
  const cancel=new AbortController(),active=controller?.signal,abort=()=>cancel.abort(),timeout=setTimeout(()=>cancel.abort(Error('Notification settings timed out')),12000);
  active?.addEventListener('abort',abort,{once:true});if(active?.aborted)abort();
  try{
   const response=await fetch('/prehled/api/notifications'+path,{...init,credentials:'same-origin',cache:'no-store',redirect:'error',headers:{'Content-Type':'application/json'},signal:cancel.signal});
   if(!response.ok){if(response.status===401)document.dispatchEvent(new Event('vcode:inbox-auth-expired'));throw Error('Notification settings unavailable');}
   return await response.json();
  }finally{clearTimeout(timeout);active?.removeEventListener('abort',abort);}
 }
 function keyBytes(value){if(typeof value!=='string'||!/^[A-Za-z0-9_-]{86,88}$/.test(value))throw Error('Invalid push key');const raw=atob(value.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-value.length%4)%4));if(raw.length!==65||raw.charCodeAt(0)!==4)throw Error('Invalid push key');return Uint8Array.from(raw,char=>char.charCodeAt(0));}
 async function bounded(promise){let timer;try{return await Promise.race([promise,new Promise((resolve,reject)=>timer=setTimeout(()=>reject(Error('Device settings timed out')),12000))]);}finally{clearTimeout(timer);}}
 async function refresh(){
  const current=++generation;controller?.abort();controller=new AbortController();configuration=undefined;registration=undefined;subscribed=false;message='';
  if(!authenticated()||!supported()||(ios()&&!standalone())){busy=false;updateLocale();return;}
  busy=true;updateLocale();
  try{
   const config=await request(),reg=await navigator.serviceWorker.getRegistration('/prehled/');
   if(current!==generation||!authenticated())return;
   configuration=config;registration=reg?.active&&reg.pushManager?reg:undefined;
   if(config.available&&!registration)message='loading';
   const worker=reg?.installing??reg?.waiting;
   if(worker){const ready=()=>{if(!['activated','redundant'].includes(worker.state))return;worker.removeEventListener('statechange',ready);if(worker.state==='activated'&&current===generation&&authenticated())refresh();};worker.addEventListener('statechange',ready);}
   const subscription=await registration?.pushManager.getSubscription();
   if(current!==generation||!authenticated())return;
   if(subscription&&config.available){const result=await request('/status',{method:'POST',body:JSON.stringify({endpoint:subscription.endpoint})});if(current!==generation||!authenticated())return;subscribed=result.subscribed===true;}
  }catch(error){if(current===generation&&error.name!=='AbortError')message='failed';}
  finally{if(current===generation){busy=false;updateLocale();}}
 }
 // Invoked only by the explicit enable-button click. Request permission before any awaited work.
 async function enable(){
  if(busy||!authenticated()||!supported()||(ios()&&!standalone())||!configuration?.available||!registration||Notification.permission==='denied')return;
  const current=generation,reg=registration,config=configuration;let publicKey;
  try{publicKey=keyBytes(config.publicKey);}catch{message='failed';updateLocale();return;}
  let permission;try{permission=Notification.permission==='granted'?Promise.resolve('granted'):Notification.requestPermission();}catch{message='failed';updateLocale();return;}
  busy=true;message='';updateLocale();let created;
  try{
   if(await permission!=='granted'){message='permission';return;}
   if(current!==generation||!authenticated())return;
   let subscription=await reg.pushManager.getSubscription();
   if(current!==generation||!authenticated())return;
   if(!subscription){subscription=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicKey});created=subscription;}
   if(current!==generation||!authenticated()){await created?.unsubscribe();return;}
   const serialized=subscription.toJSON();
   const result=await request('/subscription',{method:'POST',body:JSON.stringify({subscription:{endpoint:serialized.endpoint,expirationTime:serialized.expirationTime??null,keys:{p256dh:serialized.keys.p256dh,auth:serialized.keys.auth}},locale:locale()})});
   if(current!==generation||!authenticated()){await created?.unsubscribe();return;}
   if(result.ok!==true)throw Error('Subscription not confirmed');subscribed=true;
  }catch(error){await created?.unsubscribe().catch(()=>{});if(current===generation&&error.name!=='AbortError')message='failed';}
  finally{if(current===generation){busy=false;updateLocale();}}
 }
 async function disable({silent=false}={}){
  if(busy||!authenticated()||!supported())return false;
  const current=generation;busy=true;message='';if(!silent)updateLocale();
  try{
   const reg=registration??await navigator.serviceWorker.getRegistration('/prehled/'),subscription=await reg?.pushManager?.getSubscription();
   if(!subscription){subscribed=false;return true;}
   await request('/subscription',{method:'DELETE',body:JSON.stringify({endpoint:subscription.endpoint})});
   await bounded(subscription.unsubscribe());if(current!==generation)return true;subscribed=false;setBadge(0);return true;
  }catch(error){if(current===generation&&error.name!=='AbortError')message='failed';return false;}
  finally{if(current===generation){busy=false;if(!silent)updateLocale();}}
 }
 function setBadge(value){badge=Number.isSafeInteger(value)&&value>=0?Math.min(value,9999):0;try{const action=badge&&authenticated()?navigator.setAppBadge?.(badge):navigator.clearAppBadge?.();Promise.resolve(action).catch(()=>{});}catch{}}
 function clear(){generation++;controller?.abort();controller=undefined;registration=configuration=undefined;subscribed=busy=false;message='';badge=0;try{Promise.resolve(navigator.clearAppBadge?.()).catch(()=>{});}catch{}updateLocale();}
 function init(settings={}){options=settings;if(!initialized){initialized=true;el('notification-enable')?.addEventListener('click',enable);el('notification-disable')?.addEventListener('click',()=>disable());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&authenticated())refresh();});navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(authenticated())refresh();});navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='VCODE_INBOX_UPDATED'&&authenticated())document.dispatchEvent(new Event('vcode:inbox-updated'));});}updateLocale();}
 window.VCodeNotifications={init,refresh,clear,updateLocale,setBadge,disable};
})();

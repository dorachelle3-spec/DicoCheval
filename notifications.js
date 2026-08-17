(()=>{'use strict';
  const KEY='dicopets-calendar-reminders-v3',OLD_KEY='dicopets-calendar-reminders-v2',timers=new Map(),MAX_DELAY=2147483000;
  const VAPID_PUBLIC_KEY='BOXTs73F-Ln7fvR-tTGEn-s_bxbQDXfKjsyDiJtzUG7eJ9qwO-_3Aqfr3NyOBrjjQ6maqVSxqNBC2XtFbjHnQ8U';
  const SUPABASE_URL='https://mmxdlnfntpufwwkdvgzc.supabase.co',SUPABASE_KEY='sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP';
  let remoteDb=null;
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD_KEY)||'[]')}catch{return[]}};
  const write=list=>localStorage.setItem(KEY,JSON.stringify(list.slice(-150)));
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isSafari=()=>/^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
  const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const secure=()=>location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname);
  const getRegistration=async()=>{
    if(!('serviceWorker' in navigator))return null;
    try{await navigator.serviceWorker.register('service-worker.js?v=20260815');return await navigator.serviceWorker.ready}catch{return null}
  };
  const db=()=>{if(remoteDb)return remoteDb;if(!window.supabase)return null;remoteDb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return remoteDb};
  const vapidBytes=value=>{const padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))};
  async function saveSubscription(registration){
    const client=db();if(!client||!registration?.pushManager)return{saved:false,reason:'client'};
    const {data:{user}}=await client.auth.getUser();if(!user)return{saved:false,reason:'login'};
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:vapidBytes(VAPID_PUBLIC_KEY)});
    const json=subscription.toJSON(),keys=json.keys||{};
    const {error}=await client.from('push_subscriptions').upsert({user_id:user.id,endpoint:json.endpoint,p256dh:keys.p256dh,auth:keys.auth,expiration_time:json.expirationTime||null,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:'endpoint'});
    return{saved:!error,reason:error?.message||''};
  }
  async function saveRemoteReminder(item){
    const client=db();if(!client)return;try{const {data:{user}}=await client.auth.getUser();if(!user)return;await client.from('notification_queue').upsert({user_id:user.id,reminder_id:item.id,notify_at:new Date(Number(item.when)).toISOString(),title:item.title||'Rappel DicoPets',body:item.body||'Un événement approche.',url:item.url||'/DicoPets/index.html',status:'pending',sent_at:null,last_error:null},{onConflict:'user_id,reminder_id'})}catch{}
  }
  async function removeRemoteReminder(id){const client=db();if(!client)return;try{const {data:{user}}=await client.auth.getUser();if(user)await client.from('notification_queue').delete().eq('user_id',user.id).eq('reminder_id',id)}catch{}}
  function capability(){
    if(!secure())return{ok:false,code:'https',message:'Les notifications exigent une connexion sécurisée HTTPS.'};
    if(isIOS()&&!isStandalone())return{ok:false,code:'install-ios',message:'Sur iPhone ou iPad, installe d’abord DicoPets sur l’écran d’accueil, ouvre l’application créée, puis appuie de nouveau sur « Activer les rappels ».'};
    if(!('Notification' in window))return{ok:false,code:'unsupported',message:'Ce navigateur ne permet pas les notifications web sur cet appareil.'};
    if(!('serviceWorker' in navigator))return{ok:false,code:'worker',message:'Le service de notifications n’est pas disponible dans ce navigateur.'};
    return{ok:true,code:isSafari()?'safari':'standard',message:isSafari()?'Safari est compatible sur cet appareil.':'Ce navigateur est compatible.'};
  }
  function installHelp(code){
    let box=document.getElementById('notificationHelp');
    if(!box){box=document.createElement('aside');box.id='notificationHelp';box.className='notification-help';document.body.appendChild(box)}
    const english=document.documentElement.lang.toLowerCase().startsWith('en');
    if(code==='install-ios')box.innerHTML=english?'<button type="button" aria-label="Close">×</button><strong>Create the web app to receive notifications</strong><p>On iPhone or iPad, notifications only work from the DicoPets web app added to your Home Screen.</p><ol><li>Open DicoPets in Safari.</li><li>Tap Share.</li><li>Choose “Add to Home Screen” and enable “Open as Web App” if that option appears.</li><li>Open DicoPets using its new icon.</li><li>Return to the calendar and tap “Enable reminders”.</li></ol>':'<button type="button" aria-label="Fermer">×</button><strong>Crée l’application web pour recevoir les notifications</strong><p>Sur iPhone ou iPad, les notifications ne peuvent fonctionner que depuis l’application DicoPets ajoutée à l’écran d’accueil.</p><ol><li>Ouvre DicoPets dans Safari.</li><li>Appuie sur Partager.</li><li>Choisis « Sur l’écran d’accueil » et active « Ouvrir comme app » si ce choix apparaît.</li><li>Ouvre DicoPets avec sa nouvelle icône.</li><li>Retourne au calendrier et appuie sur « Activer les rappels ».</li></ol>';
    else box.innerHTML='<button type="button" aria-label="Fermer">×</button><strong>Notifications bloquées</strong><p>Autorise DicoPets dans les réglages du navigateur et dans les réglages de notifications de ton appareil, puis réessaie.</p>';
    box.querySelector('button').onclick=()=>box.remove();
  }
  function addIOSInstallNotice(){
    if(!isIOS()||isStandalone()||document.getElementById('iosNotificationNotice'))return;
    const button=document.getElementById('enableNotifications');if(!button)return;
    const english=document.documentElement.lang.toLowerCase().startsWith('en');
    const notice=document.createElement('div');notice.id='iosNotificationNotice';notice.className='notification-ios-notice';notice.setAttribute('role','note');
    notice.innerHTML=english?'<strong>iPhone / iPad</strong> Add DicoPets to your Home Screen as a web app before enabling notifications.': '<strong>iPhone / iPad</strong> Pour recevoir les notifications, ajoute d’abord DicoPets à ton écran d’accueil comme application web.';
    button.insertAdjacentElement('afterend',notice);
  }
  async function show(item){
    if(!('Notification' in window)||Notification.permission!=='granted')return false;
    const registration=await getRegistration();
    const options={body:item.body||'Un événement DicoPets approche.',icon:'/DicoPets/icon-dicopets.png',badge:'/DicoPets/icon-dicopets.png',tag:'dicopets-'+item.id,renotify:false,data:{url:item.url||location.href}};
    try{if(registration){await registration.showNotification(item.title||'Rappel DicoPets',options);return true}new Notification(item.title||'Rappel DicoPets',options);return true}catch{return false}
  }
  function markSent(id){write(read().map(x=>x.id===id?{...x,sent:true}:x))}
  function arm(item){
    clearTimeout(timers.get(item.id));const delay=Number(item.when)-Date.now();
    if(delay<=0){if(!item.sent&&delay>-86400000)show(item).then(ok=>ok&&markSent(item.id));return}
    if(delay>MAX_DELAY)return;
    timers.set(item.id,setTimeout(async()=>{if(await show(item))markSent(item.id);timers.delete(item.id)},delay));
  }
  function rearm(){read().filter(x=>!x.sent).forEach(arm)}
  function schedule(item){if(!item?.id||!item?.when||Number(item.when)<=Date.now()+500)return;const list=read().filter(x=>x.id!==item.id);list.push({...item,sent:false});write(list);arm(item);saveRemoteReminder(item)}
  function remove(id){write(read().filter(x=>x.id!==id));clearTimeout(timers.get(id));timers.delete(id);removeRemoteReminder(id)}
  async function enable(){
    const support=capability();if(!support.ok){installHelp(support.code);return support}
    const registration=await getRegistration();
    let permission=Notification.permission;
    if(permission==='default')permission=await Notification.requestPermission();
    if(permission!=='granted'){installHelp('blocked');return{ok:false,code:'denied',message:'Les notifications sont bloquées. Autorise DicoPets dans les réglages de ton navigateur ou de ton appareil.'}}
    let push={saved:false,reason:'unsupported'};try{push=await saveSubscription(registration)}catch(error){push={saved:false,reason:error?.message||'subscription'}}
    const displayed=await show({id:'welcome-'+Date.now(),title:'Notifications DicoPets activées',body:'Le test fonctionne sur cet appareil et ce navigateur.',url:location.href});
    rearm();
    if(!displayed)return{ok:false,code:'display',message:'L’autorisation est donnée, mais la notification de test n’a pas pu être affichée.'};
    if(push.saved)return{ok:true,code:'push-enabled',message:'Notifications activées, y compris lorsque DicoPets est fermé.'};
    if(push.reason==='login')return{ok:true,code:'local-only',message:'Notification de test réussie. Connecte-toi à ton compte pour recevoir les rappels lorsque DicoPets est fermé.'};
    return{ok:true,code:'local-only',message:'Notification de test réussie. Le service Supabase doit encore être activé pour les rappels lorsque DicoPets est fermé.'};
  }
  const style=document.createElement('style');style.textContent='.notification-help{position:fixed;z-index:10000;left:50%;bottom:max(18px,env(safe-area-inset-bottom));width:min(520px,calc(100% - 28px));transform:translateX(-50%);padding:20px 44px 20px 20px;border:1px solid #d5c08f;border-radius:16px;background:#fffdf8;color:#173b30;box-shadow:0 18px 55px #102a2255;font:15px/1.5 Arial,sans-serif}.notification-help strong{display:block;font:700 21px Georgia,serif}.notification-help button{position:absolute;right:10px;top:9px;border:0;background:transparent;color:#173b30;font-size:25px}.notification-help ol{margin-bottom:0;padding-left:20px}.notification-ios-notice{margin:10px 0 14px;padding:11px 13px;border:1px solid #d5c08f;border-radius:11px;background:#fff7dc;color:#173b30;font:14px/1.45 Arial,sans-serif}.notification-ios-notice strong{display:block;margin-bottom:2px}html[data-theme="dark"] .notification-help,html[data-theme="dark"] .notification-ios-notice{background:#17251f;color:#edf4ef;border-color:#6f603e}';document.head.appendChild(style);
  rearm();addEventListener('focus',rearm);document.addEventListener('visibilitychange',()=>document.visibilityState==='visible'&&rearm());document.readyState==='loading'?document.addEventListener('DOMContentLoaded',addIOSInstallNotice,{once:true}):addIOSInstallNotice();
  window.DicoPetsNotifications={enable,schedule,remove,capability,showTest:()=>show({id:'manual-'+Date.now(),title:'Test DicoPets',body:'Les notifications fonctionnent.',url:location.href})};
})();

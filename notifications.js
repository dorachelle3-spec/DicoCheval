(()=>{'use strict';
  const KEY='dicopets-calendar-reminders-v3',OLD_KEY='dicopets-calendar-reminders-v2',timers=new Map(),MAX_DELAY=2147483000;
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
    if(code==='install-ios')box.innerHTML='<button type="button" aria-label="Fermer">×</button><strong>Activer les notifications sur iPhone ou iPad</strong><ol><li>Ouvre DicoPets dans Safari.</li><li>Appuie sur Partager.</li><li>Choisis « Sur l’écran d’accueil » et active « Ouvrir comme app » si ce choix apparaît.</li><li>Ouvre DicoPets avec sa nouvelle icône.</li><li>Retourne au calendrier et appuie sur « Activer les rappels ».</li></ol>';
    else box.innerHTML='<button type="button" aria-label="Fermer">×</button><strong>Notifications bloquées</strong><p>Autorise DicoPets dans les réglages du navigateur et dans les réglages de notifications de ton appareil, puis réessaie.</p>';
    box.querySelector('button').onclick=()=>box.remove();
  }
  async function show(item){
    if(!('Notification' in window)||Notification.permission!=='granted')return false;
    const registration=await getRegistration();
    const options={body:item.body||'Un événement DicoPets approche.',icon:'/DicoCheval/icon-192.png',badge:'/DicoCheval/icon-192.png',tag:'dicopets-'+item.id,renotify:false,data:{url:item.url||location.href}};
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
  function schedule(item){if(!item?.id||!item?.when)return;const list=read().filter(x=>x.id!==item.id);list.push({...item,sent:false});write(list);arm(item)}
  function remove(id){write(read().filter(x=>x.id!==id));clearTimeout(timers.get(id));timers.delete(id)}
  async function enable(){
    const support=capability();if(!support.ok){installHelp(support.code);return support}
    await getRegistration();
    let permission=Notification.permission;
    if(permission==='default')permission=await Notification.requestPermission();
    if(permission!=='granted'){installHelp('blocked');return{ok:false,code:'denied',message:'Les notifications sont bloquées. Autorise DicoPets dans les réglages de ton navigateur ou de ton appareil.'}}
    const displayed=await show({id:'welcome-'+Date.now(),title:'Notifications DicoPets activées',body:'Le test fonctionne sur cet appareil et ce navigateur.',url:location.href});
    rearm();return displayed?{ok:true,code:'enabled',message:'Notifications activées : une notification de test vient d’être envoyée.'}:{ok:false,code:'display',message:'L’autorisation est donnée, mais la notification de test n’a pas pu être affichée.'};
  }
  const style=document.createElement('style');style.textContent='.notification-help{position:fixed;z-index:10000;left:50%;bottom:max(18px,env(safe-area-inset-bottom));width:min(520px,calc(100% - 28px));transform:translateX(-50%);padding:20px 44px 20px 20px;border:1px solid #d5c08f;border-radius:16px;background:#fffdf8;color:#173b30;box-shadow:0 18px 55px #102a2255;font:15px/1.5 Arial,sans-serif}.notification-help strong{display:block;font:700 21px Georgia,serif}.notification-help button{position:absolute;right:10px;top:9px;border:0;background:transparent;color:#173b30;font-size:25px}.notification-help ol{margin-bottom:0;padding-left:20px}html[data-theme="dark"] .notification-help{background:#17251f;color:#edf4ef;border-color:#6f603e}';document.head.appendChild(style);
  rearm();addEventListener('focus',rearm);document.addEventListener('visibilitychange',()=>document.visibilityState==='visible'&&rearm());
  window.DicoPetsNotifications={enable,schedule,remove,capability,showTest:()=>show({id:'manual-'+Date.now(),title:'Test DicoPets',body:'Les notifications fonctionnent.',url:location.href})};
})();

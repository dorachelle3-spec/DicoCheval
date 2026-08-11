(()=>{'use strict';
  const KEY='dicopets-calendar-reminders-v2',timers=new Map();
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const write=list=>localStorage.setItem(KEY,JSON.stringify(list.slice(-100)));
  async function show(item){
    if(!('Notification' in window)||Notification.permission!=='granted')return;
    const registration=await navigator.serviceWorker?.ready;
    const options={body:item.body||'Un événement DicoPets approche.',icon:'assets/icon-192.png',badge:'assets/icon-192.png',tag:'dicopets-'+item.id,data:{url:item.url||location.href}};
    if(registration)await registration.showNotification(item.title||'Rappel DicoPets',options);
    else new Notification(item.title||'Rappel DicoPets',options);
  }
  function arm(item){const delay=Number(item.when)-Date.now();if(delay<=0||delay>2147483000)return;clearTimeout(timers.get(item.id));timers.set(item.id,setTimeout(async()=>{await show(item);write(read().map(x=>x.id===item.id?{...x,sent:true}:x))},delay))}
  function schedule(item){if(!item?.id||!item?.when)return;const list=read().filter(x=>x.id!==item.id);list.push({...item,sent:false});write(list);arm(item)}
  function remove(id){write(read().filter(x=>x.id!==id));clearTimeout(timers.get(id));timers.delete(id)}
  async function enable(){if(!('Notification'in window))return{ok:false,message:'Les notifications ne sont pas disponibles dans ce navigateur.'};const permission=await Notification.requestPermission();if(permission!=='granted')return{ok:false,message:'Les notifications n’ont pas été autorisées.'};await show({id:'welcome',title:'Notifications DicoPets activées',body:'Tes rappels pourront apparaître sur cet appareil.',url:location.href});return{ok:true,message:'Notifications activées sur cet appareil.'}}
  read().forEach(item=>{const age=Date.now()-Number(item.when);if(!item.sent&&age>=0&&age<86400000)show(item).then(()=>write(read().map(x=>x.id===item.id?{...x,sent:true}:x)));else if(!item.sent)arm(item)});
  window.DicoPetsNotifications={enable,schedule,remove};
})();

(() => {
  const db=window.supabase?.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  const $=id=>document.getElementById(id),ALL_REMINDERS=[0,15,30,45,60,120,1440];
  if(!db||!$('calEvents'))return;
  let user=null;
  const safe=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const status=(message,ok=false)=>{$('calStatus').textContent=message;$('calStatus').className=ok?'status saved':'status'};
  const localDate=()=>{const now=new Date(),offset=now.getTimezoneOffset()*60000;return new Date(now-offset).toISOString().slice(0,10)};
  const reminderLabel=minutes=>minutes===0?'à l’heure exacte':minutes<60?`${minutes} min avant`:minutes===60?'1 h avant':minutes===1440?'1 jour avant':`${minutes/60} h avant`;
  const noteData=event=>{const raw=String(event.notes||''),match=raw.match(/^\[\[dpr:(0|15|30|45|60|120|1440)\]\]/),language=(raw.match(/\[\[dpl:(fr|en)\]\]/)||[, 'fr'])[1];return{minutes:match?Number(match[1]):60,language,notes:raw.replace(/^\[\[dpr:(0|15|30|45|60|120|1440)\]\]/,'').replace(/^\[\[dpl:(fr|en)\]\]/,'')}};
  const eventMoment=event=>new Date(`${event.event_date}T${String(event.event_time||'').slice(0,5)||'09:00'}:00`);
  const reminderIds=id=>ALL_REMINDERS.map(minutes=>`dog-${id}-${minutes}`);
  function scheduleEvent(event){
    if(!window.DicoPetsNotifications||!event?.id||!event.event_time)return;
    const at=eventMoment(event),{minutes,language}=noteData(event),english=language==='en',clock=at.toLocaleTimeString(english?'en-US':'fr-CA',{hour:'2-digit',minute:'2-digit'});
    const send=(offset,title,body)=>window.DicoPetsNotifications.schedule({id:`dog-${event.id}-${offset}`,when:at.getTime()-offset*60000,title,body,url:'journal-chien.html#calendrier'});
    const before=english?(minutes===60?'1 hour before':minutes<60?`${minutes} minutes before`:minutes===1440?'1 day before':`${minutes/60} hours before`):reminderLabel(minutes);
    if(minutes>0)send(minutes,english?`DicoChien reminder · ${before}`:`Rappel DicoChien · ${before}`,english?`${event.title} is scheduled for ${clock}.`:`${event.title} est prévu à ${clock}.`);
    send(0,english?'DicoChien appointment':'Rendez-vous DicoChien',english?`${event.title} is scheduled now, at ${clock}.`:`${event.title} est prévu maintenant, à ${clock}.`);
  }
  function clearReminders(id){reminderIds(id).forEach(reminderId=>window.DicoPetsNotifications?.remove(reminderId))}
  async function loadEvents(){
    if(!user){$('calEvents').innerHTML='<p class="empty">Connecte-toi à ton espace membre pour utiliser ton calendrier privé.</p>';return}
    $('calEvents').innerHTML='<p class="empty">Chargement de tes événements…</p>';
    const today=localDate(),{data,error}=await db.from('dog_calendar_events').select('*').eq('user_id',user.id).gte('event_date',today).order('event_date',{ascending:true}).order('event_time',{ascending:true,nullsFirst:false});
    if(error){$('calEvents').innerHTML='<p class="empty">Impossible de charger les événements. Vérifie ta connexion, puis recharge la page.</p>';return}
    const upcoming=data||[];upcoming.forEach(scheduleEvent);
    if(!upcoming.length){$('calEvents').innerHTML='<p class="empty">Aucun événement à venir.</p>';return}
    $('calEvents').innerHTML=upcoming.map(event=>{const date=new Date(event.event_date+'T12:00:00').toLocaleDateString('fr-CA',{day:'2-digit',month:'short'}),time=event.event_time?event.event_time.slice(0,5):'',details=noteData(event);return `<article class="event-card"><div class="event-date">${safe(date)}</div><div><h3>${safe(event.title)}</h3><p>${safe(event.event_type)}${time?' · '+safe(time):''} · rappel ${reminderLabel(details.minutes)}</p>${details.notes?`<p>${safe(details.notes)}</p>`:''}</div><button class="event-delete" data-id="${safe(event.id)}">Supprimer</button></article>`}).join('');
    $('calEvents').querySelectorAll('.event-delete').forEach(button=>button.onclick=()=>deleteEvent(button.dataset.id));
  }
  async function deleteEvent(id){
    if(!user||!confirm('Supprimer cet événement de ton calendrier ?'))return;
    const {error}=await db.from('dog_calendar_events').delete().eq('id',id).eq('user_id',user.id);
    if(error)return status('La suppression n’a pas fonctionné. Réessaie.');clearReminders(id);status('Événement supprimé.',true);loadEvents();
  }
  async function saveEvent(){
    if(!user)return status('Connecte-toi d’abord à ton espace membre.');
    const title=$('calTitle').value.trim(),eventDate=$('calDate').value,eventTime=$('calTime').value,reminder=Number($('calReminder').value),language=$('calReminderLanguage').value==='en'?'en':'fr';
    if(!title||!eventDate||!eventTime)return status('Ajoute une date, une heure et un titre pour créer un rappel exact.');
    const notes=`[[dpr:${ALL_REMINDERS.includes(reminder)?reminder:60}]][[dpl:${language}]]${$('calNotes').value.trim()}`;
    $('calSave').disabled=true;
    const {data,error}=await db.from('dog_calendar_events').insert({user_id:user.id,event_date:eventDate,event_time:eventTime,title,event_type:$('calType').value,notes}).select().single();
    $('calSave').disabled=false;if(error)return status('Impossible d’enregistrer. Vérifie que le calendrier est activé dans Supabase.');
    scheduleEvent(data);$('calTitle').value='';$('calTime').value='';$('calNotes').value='';$('calReminder').value='60';$('calReminderLanguage').value=document.documentElement.lang.toLowerCase().startsWith('en')?'en':'fr';status('Événement ajouté : le rappel est programmé à l’heure choisie.',true);loadEvents();
  }
  $('calDate').value=localDate();$('calReminderLanguage').value=document.documentElement.lang.toLowerCase().startsWith('en')?'en':'fr';$('calSave').onclick=saveEvent;
  if($('enableNotifications'))$('enableNotifications').onclick=async()=>{const result=await window.DicoPetsNotifications?.enable();$('notificationStatus').textContent=result?.message||'Impossible d’activer les notifications.'};
  db.auth.getUser().then(({data})=>{user=data.user||null;$('calSave').disabled=!user;loadEvents()});
  db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;$('calSave').disabled=!user;loadEvents()});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user)loadEvents()});
})();

(() => {
  const db = window.supabase?.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  const $ = id => document.getElementById(id);
  if (!db || !$('calEvents')) return;
  let user = null;
  const safe = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const status = (message, ok=false) => { $('calStatus').textContent=message; $('calStatus').className=ok?'status saved':'status'; };
  const scheduleEvent=event=>{if(!window.DicoPetsNotifications||!event?.id)return;const clock=event.event_time?event.event_time.slice(0,5):'09:00',when=new Date(`${event.event_date}T${clock}:00`).getTime()-3600000;window.DicoPetsNotifications.schedule({id:'dog-'+event.id,when,title:'Rappel DicoChien',body:`${event.title}${event.event_time?' à '+clock:''} — dans environ une heure.`,url:'journal-chien.html#calendrier'})};

  async function loadEvents(){
    if(!user){$('calEvents').innerHTML='<p class="empty">Connecte-toi à ton espace membre pour utiliser ton calendrier privé.</p>';return;}
    const {data,error}=await db.from('dog_calendar_events').select('*').order('event_date',{ascending:true}).order('event_time',{ascending:true,nullsFirst:false});
    if(error){$('calEvents').innerHTML='<p class="empty">Le calendrier doit être activé dans Supabase avant sa première utilisation.</p>';return;}
    const today=new Date().toISOString().slice(0,10), upcoming=(data||[]).filter(event=>event.event_date>=today);upcoming.forEach(scheduleEvent);
    if(!upcoming.length){$('calEvents').innerHTML='<p class="empty">Aucun événement à venir.</p>';return;}
    $('calEvents').innerHTML=upcoming.map(event=>{const date=new Date(event.event_date+'T12:00:00').toLocaleDateString('fr-CA',{day:'2-digit',month:'short'}),time=event.event_time?event.event_time.slice(0,5):'';return `<article class="event-card"><div class="event-date">${safe(date)}</div><div><h3>${safe(event.title)}</h3><p>${safe(event.event_type)}${time?' · '+safe(time):''}</p>${event.notes?`<p>${safe(event.notes)}</p>`:''}</div><button class="event-delete" data-id="${safe(event.id)}">Supprimer</button></article>`}).join('');
    $('calEvents').querySelectorAll('.event-delete').forEach(button=>button.onclick=()=>deleteEvent(button.dataset.id));
  }
  async function deleteEvent(id){
    if(!user||!confirm('Supprimer cet événement de ton calendrier ?'))return;
    const {error}=await db.from('dog_calendar_events').delete().eq('id',id).eq('user_id',user.id);
    if(error)return status('La suppression n’a pas fonctionné. Réessaie.');window.DicoPetsNotifications?.remove('dog-'+id);status('Événement supprimé.',true);loadEvents();
  }
  async function saveEvent(){
    if(!user)return status('Connecte-toi d’abord à ton espace membre.');
    const title=$('calTitle').value.trim(),eventDate=$('calDate').value;if(!title||!eventDate)return status('Ajoute au minimum une date et un titre.');
    $('calSave').disabled=true;
    const {data,error}=await db.from('dog_calendar_events').insert({user_id:user.id,event_date:eventDate,event_time:$('calTime').value||null,title,event_type:$('calType').value,notes:$('calNotes').value.trim()||null}).select().single();
    $('calSave').disabled=false;if(error)return status('Impossible d’enregistrer. Vérifie que le calendrier est activé dans Supabase.');
    scheduleEvent(data);$('calTitle').value='';$('calTime').value='';$('calNotes').value='';status('Événement ajouté à ton calendrier privé.',true);loadEvents();
  }
  $('calDate').value=new Date().toISOString().slice(0,10);$('calSave').onclick=saveEvent;
  if($('enableNotifications'))$('enableNotifications').onclick=async()=>{const result=await window.DicoPetsNotifications?.enable();$('notificationStatus').textContent=result?.message||'Impossible d’activer les notifications.'};
  db.auth.getSession().then(({data})=>{user=data.session?.user||null;$('calSave').disabled=!user;loadEvents()});
  db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;$('calSave').disabled=!user;loadEvents()});
})();

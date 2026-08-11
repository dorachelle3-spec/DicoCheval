(() => {
  const $=id=>document.getElementById(id),fields=['date','dog','activity','mood','notes','goal'];
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  let user=null,entries=[],currentEntry=null;
  $('date').valueAsDate=new Date();
  const escape=s=>String(s||'').replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x]));
  const status=(message,ok=false)=>$('status').innerHTML=ok?'<span class="saved">'+message+'</span>':message;
  const toggleWriting=enabled=>['save','new'].forEach(id=>$(id).disabled=!enabled);
  const render=()=>{$('entries').innerHTML=entries.length?entries.map((x,i)=>'<button class="book-spine" data-open="'+i+'"><small>'+escape(x.session_date||'Sans date')+'</small><b>'+escape(x.dog||'Mon chien')+'</b><small>'+escape(x.activity||'Journal canin')+'</small></button>').join(''):'<p class="empty">Aucune page enregistrée. Écris ton premier souvenir avec ton chien.</p>';document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openEntry(Number(b.dataset.open)))};
  const openEntry=i=>{const x=entries[i];if(!x)return;currentEntry=x;$('deleteEntry').style.display='inline-block';$('entryTitle').textContent=x.dog||'Mon chien';$('entryMeta').innerHTML='<div>Date : '+escape(x.session_date||'—')+'</div><div>Activité : '+escape(x.activity||'—')+'</div><div>Humeur : '+escape(x.mood||'—')+'</div>';$('entryNotes').textContent=x.notes||'—';$('entryGoal').textContent=x.goal||'—';$('entryBook').classList.add('open');document.body.classList.add('entry-open');$('entryBook').scrollTop=0};
  const closeEntry=()=>{$('entryBook').classList.remove('open');document.body.classList.remove('entry-open')};
  const blank=()=>{fields.forEach(f=>$(f).value='');$('date').valueAsDate=new Date();status('Nouvelle page prête.')};
  async function load(){const {data,error}=await db.from('dog_journal_entries').select('*').order('session_date',{ascending:false}).order('created_at',{ascending:false});if(error){status('Le journal canin attend sa configuration privée dans Supabase.');return}entries=data||[];render()}
  $('save').onclick=async()=>{const notes=$('notes').value.trim();if(!notes){status('Écris quelques notes avant d’enregistrer.');return}const entry={user_id:user.id,session_date:$('date').value||null,dog:$('dog').value.trim()||null,activity:$('activity').value.trim()||null,mood:$('mood').value.trim()||null,notes,goal:$('goal').value.trim()||null};$('save').disabled=true;status('Enregistrement privé…');const {error}=await db.from('dog_journal_entries').insert(entry);$('save').disabled=false;if(error){status('Impossible d’enregistrer. Vérifie que le code Supabase du journal canin a été exécuté.');return}status('Page enregistrée dans ton journal privé !',true);blank();await load()};
  $('new').onclick=blank;
  $('deleteEntry').onclick=async()=>{if(!currentEntry||!confirm('Supprimer définitivement cette page ?'))return;const {error}=await db.from('dog_journal_entries').delete().eq('id',currentEntry.id);if(error){status('Impossible de supprimer cette page.');return}closeEntry();currentEntry=null;status('Page supprimée.');await load()};
  $('backLibrary').onclick=closeEntry;$('backLibraryTop').onclick=closeEntry;document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('entryBook').classList.contains('open'))closeEntry()});
  (async()=>{const {data}=await db.auth.getUser();user=data.user;if(!user){toggleWriting(false);status('Connecte-toi dans DicoChien pour ouvrir ton journal privé.');render();return}toggleWriting(true);status('Journal privé de ton compte : seul toi peux lire ces pages.',true);await load()})();
})();

/* Espace membre : profil, points, avatars et notifications. */
(() => {
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  const OWNER='f22161e4-7528-4fd2-9860-a18be084b1f6';
  const button=document.getElementById('topVisitorAccess');
  if(!button)return;
  const avatars=[
    {points:0,src:'assets/avatar-0.png',name:'Avatar de départ'},
    {points:10,src:'assets/avatar-5.png',name:'Cheval pie'},
    {points:15,src:'assets/avatar-10.png',name:'Cheval alezan'},
    {points:20,src:'assets/avatar-15.png',name:'Frison'}
  ];
  document.head.insertAdjacentHTML('beforeend','<style>.member-modal{position:fixed;inset:0;background:#173526bb;z-index:140;display:none;align-items:center;justify-content:center;padding:20px}.member-modal.open{display:flex}.member-box{position:relative;width:min(560px,100%);max-height:90vh;overflow:auto;background:#fffdf8;border-radius:15px;padding:28px}.member-box h2,.member-box h3{color:#234238;margin-top:0}.member-close{position:absolute;right:13px;top:10px;background:none!important;color:#234238!important;font-size:24px}.member-avatar{width:88px;height:88px;border-radius:50%;object-fit:cover;background:#dfe9df;border:2px solid #b58a4b;display:block;margin:8px 0 14px}.member-box input{width:100%;padding:10px;margin:5px 0 12px;border:1px solid #cbd8ce;border-radius:6px;font:14px Arial}.member-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.member-status{font-size:13px;color:#50685d;min-height:18px}.member-inbox,.member-points{border-top:1px solid #dde7dd;margin-top:20px;padding-top:16px}.member-notification{background:#f2f6f2;border-radius:8px;padding:10px;margin:7px 0;font-size:13px}.member-notification.unread{border-left:4px solid #b58a4b}.points-total{display:inline-block;background:#fff1d7;color:#765215;border-radius:99px;padding:6px 11px;font-weight:700}.avatar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:12px 0}.avatar-choice{border:2px solid #d8e2d8;border-radius:10px;background:#fff;padding:5px;cursor:pointer;color:#234238;font:11px Arial}.avatar-choice.selected{border-color:#b58a4b;box-shadow:0 0 0 2px #f6dfb7}.avatar-choice:disabled{opacity:.48;cursor:not-allowed}.avatar-choice img{display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;margin-bottom:5px}.avatar-upload-lock{font-size:12px;color:#63756a}.delete-account{margin-top:20px;width:100%;font-size:12px!important}.notification-badge{display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 5px;margin-left:5px;border-radius:99px;background:#9d3e3e;color:#fff;font-size:11px;vertical-align:middle}.auto-delete{display:flex;gap:8px;align-items:center;font-size:13px;color:#50685d;margin:8px 0}@media(max-width:440px){.avatar-grid{grid-template-columns:repeat(2,1fr)}}</style>');
  document.body.insertAdjacentHTML('beforeend','<div class="member-modal" id="memberModal"><div class="member-box"><button class="member-close" id="memberClose">×</button><h2>Mon espace membre</h2><p id="memberEmail" class="member-status"></p><img id="memberAvatar" class="member-avatar" alt="Photo de profil"><label for="memberPseudo">Pseudo</label><input id="memberPseudo" maxlength="40" placeholder="Choisis ton pseudo"><p id="memberJoined" class="member-status"></p><section class="member-points"><h3>Mes points</h3><p class="points-total" id="memberPoints">0 point</p><p class="member-status">1 minute passée sur le site = 1 point.</p><h3>Choisir mon avatar</h3><div class="avatar-grid" id="avatarGrid"></div><label for="memberAvatarFile">Photo personnelle — 40 points</label><input id="memberAvatarFile" type="file" accept="image/png,image/jpeg,image/webp"><p id="avatarHint" class="avatar-upload-lock"></p></section><p id="memberStatus" class="member-status"></p><div class="member-actions"><button class="btn" id="saveMemberProfile">Enregistrer mon profil</button><button class="btn danger" id="memberSignOut">Se déconnecter</button></div><section class="member-inbox"><h3>Boîte de réception</h3><label class="auto-delete"><input id="memberAutoDelete" type="checkbox"> Supprimer automatiquement les notifications après lecture</label><div id="memberNotifications"><p class="member-status">Chargement…</p></div></section><button class="btn danger delete-account" id="deleteMemberAccount">Supprimer définitivement mon compte</button></div></div>');
  const $=id=>document.getElementById(id);const modal=$('memberModal');let currentUser=null,pendingPreview='',chosenAvatar='';
  const reservedName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').includes('dicocheval');
  const esc=value=>String(value||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const isOwner=user=>user?.id===OWNER;
  const getPoints=user=>{const p=user.user_metadata||{},last=Date.parse(p.points_last_at||user.created_at||new Date().toISOString()),minutes=Math.max(0,Math.floor((Date.now()-last)/60000));return Number(p.points||0)+minutes};
  async function updatePoints(user){if(!user)return user;const profile=user.user_metadata||{},points=getPoints(user),last=Date.parse(profile.points_last_at||user.created_at||0);if(points===Number(profile.points||0)&&Date.now()-last<60000)return user;const {data}=await db.auth.updateUser({data:{points,points_last_at:new Date().toISOString()}});return data.user||user}
  async function refreshButton(){const {data}=await db.auth.getUser();if(!data.user){button.textContent='Se connecter visiteur';button.dataset.notifications='0';return}const {count}=await db.from('notifications').select('id',{count:'exact',head:true}).eq('destinataire_id',data.user.id).eq('lu',false);const total=count||0;button.dataset.notifications=String(total);button.innerHTML='Mon espace membre'+(total?` <span class="notification-badge">${total}</span>`:'')}
  async function loadInbox(){if(!currentUser)return;const target=$('memberNotifications');const {data,error}=await db.from('notifications').select('*').eq('destinataire_id',currentUser.id).order('cree_le',{ascending:false}).limit(30);if(error){target.innerHTML='<p class="member-status">Ta boîte de réception sera disponible après son activation.</p>';return}target.innerHTML=data?.length?data.map(n=>`<div class="member-notification ${n.lu?'':'unread'}">${esc(n.texte)}<br><small>${new Intl.DateTimeFormat('fr-CA',{day:'numeric',month:'short',year:'numeric'}).format(new Date(n.cree_le))}</small></div>`).join(''):'<p class="member-status">Aucune notification pour le moment.</p>';const unseen=(data||[]).filter(n=>!n.lu).map(n=>n.id);if(unseen.length){if($('memberAutoDelete').checked)await db.from('notifications').delete().in('id',unseen);else await db.from('notifications').update({lu:true}).in('id',unseen)}refreshButton()}
  function ownedAvatars(){return Array.isArray(currentUser?.user_metadata?.purchased_avatars)?currentUser.user_metadata.purchased_avatars:[]}
  async function chooseAvatar(src){const avatar=avatars.find(a=>a.src===src);if(!avatar||!currentUser)return;const owner=isOwner(currentUser),owned=ownedAvatars(),points=getPoints(currentUser);if(!owner&&avatar.points>0&&!owned.includes(src)){if(points<avatar.points)return;if(!confirm(`Débloquer cet avatar pour ${avatar.points} points ?`))return;const updatedPoints=points-avatar.points;const {data,error}=await db.auth.updateUser({data:{points:updatedPoints,points_last_at:new Date().toISOString(),purchased_avatars:[...owned,src]}});if(error){$('memberStatus').textContent='L’achat de cet avatar n’a pas pu être enregistré.';return}currentUser=data.user||currentUser;$('memberStatus').textContent=`Avatar débloqué : −${avatar.points} points.`}chosenAvatar=src;pendingPreview='';$('memberAvatarFile').value='';$('memberAvatar').src=chosenAvatar;renderAvatars()}
  function renderAvatars(){if(!currentUser)return;const points=getPoints(currentUser),owner=isOwner(currentUser),owned=ownedAvatars();$('memberPoints').textContent=points+' point'+(points===1?'':'s');$('avatarGrid').innerHTML=avatars.map(a=>{const available=owner||a.points===0||owned.includes(a.src)||points>=a.points;const label=a.points===0?'Départ':owned.includes(a.src)?'Débloqué':a.points+' points';return `<button class="avatar-choice ${chosenAvatar===a.src?'selected':''}" data-avatar="${a.src}" ${available?'':'disabled'}><img src="${a.src}" alt="${a.name}"><span>${label}${available?'':' 🔒'}</span></button>`}).join('');$('avatarGrid').querySelectorAll('[data-avatar]').forEach(choice=>choice.onclick=()=>chooseAvatar(choice.dataset.avatar));const custom=owner||currentUser.user_metadata?.custom_avatar_unlocked||points>=40;$('memberAvatarFile').disabled=!custom;$('avatarHint').textContent=custom?'Tu peux choisir une image personnelle.':'Débloque ta photo personnelle à 40 points.'}
  function showProfile(user){currentUser=user;const profile=user.user_metadata||{};chosenAvatar=profile.avatar_url||avatars[0].src;$('memberEmail').textContent='Connecté·e : '+(user.email||'');$('memberPseudo').value=profile.pseudo||'';$('memberAutoDelete').checked=!!profile.auto_delete_notifications;$('memberAvatar').src=chosenAvatar;$('memberAvatarFile').value='';const date=new Date(user.created_at);$('memberJoined').textContent='Membre depuis : '+date.toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'});$('memberStatus').textContent='';pendingPreview='';renderAvatars();modal.classList.add('open');loadInbox()}
  async function openProfile(focusInbox=false){const {data}=await db.auth.getUser();if(!data.user){$('commentAuthModal')?.classList.add('open');return}showProfile(await updatePoints(data.user));if(focusInbox)setTimeout(()=>document.querySelector('.member-inbox')?.scrollIntoView({behavior:'smooth',block:'start'}),60)}
  button.onclick=event=>openProfile(!!event.target.closest('.notification-badge')||Number(button.dataset.notifications||0)>0);$('memberClose').onclick=()=>modal.classList.remove('open');
  $('memberAvatarFile').onchange=()=>{const file=$('memberAvatarFile').files[0];if(!file)return;if(file.size>3*1024*1024){$('memberStatus').textContent='Choisis une image de 3 Mo maximum.';$('memberAvatarFile').value='';return}pendingPreview=URL.createObjectURL(file);$('memberAvatar').src=pendingPreview;$('memberStatus').textContent='Photo choisie : clique sur Enregistrer mon profil.'};
  $('saveMemberProfile').onclick=async()=>{if(!currentUser)return;const pseudo=$('memberPseudo').value.trim(),file=$('memberAvatarFile').files[0],owner=isOwner(currentUser),points=getPoints(currentUser),customOwned=!!currentUser.user_metadata?.custom_avatar_unlocked;if(reservedName(pseudo)&&!owner){$('memberStatus').textContent='Ce pseudo ne peut pas être utilisé.';return}if(file&&!owner&&!customOwned&&points<40){$('memberStatus').textContent='Il faut 40 points pour envoyer une photo personnelle.';return}$('memberStatus').textContent='Enregistrement…';let avatarUrl=chosenAvatar||avatars[0].src,finalPoints=points,customUnlocked=customOwned;if(file){if(!owner&&!customOwned){finalPoints-=40;customUnlocked=true;$('memberStatus').textContent='Photo débloquée : −40 points. Envoi en cours…'}const ext=(file.name.split('.').pop()||'jpg').toLowerCase(),path=currentUser.id+'/avatar-'+Date.now()+'.'+ext;const {error:uploadError}=await db.storage.from('avatars').upload(path,file,{upsert:true,contentType:file.type});if(uploadError){$('memberStatus').textContent='La photo ne peut pas encore être enregistrée. Il faut activer le dossier Images dans Supabase.';return}avatarUrl=db.storage.from('avatars').getPublicUrl(path).data.publicUrl}const {data,error}=await db.auth.updateUser({data:{pseudo,avatar_url:avatarUrl,points:finalPoints,points_last_at:new Date().toISOString(),custom_avatar_unlocked:customUnlocked,auto_delete_notifications:$('memberAutoDelete').checked}});if(error){$('memberStatus').textContent='Le profil n’a pas pu être enregistré.';return}currentUser=data.user||currentUser;chosenAvatar=avatarUrl;$('memberStatus').textContent='Profil enregistré !';$('memberAvatar').src=avatarUrl;renderAvatars();refreshButton()};
  $('memberSignOut').onclick=async()=>{await db.auth.signOut();modal.classList.remove('open');refreshButton()};
  $('deleteMemberAccount').onclick=async()=>{if(!currentUser)return;if(!confirm('Supprimer définitivement ton compte et tes données ? Cette action ne peut pas être annulée.'))return;const {error}=await db.functions.invoke('delete-account');if(error){$('memberStatus').textContent='La suppression sécurisée doit encore être activée dans Supabase.';return}await db.auth.signOut();modal.classList.remove('open');refreshButton();alert('Ton compte a été supprimé.')};
  setInterval(async()=>{const {data}=await db.auth.getUser();if(data.user){currentUser=await updatePoints(data.user);if(modal.classList.contains('open'))renderAvatars();refreshButton()}},60000);
  db.auth.onAuthStateChange(()=>setTimeout(refreshButton,0));refreshButton();
})();

/* Traduction de l'espace membre. */
(() => {
  const select=document.getElementById('languageHero');
  if(!select)return;
  function translate(){
    const en=select.value==='en';
    const t=(fr,english)=>en?english:fr;
    const modal=document.getElementById('memberModal');
    if(!modal)return;
    modal.querySelector('h2').textContent=t('Mon espace membre','My member area');
    modal.querySelector('label[for="memberPseudo"]').textContent=t('Pseudo','Username');
    modal.querySelector('#memberPoints')?.parentElement?.previousElementSibling?.replaceChildren(document.createTextNode(t('Mes points','My points')));
    const headings=modal.querySelectorAll('h3');
    if(headings[1])headings[1].textContent=t('Choisir mon avatar','Choose my avatar');
    if(headings[2])headings[2].textContent=t('Boîte de réception','Inbox');
    const upload=modal.querySelector('label[for="memberAvatarFile"]');if(upload)upload.textContent=t('Photo personnelle — 40 points','Personal photo — 40 points');
    const auto=document.getElementById('memberAutoDelete');if(auto?.parentElement)auto.parentElement.lastChild.textContent=t(' Supprimer automatiquement les notifications après lecture',' Automatically delete notifications after reading');
    const save=document.getElementById('saveMemberProfile');if(save)save.textContent=t('Enregistrer mon profil','Save my profile');
    const out=document.getElementById('memberSignOut');if(out)out.textContent=t('Se déconnecter','Sign out');
    const del=document.getElementById('deleteMemberAccount');if(del)del.textContent=t('Supprimer définitivement mon compte','Permanently delete my account');
    const visitor=document.getElementById('topVisitorAccess');if(visitor&&!visitor.querySelector('.notification-badge'))visitor.textContent=t('Mon espace membre','My member area');
    const owner=document.getElementById('topOwnerAccess');if(owner)owner.textContent=t('Espace propriétaire','Owner area');
  }
  select.addEventListener('change',()=>setTimeout(translate,30));translate();
})();
/* Fond personnel déblocable à 300 points. */
(() => {
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  const owner='f22161e4-7528-4fd2-9860-a18be084b1f6';
  const colors=[['#fafaf6','Classique'],['#ffffff','Blanc'],['#f1ecfa','Lavande'],['#e6dcff','Violet'],['#e9f4fb','Bleu doux'],['#d8f0ff','Bleu ciel'],['#dff7f2','Turquoise'],['#edf5ea','Vert sauge'],['#e0f4d7','Vert tendre'],['#fff8d7','Jaune doux'],['#ffe9c9','Pêche'],['#fff0f5','Rose doux'],['#ffe0ec','Rose bonbon'],['#f5e6d3','Sable'],['#eeeeee','Gris clair']];
  document.head.insertAdjacentHTML('beforeend','<style>body{background:var(--member-background,#fafaf6)!important}body .section:not(.hero){background:var(--member-background,#fafaf6)!important}.member-background{border-top:1px solid #dde7dd;margin-top:20px;padding-top:16px}.background-colors{display:flex;gap:8px;flex-wrap:wrap}.background-color{width:42px;height:42px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #b9cbbb;cursor:pointer}.background-color.selected{box-shadow:0 0 0 3px #b58a4b}.background-color:disabled{opacity:.45;cursor:not-allowed}.background-picker{width:42px;height:42px;padding:0;border:0;border-radius:50%;overflow:hidden;cursor:pointer;background:transparent!important}</style>');
  const apply=color=>document.documentElement.style.setProperty('--member-background',color||'#fafaf6');
  async function open(){
    const result=await db.auth.getUser(),user=result.data.user;if(!user)return;
    const p=user.user_metadata||{},last=Date.parse(p.points_last_at||user.created_at),points=Number(p.points||0)+Math.max(0,Math.floor((Date.now()-last)/60000)),unlocked=user.id===owner||points>=300;
    apply(p.site_background||'#fafaf6');
    const inbox=document.querySelector('.member-inbox');if(!inbox||document.getElementById('memberBackground'))return;
    const section=document.createElement('section');section.id='memberBackground';section.className='member-background';
    section.innerHTML='<h3>Mon fond de site</h3><p class="member-status">'+(unlocked?'Choisis une couleur visible seulement pour toi.':'Atteins 300 points pour personnaliser le fond du site.')+'</p><div class="background-colors"></div>';
    const group=section.querySelector('.background-colors');
    colors.forEach(item=>{const color=item[0],label=item[1],b=document.createElement('button');b.type='button';b.className='background-color '+((p.site_background||'#fafaf6')===color?'selected':'');b.title=label;b.style.setProperty('background',color,'important');b.disabled=!unlocked;b.onclick=async()=>{apply(color);group.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');await db.auth.updateUser({data:{site_background:color}})};group.append(b)});
    inbox.before(section);
  }
  db.auth.getUser().then(result=>apply(result.data.user?.user_metadata?.site_background||'#fafaf6'));
  new MutationObserver(open).observe(document.body,{childList:true,subtree:true});open();
})();

/* Sélecteur de couleur libre pour le fond personnel. */
(() => {
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  function add(){
    const group=document.querySelector('#memberBackground .background-colors');
    if(!group||group.querySelector('.background-picker'))return;
    const picker=document.createElement('input');picker.type='color';picker.className='background-picker';picker.title='Choisir une couleur personnalisée';
    db.auth.getUser().then(({data})=>{const user=data.user,background=user?.user_metadata?.site_background||'#fafaf6',last=Date.parse(user?.user_metadata?.points_last_at||user?.created_at||Date.now()),points=Number(user?.user_metadata?.points||0)+Math.max(0,Math.floor((Date.now()-last)/60000));picker.value=/^#[0-9a-fA-F]{6}$/.test(background)?background:'#fafaf6';picker.disabled=!(user?.id==='f22161e4-7528-4fd2-9860-a18be084b1f6'||points>=300)});
    picker.oninput=async()=>{const color=picker.value;document.documentElement.style.setProperty('--member-background',color);group.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));await db.auth.updateUser({data:{site_background:color}})};
    group.append(picker);
  }
  new MutationObserver(add).observe(document.body,{childList:true,subtree:true});add();
})();


/* Boîte de réception : suppression immédiate et affichage Safari. */
(() => {
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  document.head.insertAdjacentHTML('beforeend','<style>.member-modal{align-items:flex-start!important;overflow-y:auto;-webkit-overflow-scrolling:touch}.member-box{margin:20px auto;max-height:calc(100vh - 40px)!important;max-height:calc(100dvh - 40px)!important;-webkit-overflow-scrolling:touch;overflow-y:auto!important;overflow-x:hidden}.member-notification{overflow-wrap:anywhere;word-break:break-word}.member-inbox{min-width:0}</style>');
  const checkbox=document.getElementById('memberAutoDelete');
  if(!checkbox)return;
  checkbox.addEventListener('change',async()=>{
    const {data:{user}}=await db.auth.getUser();if(!user)return;
    await db.auth.updateUser({data:{auto_delete_notifications:checkbox.checked}});
    if(!checkbox.checked)return;
    const {error}=await db.from('notifications').delete().eq('destinataire_id',user.id).eq('lu',false);
    if(!error){const area=document.getElementById('memberNotifications');if(area)area.innerHTML='<p class="member-status">Aucune notification pour le moment.</p>';const badge=document.querySelector('.notification-badge');badge?.remove()}
  });
})();

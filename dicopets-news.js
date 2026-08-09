/* Accueil DicoPets : compte partagé et actualités Supabase. */
(()=>{
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  const OWNER_ID='f22161e4-7528-4fd2-9860-a18be084b1f6';
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const english=()=>document.documentElement.lang==='en';
  let articles=[];
  let expanded=false;
  let editingId=null;

  function dateText(value){
    return new Intl.DateTimeFormat(english()?'en-US':'fr-CA',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value));
  }

  async function isOwner(){
    const {data}=await db.auth.getUser();
    return data.user?.id===OWNER_ID;
  }

  async function renderNews(){
    const list=$('newsList');
    const {data,error}=await db.from('actualites').select('*').order('publie_le',{ascending:false});
    if(error){list.innerHTML='<p class="empty">'+(english()?'News cannot be loaded right now.':'Impossible de charger les actualités pour le moment.')+'</p>';return}
    articles=data||[];
    if(!articles.length){
      list.innerHTML='<p class="empty">'+(english()?'No news has been published yet.':'Aucune actualité publiée pour le moment.')+'</p>';
      $('newsToggle').hidden=true;
      return;
    }
    const owner=await isOwner();
    const shown=expanded?articles:articles.slice(0,2);
    list.innerHTML=shown.map(article=>`<article class="news-card" data-article-id="${article.id}">${article.image_url?`<img src="${esc(article.image_url)}" alt="">`:''}<div class="news-copy"><p class="news-date">${english()?'Published':'Publié le'} ${dateText(article.publie_le)}</p><h3>${esc(article.titre)}</h3><p>${esc(article.contenu.length>280?article.contenu.slice(0,280).trim()+'…':article.contenu)}</p><div class="news-actions"><a class="button button-small" href="article.html?id=${article.id}">${english()?'Read more':'Voir plus'}</a>${owner?`<button type="button" class="button button-ghost" data-edit="${article.id}">${english()?'Edit':'Modifier'}</button><button type="button" class="button button-danger" data-delete="${article.id}" data-image="${esc(article.image_url||'')}">${english()?'Delete':'Supprimer'}</button>`:''}</div></div></article>`).join('');
    $('newsToggle').hidden=articles.length<=2;
    $('newsToggle').textContent=expanded?(english()?'Show fewer news':'Voir moins d’actualités'):(english()?'View all news':'Voir toutes les actualités');
    list.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>openOwnerEditor(articles.find(a=>a.id===button.dataset.edit)));
    list.querySelectorAll('[data-delete]').forEach(button=>button.onclick=()=>deleteArticle(button));
  }

  async function deleteArticle(button){
    if(!confirm(english()?'Delete this news item?':'Supprimer cette actualité ?'))return;
    const {error}=await db.from('actualites').delete().eq('id',button.dataset.delete);
    if(error){alert(english()?'Deletion failed.':'La suppression a échoué.');return}
    if(button.dataset.image){
      const marker='/actualites/';
      const position=button.dataset.image.indexOf(marker);
      if(position>=0)await db.storage.from('actualites').remove([button.dataset.image.slice(position+marker.length)]);
    }
    renderNews();
  }

  function resetEditor(article){
    editingId=article?.id||null;
    $('articleTitle').value=article?.titre||'';
    $('articleText').value=article?.contenu||'';
    $('articleImage').value='';
    $('saveArticle').textContent=article?(english()?'Save changes':'Enregistrer les modifications'):(english()?'Publish':'Publier l’article');
    $('cancelEdit').hidden=!article;
    $('editorStatus').textContent=article?(english()?'Editing this news item.':'Modification de cette actualité.'):(english()?'You are signed in as the owner.':'Tu es connectée comme propriétaire.');
  }

  async function openOwnerEditor(article){
    $('ownerModal').classList.add('open');
    if(await isOwner()){
      $('ownerLogin').hidden=true;
      $('ownerEditor').hidden=false;
      resetEditor(article);
    }else{
      $('ownerLogin').hidden=false;
      $('ownerEditor').hidden=true;
    }
  }

  async function refreshAccountButton(){
    const {data}=await db.auth.getUser();
    $('accountButton').textContent=data.user?(english()?'My DicoPets account':'Mon compte DicoPets'):(english()?'Sign in':'Se connecter');
  }

  async function openAccount(){
    const {data}=await db.auth.getUser();
    $('accountModal').classList.add('open');
    $('accountLoggedOut').hidden=!!data.user;
    $('accountLoggedIn').hidden=!data.user;
    if(data.user)$('accountIdentity').textContent=(english()?'Signed in as ':'Connecté·e avec ')+(data.user.email||'DicoPets');
  }

  async function authenticate(create){
    const email=$('accountEmail').value.trim();
    const password=$('accountPassword').value;
    if(!email||password.length<6){$('accountInfo').textContent=english()?'Enter an email and a password of at least 6 characters.':'Entre une adresse courriel et un mot de passe d’au moins 6 caractères.';return}
    $('accountInfo').textContent=english()?'Please wait…':'Patiente…';
    const result=create?await db.auth.signUp({email,password,options:{emailRedirectTo:'https://dorachelle3-spec.github.io/DicoCheval/'}}):await db.auth.signInWithPassword({email,password});
    if(result.error){$('accountInfo').textContent=result.error.message;return}
    $('accountInfo').textContent=create?(english()?'Check your email to confirm the account.':'Vérifie ton courriel pour confirmer ton compte.'):(english()?'You are signed in.':'Connexion réussie !');
    if(!create){await openAccount();await refreshAccountButton();await renderNews()}
  }

  $('newsToggle').onclick=()=>{expanded=!expanded;renderNews()};
  $('ownerButton').onclick=()=>openOwnerEditor();
  $('ownerClose').onclick=()=>$('ownerModal').classList.remove('open');
  $('ownerSignIn').onclick=async()=>{
    const email=$('ownerEmail').value.trim();
    const password=$('ownerPassword').value;
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error||!(await isOwner())){await db.auth.signOut();$('ownerInfo').textContent=english()?'Access denied.':'Connexion refusée : seul le compte propriétaire peut publier.';return}
    $('ownerLogin').hidden=true;$('ownerEditor').hidden=false;resetEditor();refreshAccountButton();renderNews();
  };
  $('cancelEdit').onclick=()=>resetEditor();
  $('ownerSignOut').onclick=async()=>{await db.auth.signOut();$('ownerModal').classList.remove('open');refreshAccountButton();renderNews()};
  $('saveArticle').onclick=async()=>{
    if(!(await isOwner())){$('editorStatus').textContent=english()?'Your session has expired.':'Ta session a expiré.';return}
    const titre=$('articleTitle').value.trim();
    const contenu=$('articleText').value.trim();
    const file=$('articleImage').files[0];
    if(!titre||!contenu){$('editorStatus').textContent=english()?'Add a title and text.':'Ajoute un titre et le texte de l’actualité.';return}
    if(file&&file.size>5*1024*1024){$('editorStatus').textContent=english()?'The image is larger than 5 MB.':'Cette image dépasse 5 Mo.';return}
    $('saveArticle').disabled=true;$('editorStatus').textContent=english()?'Saving…':'Enregistrement…';
    let image_url;
    if(file){
      const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
      const path=crypto.randomUUID()+'.'+ext;
      const {error}=await db.storage.from('actualites').upload(path,file,{contentType:file.type});
      if(error){$('editorStatus').textContent=english()?'The image could not be uploaded.':'Impossible d’envoyer l’image.';$('saveArticle').disabled=false;return}
      image_url=db.storage.from('actualites').getPublicUrl(path).data.publicUrl;
    }
    const values={titre,contenu};if(image_url)values.image_url=image_url;
    const {error}=editingId?await db.from('actualites').update(values).eq('id',editingId):await db.from('actualites').insert(values);
    $('saveArticle').disabled=false;
    if(error){$('editorStatus').textContent=english()?'Saving failed.':'L’enregistrement a échoué.';return}
    $('ownerModal').classList.remove('open');resetEditor();renderNews();
  };

  $('accountButton').onclick=openAccount;
  $('accountClose').onclick=()=>$('accountModal').classList.remove('open');
  $('accountSignIn').onclick=()=>authenticate(false);
  $('accountSignUp').onclick=()=>authenticate(true);
  $('accountSignOut').onclick=async()=>{await db.auth.signOut();$('accountModal').classList.remove('open');refreshAccountButton();renderNews()};
  $('passwordToggle').onclick=()=>{const field=$('accountPassword');field.type=field.type==='password'?'text':'password';$('passwordToggle').textContent=field.type==='password'?'Afficher':'Masquer'};
  db.auth.onAuthStateChange(()=>setTimeout(()=>{refreshAccountButton();renderNews()},0));
  window.addEventListener('dicopets-language-change',()=>{refreshAccountButton();renderNews()});
  refreshAccountButton();renderNews();
})();

/* Cœurs pour les actualités et les commentaires. */
(() => {
  const db=window.supabase.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  document.head.insertAdjacentHTML('beforeend','<style>.social-like{margin-top:10px;background:transparent!important;color:#a13e5b!important;border:1px solid #e2bdc8!important;font-size:12px!important;padding:5px 9px!important}.social-like.active{background:#fff0f3!important;font-weight:700}.article-social{padding:0 25px 16px}.comment-like{margin-top:8px}</style>');
  const tableFor=kind=>kind==='article'?'likes_actualites':'likes_commentaires';
  const fieldFor=kind=>kind==='article'?'actualite_id':'commentaire_id';
  async function renderLike(host,kind,id){
    if(!host||host.querySelector('.social-like'))return;
    const table=tableFor(kind),field=fieldFor(kind);
    const {data:all,error}=await db.from(table).select('id').eq(field,id);
    if(error)return;
    const {data:{user}}=await db.auth.getUser();
    let active=false;
    if(user){const {data}=await db.from(table).select('id').eq(field,id).eq('auteur_id',user.id).maybeSingle();active=!!data}
    const button=document.createElement('button');button.type='button';button.className='social-like'+(active?' active':'');button.textContent=(active?'♥':'♡')+' '+all.length;
    button.onclick=async()=>{const {data:{user:current}}=await db.auth.getUser();if(!current){document.getElementById('commentAuthModal')?.classList.add('open');return}button.disabled=true;let error;if(active){({error}=await db.from(table).delete().eq(field,id).eq('auteur_id',current.id))}else{({error}=await db.from(table).insert({[field]:id,auteur_id:current.id}))}if(error){alert('Le cœur ne peut pas encore être enregistré.');button.disabled=false;return}active=!active;const {data:updated}=await db.from(table).select('id').eq(field,id);button.classList.toggle('active',active);button.textContent=(active?'♥':'♡')+' '+(updated?.length||0);button.disabled=false};host.append(button)
  }
  function scan(){document.querySelectorAll('.news-card[data-article-id]').forEach(card=>{let zone=card.querySelector('.article-social');if(!zone){zone=document.createElement('div');zone.className='article-social';card.append(zone)}renderLike(zone,'article',card.dataset.articleId);card.querySelectorAll('.comment[data-comment]').forEach(comment=>renderLike(comment,'comment',comment.dataset.comment))})}
  [250,900,1800].forEach(delay=>setTimeout(scan,delay));
  document.getElementById('languageHero')?.addEventListener('change',()=>[300,1000].forEach(delay=>setTimeout(scan,delay)));
})();
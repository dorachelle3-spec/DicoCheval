/* Navigation entre DicoPets et l’univers DicoCheval. */
(()=>{
  const back=document.createElement('a');
  back.href='index.html';
  back.textContent='← Retour à DicoPets';
  back.setAttribute('style','display:block;background:#b58a4b;color:#fff;text-align:center;padding:8px 14px;text-decoration:none;font-weight:700');
  document.body.prepend(back);
  setTimeout(()=>{
    const ownerAccess=document.getElementById('topOwnerAccess');
    if(ownerAccess){ownerAccess.textContent='Actualités DicoPets';ownerAccess.onclick=()=>location.href='index.html#actualite'}
  },700);
  if(new URLSearchParams(location.search).get('openMember')==='1'){
    setTimeout(()=>document.getElementById('topVisitorAccess')?.click(),900);
  }
})();

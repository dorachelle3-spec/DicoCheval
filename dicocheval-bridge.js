/* Navigation commune entre DicoPets et l’univers DicoCheval. */
(() => {
  if (!document.getElementById('dicopetsGlobalBar')) {
    document.getElementById('communityButton')?.remove();
    const bar = document.createElement('nav');
    bar.id = 'dicopetsGlobalBar';
    bar.setAttribute('aria-label', 'Navigation DicoPets');
    bar.innerHTML = '<a href="index.html">← Accueil DicoPets</a><a href="credits.html?v=20260810-global">Crédits photos</a><a id="communityButton" href="https://discord.gg/wVpQHHZUE7" target="_blank" rel="noopener noreferrer">Rejoindre la communauté</a>';
    document.body.prepend(bar);
    document.head.insertAdjacentHTML('beforeend','<style>#dicopetsGlobalBar{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;background:#173b30;padding:9px 14px;position:relative;z-index:60}#dicopetsGlobalBar a{display:inline-flex;color:#fff;text-decoration:none;border:1px solid #ffffff55;border-radius:999px;padding:8px 13px;font:800 13px Arial,sans-serif}#dicopetsGlobalBar a:hover{background:#ffffff18}#dicopetsGlobalBar a:nth-child(2){border-color:#e7c47f;color:#f5d997}</style>');
  }
  document.querySelectorAll('a[href^="credits.html"]').forEach(link => link.href = 'credits.html?v=20260810-global');
  if (!document.querySelector('script[src^="signup-reminder.js"]')) {
    const reminder = document.createElement('script');
    reminder.src = 'signup-reminder.js?v=20260810-popup';
    document.body.append(reminder);
  }
  setTimeout(() => {
    const ownerAccess = document.getElementById('topOwnerAccess');
    if (ownerAccess) {
      ownerAccess.textContent = 'Actualités DicoPets';
      ownerAccess.onclick = () => location.href = 'index.html#actualite';
    }
  }, 700);
  if (new URLSearchParams(location.search).get('openMember') === '1') {
    setTimeout(() => document.getElementById('topVisitorAccess')?.click(), 900);
  }
})();

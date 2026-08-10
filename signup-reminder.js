/* Rappel discret de création de compte commun à tous les univers DicoPets. */
(() => {
  if (document.getElementById('dicopetsSignupReminder')) return;
  const CREATED_KEY = 'dicopetsAccountCreated';
  const NEXT_KEY = 'dicopetsSignupReminderNext';
  const TWO_MINUTES = 120000;
  const db = window.supabase?.createClient(
    'https://mmxdlnfntpufwwkdvgzc.supabase.co',
    'sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP'
  );
  let signedIn = false;
  const english = () => document.documentElement.lang.toLowerCase().startsWith('en');

  document.head.insertAdjacentHTML('beforeend', `<style>
    .signup-reminder{position:fixed;inset:0;z-index:500;display:none;align-items:center;justify-content:center;padding:20px;background:#102d24b8;backdrop-filter:blur(3px)}
    .signup-reminder.open{display:flex}.signup-reminder-card{position:relative;width:min(470px,100%);padding:32px;border:1px solid #d8dfd6;border-radius:20px;background:#fffdf8;color:#18352c;text-align:center;box-shadow:0 25px 70px #071b1580}
    .signup-reminder-icon{font-size:42px}.signup-reminder h2{margin:8px 0;font:700 34px/1.1 Georgia,serif}.signup-reminder p{margin:9px 0;color:#5e7168}.signup-reminder .secure{color:#8b652e;font-weight:900}
    .signup-reminder-action{display:inline-flex;margin-top:12px;padding:14px 20px;border:0;border-radius:12px;background:#173b30;color:#fff;font:900 16px Arial,sans-serif;cursor:pointer}.signup-reminder-action:hover{background:#b88a44}
    .signup-reminder-close{position:absolute;right:13px;top:12px;border:0!important;background:#e9efe9!important;color:#173b30!important;border-radius:9px!important;padding:7px 10px!important;font:900 15px Arial,sans-serif!important;cursor:pointer}
  </style>`);
  document.body.insertAdjacentHTML('beforeend', `<aside id="dicopetsSignupReminder" class="signup-reminder" role="dialog" aria-modal="true" aria-labelledby="signupReminderTitle">
    <div class="signup-reminder-card"><button class="signup-reminder-close" type="button" aria-label="Fermer">×</button><div class="signup-reminder-icon" aria-hidden="true">🐾</div><h2 id="signupReminderTitle">Rejoins DicoPets</h2><p class="signup-copy">Crée ton compte pour retrouver ton espace membre dans tous les univers.</p><p class="secure">C’est entièrement sécurisé</p><button class="signup-reminder-action" type="button">Clique ici pour créer ton compte</button></div>
  </aside>`);
  const popup = document.getElementById('dicopetsSignupReminder');
  const close = popup.querySelector('.signup-reminder-close');
  const action = popup.querySelector('.signup-reminder-action');
  const updateLanguage = () => {
    const en = english();
    popup.querySelector('h2').textContent = en ? 'Join DicoPets' : 'Rejoins DicoPets';
    popup.querySelector('.signup-copy').textContent = en ? 'Create your account to access your member area in every world.' : 'Crée ton compte pour retrouver ton espace membre dans tous les univers.';
    popup.querySelector('.secure').textContent = en ? 'It is completely secure' : 'C’est entièrement sécurisé';
    action.textContent = en ? 'Click here to create your account' : 'Clique ici pour créer ton compte';
  };
  const accountCreated = () => localStorage.getItem(CREATED_KEY) === '1';
  const hideForever = () => { localStorage.setItem(CREATED_KEY, '1'); popup.classList.remove('open'); };
  const postpone = () => { localStorage.setItem(NEXT_KEY, String(Date.now() + TWO_MINUTES)); popup.classList.remove('open'); };
  const showIfNeeded = () => {
    if (signedIn || accountCreated() || Date.now() < Number(localStorage.getItem(NEXT_KEY) || 0)) return;
    updateLanguage(); popup.classList.add('open');
  };
  const openAccount = () => {
    postpone();
    const homeModal = document.getElementById('accountModal');
    const memberModal = document.getElementById('commentAuthModal');
    if (homeModal) { homeModal.classList.add('open'); document.getElementById('accountEmail')?.focus(); return; }
    if (memberModal) { memberModal.classList.add('open'); (document.getElementById('dogAuthEmail') || document.getElementById('commentEmail'))?.focus(); return; }
    location.href = 'index.html?createAccount=1';
  };
  close.onclick = postpone;
  action.onclick = openAccount;
  popup.addEventListener('click', event => { if (event.target === popup) postpone(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && popup.classList.contains('open')) postpone(); });
  window.addEventListener('dicopets-language-change', updateLanguage);
  document.getElementById('language')?.addEventListener('change', updateLanguage);
  document.getElementById('languageHero')?.addEventListener('change', updateLanguage);

  const watchSuccess = element => {
    if (!element) return;
    new MutationObserver(() => {
      if (/vérifie|courriel|check your email|compte créé|account created|confirmation|confirm your account/i.test(element.textContent)) hideForever();
    }).observe(element, { childList:true, subtree:true, characterData:true });
  };
  ['accountInfo','commentAuthInfo','dogAuthMessage'].forEach(id => watchSuccess(document.getElementById(id)));

  if (db) {
    db.auth.getUser().then(({data}) => { signedIn = !!data.user; if (signedIn) hideForever(); else setTimeout(showIfNeeded, 500); });
    db.auth.onAuthStateChange((_event, session) => { signedIn = !!session?.user; if (signedIn) hideForever(); });
  } else setTimeout(showIfNeeded, 500);
  setInterval(showIfNeeded, 5000);
  if (new URLSearchParams(location.search).get('createAccount') === '1') setTimeout(openAccount, 400);
})();

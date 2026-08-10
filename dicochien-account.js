/* Connexion DicoPets partagée avec l'espace membre de DicoCheval. */
(() => {
  const db = window.supabase.createClient(
    'https://mmxdlnfntpufwwkdvgzc.supabase.co',
    'sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP'
  );
  const $ = id => document.getElementById(id);
  const button = $('topVisitorAccess');
  const modal = $('commentAuthModal');
  if (!button || !modal) return;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
  const message = text => { $('dogAuthMessage').textContent = text; };
  const labels = {
    fr: { signedOut: 'Se connecter', signedIn: 'Mon espace membre', wait: 'Connexion…', sent: 'Vérifie ton courriel pour confirmer ton compte.', error: 'Connexion impossible. Vérifie ton courriel et ton mot de passe.' },
    en: { signedOut: 'Sign in', signedIn: 'My member area', wait: 'Signing in…', sent: 'Check your email to confirm your account.', error: 'Unable to sign in. Check your email and password.' }
  };

  async function refresh() {
    const { data } = await db.auth.getUser();
    const key = lang();
    button.textContent = data.user ? labels[key].signedIn : labels[key].signedOut;
    return data.user;
  }

  button.addEventListener('click', async () => {
    const user = await refresh();
    if (!user) modal.classList.add('open');
  });
  $('dogAuthClose').onclick = () => modal.classList.remove('open');
  modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
  $('dogPasswordEye').onclick = () => {
    const input = $('dogAuthPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  $('dogSignIn').onclick = async () => {
    const key = lang();
    message(labels[key].wait);
    const { error } = await db.auth.signInWithPassword({
      email: $('dogAuthEmail').value.trim(),
      password: $('dogAuthPassword').value
    });
    if (error) { message(labels[key].error); return; }
    modal.classList.remove('open');
    await refresh();
    setTimeout(() => button.click(), 150);
  };

  $('dogSignUp').onclick = async () => {
    const key = lang();
    const { error } = await db.auth.signUp({
      email: $('dogAuthEmail').value.trim(),
      password: $('dogAuthPassword').value,
      options: { emailRedirectTo: 'https://dorachelle3-spec.github.io/DicoCheval/dicochien.html' }
    });
    message(error ? labels[key].error : labels[key].sent);
  };

  db.auth.onAuthStateChange(() => setTimeout(refresh, 0));
  document.getElementById('language')?.addEventListener('change', () => setTimeout(refresh, 0));
  refresh();
})();

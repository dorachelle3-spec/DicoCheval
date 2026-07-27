/* Quiz DicoCheval : score final et meilleur résultat. */
(() => {
  const db = window.supabase?.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  let score = 0, answered = 0, locked = false, timer;
  const english = () => document.getElementById('languageHero')?.value === 'en';
  const text = (fr,en) => english() ? en : fr;
  const questions = () => english() && typeof enQuiz !== 'undefined' ? enQuiz : qs;
  const localBest = () => { try { return JSON.parse(localStorage.getItem('dcBestQuizScore') || 'null'); } catch { return null; } };
  const better = (next, previous) => !previous || next.percentage > previous.percentage || (next.percentage === previous.percentage && next.correct > previous.correct);
  async function saveBest(next) {
    const previous = localBest();
    if (!better(next, previous)) return previous;
    localStorage.setItem('dcBestQuizScore', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('dc-quiz-score-changed', {detail: next}));
    if (!db) return next;
    const {data} = await db.auth.getUser();
    const user = data.user;
    const saved = user?.user_metadata?.best_quiz_score;
    if (user && better(next, saved)) await db.auth.updateUser({data:{best_quiz_score:next}});
    return next;
  }
  function renderFinished(total) {
    const percentage = Math.round((score / total) * 100);
    const current = {correct:score,total,percentage,completed_at:new Date().toISOString()};
    const best = localBest();
    const visibleBest = better(current,best) ? current : best;
    document.getElementById('qn').textContent = total;
    document.getElementById('question').textContent = text('Quiz terminé !','Quiz complete!');
    document.getElementById('answers').innerHTML = '';
    document.getElementById('result').innerHTML = `<strong>${text('Ton résultat','Your result')} : ${score} / ${total} (${percentage} %)</strong><br>${text('Meilleur score','Best score')} : ${visibleBest?.correct ?? score} / ${visibleBest?.total ?? total} (${visibleBest?.percentage ?? percentage} %)`;
    saveBest(current);
    if (typeof window.unlock === 'function') window.unlock('quiz');
  }
  function drawQuiz() {
    clearTimeout(timer);
    const list = questions();
    if (answered >= list.length) { renderFinished(list.length); return; }
    const question = list[qi % list.length];
    locked = false;
    document.getElementById('qn').textContent = answered + 1;
    document.getElementById('question').textContent = question[0];
    document.getElementById('result').textContent = '';
    document.getElementById('answers').innerHTML = question[1].map((choice,index)=>`<button type="button" data-choice="${index}">${choice}</button>`).join('');
    document.querySelectorAll('#answers button').forEach(button => button.onclick = () => {
      if (locked) return;
      locked = true;
      const correct = question[1][Number(button.dataset.choice)] === question[2];
      if (correct) score += 1;
      answered += 1;
      document.querySelectorAll('#answers button').forEach(item => item.disabled = true);
      document.getElementById('result').textContent = correct ? text('✓ Bravo, tu as réussi !','✓ Well done, you got it!') : text('✕ Réponse : ','✕ Answer: ') + question[2];
      timer = setTimeout(() => { qi = (qi + 1) % list.length; drawQuiz(); }, 2000);
    });
  }
  function restart() { clearTimeout(timer); qi = 0; score = 0; answered = 0; drawQuiz(); }
  window.drawQ = drawQuiz;
  window.nextQ = () => { if (!locked) { locked = true; answered += 1; qi = (qi + 1) % questions().length; drawQuiz(); } };
  const restartButton = document.getElementById('restartQuiz');
  if (restartButton) restartButton.onclick = restart;
  document.getElementById('languageHero')?.addEventListener('change', () => { if (restartButton) restartButton.textContent = text('Recommencer le quiz','Restart quiz'); restart(); });
  document.addEventListener('DOMContentLoaded', drawQuiz, {once:true});
  drawQuiz();
})();

/* Affiche le meilleur score dans l’espace membre. */
(() => {
  const db = window.supabase?.createClient('https://mmxdlnfntpufwwkdvgzc.supabase.co','sb_publishable_Pa-DX3nwNTZktbWK46KDQg_IuIy8TZP');
  const english = () => document.getElementById('languageHero')?.value === 'en';
  const text = (fr,en) => english() ? en : fr;
  async function renderBest() {
    const points = document.getElementById('memberPoints');
    if (!points || document.getElementById('memberBestQuiz')) return;
    const {data} = await db.auth.getUser();
    const saved = data.user?.user_metadata?.best_quiz_score || (()=>{ try{return JSON.parse(localStorage.getItem('dcBestQuizScore')||'null')}catch{return null} })();
    const line = document.createElement('p');
    line.id = 'memberBestQuiz'; line.className = 'member-status';
    line.textContent = saved ? `${text('Meilleur score au quiz','Best quiz score')} : ${saved.correct} / ${saved.total} (${saved.percentage} %)` : text('Meilleur score au quiz : aucun quiz terminé pour le moment.','Best quiz score: no completed quiz yet.');
    points.after(line);
  }
  document.getElementById('topVisitorAccess')?.addEventListener('click',()=>setTimeout(renderBest,100));
  window.addEventListener('dc-quiz-score-changed',()=>{document.getElementById('memberBestQuiz')?.remove();renderBest()});
})();
/* Animations visibles, légères et rejouées pendant le défilement. */
(()=>{
  const style=document.createElement('style');
  style.textContent=`@media (prefers-reduced-motion:no-preference){.dc-reveal{opacity:0;transform:translateY(44px) scale(.985);filter:blur(4px);transition:opacity .48s ease,transform .7s cubic-bezier(.16,.82,.28,1),filter .48s ease}.dc-reveal.dc-visible{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}.dc-reveal .card,.dc-reveal .disc,.dc-reveal .job,.dc-reveal .term{transition:transform .25s ease,box-shadow .25s ease}.dc-reveal.dc-visible .card:hover,.dc-reveal.dc-visible .disc:hover,.dc-reveal.dc-visible .job:hover,.dc-reveal.dc-visible .term:hover{transform:translateY(-4px);box-shadow:0 10px 22px #17352618}}`;
  document.head.append(style);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const sections=[...document.querySelectorAll('main > .section')];
  sections.forEach((section,index)=>{if(index!==0)section.classList.add('dc-reveal')});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('dc-visible',entry.isIntersecting)),{threshold:.16,rootMargin:'-7% 0px -14%'});
  sections.forEach(section=>{if(section.classList.contains('dc-reveal'))observer.observe(section)});
})();
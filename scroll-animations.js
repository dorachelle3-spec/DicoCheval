/* Animations légères lors du défilement. */
(()=>{
  const style=document.createElement('style');
  style.textContent=`@media (prefers-reduced-motion:no-preference){.dc-reveal{opacity:0;transform:translateY(24px);transition:opacity .65s ease,transform .65s cubic-bezier(.2,.75,.3,1)}.dc-reveal.dc-visible{opacity:1;transform:none}.dc-reveal .head{transition-delay:.04s}.dc-reveal .grid3,.dc-reveal .care,.dc-reveal .diagram,.dc-reveal .quiz,.dc-reveal .home-preview,.dc-reveal .map-layout,.dc-reveal .ideal-card{transition-delay:.1s}.dc-reveal .card,.dc-reveal .disc,.dc-reveal .job,.dc-reveal .term{transition:transform .25s ease,box-shadow .25s ease}.dc-reveal.dc-visible .card:hover,.dc-reveal.dc-visible .disc:hover,.dc-reveal.dc-visible .job:hover,.dc-reveal.dc-visible .term:hover{transform:translateY(-4px);box-shadow:0 10px 22px #17352618}}`;
  document.head.append(style);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const sections=[...document.querySelectorAll('main > .section')];
  sections.forEach((section,index)=>{if(index===0)return;section.classList.add('dc-reveal')});
  const reveal=entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('dc-visible');observer.unobserve(entry.target)}});
  const observer=new IntersectionObserver(reveal,{threshold:.13,rootMargin:'0px 0px -55px'});
  sections.forEach(section=>{if(section.classList.contains('dc-reveal'))observer.observe(section)});
})();

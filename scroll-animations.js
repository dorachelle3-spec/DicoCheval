/* Animations discrètes, rejouées pendant le défilement. */
(()=>{
  const style=document.createElement('style');
  style.textContent=`@media (prefers-reduced-motion:no-preference){.dc-reveal{opacity:0;transform:translateY(16px);transition:opacity .34s ease,transform .46s cubic-bezier(.22,.7,.25,1);will-change:opacity,transform}.dc-reveal.dc-visible{opacity:1;transform:translateY(0)}.dc-reveal .card,.dc-reveal .disc,.dc-reveal .job,.dc-reveal .term{transition:transform .22s ease,box-shadow .22s ease}.dc-reveal.dc-visible .card:hover,.dc-reveal.dc-visible .disc:hover,.dc-reveal.dc-visible .job:hover,.dc-reveal.dc-visible .term:hover{transform:translateY(-3px);box-shadow:0 9px 20px #17352616}}`;
  document.head.append(style);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const observed=new WeakSet();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('dc-visible',entry.isIntersecting)),{threshold:.08,rootMargin:'0px 0px -7%'});
  const attach=()=>{
    document.querySelectorAll('main > .section > .wrap, main > .section .home-preview').forEach(target=>{
      if(observed.has(target))return;
      observed.add(target);
      target.classList.add('dc-reveal');
      observer.observe(target);
    });
  };
  attach();
  new MutationObserver(attach).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
})();
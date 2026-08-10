(() => {
  const titles=['Bien manger','Suivi vétérinaire','Hygiène et pelage','Bouger et jouer','Émotions et repos','S’adapter à la météo'];
  document.querySelectorAll('.mission h2').forEach((heading,index)=>heading.textContent=titles[index]||heading.textContent.replace(/^Mission\s+/i,''));
})();

(() => {
  const $ = s => document.querySelector(s);
  const en = () => document.documentElement.lang === 'en-US' || localStorage.getItem('dicochevalLocale') === 'en-US';
  const text = (fr, english) => en() ? english : fr;
  const origins = {
    'Espagne': ['Andalou','Lusitanien','Barbe'], 'France': ['Selle français','Camargue','Percheron','Comtois','Trait breton','Henson','Landais','Pottok'],
    'Royaume-Uni': ['Pur-sang anglais','Clydesdale','Dartmoor','Exmoor','Fell','Highland','New Forest','Shetland','Welsh A','Welsh B','Welsh C','Welsh D'],
    'Irlande': ['Irish Cob','Connemara','Kerry Bog'], 'Islande': ['Islandais'], 'Allemagne': ['Hanovrien','Holsteiner','Trakehner','Frison'],
    'États-Unis': ['Appaloosa','Mustang','Paint Horse','Quarter Horse','Tennessee Walker'], 'Maroc': ['Barbe'], 'Mongolie': ['Mongol'], 'Autriche': ['Haflinger']
  };
  const map = document.createElement('section'); map.id='carte-races'; map.className='section map-section';
  map.innerHTML='<div class="wrap"><div class="head"><h2></h2><p></p></div><div class="map-layout"><div class="country-map"></div><article class="map-result"><span class="eyebrow"></span><h3></h3><p></p><div class="map-breeds"></div></article></div></div>';
  $('#races').before(map);
  const ideal = document.createElement('section'); ideal.id='cheval-ideal'; ideal.className='section rose';
  ideal.innerHTML='<div class="wrap"><div class="head"><h2></h2><p></p></div><div class="ideal-card"><div class="ideal-questions"></div><button class="ideal-submit"></button><div class="ideal-result" aria-live="polite"></div></div></div>';
  $('#disciplines').before(ideal);
  const badges = document.createElement('section'); badges.id='badges'; badges.className='section tint';
  badges.innerHTML='<div class="wrap"><div class="head"><h2></h2><p></p></div><div class="badge-grid"></div></div>';
  $('#quiz').before(badges);
  const style=document.createElement('style'); style.textContent=`
    .map-layout{display:grid;grid-template-columns:1.2fr .8fr;gap:22px}.country-map{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:#173526;padding:25px;border-radius:18px}.country-map button{background:#fdfaf2!important;color:#1f4737!important;border:0;border-radius:13px;padding:16px 9px;font-weight:800;cursor:pointer}.country-map button:hover,.country-map button.active{background:#b58a4b!important;color:white!important;transform:translateY(-2px)}.map-result,.ideal-card{background:#fffdf8;border:1px solid #d7e0d5;border-radius:18px;padding:27px}.map-result h3{margin:5px 0;color:#1f4737}.eyebrow{font-size:12px;color:#b58a4b;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.map-breeds{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.map-breeds button{background:#e4eee7!important;color:#1f4737!important;border:0;border-radius:99px;padding:8px 12px;font-weight:800}.ideal-questions{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.ideal-questions label{font-weight:800;color:#1f4737}.ideal-questions select{display:block;width:100%;margin-top:7px;padding:11px;border:1px solid #cbd8ce;border-radius:10px;background:white}.ideal-submit{margin-top:22px}.ideal-result{margin-top:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.match{background:#edf2ea;border-radius:12px;padding:17px}.match h3{margin:0;color:#1f4737}.match button{padding:7px 10px;margin-top:10px}.badge-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.badge{background:white;border:1px solid #d7e0d5;border-radius:16px;padding:21px;opacity:.48}.badge.unlocked{opacity:1;border-color:#b58a4b;box-shadow:0 8px 22px #1f47371a}.badge .medal{font-size:31px}.badge h3{margin:10px 0 6px;color:#1f4737}.badge small{color:#63756a}@media(max-width:720px){.map-layout,.ideal-questions,.ideal-result{grid-template-columns:1fr}.badge-grid{grid-template-columns:1fr 1fr}.country-map{grid-template-columns:1fr 1fr}}
  `; document.head.append(style);
  function render(){
    document.querySelectorAll('.nav .wrap').forEach(nav=>{ if(!nav.querySelector('[href="#carte-races"]')) nav.insertAdjacentHTML('beforeend','<a href="#carte-races">'+text('Carte','Map')+'</a><a href="#cheval-ideal">'+text('Mon cheval','My horse')+'</a><a href="#badges">'+text('Badges','Badges')+'</a>'); });
    $('#carte-races h2').textContent=text('Carte des races','Breed map'); $('#carte-races .head p').textContent=text('Clique sur un pays pour découvrir les races qui y sont liées.','Click a country to discover breeds connected to it.');
    $('#cheval-ideal h2').textContent=text('Mon cheval idéal','My ideal horse'); $('#cheval-ideal .head p').textContent=text('Réponds à trois questions : le site te propose des races à explorer.','Answer three questions and discover breeds to explore.');
    $('#badges h2').textContent=text('Mes badges','My badges'); $('#badges .head p').textContent=text('Découvre le site et collectionne tes badges.','Explore the site and collect badges.');
    $('.country-map').innerHTML=Object.keys(origins).map((x,i)=>'<button data-country="'+x+'">'+x+'</button>').join('');
    $('.country-map button').onclick?.(); $('.country-map button:first-child').click();
    $('.ideal-questions').innerHTML=[
      [text('Expérience','Experience'),[['beginner',text('Je débute','I am a beginner')],['regular',text('J’ai un peu d’expérience','Some experience')],['sport',text('Je veux pratiquer un sport','I want to do sport')]]],
      [text('Ce que je préfère','What I prefer'),[['calm',text('Calme et proche de l’humain','Calm and people-oriented')],['outdoor',text('Randonnée et extérieur','Trail riding')],['jump',text('Saut et polyvalence','Jumping and versatility')]]],
      [text('Taille souhaitée','Preferred size'),[['pony',text('Poney','Pony')],['medium',text('Moyen','Medium')],['large',text('Grand cheval','Large horse')]]]
    ].map(([l,opts],i)=>'<label>'+l+'<select id="ideal'+i+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select></label>').join('');
    $('.ideal-submit').textContent=text('Trouver mes races','Find my breeds'); $('.ideal-submit').onclick=findIdeal; renderBadges();
  }
  function showCountry(country,button){ document.querySelectorAll('.country-map button').forEach(x=>x.classList.remove('active'));button.classList.add('active'); const list=origins[country]; $('.map-result .eyebrow').textContent=text('Races originaires ou fortement liées à ce pays','Breeds originating from or strongly linked to this country');$('.map-result h3').textContent=country;$('.map-result p').textContent=text(list.length+' races à découvrir.','Discover '+list.length+' breeds.');$('.map-breeds').innerHTML=list.map(n=>'<button data-breed="'+n+'">'+n+'</button>').join('');document.querySelectorAll('.map-breeds button').forEach(b=>b.onclick=()=>{unlock('world');window.openBreed?.(b.dataset.breed)}); }
  document.addEventListener('click',e=>{const b=e.target.closest('.country-map button');if(b)showCountry(b.dataset.country,b)});
  function findIdeal(){const a=$('#ideal0').value,b=$('#ideal1').value,c=$('#ideal2').value;let picks=c==='pony'?['Connemara','Haflinger','New Forest']:b==='jump'||a==='sport'?['Selle français','Hanovrien','Quarter Horse']:b==='outdoor'?['Mérens','Islandais','Appaloosa']:['Haflinger','Franche-Montagne','Camargue'];$('.ideal-result').innerHTML=picks.map(n=>'<article class="match"><span>★ '+text('Bonne piste','Great match')+'</span><h3>'+n+'</h3><button data-breed="'+n+'">'+text('Voir la fiche','View profile')+'</button></article>').join('');document.querySelectorAll('.ideal-result button').forEach(x=>x.onclick=()=>{unlock('finder');window.openBreed?.(x.dataset.breed)});unlock('finder');}
  const keys={world:['🌍',text('Explorateur du monde','World explorer'),text('Cliquer sur un pays de la carte','Click a country on the map')],finder:['✨',text('Mon cheval idéal','My ideal horse'),text('Terminer le questionnaire','Complete the questionnaire')],breed:['🐴',text('Passionné de races','Breed enthusiast'),text('Ouvrir une fiche de race','Open a breed profile')],quiz:['🏆',text('Quiz terminé','Quiz complete'),text('Répondre à une question du quiz','Answer a quiz question')]};
  function unlock(k){let a=JSON.parse(localStorage.getItem('dcBadges')||'[]');if(!a.includes(k)){a.push(k);localStorage.setItem('dcBadges',JSON.stringify(a));}renderBadges();}
  function renderBadges(){let a=JSON.parse(localStorage.getItem('dcBadges')||'[]');$('.badge-grid').innerHTML=Object.entries(keys).map(([k,v])=>'<article class="badge '+(a.includes(k)?'unlocked':'')+'"><div class="medal">'+v[0]+'</div><h3>'+v[1]+'</h3><small>'+v[2]+'</small><p>'+(a.includes(k)?text('Débloqué !','Unlocked!'):text('À débloquer','Locked'))+'</p></article>').join('');}
  const old=window.openBreed; if(old) window.openBreed=function(n){unlock('breed');return old(n)};
  const oldAnswer=window.answer; if(oldAnswer) window.answer=function(el){oldAnswer(el);unlock('quiz');};
  render(); document.getElementById('locale')?.addEventListener('change',()=>setTimeout(render,10));
})();

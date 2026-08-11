(() => {
  const top=document.querySelector('.top'),lang=document.createElement('select');lang.id='mapLanguage';lang.setAttribute('aria-label','Langue');lang.innerHTML='<option value="fr">Français</option><option value="en">English</option>';lang.value=localStorage.getItem('dicopetsLanguage')==='en'?'en':'fr';top.appendChild(lang);
  const languageStyle=document.createElement('style');languageStyle.textContent='#mapLanguage{padding:9px 13px;border:1px solid #ffffff66;border-radius:999px;background:#fff;color:#173b30;font-weight:900}#mapLanguage option{background:#fff;color:#173b30}';document.head.appendChild(languageStyle);
  const countries={
    'Royaume-Uni':[[54,-2.5],['Welsh Corgi Pembroke','Welsh Corgi Cardigan','Whippet','Labrador Retriever','Golden Retriever','Beagle','Border Collie','Cavalier King Charles Spaniel','Jack Russell Terrier','Cocker anglais','Otterhound']],
    'Allemagne':[[51.1,10.4],['Berger allemand','Rottweiler','Dobermann','Teckel standard','Eurasier','Schnauzer nain']],
    'France':[[46.3,2.2],['Bouledogue français','Caniche standard','Basset Hound','Bichon frisé','Épagneul nain continental Papillon']],
    'États-Unis':[[39,-98],['Berger australien','Chinook']],
    'Canada':[[56,-106],['Terre-Neuve']],
    'Suisse':[[46.8,8.2],['Bouvier bernois']],
    'Russie':[[61,90],['Husky sibérien','Samoyède']],
    'Mexique':[[23.6,-102.5],['Chihuahua','Xoloitzcuintle moyen']],
    'Japon':[[36.2,138.2],['Akita','Kai Ken','Shiba Inu']],
    'Hongrie':[[47.1,19.5],['Mudi','Pumi']],
    'Italie':[[42.8,12.5],['Lagotto Romagnolo']],
    'Finlande':[[64,26],['Chien finnois de Laponie']],
    'Pays-Bas':[[52.2,5.3],['Kooikerhondje']],
    'Portugal':[[39.6,-8],['Chien d’eau portugais']],
    'Tchéquie':[[49.8,15.5],['Berger de Bohême','Terrier tchèque']],
    'Thaïlande':[[15.8,101],['Thai Ridgeback']],
    'Afghanistan':[[33.9,67.7],['Lévrier afghan']],
    'Mali':[[17,-4],['Azawakh']],
    'Afrique centrale':[[1,22],['Basenji']],
    'Chine':[[35.8,104],['Shih Tzu']],
    'Croatie':[[45.1,15.2],['Dalmatien']],
    'Malte':[[35.9,14.4],['Bichon maltais']],
    'Belgique':[[50.6,4.7],['Berger belge malinois','Schipperke']],
    'Écosse':[[57,-4],['Golden Retriever','Border Collie']]
  };
  const map=L.map('dogMap',{worldCopyJump:true,minZoom:2,maxZoom:7}).setView([25,8],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  const icon=L.divIcon({className:'',html:'<span class="paw-marker">🐾</span>',iconSize:[36,36],iconAnchor:[18,18]});
  Object.entries(countries).forEach(([country,[coords,breeds]])=>L.marker(coords,{icon,title:country}).addTo(map).bindTooltip(country,{direction:'top'}).on('click',()=>{
    document.getElementById('countryTitle').textContent=country;
    const en=localStorage.getItem('dicopetsLanguage')==='en';document.getElementById('countryIntro').textContent=en?breeds.length+' breed'+(breeds.length>1?'s':'')+' to discover.':breeds.length+' race'+(breeds.length>1?'s':'')+' à découvrir.';
    document.getElementById('countryBreeds').innerHTML=breeds.map(name=>'<a href="dicochien.html?section=races&breed='+encodeURIComponent(name)+'">'+name+' →</a>').join('');
  }));
  const layout=document.createElement('style');layout.textContent='@media(min-width:900px){body{height:100vh;overflow:hidden}main.wrap{height:calc(100vh - 64px);display:grid;grid-template-columns:minmax(0,1fr) 330px;grid-template-rows:auto minmax(0,1fr);gap:18px;padding-bottom:22px}.hero{grid-column:1/-1;padding:24px 0 4px}.hero h1{font-size:clamp(38px,5vw,58px)}.hero p{margin:8px 0}.map{height:100%;min-height:430px}.result{margin:0;overflow:auto}}';document.head.appendChild(layout);
  const tr={'DicoPets · Carte DicoChien':'DicoPets · DicoDog map','← DicoChien':'← DicoDog','Crédits photos':'Photo credits','Communauté':'Community','Explorer les origines':'Explore origins','La planète des chiens.':'The world of dogs.','Zoome et clique sur une patte pour découvrir des races développées ou historiquement liées à cette région. Une race peut avoir une histoire internationale : la carte indique son origine généralement reconnue.':'Zoom and click a paw to discover breeds developed in or historically linked to that region. A breed may have an international history: the map shows its generally recognized origin.','Races liées à ce pays':'Breeds linked to this country','Choisis une patte sur la carte':'Choose a paw on the map','Les races apparaîtront ici.':'Breeds will appear here.'};const originals=new WeakMap();function walk(node,en){if(node.nodeType===3){if(!node.nodeValue.trim())return;if(!originals.has(node))originals.set(node,node.nodeValue);const fr=originals.get(node),key=fr.trim(),lead=fr.match(/^\s*/)[0],tail=fr.match(/\s*$/)[0];node.nodeValue=en?lead+(tr[key]||key)+tail:fr;return}node.childNodes.forEach(n=>walk(n,en))}function apply(){const en=lang.value==='en';localStorage.setItem('dicopetsLanguage',en?'en':'fr');document.documentElement.lang=en?'en':'fr';document.title=en?'World dog breed map · DicoPets':'Carte mondiale des races de chiens · DicoPets';walk(document.body,en)}lang.onchange=apply;apply();
})();

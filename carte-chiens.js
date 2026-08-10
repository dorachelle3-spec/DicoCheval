(() => {
  const countries={
    'Royaume-Uni':[[54,-2.5],['Labrador Retriever','Golden Retriever','Beagle','Border Collie','Cavalier King Charles Spaniel','Jack Russell Terrier','Cocker anglais','Otterhound']],
    'Allemagne':[[51.1,10.4],['Berger allemand','Rottweiler','Dobermann','Teckel standard','Eurasier']],
    'France':[[46.3,2.2],['Bouledogue français','Caniche standard']],
    'États-Unis':[[39,-98],['Berger australien','Chinook']],
    'Canada':[[56,-106],['Terre-Neuve']],
    'Suisse':[[46.8,8.2],['Bouvier bernois']],
    'Russie':[[61,90],['Husky sibérien']],
    'Mexique':[[23.6,-102.5],['Chihuahua','Xoloitzcuintle moyen']],
    'Japon':[[36.2,138.2],['Akita','Kai Ken']],
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
    'Belgique':[[50.6,4.7],['Berger belge malinois','Schipperke']],
    'Écosse':[[57,-4],['Golden Retriever','Border Collie']]
  };
  const map=L.map('dogMap',{worldCopyJump:true,minZoom:2,maxZoom:7}).setView([25,8],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  const icon=L.divIcon({className:'',html:'<span class="paw-marker">🐾</span>',iconSize:[36,36],iconAnchor:[18,18]});
  Object.entries(countries).forEach(([country,[coords,breeds]])=>L.marker(coords,{icon,title:country}).addTo(map).bindTooltip(country,{direction:'top'}).on('click',()=>{
    document.getElementById('countryTitle').textContent=country;
    document.getElementById('countryIntro').textContent=breeds.length+' race'+(breeds.length>1?'s':'')+' à découvrir.';
    document.getElementById('countryBreeds').innerHTML=breeds.map(name=>'<a href="dicochien.html?breed='+encodeURIComponent(name)+'">'+name+' →</a>').join('');
  }));
})();

(function () {
  const PROFILE_KEY='mansdarbs_industry_profile_v1', RECORDS_KEY='mansdarbs_industry_records_v1';
  const sectors=[
    {id:'agri',name:'Lauksaimniecība un mežsaimniecība',jobs:['Augkopība','Lopkopība','Biškopība','Mežsaimniecība','Lauksaimniecības pakalpojumi']},
    {id:'fishing',name:'Zvejniecība un akvakultūra',jobs:['Zvejniecība','Zivju audzēšana','Zivju apstrāde']},
    {id:'manufacturing',name:'Ražošana un amatniecība',jobs:['Pārtikas ražošana','Mēbeļu izgatavošana','Metālapstrāde','Tekstilizstrādājumi','3D drukāšana','Cita ražošana']},
    {id:'construction',name:'Būvniecība un būvniecības darbi',jobs:['Būvdarbi','Elektriķis','Santehniķis','Apdares darbi','Jumtu darbi','Projektēšana']},
    {id:'auto',name:'Auto tirdzniecība un remonts',jobs:['Lietotu auto tirgotājs','Jaunu auto tirgotājs','Auto komisijas tirdzniecība','Auto remonts','Auto rezerves daļu tirdzniecība','Auto noma']},
    {id:'transport',name:'Transports un loģistika',jobs:['Kravu pārvadājumi','Pasažieru pārvadājumi','Kurjers / piegāde','Transporta organizēšana','Noliktavas pakalpojumi']},
    {id:'beauty',name:'Skaistumkopšana un labsajūta',jobs:['Frizieris','Manikīrs / pedikīrs','Kosmetologs','Vizāžists','Skropstu / uzacu meistars','Masieris','Tetovētājs']},
    {id:'health',name:'Veselība un aprūpe',jobs:['Veselības aprūpe','Fizioterapija','Aprūpes pakalpojumi','Uztura konsultācijas','Citi veselības pakalpojumi']},
    {id:'education',name:'Izglītība un apmācība',jobs:['Privātskolotājs','Valodu pasniedzējs','Profesionālā apmācība','Kursu veidotājs','Instruktors']},
    {id:'digital',name:'Digitālie un radošie pakalpojumi',jobs:['Influenceris / satura veidotājs','Blogeris','YouTube / video veidotājs','Straumētājs','Programmētājs','Grafiskais dizainers','Fotogrāfs','Mārketinga pakalpojumi','Tekstu autors','Konsultants']},
    {id:'professional',name:'Profesionālie un konsultāciju pakalpojumi',jobs:['Grāmatvedis','Biznesa konsultants','Jurists','Tulks / tulkotājs','Projektu vadītājs','Citi profesionālie pakalpojumi']},
    {id:'realestate',name:'Nekustamais īpašums',jobs:['Nekustamā īpašuma izīrēšana','Starpniecība','Pārvaldīšana','Uzturēšana']},
    {id:'retail',name:'Mazumtirdzniecība un e-komercija',jobs:['Veikals','Internetveikals','Preču tālākpārdošana','Tirgus tirdzniecība','Lietotu preču tirdzniecība']},
    {id:'wholesale',name:'Vairumtirdzniecība',jobs:['Preču vairumtirdzniecība','Imports / eksports','Izplatīšana']},
    {id:'food',name:'Ēdināšana un pārtikas pakalpojumi',jobs:['Kafejnīca / restorāns','Ēdiena piegāde','Konditors','Ēdiena gatavošana pasākumiem','Pārtikas tirdzniecība']},
    {id:'accommodation',name:'Izmitināšana un tūrisms',jobs:['Viesu nams','Īstermiņa izmitināšana','Tūrisma pakalpojumi','Gidu pakalpojumi']},
    {id:'admin',name:'Administratīvie un biroja pakalpojumi',jobs:['Virtuālais asistents','Datu ievade','Zvanu centra pakalpojumi','Biroja atbalsts']},
    {id:'cleaning',name:'Uzkopšana un teritoriju uzturēšana',jobs:['Telpu uzkopšana','Logu mazgāšana','Teritoriju kopšana','Specializētā tīrīšana']},
    {id:'repair',name:'Remonts un individuālie pakalpojumi',jobs:['Sadzīves tehnikas remonts','Elektronikas remonts','Apavu / apģērbu remonts','Šūšana','Atslēdznieks','Citi meistara pakalpojumi']},
    {id:'finance',name:'Finanses un apdrošināšana',jobs:['Finanšu konsultācijas','Apdrošināšanas starpniecība','Citi finanšu pakalpojumi']},
    {id:'arts',name:'Māksla, izklaide un sports',jobs:['Mūziķis','Mākslinieks','Pasākumu organizēšana','Sporta treneris','Fitnesa instruktors','Izklaides pakalpojumi']},
    {id:'other',name:'Cita saimnieciskā darbība',jobs:['Cita darbība / vēl nav sarakstā']}
  ];
  const styles='.industry-wrap{margin:0 0 22px}.industry-profile{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.industry-profile .field{min-width:0}.industry-note{font-size:13px;color:var(--muted);margin:10px 0 0}.industry-module{margin-top:16px;padding:17px;border:1px solid var(--line);border-radius:15px;background:#fbfdfb}.industry-module h3{margin:0 0 6px}.industry-module .formgrid{margin-top:13px}.industry-list{margin-top:16px}.industry-list .record{align-items:flex-start}.industry-tag{display:inline-block;border-radius:999px;padding:3px 9px;background:var(--pale);color:var(--green);font-size:12px;font-weight:800}@media(max-width:680px){.industry-profile{grid-template-columns:1fr}.industry-module{padding:13px}}';
  const el=id=>document.getElementById(id);
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(_){return {}}};
  const getRecords=()=>{try{const v=JSON.parse(localStorage.getItem(RECORDS_KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return []}};
  function init(){
    if(!el('recordsView')||el('industryProfileTool'))return;
    const style=document.createElement('style');style.textContent=styles;document.head.appendChild(style);
    const html='<section class="tool industry-wrap" id="industryProfileTool"><div class="eyebrow">Uzskaite · darbības profils</div><h2>Pielāgo uzskaiti savai nozarei</h2><p class="muted">Izvēlies savu galveno darbības jomu un konkrēto nodarbošanos. Nozari vēlāk varēsi mainīt vai papildināt. Šis katalogs ir plašs sākuma saraksts, nevis oficiāla NACE kodu atlase.</p><div class="industry-profile"><div class="field"><label for="industrySector">Nozare</label><select id="industrySector"></select></div><div class="field"><label for="industryJob">Nodarbošanās</label><select id="industryJob"></select></div></div><p class="industry-note">Nozare palīdz pielāgot uzskaites laukus. Tā pati par sevi nenosaka nodokļu režīmu, PVN statusu vai VID pienākumus.</p><div id="industryModule"></div><div class="industry-list"><h3>Šīs nozares projekti un darījumi</h3><div id="industryEntries" class="empty">Šai nozarei vēl nav saglabātu ierakstu.</div></div></section>';
    el('uzskaite').insertAdjacentHTML('beforebegin',html);
    const sector=el('industrySector');
    sector.innerHTML=sectors.map(s=>'<option value="'+s.id+'">'+safe(s.name)+'</option>').join('');
    const profile=getProfile();sector.value=sectors.some(s=>s.id===profile.sector)?profile.sector:'digital';
    fillJobs(profile.job);
    sector.addEventListener('change',()=>{fillJobs('');saveProfile()});
    el('industryJob').addEventListener('change',saveProfile);
    renderModule();
  }
  function fillJobs(selected){
    const s=sectors.find(x=>x.id===el('industrySector').value)||sectors[0];
    el('industryJob').innerHTML=s.jobs.map(j=>'<option value="'+safe(j)+'">'+safe(j)+'</option>').join('');
    if(s.jobs.includes(selected))el('industryJob').value=selected;
  }
  function saveProfile(){localStorage.setItem(PROFILE_KEY,JSON.stringify({sector:el('industrySector').value,job:el('industryJob').value}));renderModule()}
  function renderModule(){
    const sector=el('industrySector')?.value,job=el('industryJob')?.value||'',root=el('industryModule');if(!root)return;
    if(sector==='digital'&&/Influenceris|Blogeris|YouTube|Straumētājs/.test(job)){
      root.innerHTML='<div class="industry-module"><span class="industry-tag">Satura veidotāju modulis</span><h3>Reklāmas sadarbība vai projekts</h3><p class="muted" style="font-size:13px">Uzskaiti katru sadarbību atsevišķi — arī komisijas, platformu izmaksas un barterus.</p><div class="formgrid"><div class="field"><label for="creatorClient">Pasūtītājs / zīmols</label><input id="creatorClient" maxlength="120" placeholder="Uzņēmuma nosaukums"></div><div class="field"><label for="creatorType">Sadarbības veids</label><select id="creatorType"><option>Reklāmas publikācija</option><option>Video / satura izveide</option><option>Ilgtermiņa sadarbība</option><option>Partneru komisija</option><option>Platformas izmaksāta atlīdzība</option><option>Barters / dāvana</option><option>Cits projekts</option></select></div><div class="field"><label for="creatorProject">Projekts / kampaņa</label><input id="creatorProject" maxlength="140" placeholder="Kampaņas nosaukums"></div><div class="field"><label for="creatorAmount">Atlīdzība (€)</label><input id="creatorAmount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00"></div><div class="field"><label for="creatorDate">Darījuma datums</label><input id="creatorDate" type="date"></div><div class="field"><label for="creatorStatus">Statuss</label><select id="creatorStatus"><option>Plānots</option><option>Izpildē</option><option>Rēķins izrakstīts</option><option>Apmaksāts</option><option>Barters saņemts</option></select></div><div class="field full"><label for="creatorDoc">Dokuments / piezīmes</label><input id="creatorDoc" maxlength="180" placeholder="Rēķina Nr., līgums, platformas pārskats u.c."></div></div><div class="actions" style="justify-content:flex-start"><button class="btn primary" type="button" onclick="saveIndustryEntry(\'creator\')">Saglabāt projektu</button></div></div>';
    }else if(sector==='auto'){
      root.innerHTML='<div class="industry-module"><span class="industry-tag">Auto tirdzniecības un remonta modulis</span><h3>Automašīnas darījuma uzskaite</h3><p class="muted" style="font-size:13px">Katram auto veido atsevišķu ierakstu. Saglabā VIN, iegādes un pārdošanas summas, izmaksas un dokumentu atsauces.</p><div class="formgrid"><div class="field"><label for="carAction">Ieraksta veids</label><select id="carAction"><option value="Iegāde">Automašīnas iegāde</option><option value="Pārdošana">Automašīnas pārdošana</option><option value="Izdevums">Remonts / cits izdevums</option><option value="Komisija">Komisijas darījums</option></select></div><div class="field"><label for="carDate">Datums</label><input id="carDate" type="date"></div><div class="field"><label for="carMake">Marka un modelis</label><input id="carMake" maxlength="100" placeholder="Piem., BMW 320d"></div><div class="field"><label for="carVin">VIN</label><input id="carVin" maxlength="24" placeholder="17 simbolu VIN, ja attiecas"></div><div class="field"><label for="carCounterparty">Pārdevējs / pircējs / serviss</label><input id="carCounterparty" maxlength="120" placeholder="Darījuma otra puse"></div><div class="field"><label for="carAmount">Darījuma summa (€)</label><input id="carAmount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00"></div><div class="field"><label for="carCost">Papildu izmaksas (€)</label><input id="carCost" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00"></div><div class="field"><label for="carDoc">Dokuments / atsauce</label><input id="carDoc" maxlength="180" placeholder="Pirkuma līgums, rēķins, remonta dokuments"></div></div><div class="actions" style="justify-content:flex-start"><button class="btn primary" type="button" onclick="saveIndustryEntry(\'car\')">Saglabāt auto darījumu</button></div><p class="industry-note">PVN, tostarp lietotu preču peļņas daļas režīms, jāizvērtē pēc konkrētā darījuma un tirgotāja statusa. Šis prototips pats nenosaka PVN piemērošanu.</p></div>';
    }else{
      root.innerHTML='<div class="industry-module"><span class="industry-tag">Nozares uzskaites profils</span><h3>'+safe(job||'Darbības uzskaite')+'</h3><p class="muted" style="font-size:13px">Šai nozarei pagaidām pieejama kopējā ienākumu, izdevumu un rēķinu uzskaite. Nākamajā izstrādes kārtā pievienosim tieši šai profesijai vajadzīgos laukus, dokumentus un pārbaudes.</p><div class="formgrid"><div class="field"><label for="generalActivity">Darba / pakalpojuma apraksts</label><input id="generalActivity" maxlength="140" placeholder="Ko sniedzi vai pārdevi?"></div><div class="field"><label for="generalCounterparty">Klients / darījuma partneris</label><input id="generalCounterparty" maxlength="120" placeholder="Nosaukums (nav obligāts)"></div></div><p class="industry-note">Pamatuzskaiti vari turpināt zemāk. Nozaru moduļi tiks papildināti pakāpeniski, neierobežojot platformu ar dažām profesijām.</p></div>';
    }
    renderIndustryEntries();
  }
  window.saveIndustryEntry=function(type){
    const val=id=>el(id)?.value?.trim()||'',num=id=>Math.max(0,Number(el(id)?.value||0)),profile=getProfile();
    const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),type,sector:el('industrySector').value,job:el('industryJob').value,date:val(type==='creator'?'creatorDate':'carDate')||new Date().toISOString().slice(0,10)};
    if(type==='creator'){
      item.counterparty=val('creatorClient');item.kind=val('creatorType');item.project=val('creatorProject');item.amount=num('creatorAmount');item.status=val('creatorStatus');item.document=val('creatorDoc');
      if(!item.counterparty||!item.project){alert('Norādi vismaz pasūtītāju un projekta nosaukumu.');return}
    }else{
      item.kind=val('carAction');item.vehicle=val('carMake');item.vin=val('carVin').toUpperCase();item.counterparty=val('carCounterparty');item.amount=num('carAmount');item.extraCost=num('carCost');item.document=val('carDoc');
      if(!item.vehicle){alert('Norādi automašīnas marku un modeli.');return}
      if(item.vin&&!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(item.vin)){alert('Pārbaudi VIN ievadi.');return}
    }
    const items=getRecords();items.push(item);
    try{localStorage.setItem(RECORDS_KEY,JSON.stringify(items))}catch(_){alert('Neizdevās saglabāt. Pārlūkā var nebūt pietiekami daudz vietas.');return}
    renderIndustryEntries();
    (type==='creator'?['creatorClient','creatorProject','creatorAmount','creatorDoc']:['carMake','carVin','carCounterparty','carAmount','carCost','carDoc']).forEach(id=>{if(el(id))el(id).value=''});
  };
  function renderIndustryEntries(){
    const root=el('industryEntries');if(!root)return;
    const items=getRecords().filter(x=>x.sector===el('industrySector')?.value);
    if(!items.length){root.innerHTML='<div class="empty">Šai nozarei vēl nav saglabātu projektu vai darījumu.</div>';return}
    root.innerHTML=items.slice().reverse().map(x=>{
      const title=x.type==='creator'?(x.project||x.kind):(x.vehicle||x.kind),amount=Number(x.amount||0);
      const detail=x.type==='creator'?[x.counterparty,x.kind,x.status].filter(Boolean).join(' · '):[x.kind,x.vin,x.counterparty].filter(Boolean).join(' · ');
      return '<div class="record"><div><strong>'+safe(title)+'</strong><small>'+safe(x.date)+' · '+safe(detail)+(x.document?' · '+safe(x.document):'')+'</small></div><div class="amount">'+amount.toLocaleString('lv-LV',{minimumFractionDigits:2,maximumFractionDigits:2})+' €</div></div>';
    }).join('');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
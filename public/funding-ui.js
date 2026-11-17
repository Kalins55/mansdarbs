(function(w){
'use strict';
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function group(matches){
 const a=(matches||[]).filter(x=>x.matchType==='sector_specific');
 return {direct:a.filter(x=>x.fitStatus==='potential_match'),review:a.filter(x=>x.fitStatus!=='potential_match'),general:(matches||[]).filter(x=>x.matchType!=='sector_specific')};
}
function date(v,lang){
 if(!v)return '';
 const d=new Date(v+'T00:00:00Z');if(!Number.isFinite(d.getTime()))return '';
 try{return new Intl.DateTimeFormat(lang==='en'?'en-GB':'lv-LV',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d);}catch(_){return v;}
}
function euro(v,lang,compact){
 if(typeof v!=='number'||!Number.isFinite(v))return '';
 try{return new Intl.NumberFormat(lang==='en'?'en-IE':'lv-LV',{style:'currency',currency:'EUR',maximumFractionDigits:0,...(compact?{notation:'compact'}:{})}).format(v);}catch(_){return Math.round(v)+' EUR';}
}
function renderCard(p,lang){
 const d=p.fundingDetails||{},loan=(p.supportTypes||[]).includes('loan');
 const status=lang==='en'?({open:'Applications open',upcoming:'Coming soon',ongoing:'Ongoing programme'}[p.status]||'Check status'):(p.statusLabel||'Statuss nav pārbaudīts');
 const support=loan?(lang==='en'?'Loan — repayable':'Aizdevums — jāatmaksā'):(lang==='en'?'Grant / support':'Grants / atbalsts');
 const fit=p.fitStatus==='potential_match'?(lang==='en'?'Matches profile criteria':'Atbilst profila kritērijiem'):(lang==='en'?'Eligibility needs checking':'Jāpārbauda atbilstība');
 let amount='';
 if(typeof d.applicantMaximum==='number')amount=(lang==='en'?'Up to ':'Līdz ')+euro(d.applicantMaximum,lang,false);
 else if(typeof d.maxAmount==='number')amount=(lang==='en'?'Up to ':'Līdz ')+euro(d.maxAmount,lang,false)+(loan?'':(lang==='en'?' per project':' vienam projektam'));
 else if(typeof d.totalPublicBudget==='number')amount=(lang==='en'?'Total programme budget: ':'Kopējais programmas budžets: ')+euro(d.totalPublicBudget,lang,true);
 const rate=typeof d.interestRateFrom==='number'?(lang==='en'?' · rate from ':' · likme no ')+String(d.interestRateFrom).replace('.',lang==='en'?'.':',')+'%':'';
 const deadline=date(p.deadline,lang),verified=date(p.lastVerifiedAt,lang);
 const review=p.manualReviewReason||'';
 const note=d.note||'';
 const source=p.sourceUrl?'<a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+(lang==='en'?'Programme details':'Programmas apraksts')+' ↗</a>':'';
 const apply=p.applicationUrl?'<a href="'+esc(p.applicationUrl)+'" target="_blank" rel="noopener noreferrer">'+(lang==='en'?'Apply':'Pieteikties')+' ↗</a>':'';
 return '<article class="funding-card"><div class="funding-tags"><span class="funding-tag funding-status">'+esc(status)+'</span><span class="funding-tag '+(loan?'funding-loan':'')+'">'+esc(support)+'</span><span class="funding-tag">'+esc(fit)+'</span></div>'+
 '<h4>'+esc(p.name)+'</h4><p class="funding-summary">'+esc(p.summary||'')+'</p>'+
 (amount?'<div class="funding-amount">'+esc(amount+rate)+'</div>':'')+
 (deadline?'<p class="funding-detail"><strong>'+(lang==='en'?'Deadline:':'Termiņš:')+'</strong> '+esc(deadline)+'</p>':'')+
 (note?'<p class="funding-note">'+esc(note)+'</p>':'')+
 (review?'<p class="funding-note"><strong>'+(lang==='en'?'Check:':'Jāpārbauda:')+'</strong> '+esc(review)+'</p>':'')+
 '<div class="funding-footer">'+esc(p.sourceName||'')+(verified?' · '+(lang==='en'?'checked ':'pārbaudīts ')+esc(verified):'')+
 '<div class="funding-links">'+source+(source&&apply?' · ':'')+apply+'</div></div></article>';
}
function groupHtml(title,items,lang){
 if(!items.length)return '';
 return '<section class="funding-group"><h3>'+esc(title)+'</h3><div class="funding-list">'+items.map(x=>renderCard(x,lang)).join('')+'</div></section>';
}
function render(profiles,matches,catalog,lang){
 if(!profiles||!profiles.length)return '<div class="funding-empty"><p>'+
 (lang==='en'?'Save your industry and activity in Records to find support relevant to your work.':'Saglabā savu nozari un darbības veidu sadaļā “Uzskaite”, lai atrastu savai darbībai piemērotas iespējas.')+
 '</p><p class="funding-privacy">'+(lang==='en'?'Your profile stays on this device. No account is required.':'Nozares profils paliek šajā ierīcē. Konts nav nepieciešams.')+'</p>'+
 '<button type="button" class="btn secondary funding-profile-button" data-funding-action="profile">'+(lang==='en'?'Add industry profile':'Pievienot nozares profilu')+'</button></div>';
 if(!matches||!matches.length)return '<div class="empty">'+(lang==='en'?'No matching opportunity was found in the starter catalogue.':'Sākotnējā katalogā atbilstoša iespēja netika atrasta.')+' <a href="https://liaa.business.gov.lv/" target="_blank" rel="noopener noreferrer">'+(lang==='en'?'Browse official support':'Skatīt oficiālo atbalstu')+' ↗</a></div>';
 const g=group(matches),checked=date(catalog&&catalog.updatedAt,lang);
 return groupHtml(lang==='en'?'Matches the industry profile':'Atbilst nozarei',g.direct,lang)+
 groupHtml(lang==='en'?'Potentially relevant — check eligibility':'Iespējams piemērots — jāpārbauda',g.review,lang)+
 groupHtml(lang==='en'?'General business support':'Vispārīgs atbalsts',g.general,lang)+
 '<p class="funding-catalog-note">'+(lang==='en'?'Starter catalogue, not a complete list. Confirm terms with the programme provider.':'Sākotnējais katalogs nav pilns saraksts. Pirms pieteikšanās pārbaudi nosacījumus pie programmas īstenotāja.')+
 (checked?' '+(lang==='en'?'Catalogue checked: ':'Kataloga pārbaudes datums: ')+esc(checked)+'.':'')+'</p>';
}
const api=Object.freeze({escapeHtml:esc,groupFundingMatches:group,renderCard:renderCard,renderFundingContent:render});
w.MansdarbsFundingUI=api;
if(!w.document)return;
const doc=w.document,box=doc.getElementById('fundingResults');if(!box)return;
const style=doc.createElement('style');
style.textContent='.funding-section{margin-top:22px}.funding-empty{background:#fff;border:1px solid var(--line);border-radius:16px;padding:17px}.funding-empty p{margin:0 0 9px;color:var(--muted);font-size:14px}.funding-empty .funding-privacy{font-size:12px}.funding-profile-button{width:auto;margin-top:5px}.funding-group{margin-top:14px}.funding-group h3{font-size:16px;margin:0 0 9px}.funding-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.funding-card{min-width:0;background:#fff;border:1px solid var(--line);border-radius:15px;padding:16px}.funding-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:9px}.funding-tag{border-radius:999px;padding:3px 8px;background:#f0f3f0;color:#4f5d55;font-size:11px;font-weight:800}.funding-status{background:#e8f3ec;color:var(--green)}.funding-loan{background:#fff3df;color:#805014}.funding-card h4{font-size:16px;line-height:1.3;margin:0 0 7px}.funding-summary{font-size:13px;color:var(--muted);margin:0 0 10px}.funding-amount{font-weight:850;font-size:14px;margin:8px 0}.funding-detail,.funding-note{font-size:12px;line-height:1.4;color:var(--muted);margin:7px 0 0}.funding-footer{display:flex;flex-direction:column;gap:7px;border-top:1px solid var(--line);margin-top:12px;padding-top:9px;font-size:11px;color:var(--muted)}.funding-links{display:flex;gap:8px;flex-wrap:wrap;font-size:12px}.funding-links a{font-weight:800;text-decoration:none}.funding-catalog-note{font-size:12px;color:var(--muted);margin:12px 0 0}@media(max-width:680px){.funding-section{margin-top:17px}.funding-list{grid-template-columns:1fr;gap:8px}.funding-card{padding:14px}.funding-group{margin-top:12px}.funding-card h4{font-size:15px}}';
doc.head.appendChild(style);
let catalog=null,matches=[],profiles=[];
function language(){return doc.documentElement.lang==='en'?'en':'lv';}
function paint(){box.innerHTML=render(profiles,matches,catalog,language());}
async function load(){
 const funding=w.MansdarbsFunding;
 if(!funding){box.textContent=language()==='en'?'Funding finder unavailable. Reload the page.':'Finansējuma meklētājs nav pieejams. Pārlādē lapu.';return;}
 try{
  profiles=funding.getLocalIndustryProfiles();
  if(!profiles.length){catalog=null;matches=[];paint();return;}
  catalog=await funding.loadFundingCatalog();
  const d=new Date(),today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  matches=funding.getLocalFundingMatches(catalog,{today:today});paint();
 }catch(_){box.innerHTML='<div class="empty">'+(language()==='en'?'Funding opportunities could not be loaded.':'Finansējuma iespējas neizdevās ielādēt.')+' <button type="button" class="textlink" data-funding-action="retry">'+(language()==='en'?'Retry':'Mēģināt vēlreiz')+'</button></div>';}
}
box.addEventListener('click',event=>{
 const button=event.target&&event.target.closest?event.target.closest('[data-funding-action]'):null;if(!button)return;
 if(button.dataset.fundingAction==='retry')load();
 if(button.dataset.fundingAction==='profile'){
  if(typeof w.showView==='function')w.showView('records');
  const section=doc.getElementById('industrySection');if(section){section.open=true;section.scrollIntoView({behavior:'smooth',block:'start'});}
 }
});
doc.addEventListener('mansdarbs:industry-profile-updated',load);
new MutationObserver(paint).observe(doc.documentElement,{attributes:true,attributeFilter:['lang']});
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',load,{once:true});else load();
})(typeof window!=='undefined'?window:globalThis);
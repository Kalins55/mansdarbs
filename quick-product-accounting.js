(function(){
'use strict';
const PRODUCTS_KEY='mansdarbs_quick_products_v1';
const SALES_KEY='mansdarbs_quick_sales_v1';
const mount=document.getElementById('quickProductAccountingMount');
if(!mount)return;
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?v:fallback}catch(_){return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}};
let products=read(PRODUCTS_KEY,[]);
let sales=read(SALES_KEY,[]);
const money=n=>new Intl.NumberFormat('lv-LV',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const localDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
mount.innerHTML=`
<style>
#quickProductAccountingMount .qpa{margin-top:16px;border:1px solid var(--line);border-radius:16px;padding:17px;background:#fbfdfb}
#quickProductAccountingMount .qpa h3{margin:0 0 5px;font-size:19px}
#quickProductAccountingMount .qpa p{margin:0 0 13px;color:var(--muted);font-size:14px}
#quickProductAccountingMount .qpa-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
#quickProductAccountingMount label{display:block;font-size:14px;font-weight:750;margin-bottom:6px}
#quickProductAccountingMount input{width:100%;min-width:0;border:1px solid #cbd8ce;border-radius:12px;padding:15px 12px;background:white;color:var(--ink);font-size:20px}
#quickProductAccountingMount .qpa-field{min-width:0}
#quickProductAccountingMount .qpa-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
#quickProductAccountingMount button{border:0;border-radius:12px;padding:14px 16px;font-size:17px;font-weight:800;cursor:pointer}
#quickProductAccountingMount .qpa-primary{background:var(--green);color:white;width:100%;min-height:54px}
#quickProductAccountingMount .qpa-secondary{background:#e9efea;color:var(--ink);font-size:14px;padding:7px 10px}
#quickProductAccountingMount .qpa-entry{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end;margin-top:14px}
#quickProductAccountingMount .qpa-result{margin-top:10px;padding:13px;border-radius:11px;background:#edf5ef;display:flex;justify-content:space-between;gap:10px;align-items:center;min-height:48px}
#quickProductAccountingMount .qpa-list{margin-top:12px}
#quickProductAccountingMount .qpa-row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}
#quickProductAccountingMount .qpa-muted{color:var(--muted);font-size:12px}
#quickProductAccountingMount .qpa-status{min-height:22px;margin-top:8px;color:var(--green);font-size:14px;font-weight:700}
#quickProductAccountingMount details{margin-top:16px;border-top:1px solid var(--line);padding-top:12px}
#quickProductAccountingMount summary{font-weight:750;cursor:pointer;padding:7px 0}
@media(max-width:600px){#quickProductAccountingMount .qpa-grid{grid-template-columns:1fr 1fr}}
</style>
<section class="qpa" aria-label="Ātrā produktu uzskaite">
<h3>Ātrā pārdošanas ievade</h3>
<p>Jāievada tikai produkta kods un daudzums. Pārējo aprēķina Mansdarbs.</p>
<div class="qpa-entry">
<div class="qpa-field"><label for="qpaSaleCode">1. Produkta kods</label><input id="qpaSaleCode" inputmode="numeric" autocomplete="off" placeholder="Piemēram, 1"></div>
<div class="qpa-field"><label for="qpaQty">2. Daudzums</label><input id="qpaQty" type="number" min="1" step="1" inputmode="numeric" value="1"></div>
</div>
<div class="qpa-result"><span id="qpaFound">Ievadi produkta kodu.</span><strong id="qpaTotal">—</strong></div>
<div class="qpa-muted" id="qpaUnitPrice"></div>
<div class="qpa-actions"><button type="button" class="qpa-primary" id="qpaAddSale">PIEVIENOT PĀRDOŠANU</button></div>
<div class="qpa-status" id="qpaStatus" role="status" aria-live="polite"></div>
<div class="qpa-list" id="qpaSales"></div>
<details><summary>Produktu iestatījumi (vadītājam)</summary>
<p>Pievieno katram produktam kodu, nosaukumu un cenu. Darbiniekam šī sadaļa nav jāizmanto.</p>
<div class="qpa-grid">
<div class="qpa-field"><label for="qpaCode">Produkta kods</label><input id="qpaCode" inputmode="numeric" maxlength="6" placeholder="1"></div>
<div class="qpa-field"><label for="qpaName">Produkta nosaukums</label><input id="qpaName" maxlength="70" placeholder="Saldējums"></div>
<div class="qpa-field"><label for="qpaPrice">Cena (€)</label><input id="qpaPrice" type="number" min="0" step="0.01" inputmode="decimal" placeholder="1.50"></div>
</div>
<div class="qpa-actions"><button type="button" class="qpa-primary" id="qpaSaveProduct">Saglabāt produktu</button></div>
<div class="qpa-list" id="qpaProducts"></div></details>
<div class="qpa-muted">Dati pagaidām glabājas tikai šajā ierīcē un pārlūkā.</div>
</section>
`;
const $=id=>mount.querySelector('#'+id);
function renderProducts(){
 $('qpaProducts').innerHTML=products.length?'<div class="qpa-muted">Produktu saraksts</div>'+products.slice().sort((a,b)=>Number(a.code)-Number(b.code)).map(p=>'<div class="qpa-row"><span><strong>'+esc(p.code)+'. '+esc(p.name)+'</strong></span><span>'+money(p.price)+' <button type="button" class="qpa-secondary" data-edit="'+esc(p.code)+'" style="padding:5px 8px">Labot</button></span></div>').join(''):'<div class="qpa-muted">Vēl nav pievienots neviens produkts.</div>';
}
function selected(){return products.find(p=>p.code===$('qpaSaleCode').value.trim())}
function updateTotal(){
 const p=selected(),qty=Math.max(0,Number($('qpaQty').value)||0);
 $('qpaFound').textContent=p?p.name:'Šāds produkta cipars nav atrasts.';
 $('qpaUnitPrice').textContent=p?money(p.price)+' / gab.':'';
 $('qpaTotal').textContent=p&&qty?money(p.price*qty):'—';
}
function renderSales(){
 const today=localDate(new Date());
 const todaysSales=sales.filter(s=>s.date===today);
 const total=todaysSales.reduce((sum,s)=>sum+s.total,0);
 const units=todaysSales.reduce((sum,s)=>sum+s.qty,0);
 const byProduct=new Map();
 todaysSales.forEach(s=>{
  const item=byProduct.get(s.code)||{code:s.code,name:s.name,qty:0,total:0};
  item.qty+=s.qty;item.total+=s.total;byProduct.set(s.code,item);
 });
 const productRows=[...byProduct.values()].sort((a,b)=>b.qty-a.qty||b.total-a.total).map(p=>'<div class="qpa-row"><span>'+esc(p.code)+'. '+esc(p.name)+' <span class="qpa-muted">× '+p.qty+'</span></span><strong>'+money(p.total)+'</strong></div>').join('');
 const lastToday=todaysSales[todaysSales.length-1];
 const undoButton=lastToday?'<div class="qpa-actions"><button type="button" class="qpa-secondary" id="qpaUndoSale">Atsaukt pēdējo pārdošanu</button></div>':'';
 $('qpaSales').innerHTML='<div class="qpa-row"><strong>Šodienas kopsavilkums</strong><strong>'+money(total)+'</strong></div><div class="qpa-muted">Pārdotās vienības: '+units+'</div>'+(productRows?'<div class="qpa-muted" style="margin-top:8px">Pa produktiem</div>'+productRows:'<div class="qpa-muted">Šodien pārdošanas ierakstu vēl nav.</div>')+undoButton+'<details><summary>Pēdējie pārdošanas ieraksti ('+todaysSales.length+')</summary>'+(todaysSales.length?todaysSales.slice(-8).reverse().map(s=>'<div class="qpa-row"><span>'+esc(s.code)+'. '+esc(s.name)+' × '+s.qty+' <span class="qpa-muted">'+esc(s.time)+'</span></span><strong>'+money(s.total)+'</strong></div>').join(''):'<div class="qpa-muted">Ierakstu nav.</div>')+'</details>';
}
$('qpaSaveProduct').addEventListener('click',()=>{
 const code=$('qpaCode').value.trim(),name=$('qpaName').value.trim(),price=Number($('qpaPrice').value);
 if(!/^\d{1,6}$/.test(code)||!name||$('qpaPrice').value===''||!Number.isFinite(price)||price<0){$('qpaStatus').textContent='Pārbaudi ciparu, nosaukumu un cenu.';return}
 const existing=products.find(p=>p.code===code);
 if(existing){existing.name=name;existing.price=price}else products.push({code,name,price});
 if(!save(PRODUCTS_KEY,products)){$('qpaStatus').textContent='Neizdevās saglabāt pārlūkprogrammā.';return}
 $('qpaStatus').textContent='Produkts saglabāts.';renderProducts();updateTotal();
});
$('qpaProducts').addEventListener('click',e=>{
 const b=e.target.closest('[data-edit]');if(!b)return;
 const p=products.find(x=>x.code===b.dataset.edit);if(!p)return;
 $('qpaCode').value=p.code;$('qpaName').value=p.name;$('qpaPrice').value=p.price;
 $('qpaCode').focus();
});
$('qpaSaleCode').addEventListener('input',updateTotal);
$('qpaQty').addEventListener('input',updateTotal);
function addSale(){
 const p=selected(),qty=Number($('qpaQty').value);
 if(!p){$('qpaStatus').textContent='Šāds kods nav atrasts. Pārbaudi kodu.';$('qpaSaleCode').focus();return}
 if(!Number.isInteger(qty)||qty<1){$('qpaStatus').textContent='Ievadi daudzumu, vismaz 1.';$('qpaQty').focus();return}
 const now=new Date(),record={code:p.code,name:p.name,qty,total:p.price*qty,time:now.toLocaleTimeString('lv-LV',{hour:'2-digit',minute:'2-digit'}),date:localDate(now)};
 sales.push(record);
 if(!save(SALES_KEY,sales)){sales.pop();$('qpaStatus').textContent='Neizdevās saglabāt. Mēģini vēlreiz.';return}
 $('qpaStatus').textContent='Saglabāts! Vari ievadīt nākamo produktu.';renderSales();$('qpaSaleCode').value='';$('qpaQty').value='1';updateTotal();$('qpaSaleCode').focus();
}
$('qpaSales').addEventListener('click',e=>{
 const button=e.target.closest('#qpaUndoSale');if(!button)return;
 const today=localDate(new Date());
 const last=sales.filter(item=>item.date===today).slice(-1)[0];
 if(!last)return;
 if(!window.confirm('Atsaukt pēdējo pārdošanas ierakstu?'))return;
 const index=sales.lastIndexOf(last);
 const removed=sales.splice(index,1)[0];
 if(!save(SALES_KEY,sales)){sales.splice(index,0,removed);$('qpaStatus').textContent='Neizdevās saglabāt izmaiņas. Ieraksts nav atsaukts.';return}
 $('qpaStatus').textContent='Pēdējais pārdošanas ieraksts atsaukts.';
 renderSales();
});
$('qpaAddSale').addEventListener('click',addSale);
$('qpaSaleCode').addEventListener('keydown',e=>{if(e.key==='Enter'){$('qpaQty').focus();$('qpaQty').select()}});
$('qpaQty').addEventListener('keydown',e=>{if(e.key==='Enter')addSale()});
renderProducts();renderSales();updateTotal();
})();
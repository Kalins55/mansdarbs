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
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
mount.innerHTML=`
<style>
#quickProductAccountingMount .qpa{margin-top:16px;border:1px solid var(--line);border-radius:16px;padding:17px;background:#fbfdfb}
#quickProductAccountingMount .qpa h3{margin:0 0 5px;font-size:19px}
#quickProductAccountingMount .qpa p{margin:0 0 13px;color:var(--muted);font-size:14px}
#quickProductAccountingMount .qpa-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
#quickProductAccountingMount label{display:block;font-size:13px;font-weight:750;margin-bottom:5px}
#quickProductAccountingMount input{width:100%;min-width:0;border:1px solid #d5ded7;border-radius:10px;padding:10px;background:white;color:var(--ink)}
#quickProductAccountingMount .qpa-field{min-width:0}
#quickProductAccountingMount .qpa-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
#quickProductAccountingMount button{border:0;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}
#quickProductAccountingMount .qpa-primary{background:var(--green);color:white}
#quickProductAccountingMount .qpa-secondary{background:#e9efea;color:var(--ink)}
#quickProductAccountingMount .qpa-entry{display:grid;grid-template-columns:90px 1fr 100px;gap:9px;align-items:end;margin-top:14px}
#quickProductAccountingMount .qpa-result{margin-top:10px;padding:12px;border-radius:11px;background:#edf5ef;display:flex;justify-content:space-between;gap:10px;align-items:center}
#quickProductAccountingMount .qpa-list{margin-top:12px}
#quickProductAccountingMount .qpa-row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}
#quickProductAccountingMount .qpa-muted{color:var(--muted);font-size:12px}
#quickProductAccountingMount .qpa-status{min-height:20px;margin-top:8px;color:var(--green);font-size:13px}
@media(max-width:600px){#quickProductAccountingMount .qpa-grid{grid-template-columns:1fr 1fr}#quickProductAccountingMount .qpa-entry{grid-template-columns:75px 1fr}#quickProductAccountingMount .qpa-entry .qpa-field:last-child{grid-column:1/-1}}
</style>
<section class="qpa" aria-label="Ātrā produktu uzskaite">
<h3>⚡ Ātrā produktu uzskaite</h3>
<p>Katram produktam piešķir ciparu un cenu. Pēc tam pārdošanai pietiek ievadīt ciparu un daudzumu.</p>
<div class="qpa-grid">
<div class="qpa-field"><label for="qpaCode">Produkta cipars</label><input id="qpaCode" inputmode="numeric" maxlength="6" placeholder="1"></div>
<div class="qpa-field"><label for="qpaName">Produkta nosaukums</label><input id="qpaName" maxlength="70" placeholder="Saldējums"></div>
<div class="qpa-field"><label for="qpaPrice">Cena (€)</label><input id="qpaPrice" type="number" min="0" step="0.01" inputmode="decimal" placeholder="1.50"></div>
</div>
<div class="qpa-actions"><button type="button" class="qpa-primary" id="qpaSaveProduct">Saglabāt produktu</button></div>
<div class="qpa-list" id="qpaProducts"></div>
<div class="qpa-entry">
<div class="qpa-field"><label for="qpaSaleCode">Produkta cipars</label><input id="qpaSaleCode" inputmode="numeric" placeholder="1"></div>
<div class="qpa-field"><label for="qpaQty">Daudzums</label><input id="qpaQty" type="number" min="1" step="1" inputmode="numeric" value="1"></div>
<div class="qpa-field"><label>Kopā</label><div class="qpa-result" style="margin:0;min-height:42px"><strong id="qpaTotal">—</strong></div></div>
</div>
<div class="qpa-result"><span id="qpaFound">Ievadi produkta ciparu.</span><strong id="qpaUnitPrice"></strong></div>
<div class="qpa-actions"><button type="button" class="qpa-primary" id="qpaAddSale">Pievienot pārdošanu</button></div>
<div class="qpa-status" id="qpaStatus" role="status" aria-live="polite"></div>
<div class="qpa-list" id="qpaSales"></div>
<div class="qpa-muted">Produktu saraksts un pārdošanas ieraksti tiek glabāti tikai šajā pārlūkprogrammā. Tie netiek nosūtīti uz serveri.</div>
</section>`;
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
 const total=sales.reduce((sum,s)=>sum+s.total,0);
 $('qpaSales').innerHTML='<div class="qpa-row"><strong>Šodienas ievadītie ieraksti</strong><strong>'+money(total)+'</strong></div>'+(sales.length?sales.slice(-8).reverse().map(s=>'<div class="qpa-row"><span>'+esc(s.code)+'. '+esc(s.name)+' × '+s.qty+' <span class="qpa-muted">'+esc(s.time)+'</span></span><strong>'+money(s.total)+'</strong></div>').join(''):'<div class="qpa-muted">Pārdošanas ierakstu vēl nav.</div>');
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
$('qpaAddSale').addEventListener('click',()=>{
 const p=selected(),qty=Number($('qpaQty').value);
 if(!p||!Number.isInteger(qty)||qty<1){$('qpaStatus').textContent='Ievadi derīgu produkta ciparu un veselu daudzumu.';return}
 const now=new Date(),record={code:p.code,name:p.name,qty,total:p.price*qty,time:now.toLocaleTimeString('lv-LV',{hour:'2-digit',minute:'2-digit'}),date:now.toISOString().slice(0,10)};
 sales.push(record);
 if(!save(SALES_KEY,sales)){sales.pop();$('qpaStatus').textContent='Neizdevās saglabāt pārdošanas ierakstu.';return}
 $('qpaStatus').textContent='Pārdošana pievienota.';renderSales();$('qpaSaleCode').value='';$('qpaQty').value='1';updateTotal();
});
renderProducts();renderSales();updateTotal();
})();
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'funding-ui.js'),'utf8');
const ui=new Function('window',source+'; return window.MansdarbsFundingUI;')({});
function item(overrides={}){return {id:'test',name:'Nozares atbalsts',summary:'Atbalsts ieguldījumiem.',sourceName:'LAD',sourceUrl:'https://example.test/info',applicationUrl:'https://example.test/apply',matchType:'sector_specific',fitStatus:'needs_more_info',supportTypes:['grant'],supportTypeLabels:['Grants'],status:'open',statusLabel:'Atvērta pieteikšanās',deadline:'2026-12-09',lastVerifiedAt:'2026-11-17',manualReviewReason:'Jāpārbauda izmaksas.',fundingDetails:{totalPublicBudget:30500000,note:'Kopējais publiskais budžets.'},...overrides};}
test('matches are grouped into direct, review and general support',()=>{const g=ui.groupFundingMatches([item({fitStatus:'potential_match'}),item(),item({matchType:'cross_sector'})]);assert.equal(g.direct.length,1);assert.equal(g.review.length,1);assert.equal(g.general.length,1);});
test('total programme budgets are clearly distinguished from applicant awards',()=>{const h=ui.renderCard(item(),'lv');assert.match(h,/Kopējais programmas budžets/);assert.match(h,/Kopējais publiskais budžets/);assert.match(h,/Jāpārbauda atbilstība/);});
test('repayable loans and their interest rate are clear',()=>{const h=ui.renderCard(item({supportTypes:['loan'],supportTypeLabels:['Aizdevums — jāatmaksā'],fundingDetails:{maxAmount:250000,interestRateFrom:4.9}}),'lv');assert.match(h,/Aizdevums — jāatmaksā/);assert.match(h,/likme no 4,9%/);});
test('no-profile state explains local storage and no-account use',()=>{const h=ui.renderFundingContent([],[],null,'lv');assert.match(h,/Pievienot nozares profilu/);assert.match(h,/Konts nav nepieciešams/);});
test('programme text is escaped',()=>{const h=ui.renderCard(item({name:'<img src=x onerror=alert(1)>'}),'lv');assert.doesNotMatch(h,/<img src=x/);assert.match(h,/&lt;img/);});

test('mixed grant and non-financial support types are both displayed',()=>{const h=ui.renderCard(item({id:'nostradamus-open-call-1-2026',supportTypes:['grant','non_financial'],supportTypeLabels:['Grants','Nefinansiāls atbalsts']}),'lv');assert.match(h,/Grants/);assert.match(h,/Nefinansiāls atbalsts/);});

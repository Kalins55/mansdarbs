/* Mansdarbs context engine v1.
   User-controlled needs profile; stored only in this browser. No analytics or network calls. */
(function () {
  'use strict';
  const KEY = 'mansdarbs_context_profile_v1';
  const root = document.getElementById('homeView');
  if (!root || document.getElementById('contextProfile')) return;

  const en = () => document.documentElement.lang === 'en';
  const tr = (lv, english) => en() ? english : lv;
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || 'null');
      return value && typeof value === 'object' ? value : null;
    } catch (_) { return null; }
  };
  let profile = read();

  const stages = [
    ['planning', 'Vēl tikai plānoju sākt', 'I am planning to start'],
    ['informal', 'Jau strādāju, bet neesmu reģistrējis darbību', 'I already work, but have not registered'],
    ['registered', 'Esmu reģistrēts pašnodarbinātais', 'I am registered as self-employed'],
    ['company', 'Man ir uzņēmums (SIA vai cita forma)', 'I have a company (SIA or other form)']
  ];
  const needs = [
    ['registration', 'Darbības reģistrēšana', 'Registering my activity'],
    ['tax', 'Nodokļi un aprēķini', 'Taxes and calculations'],
    ['records', 'Ienākumu un izdevumu uzskaite', 'Income and expense tracking'],
    ['invoices', 'Rēķinu izrakstīšana', 'Creating invoices'],
    ['vat', 'PVN pienākumi', 'VAT obligations'],
    ['permits', 'Atļaujas un nozares prasības', 'Permits and industry rules'],
    ['employees', 'Darbinieki un algas', 'Employees and payroll']
  ];

  const style = document.createElement('style');
  style.textContent = `
    .context-engine{margin:18px 0 24px;padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--surface)}
    .context-engine h2{font-size:19px;margin:0 0 6px}
    .context-engine p{margin:5px 0;color:var(--muted);font-size:14px}
    .context-engine__toggle{margin-top:12px}
    .context-engine__form{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
    .context-engine__form[hidden],.context-engine__result[hidden]{display:none}
    .context-engine__result{margin-top:14px;padding:13px;border-radius:12px;background:var(--pale);color:var(--text)}
    .context-engine__result strong{display:block;margin-bottom:5px}
    .context-engine__actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
    .context-engine__privacy{font-size:12px!important}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'context-engine';
  section.id = 'contextProfile';
  section.innerHTML = `
    <div class="eyebrow">${tr('Tavs nākamais solis','Your next step')}</div>
    <h2>${tr('Mansdarbs pielāgojas tavai situācijai','Mansdarbs adapts to your situation')}</h2>
    <p>${tr('Atbildi uz diviem īsiem jautājumiem, lai redzētu sev atbilstošāku palīdzību. Konts nav vajadzīgs.','Answer two quick questions to see more relevant guidance. No account needed.')}</p>
    <button type="button" class="btn secondary context-engine__toggle" id="contextToggle">${profile ? tr('Mainīt manu situāciju','Update my situation') : tr('Pielāgot Mansdarbs','Personalise Mansdarbs')}</button>
    <div class="context-engine__form" id="contextForm" hidden>
      <div class="field">
        <label for="contextStage">${tr('Kur tu pašlaik esi?','Where are you right now?')}</label>
        <select id="contextStage">${stages.map(x => `<option value="${x[0]}">${tr(x[1],x[2])}</option>`).join('')}</select>
      </div>
      <div class="field" style="margin-top:12px">
        <label for="contextNeed">${tr('Kas tev šobrīd ir svarīgākais?','What matters most to you right now?')}</label>
        <select id="contextNeed">${needs.map(x => `<option value="${x[0]}">${tr(x[1],x[2])}</option>`).join('')}</select>
      </div>
      <div class="context-engine__actions">
        <button type="button" class="btn primary" id="contextSave">${tr('Saglabāt un parādīt nākamo soli','Save and show my next step')}</button>
        <button type="button" class="btn secondary" id="contextCancel">${tr('Atcelt','Cancel')}</button>
        <button type="button" class="btn secondary" id="contextDelete">${tr('Dzēst manu profilu','Delete my profile')}</button>
      </div>
      <p class="context-engine__privacy">${tr('Atbildes tiek saglabātas tikai šajā pārlūkā. Tās netiek sūtītas serverim un netiek izmantotas apmeklējumu analītikā.','Your answers are stored only in this browser. They are not sent to a server or used for visit analytics.')}</p>
    </div>
    <div class="context-engine__result" id="contextResult" aria-live="polite" hidden></div>`;
  const guide = root.querySelector('#guide');
  const audience = root.querySelector('.audience');
  if (audience) audience.insertAdjacentElement('afterend', section);
  else if (guide) guide.insertAdjacentElement('beforebegin', section);
  else root.appendChild(section);

  const stageEl = section.querySelector('#contextStage');
  const needEl = section.querySelector('#contextNeed');
  const form = section.querySelector('#contextForm');
  const result = section.querySelector('#contextResult');
  const toggle = section.querySelector('#contextToggle');

  function recommendation(p) {
    const stage = stages.find(x => x[0] === p.stage) || stages[0];
    const need = needs.find(x => x[0] === p.need) || needs[0];
    const copy = {
      planning: {
        registration: ['Sāc ar piemērotas darbības formas un reģistrācijas ceļa noskaidrošanu. Pēc tam pārbaudi savas nozares prasības.','Start by choosing an appropriate business form and understanding the registration route. Then check the rules for your industry.','guide'],
        tax: ['Pirms darbības sākšanas iepazīsti nodokļu režīmus un to atšķirības. Mansdarbs sadaļā Aprēķini vari apskatīt orientējošos aprēķinus.','Before starting, learn how the tax regimes differ. The Calculators section provides indicative estimates.','calculator'],
        records: ['Sāc ar vienkāršu ienākumu un izdevumu uzskaiti. Ierakstus vari izmēģināt bez konta izveides.','Start with simple income and expense tracking. You can try the records tool without creating an account.','records'],
        invoices: ['Iepazīsties ar rēķina obligātajiem rekvizītiem un sagatavo savu pirmo rēķina veidni.','Learn which details an invoice must contain and prepare your first invoice template.','records'],
        vat: ['Noskaidro, vai tavai plānotajai darbībai var rasties PVN reģistrācijas pienākums. Pārbaudi aktuālos VID nosacījumus.','Check whether your planned activity could trigger VAT registration and verify the current VID rules.','guide'],
        permits: ['Pirms darba sākšanas pārbaudi savas nozares atļaujas, reģistrācijas un kvalifikācijas prasības.','Before starting, check the permits, registrations and qualification rules for your industry.','guide'],
        employees: ['Ja plāno pieņemt darbiniekus, vispirms noskaidro darba devēja reģistrācijas, darba līgumu un algu nodokļu pienākumus.','If you plan to hire, first check employer registration, employment contract and payroll tax obligations.','guide']
      },
      informal: {
        registration: ['Nākamais solis ir noskaidrot, kā reģistrēt jau uzsāktu saimniecisko darbību un kā sakārtot līdzšinējos darījumus.','Next, find out how to register an activity you have already started and how to organise previous transactions.','guide'],
        tax: ['Pārbaudi, kurš nodokļu režīms atbilst tavai situācijai, un sāc plānot VSAOI un IIN.','Check which tax regime fits your situation and start planning social contributions and personal income tax.','calculator'],
        records: ['Sāc fiksēt visus ieņēmumus un ar darbu saistītos izdevumus, saglabājot pamatojošos dokumentus.','Start recording all income and work-related expenses, keeping supporting documents.','records'],
        invoices: ['Sakārto rēķinu izrakstīšanu un dokumentus par jau sniegtajiem pakalpojumiem vai pārdotajām precēm.','Set up invoicing and documentation for services already provided or goods already sold.','records'],
        vat: ['Pārbaudi apgrozījumu, darījumu veidus un PVN reģistrācijas nosacījumus VID.','Check your turnover, transaction types and VAT registration requirements with VID.','guide'],
        permits: ['Pārbaudi, vai tavai faktiskajai darbībai vajadzīga nozares reģistrācija, atļauja vai kvalifikācija.','Check whether your actual activity requires industry registration, a permit or a qualification.','guide'],
        employees: ['Pirms piesaisti darbiniekus, sakārto darba devēja pienākumus un algu uzskaiti.','Before hiring, set up employer obligations and payroll records.','guide']
      },
      registered: {
        registration: ['Pārbaudi, vai VID reģistrētie darbības veidi un faktiskā darbība joprojām sakrīt.','Check that your VID-registered activity codes still match what you actually do.','guide'],
        tax: ['Pārskati ceturkšņa VSAOI un gada IIN prognozi, izmantojot savus faktiskos ienākumus un izdevumus.','Review quarterly social contributions and your annual income tax estimate using your actual income and expenses.','calculator'],
        records: ['Regulāri salīdzini ienākumu un izdevumu ierakstus ar bankas kontu un saglabātajiem dokumentiem.','Regularly reconcile income and expense records with your bank account and supporting documents.','records'],
        invoices: ['Pārbaudi, vai rēķinos ir visi nepieciešamie rekvizīti un vai numuri neatkārtojas.','Check that invoices contain the required details and that invoice numbers are unique.','records'],
        vat: ['Pārbaudi savu PVN statusu un to, vai nav mainījušies reģistrācijas vai deklarēšanas pienākumi.','Review your VAT status and check whether registration or filing obligations have changed.','guide'],
        permits: ['Pārbaudi, vai visas nozares atļaujas un reģistrācijas ir spēkā un atbilst faktiskajai darbībai.','Check that industry permits and registrations remain valid and match your actual activity.','guide'],
        employees: ['Pārskati darba līgumus, darba laika uzskaiti un algu nodokļu iesniegšanas termiņus.','Review employment contracts, working-time records and payroll filing deadlines.','guide']
      },
      company: {
        registration: ['Pārbaudi uzņēmuma reģistrācijas datus, darbības veidus un faktiskās struktūrvienības.','Review company registration details, business activities and actual operating locations.','guide'],
        tax: ['Sāc ar uzņēmuma nodokļu kalendāru un atsevišķu uzņēmuma un privāto finanšu uzskaiti.','Start with a company tax calendar and separate company and personal financial records.','calculator'],
        records: ['Pārliecinies, ka uzņēmuma darījumi tiek uzskaitīti atbilstoši tā grāmatvedības kārtībai.','Ensure company transactions are recorded under the applicable accounting procedures.','records'],
        invoices: ['Pārbaudi uzņēmuma rekvizītus, PVN statusu un rēķinu numerācijas kārtību.','Check company details, VAT status and invoice numbering.','records'],
        vat: ['Pārbaudi uzņēmuma PVN reģistrāciju, deklarāciju termiņus un darījumu veidus.','Review company VAT registration, return deadlines and transaction types.','guide'],
        permits: ['Pārbaudi, vai uzņēmumam un tā darbības vietām ir visas nepieciešamās nozares atļaujas.','Check that the company and its operating locations hold all required industry permits.','guide'],
        employees: ['Sakārto darba devēja pienākumu, darba laika un algu uzskaites procesu.','Set up employer obligations, working-time and payroll processes.','guide']
      }
    };
    return {stage: tr(stage[1],stage[2]), need: tr(need[1],need[2]), message: copy[p.stage]?.[p.need] || copy.planning.registration};
  }

  function readIndustryProfile() {
    try {
      const value = JSON.parse(localStorage.getItem('mansdarbs_industry_profile_v1') || 'null');
      if (!value || typeof value !== 'object' || typeof value.sector !== 'string' || typeof value.job !== 'string') return null;
      return value;
    } catch (_) { return null; }
  }

  const sectorNames = {
    digital:['Digitālie un radošie pakalpojumi','Digital and creative services'],
    repair:['Remonts un individuālie pakalpojumi','Repair and personal services'],
    auto:['Auto tirdzniecība un remonts','Vehicle sales and repair'],
    agri:['Lauksaimniecība un mežsaimniecība','Agriculture and forestry'],
    fishing:['Zvejniecība un akvakultūra','Fishing and aquaculture'],
    manufacturing:['Ražošana un amatniecība','Manufacturing and crafts'],
    construction:['Būvniecība un būvniecības darbi','Construction and building work'],
    transport:['Transports un loģistika','Transport and logistics'],
    beauty:['Skaistumkopšana un labsajūta','Beauty and wellness'],
    health:['Veselība un aprūpe','Health and care'],
    education:['Izglītība un apmācība','Education and training'],
    professional:['Profesionālie un konsultāciju pakalpojumi','Professional and consulting services'],
    realestate:['Nekustamais īpašums','Real estate'],
    retail:['Mazumtirdzniecība un e-komercija','Retail and e-commerce'],
    wholesale:['Vairumtirdzniecība','Wholesale'],
    food:['Ēdināšana un pārtikas pakalpojumi','Food and catering services'],
    accommodation:['Izmitināšana un tūrisms','Accommodation and tourism'],
    admin:['Administratīvie un biroja pakalpojumi','Administrative and office services'],
    cleaning:['Uzkopšana un teritoriju uzturēšana','Cleaning and grounds maintenance'],
    finance:['Finanses un apdrošināšana','Finance and insurance'],
    arts:['Māksla, izklaide un sports','Arts, entertainment and sports'],
    other:['Cita saimnieciskā darbība','Other business activity']
  };

  function showResult(p) {
    const rec = recommendation(p);
    const message = en() ? rec.message[1] : rec.message[0];
    const action = rec.message[2];
    const industry = readIndustryProfile();
    result.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = tr('Ieteicamais nākamais solis','Your suggested next step');
    const details = document.createElement('p');
    details.textContent = message;
    const meta = document.createElement('p');
    meta.className = 'context-engine__privacy';
    meta.textContent = tr('Tava situācija: ','Your situation: ') + rec.stage + ' · ' + rec.need;
    result.append(strong,details,meta);

    const industryNote = document.createElement('p');
    industryNote.className = 'context-engine__privacy';
    if (industry) {
      const sector = sectorNames[industry.sector];
      industryNote.textContent = tr('Nozares profils: ','Industry profile: ') +
        (sector ? (en() ? sector[1] : sector[0]) : industry.sector) + ' · ' + industry.job;
    } else {
      industryNote.textContent = tr(
        'Vēl neesi pievienojis nozares profilu. Tas palīdzēs pielāgot uzskaites laukus tavai darbībai.',
        'You have not added an industry profile yet. It helps tailor record fields to your activity.'
      );
    }
    result.append(industryNote);

    const actions = document.createElement('div');
    actions.className = 'context-engine__actions';
    const go = document.createElement('button');
    go.type = 'button'; go.className = 'btn primary';
    go.textContent = action === 'calculator' ? tr('Atvērt aprēķinus','Open calculators') : action === 'records' ? tr('Atvērt uzskaiti','Open records') : tr('Atvērt sākšanas ceļvedi','Open the getting-started guide');
    go.addEventListener('click', () => {
      if (action === 'calculator') window.showView('calculator');
      else if (action === 'records') window.showAccounting ? window.showAccounting() : window.showView('records');
      else window.showGuide();
    });
    const industryButton = document.createElement('button');
    industryButton.type = 'button'; industryButton.className = 'btn secondary';
    industryButton.textContent = industry ? tr('Atvērt nozares uzskaiti','Open industry records') : tr('Pievienot nozares profilu','Add industry profile');
    industryButton.addEventListener('click', () => {
      if (window.showAccounting) window.showAccounting();
      else if (window.showView) window.showView('records');
    });
    const edit = document.createElement('button');
    edit.type = 'button'; edit.className = 'btn secondary';
    edit.textContent = tr('Mainīt atbildes','Change answers');
    edit.addEventListener('click', () => { form.hidden = false; stageEl.value = p.stage; needEl.value = p.need; });
    actions.append(go,industryButton,edit);
    result.append(actions);
    result.hidden = false;
    toggle.textContent = tr('Mainīt manu situāciju','Update my situation');
  }

  document.addEventListener('mansdarbs:industry-profile-updated', () => {
    if (profile && stages.some(x => x[0] === profile.stage) && needs.some(x => x[0] === profile.need)) {
      showResult(profile);
    }
  });

  toggle.addEventListener('click', () => {
    form.hidden = !form.hidden;
    if (!form.hidden && profile) { stageEl.value = profile.stage; needEl.value = profile.need; }
  });
  section.querySelector('#contextCancel').addEventListener('click', () => { form.hidden = true; });
  section.querySelector('#contextDelete').addEventListener('click', () => {
    try { localStorage.removeItem(KEY); } catch (_) {}
    profile = null; result.hidden = true; form.hidden = true;
    stageEl.value = 'planning'; needEl.value = 'registration';
    toggle.textContent = tr('Pielāgot Mansdarbs','Personalise Mansdarbs');
  });
  section.querySelector('#contextSave').addEventListener('click', () => {
    const next = {stage: stageEl.value, need: needEl.value, updatedAt: new Date().toISOString()};
    try { localStorage.setItem(KEY, JSON.stringify(next)); }
    catch (_) { alert(tr('Neizdevās saglabāt atbildes šajā pārlūkā.','Could not save your answers in this browser.')); return; }
    profile = next;
    form.hidden = true;
    showResult(profile);
  });

  function refreshLanguage() {
    const saved = profile;
    const wasOpen = !form.hidden;
    section.querySelector('.eyebrow').textContent = tr('Tavs nākamais solis','Your next step');
    section.querySelector('h2').textContent = tr('Mansdarbs pielāgojas tavai situācijai','Mansdarbs adapts to your situation');
    section.querySelector('p').textContent = tr('Atbildi uz diviem īsiem jautājumiem, lai redzētu sev atbilstošāku palīdzību. Konts nav vajadzīgs.','Answer two quick questions to see more relevant guidance. No account needed.');
    toggle.textContent = saved ? tr('Mainīt manu situāciju','Update my situation') : tr('Pielāgot Mansdarbs','Personalise Mansdarbs');
    stageEl.innerHTML = stages.map(x => `<option value="${x[0]}">${tr(x[1],x[2])}</option>`).join('');
    needEl.innerHTML = needs.map(x => `<option value="${x[0]}">${tr(x[1],x[2])}</option>`).join('');
    if (saved) { stageEl.value = saved.stage; needEl.value = saved.need; }
    form.hidden = !wasOpen;
    if (saved) showResult(saved);
  }
  const observer = new MutationObserver(refreshLanguage);
  observer.observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  if (profile && stages.some(x => x[0] === profile.stage) && needs.some(x => x[0] === profile.need)) showResult(profile);
  if (profile && (!stages.some(x => x[0] === profile.stage) || !needs.some(x => x[0] === profile.need))) profile = null;
})();
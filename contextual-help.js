/* Contextual help: activated only after a repeated form error or a real save failure.
   No analytics, profiling, or network requests. */
(function () {
  'use strict';

  const attempts = Object.create(null);
  let panel;
  let expanded = false;

  const copy = {
    records: {
      lv: 'Pārbaudi, vai summa ir lielāka par 0 un vai izvēlēts datums. Apraksts nav obligāts.',
      en: 'Check that the amount is greater than 0 and that a date is selected. The description is optional.'
    },
    sia: {
      lv: 'Pārbaudi, vai izvēlēts datums, ievadīts darījuma apraksts un summa bez PVN ir lielāka par 0.',
      en: 'Check that a date and transaction description are entered, and that the amount excluding VAT is greater than 0.'
    },
    invoice: {
      lv: 'Rēķinā obligāti vajadzīgs izrakstītājs, saņēmējs, pakalpojuma vai preces apraksts, derīgs daudzums un cena, kā arī rēķina numurs un datums.',
      en: 'An invoice needs an issuer, recipient, service or product description, a valid quantity and price, plus an invoice number and date.'
    },
    storage: {
      lv: 'Pārlūks neļāva saglabāt datus. Pārbaudi, vai ierīcē ir brīva vieta un vai pārlūks neatļauj vietņu datu glabāšanu privātuma režīmā. Pirms lapas aizvēršanas nokopē svarīgo informāciju.',
      en: 'The browser could not save the data. Check available device storage and whether browser privacy settings block website storage. Copy any important information before closing the page.'
    }
  };

  function text(lv, en) {
    return document.documentElement.lang === 'en' ? en : lv;
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'mansdarbsContextHelp';
    panel.className = 'md-context-help';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.setAttribute('aria-label', text('Papildu palīdzība', 'Additional help'));
    panel.innerHTML =
      '<div class="md-context-help__copy">' +
        '<strong class="md-context-help__title"></strong>' +
        '<p class="md-context-help__message"></p>' +
      '</div>' +
      '<div class="md-context-help__actions">' +
        '<button type="button" class="md-context-help__accept"></button>' +
        '<button type="button" class="md-context-help__later"></button>' +
      '</div>';
    document.body.appendChild(panel);
    panel.querySelector('.md-context-help__accept').addEventListener('click', function () {
      expanded = true;
      panel.querySelector('.md-context-help__title').textContent =
        text('Pamēģināsim soli pa solim', 'Let’s go through it step by step');
      panel.querySelector('.md-context-help__message').textContent = panel.dataset.helpText || '';
      panel.querySelector('.md-context-help__accept').hidden = true;
      panel.querySelector('.md-context-help__later').textContent = text('Aizvērt', 'Close');
      panel.querySelector('.md-context-help__later').focus();
    });
    panel.querySelector('.md-context-help__later').addEventListener('click', function () {
      panel.hidden = true;
      expanded = false;
      panel.querySelector('.md-context-help__accept').hidden = false;
    });
    return panel;
  }

  window.mansdarbsHelpFailure = function (type) {
    if (!copy[type]) return;
    attempts[type] = (attempts[type] || 0) + 1;
    if (type !== 'storage' && attempts[type] < 2) return;

    const root = ensurePanel();
    root.dataset.helpText = copy[type][document.documentElement.lang === 'en' ? 'en' : 'lv'];
    root.querySelector('.md-context-help__title').textContent =
      text('Vai vēlies palīdzību saprast, kā rīkoties tālāk?', 'Would you like help understanding what to do next?');
    root.querySelector('.md-context-help__message').textContent =
      text('Varu parādīt dažus konkrētus soļus šīs situācijas atrisināšanai.', 'I can show a few practical steps to resolve this.');
    root.querySelector('.md-context-help__accept').textContent =
      text('Jā, parādīt', 'Yes, show me');
    root.querySelector('.md-context-help__later').textContent =
      text('Vēlāk', 'Later');
    root.hidden = false;
    expanded = false;
    root.querySelector('.md-context-help__accept').hidden = false;
  };
})();
